/**
 * /.netlify/functions/sync — almacenamiento compartido del portal Reto IA.
 * Alias bonito en /api/sync (ver redirect en netlify.toml).
 *
 * Formato: ESM con `export const handler` (Functions v1 compatible con zisi).
 * El import estático de @netlify/blobs permite que zisi lo detecte y
 * lo incluya en el bundle del Lambda.
 */
import { getStore } from '@netlify/blobs';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};

function json(obj, statusCode = 200) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json', ...CORS },
    body: JSON.stringify(obj)
  };
}

export const handler = async (event) => {
  const method = (event.httpMethod || '').toUpperCase();

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
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
      const qs = event.queryStringParameters || {};
      if (qs.ts === '1') {
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
      const body = event.body || '';
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
