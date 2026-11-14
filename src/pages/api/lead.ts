import type { APIRoute } from 'astro';
import { square, token, json } from '../../square';

export const config = { runtime: 'edge' };

// POST { email, items: [{ name, variant, qty }] } -> saves the shopper as a Square customer
// with their cart in the note, so abandoned carts can be followed up from Square.
export const POST: APIRoute = async ({ request, locals }) => {
  const tok = token(locals);
  if (!tok) return json({ error: 'not_configured' }, 503);
  let b: any;
  try { b = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const email = String(b?.email || '').trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/.test(email)) return json({ error: 'bad_email' }, 400);
  const items = (Array.isArray(b?.items) ? b.items : []).slice(0, 30)
    .map((x: any) => `${Math.min(99, Number(x?.qty) || 1)} x ${String(x?.name || '').slice(0, 80)}${x?.variant ? ' (' + String(x.variant).slice(0, 40) + ')' : ''}`);
  const note = `Website cart ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC: ${items.join('; ') || 'empty'}`.slice(0, 500);

  const s = await square(tok, '/customers/search', {
    method: 'POST',
    body: JSON.stringify({ query: { filter: { email_address: { exact: email } } }, limit: 1 }),
  });
  const existing = s.data?.customers?.[0];
  const r = existing
    ? await square(tok, `/customers/${existing.id}`, { method: 'PUT', body: JSON.stringify({ note, version: existing.version }) })
    : await square(tok, '/customers', {
        method: 'POST',
        body: JSON.stringify({ idempotency_key: crypto.randomUUID(), email_address: email, note, reference_id: 'website-cart' }),
      });
  return r.ok ? json({ ok: true }) : json({ error: 'square_error' }, 502);
};
