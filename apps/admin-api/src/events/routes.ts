import Router from '@koa/router';
import { z } from 'zod';
import { writeAdminAudit } from '../audit/repository.js';
import { requireAdmin } from '../auth/middleware.js';
import { ADMIN_API_PREFIX } from '../http.js';
import { requirePlatformPermission } from '../rbac/middleware.js';
import { getEvent, setEventModeration } from './repository.js';

const ModerateSchema = z.object({ status: z.enum(['ok', 'removed']) });

export const adminEventRouter = new Router({ prefix: `${ADMIN_API_PREFIX}/events` });

adminEventRouter.post(
  '/:eventId/moderate',
  requireAdmin,
  requirePlatformPermission('platform:event:moderate'),
  async (ctx) => {
    const session = ctx.state.admin;
    const eventId = ctx.params.eventId;
    if (!session || !eventId) {
      ctx.status = session ? 400 : 401;
      return;
    }
    const parsed = ModerateSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      ctx.status = 400;
      ctx.body = { error: 'invalid input' };
      return;
    }
    const event = await getEvent(eventId);
    if (!event) {
      ctx.status = 404;
      return;
    }
    await setEventModeration(eventId, parsed.data.status);
    await writeAdminAudit({
      actorId: session.id,
      action: 'event.moderate',
      targetType: 'event',
      targetId: eventId,
      metadata: { status: parsed.data.status },
    });
    ctx.body = { id: eventId, moderationStatus: parsed.data.status };
  },
);
