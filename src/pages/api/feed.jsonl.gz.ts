import type { APIRoute } from 'astro';
import { buildFeed } from './feed.jsonl';

export const config = { runtime: 'edge' };

// GET -> the same product feed, gzip-compressed (what ChatGPT's hosted URL import expects).
export const GET: APIRoute = async ({ locals }) => {
  const body = await buildFeed(locals);
  if (body instanceof Response) return body;
  const gz = new Blob([body]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(await new Response(gz).arrayBuffer(), {
    headers: { 'Content-Type': 'application/gzip', 'Cache-Control': 'public, max-age=3600' },
  });
};
