import Router from '@koa/router';
import { writeAudit } from '../audit/repository.js';
import { requireAuth } from '../auth/middleware.js';
import { config } from '../config.js';
import { API_PREFIX } from '../http.js';
import { requireOrgPermission } from '../rbac/middleware.js';
import { getOrgConnect, setChargesEnabled, setStripeAccount } from './connect-repository.js';
import { payments } from './index.js';

export const connectRouter = new Router({ prefix: `${API_PREFIX}/orgs` });

// Start (or resume) Stripe Connect onboarding; returns a hosted link the organizer completes.
connectRouter.post(
  '/:orgId/connect/onboard',
  requireAuth,
  requireOrgPermission('org:billing'),
  async (ctx) => {
    const user = ctx.state.user;
    const orgId = ctx.params.orgId;
    if (!user || !orgId) {
      ctx.status = user ? 400 : 401;
      return;
    }
    const connect = await getOrgConnect(orgId);
    let accountId = connect?.stripeAccountId ?? null;
    if (!accountId) {
      accountId = await payments.createConnectAccount(user.email);
      await setStripeAccount(orgId, accountId);
      await writeAudit({
        actorId: user.id,
        scope: 'org',
        orgId,
        action: 'connect.account_created',
        target: accountId,
      });
    }
    const url = await payments.createAccountLink(
      accountId,
      `${config.WEB_ORIGIN}/orgs/${orgId}/connect/return`,
      `${config.WEB_ORIGIN}/orgs/${orgId}/connect/refresh`,
    );
    ctx.body = { url, accountId, mode: payments.mode };
  },
);

connectRouter.get(
  '/:orgId/connect/status',
  requireAuth,
  requireOrgPermission('org:billing'),
  async (ctx) => {
    const orgId = ctx.params.orgId;
    if (!orgId) {
      ctx.status = 400;
      return;
    }
    const connect = await getOrgConnect(orgId);
    if (!connect?.stripeAccountId) {
      ctx.body = { connected: false, chargesEnabled: false };
      return;
    }
    // Live mode refreshes from Stripe; mock mode trusts the cached flag (set by mock-complete).
    if (payments.mode === 'live') {
      const status = await payments.getAccountStatus(connect.stripeAccountId);
      if (status.chargesEnabled !== connect.chargesEnabled) {
        await setChargesEnabled(orgId, status.chargesEnabled);
      }
      ctx.body = { connected: true, chargesEnabled: status.chargesEnabled };
      return;
    }
    ctx.body = { connected: true, chargesEnabled: connect.chargesEnabled };
  },
);

// Dev-only (mock mode): simulate the organizer finishing Stripe onboarding.
connectRouter.post(
  '/:orgId/connect/mock-complete',
  requireAuth,
  requireOrgPermission('org:billing'),
  async (ctx) => {
    const user = ctx.state.user;
    const orgId = ctx.params.orgId;
    if (!user || !orgId) {
      ctx.status = user ? 400 : 401;
      return;
    }
    if (payments.mode !== 'mock') {
      ctx.status = 404;
      return;
    }
    const connect = await getOrgConnect(orgId);
    if (!connect?.stripeAccountId) {
      ctx.status = 400;
      ctx.body = { error: 'start onboarding first' };
      return;
    }
    await setChargesEnabled(orgId, true);
    await writeAudit({
      actorId: user.id,
      scope: 'org',
      orgId,
      action: 'connect.mock_completed',
      target: connect.stripeAccountId,
      after: { chargesEnabled: true },
    });
    ctx.body = { ok: true, chargesEnabled: true };
  },
);
