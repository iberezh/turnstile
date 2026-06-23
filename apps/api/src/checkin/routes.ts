import Router from '@koa/router';
import { z } from 'zod';
import { requireAuth } from '../auth/middleware.js';
import { config } from '../config.js';
import { loadOwnedEvent } from '../events/guard.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { verifyTicket } from '../tickets/qr.js';
import { addClient, broadcast, removeClient } from './hub.js';
import { admitTicket, checkinStats, getTicketState } from './repository.js';

const TokenSchema = z.object({ token: z.string().min(1) });

export const checkinRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

// Scan a ticket QR at the door. First-scan-wins; repeat or invalid scans are reported, not admitted.
checkinRouter.post(
  '/:orgId/events/:eventId/checkin',
  requireAuth,
  requireOrgPermission('checkin:scan'),
  async (ctx) => {
    const { orgId, eventId } = ctx.params;
    if (!orgId || !eventId) {
      ctx.status = 400;
      return;
    }
    if (!(await loadOwnedEvent(orgId, eventId))) {
      ctx.status = 404;
      return;
    }
    const body = TokenSchema.safeParse(ctx.request.body);
    if (!body.success) {
      ctx.status = 400;
      ctx.body = { result: 'invalid' };
      return;
    }
    let claim: { ticketId: string; eventId: string };
    try {
      claim = verifyTicket(body.data.token);
    } catch {
      ctx.status = 400;
      ctx.body = { result: 'invalid' };
      return;
    }
    if (claim.eventId !== eventId) {
      ctx.status = 409;
      ctx.body = { result: 'wrong_event' };
      return;
    }
    const scannedAt = await admitTicket(claim.ticketId, eventId);
    if (scannedAt) {
      broadcast(eventId, {
        type: 'checkin',
        ticketId: claim.ticketId,
        scannedAt: scannedAt.toISOString(),
      });
      ctx.body = {
        result: 'admitted',
        ticketId: claim.ticketId,
        scannedAt: scannedAt.toISOString(),
      };
      return;
    }
    const state = await getTicketState(claim.ticketId, eventId);
    if (!state) {
      ctx.status = 404;
      ctx.body = { result: 'not_found' };
      return;
    }
    if (state.status === 'checked_in') {
      ctx.status = 409;
      ctx.body = {
        result: 'already_checked_in',
        scannedAt: state.scannedAt?.toISOString() ?? null,
      };
      return;
    }
    ctx.status = 409;
    ctx.body = { result: 'not_valid', status: state.status };
  },
);

checkinRouter.get(
  '/:orgId/events/:eventId/checkin/stats',
  requireAuth,
  requireOrgPermission('checkin:dashboard'),
  async (ctx) => {
    const { orgId, eventId } = ctx.params;
    if (!orgId || !eventId) {
      ctx.status = 400;
      return;
    }
    if (!(await loadOwnedEvent(orgId, eventId))) {
      ctx.status = 404;
      return;
    }
    ctx.body = await checkinStats(eventId);
  },
);

// Live door dashboard: streams each admission as it happens (SSE).
checkinRouter.get(
  '/:orgId/events/:eventId/checkin/stream',
  requireAuth,
  requireOrgPermission('checkin:dashboard'),
  async (ctx) => {
    const { orgId, eventId } = ctx.params;
    if (!orgId || !eventId) {
      ctx.status = 400;
      return;
    }
    if (!(await loadOwnedEvent(orgId, eventId))) {
      ctx.status = 404;
      return;
    }
    // Take over the socket; set credentialed CORS here since the raw write bypasses the cors plugin.
    ctx.respond = false;
    ctx.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': config.WEB_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
    });
    ctx.res.write(':\n\n');
    const client = (data: unknown) => ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);
    addClient(eventId, client);
    ctx.req.on('close', () => removeClient(eventId, client));
  },
);
