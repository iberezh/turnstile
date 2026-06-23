import Router from '@koa/router';
import { clearSessionCookie, setSessionCookie } from './cookie.js';
import { requireAuth } from './middleware.js';
import { DUMMY_HASH, hashPassword, verifyPassword } from './password.js';
import { createUser, findUserByEmail, findUserById } from './repository.js';
import { LoginSchema, RegisterSchema } from './schemas.js';
import { signSession } from './tokens.js';

export const authRouter = new Router({ prefix: '/auth' });

authRouter.post('/register', async (ctx) => {
  const parsed = RegisterSchema.safeParse(ctx.request.body);
  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { error: 'invalid input' };
    return;
  }
  const email = parsed.data.email.toLowerCase();
  if (await findUserByEmail(email)) {
    ctx.status = 409;
    ctx.body = { error: 'email already registered' };
    return;
  }
  const passwordHash = await hashPassword(parsed.data.password);
  const user = await createUser(email, passwordHash, parsed.data.name ?? null);
  setSessionCookie(ctx, signSession({ id: user.id, email: user.email }));
  ctx.status = 201;
  ctx.body = { id: user.id, email: user.email, name: user.name };
});

authRouter.post('/login', async (ctx) => {
  const parsed = LoginSchema.safeParse(ctx.request.body);
  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { error: 'invalid input' };
    return;
  }
  const email = parsed.data.email.toLowerCase();
  const user = await findUserByEmail(email);
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    ctx.status = 401;
    ctx.body = { error: 'invalid credentials' };
    return;
  }
  setSessionCookie(ctx, signSession({ id: user.id, email: user.email }));
  ctx.body = { id: user.id, email: user.email, name: user.name };
});

authRouter.post('/logout', (ctx) => {
  clearSessionCookie(ctx);
  ctx.body = { ok: true };
});

authRouter.get('/me', requireAuth, async (ctx) => {
  const session = ctx.state.user;
  if (!session) {
    ctx.status = 401;
    return;
  }
  const user = await findUserById(session.id);
  if (!user) {
    ctx.status = 401;
    ctx.body = { error: 'unauthorized' };
    return;
  }
  ctx.body = { id: user.id, email: user.email, name: user.name };
});
