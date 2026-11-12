import type { APIRoute } from 'astro';
import { square, token, SITE } from '../../square';
import { PRODUCTS } from '../../products-map';

export const config = { runtime: 'edge' };

const BRAND = '3D Design & Supply';
const clean = (s: string) => (s || '').replace(/\s+/g, ' ').trim();

// GET -> JSONL product feed for ChatGPT shopping (one row per color variation).
export const GET: APIRoute = async ({ locals }) => {
  const tok = token(locals);
  if (!tok) return new Response('not configured', { status: 503 });

  const items: any[] = [];
  let cursor: string | undefined;
  do {
    const r = await square(tok, `/catalog/list?types=ITEM${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
    if (!r.ok) return new Response('square error', { status: 502 });
    items.push(...(r.data.objects || []));
    cursor = r.data.cursor;
  } while (cursor);

  const lines: string[] = [];
  for (const item of items) {
    const map = PRODUCTS[item.id];
    if (!map || item.is_deleted) continue;
    const [slug, image] = map;
    const d = item.item_data || {};
    const name = clean(d.name);
    const desc = clean(d.description_plaintext || d.description || name).slice(0, 5000);
    for (const v of d.variations || []) {
      const vd = v.item_variation_data || {};
      if (v.is_deleted || vd.sellable === false || !vd.price_money) continue;
      const color = clean((vd.name || '').replace(/^Primary color:\s*/i, ''));
      const multi = (d.variations || []).length > 1 && color && !/^regular$/i.test(color);
      lines.push(JSON.stringify({
        item_id: v.id,
        title: multi ? `${name} - ${color}` : name,
        description: desc,
        url: `${SITE}/products/${slug}`,
        brand: BRAND,
        seller_name: BRAND,
        image_url: image,
        availability: 'in_stock',
        price: `${(vd.price_money.amount / 100).toFixed(2)} ${vd.price_money.currency || 'USD'}`,
      }));
    }
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'application/jsonl; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
