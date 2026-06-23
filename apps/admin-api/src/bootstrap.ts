import { hashPassword } from './auth/password.js';
import { countAdmins, createAdmin } from './auth/repository.js';
import { provisioningUri, randomTotpSecret } from './auth/totp.js';
import { config } from './config.js';

// Seed a single superadmin the first time the admin DB is empty, so the control plane is usable
// out of the box. The TOTP secret (and the otpauth:// enrollment URI) is printed once — there is
// no other way to recover it, by design.
export async function bootstrapSuperadmin(): Promise<void> {
  if ((await countAdmins()) > 0) return;
  const email = config.BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const secret = config.BOOTSTRAP_ADMIN_TOTP_SECRET || randomTotpSecret();
  const passwordHash = await hashPassword(config.BOOTSTRAP_ADMIN_PASSWORD);
  await createAdmin(email, passwordHash, secret, 'superadmin');
  console.log(`seeded superadmin: ${email}`);
  console.log(`TOTP secret (store now): ${secret}`);
  console.log(`enroll: ${provisioningUri(email, 'Turnstile Admin', secret)}`);
}
