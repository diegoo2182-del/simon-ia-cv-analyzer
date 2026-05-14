export const SESSION_COOKIE = 'simon_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET ?? 'fallback-secret';
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  );
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = await sign(payload);
  return `${payload}.${encodeURIComponent(sig)}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dot = token.indexOf('.');
    if (dot === -1) return false;
    const payload = token.slice(0, dot);
    const sig = decodeURIComponent(token.slice(dot + 1));
    const expected = await sign(payload);
    if (expected !== sig) return false;
    return Date.now() < Number(payload);
  } catch {
    return false;
  }
}
