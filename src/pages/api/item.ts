import type { APIRoute } from 'astro';
import { square, token, json } from '../../square';

export const config = { runtime: 'edge' };

// GET ?id=<square item id> -> the item's sellable variations with live prices.
export const GET: APIRoute = async ({ url, locals }) => {
  const tok = token(locals);
  if (!tok) return json({ error: 'not_configured' }, 503);
  const id = url.searchParams.get('id') || '';
  if (!/^[A-Z0-9]{10,40}$/.test(id)) return json({ error: 'bad_id' }, 400);

  const r = await square(tok, `/catalog/object/${id}`);
  const item = r.data?.object;
  if (!r.ok || item?.type !== 'ITEM' || item.is_deleted) return json({ error: 'not_found' }, 404);

  const variations = (item.item_data?.variations || [])
    .filter((v: any) => !v.is_deleted && v.item_variation_data?.sellable !== false && v.item_variation_data?.price_money)
    .map((v: any) => ({
      id: v.id,
      name: (v.item_variation_data.name || '').replace(/^Primary color:\s*/i, ''),
      price: v.item_variation_data.price_money.amount,
    }));

  return new Response(JSON.stringify({ id: item.id, name: item.item_data?.name, variations }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
};
