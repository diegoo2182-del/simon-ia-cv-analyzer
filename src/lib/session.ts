import { createHmac } from 'crypto';

const SESSION_COOKIE = 'simon_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

function sign(payload: string): string {
  const secret = process.env.AUTH_SECRET ?? 'fallback-secret';
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (sign(payload) !== sig) return false;
  return Date.now() < Number(payload);
}

export { SESSION_COOKIE, SESSION_TTL_MS };
