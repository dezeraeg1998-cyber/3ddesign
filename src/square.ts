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
