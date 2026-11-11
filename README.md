# 3D Design & Supply cart checkout

Small Webflow Cloud (Astro) app that powers the cart on www.3ddesignsupply.com.

- `GET  /api/item?id=SQUARE_ITEM_ID` returns the item's variations and live prices.
- `POST /api/checkout` with `{ "items": [{ "variationId": "...", "qty": 1 }] }` returns a Square checkout URL.

Requires the secret environment variable `SQUARE_ACCESS_TOKEN` (set in Webflow Cloud, never committed).
