import Router from '@koa/router';
import { ADMIN_API_PREFIX } from '../http.js';
import { clearAdminCookie, setAdminCookie } from './cookie.js';
import { requireAdmin } from './middleware.js';
import { DUMMY_HASH, verifyPassword } from './password.js';
import { findAdminByEmail, findAdminById } from './repository.js';
import { AdminLoginSchema } from './schemas.js';
import { signAdminSession } from './tokens.js';
import { verifyTotp } from './totp.js';

export const adminAuthRouter = new Router({ prefix: `${ADMIN_API_PREFIX}/auth` });

adminAuthRouter.post('/login', async (ctx) => {
  const parsed = AdminLoginSchema.safeParse(ctx.request.body);
  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { error: 'invalid input' };
    return;
  }
  const email = parsed.data.email.toLowerCase();
  const admin = await findAdminByEmail(email);
  // Always run a password compare (dummy hash if unknown) to keep timing flat.
  const passwordOk = await verifyPassword(parsed.data.password, admin?.passwordHash ?? DUMMY_HASH);
  const totpOk = admin ? verifyTotp(admin.totpSecret, parsed.data.totp) : false;
  if (!admin || !passwordOk || !totpOk) {
    ctx.status = 401;
    ctx.body = { error: 'invalid credentials' };
    return;
  }
  setAdminCookie(ctx, signAdminSession({ id: admin.id, email: admin.email }));
  ctx.body = { id: admin.id, email: admin.email, role: admin.role };
});

adminAuthRouter.post('/logout', (ctx) => {
  clearAdminCookie(ctx);
  ctx.body = { ok: true };
});

adminAuthRouter.get('/me', requireAdmin, async (ctx) => {
  const session = ctx.state.admin;
  if (!session) {
    ctx.status = 401;
    return;
  }
  const admin = await findAdminById(session.id);
  if (!admin) {
    ctx.status = 401;
    ctx.body = { error: 'unauthorized' };
    return;
  }
  ctx.body = { id: admin.id, email: admin.email, role: admin.role };
});
