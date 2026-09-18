import { randomUUID } from "crypto";

export const SESSION_COOKIE_NAME = "inv_session";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

interface AuthState {
  failCount: number;
  lockedUntil: number;
  sessions: Map<string, number>;
}

declare global {
  var __authState: AuthState | undefined;
}

function state(): AuthState {
  if (!global.__authState) {
    global.__authState = { failCount: 0, lockedUntil: 0, sessions: new Map() };
  }
  return global.__authState;
}

export function getLockoutRemainingMs(): number {
  const remaining = state().lockedUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

export function verifyPin(pin: string): { ok: boolean; lockedMs: number } {
  const s = state();
  const alreadyLocked = getLockoutRemainingMs();
  if (alreadyLocked > 0) {
    return { ok: false, lockedMs: alreadyLocked };
  }

  const correctPin = process.env.DASHBOARD_PIN ?? "";
  if (pin === correctPin) {
    s.failCount = 0;
    s.lockedUntil = 0;
    return { ok: true, lockedMs: 0 };
  }

  s.failCount += 1;
  if (s.failCount >= MAX_ATTEMPTS) {
    s.lockedUntil = Date.now() + LOCKOUT_MS;
    s.failCount = 0;
    return { ok: false, lockedMs: LOCKOUT_MS };
  }
  return { ok: false, lockedMs: 0 };
}

export function createSession(): string {
  const token = randomUUID();
  state().sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function isValidSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const s = state();
  const expiry = s.sessions.get(token);
  if (!expiry) return false;
  if (expiry < Date.now()) {
    s.sessions.delete(token);
    return false;
  }
  return true;
}
