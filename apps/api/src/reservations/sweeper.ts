import { sweepExpiredHolds } from './repository.js';

const SWEEP_INTERVAL_MS = 30_000;

// Periodically reclaims inventory from expired holds. unref'd so it never keeps the process alive.
export function startHoldSweeper(): NodeJS.Timeout {
  const timer = setInterval(() => {
    sweepExpiredHolds(new Date()).catch((err) => console.error('hold sweep failed', err));
  }, SWEEP_INTERVAL_MS);
  timer.unref();
  return timer;
}
