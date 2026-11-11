import type { APIRoute } from 'astro';
import { square, token, json, LOCATION_ID, SITE } from '../../square';

export const config = { runtime: 'edge' };

// POST { items: [{ variationId, qty }] } -> { url } of a Square checkout page.
// Prices always come from the Square catalog, never from the browser.
export const POST: APIRoute = async ({ request, locals }) => {
  const tok = token(locals);
  if (!tok) return json({ error: 'not_configured' }, 503);

  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length || items.length > 50) return json({ error: 'empty_cart' }, 400);

  const lineItems = [];
  for (const it of items) {
    const id = String(it?.variationId || '');
    const qty = Math.floor(Number(it?.qty));
    if (!/^[A-Z0-9]{10,40}$/.test(id) || !(qty >= 1 && qty <= 99)) return json({ error: 'bad_item' }, 400);
    lineItems.push({ catalog_object_id: id, quantity: String(qty) });
  }

  const r = await square(tok, '/online-checkout/payment-links', {
    method: 'POST',
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      order: { location_id: LOCATION_ID, line_items: lineItems },
      checkout_options: {
        ask_for_shipping_address: true,
        redirect_url: `${SITE}/?order=thanks`,
      },
    }),
  });
  if (!r.ok || !r.data?.payment_link?.url) {
    return json({ error: 'square_error', detail: r.data?.errors?.[0]?.detail || null }, 502);
  }
  return json({ url: r.data.payment_link.url });
};
