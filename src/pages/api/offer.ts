import type { APIRoute } from 'astro';
import { token, json, signOffer, OFFER_MS } from '../../square';

export const config = { runtime: 'edge' };

// GET -> { token, exp }: a signed 15-minute welcome offer for first-time visitors.
export const GET: APIRoute = async ({ locals }) => {
  const tok = token(locals);
  if (!tok) return json({ error: 'not_configured' }, 503);
  const exp = Date.now() + OFFER_MS;
  return json({ token: await signOffer(tok, exp), exp });
};
