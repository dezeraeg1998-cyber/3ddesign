// Shared helpers for talking to the Square API from the edge runtime.
export const SQUARE_BASE = 'https://connect.squareup.com/v2';
export const SQUARE_VERSION = '2025-01-23';
export const LOCATION_ID = 'LQ10MPED94S12';
export const SITE = 'https://www.3ddesignsupply.com';

export function token(locals: any): string | undefined {
  return locals?.runtime?.env?.SQUARE_ACCESS_TOKEN;
}

export async function square(tok: string, path: string, init: RequestInit = {}) {
  const res = await fetch(SQUARE_BASE + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${tok}`,
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data: any = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// Signed 25%-off welcome offer tokens: "<expiryMs>.<hmac>". Key is derived from the Square token secret.
async function offerKey(tok: string) {
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('dd-offer:' + tok));
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
export const OFFER_MS = 15 * 60 * 1000;
export const OFFER_PCT = '25';
export async function signOffer(tok: string, exp: number) {
  const sig = await crypto.subtle.sign('HMAC', await offerKey(tok), new TextEncoder().encode(String(exp)));
  return `${exp}.${hex(sig)}`;
}
export async function offerValid(tok: string, t: unknown) {
  if (typeof t !== 'string' || !/^\d{13}\.[0-9a-f]{64}$/.test(t)) return false;
  const exp = Number(t.split('.')[0]);
  if (Date.now() > exp + 2 * 60 * 1000) return false; // 2 min grace for slow checkouts
  return (await signOffer(tok, exp)) === t;
}
