/**
 * /.netlify/functions/sync — almacenamiento compartido del portal Reto IA.
 * Alias bonito en /api/sync (ver redirect en netlify.toml).
 *
 * Functions v2 (req, context). En v2 el contexto de Netlify Blobs se
 * inyecta automáticamente y getStore() funciona sin pasar siteID/token.
 * En v1 (export const handler), con esbuild, el SDK no siempre encuentra
 * ese contexto y devuelve "environment has not been configured".
 */
import { getStore } from '@netlify/blobs';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...CORS }
  });
}

export default async (req) => {
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response('', { status: 204, headers: CORS });
  }

  let store;
  try {
    store = getStore({ name: 'reto-ia-portal', consistency: 'strong' });
  } catch (e) {
    return json({
      error: 'blobs_init_failed',
      detail: String(e && e.message ? e.message : e),
      help: 'Verifica que Netlify Blobs esté habilitado para este sitio.'
    }, 500);
  }

  try {
    if (method === 'GET') {
      const url = new URL(req.url);
      if (url.searchParams.get('ts') === '1') {
        const tsRaw = await store.get('ts');
        return json({ ts: tsRaw ? Number(tsRaw) : 0 });
      }
      const dbRaw = await store.get('db');
      const tsRaw = await store.get('ts');
      return json({
        db: dbRaw ? JSON.parse(dbRaw) : null,
        ts: tsRaw ? Number(tsRaw) : 0
      });
    }

    if (method === 'POST' || method === 'PUT') {
      const body = await req.text();
      try { JSON.parse(body); } catch (e) {
        return json({ ok: false, error: 'invalid_json', detail: String(e.message || e) }, 400);
      }
      const ts = Date.now();
      await store.set('db', body);
      await store.set('ts', String(ts));
      return json({ ok: true, ts });
    }

    return json({ error: 'method_not_allowed', method }, 405);
  } catch (e) {
    return json({
      error: 'runtime_error',
      detail: String(e && e.message ? e.message : e),
      stack: String((e && e.stack) || '').split('\n').slice(0, 5).join(' | ')
    }, 500);
  }
};
