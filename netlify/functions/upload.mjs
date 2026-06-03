/**
 * /.netlify/functions/upload — almacenamiento de archivos del portal Reto IA.
 * Alias /api/upload (redirect en netlify.toml).
 *
 * POST  /api/upload?prefix=progress/email/sem1  (body: binary file, headers: x-filename, content-type)
 *       → guarda el blob en el store "reto-ia-files" y devuelve {path, url}
 *
 * GET   /api/upload?path=progress/email/sem1/1717000000-mi-pdf.pdf
 *       → sirve el binario con su content-type (para descargas).
 *
 * DELETE /api/upload?path=...
 *       → borra el blob (usado cuando un usuario quita un archivo).
 *
 * Functions v2 (req, context). El contexto de Netlify Blobs se inyecta
 * automáticamente, igual que en sync.mjs.
 *
 * Límite de tamaño: 25 MB (validado también en cliente).
 */
import { getStore } from '@netlify/blobs';

const MAX_BYTES = 25 * 1024 * 1024;

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type,x-filename,x-content-type',
  'cache-control': 'no-store'
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...CORS }
  });
}

function sanitizePathSegment(s){
  let out = String(s||'').replace(/[^\w.\-@]+/g,'_').replace(/_+/g,'_').slice(0, 120);
  // No permitir segmentos vacíos, "." ni ".." (traversal)
  if(!out || out === '.' || out === '..' || /^\.+$/.test(out)) return '';
  return out;
}

function safePath(prefix, filename){
  // prefix viene del cliente: "commitment/email" o "progress/email/sem1" etc.
  const parts = String(prefix||'misc').split('/').map(sanitizePathSegment).filter(Boolean);
  const safeName = sanitizePathSegment(filename || 'file') || 'file';
  const ts = Date.now();
  // Si todo el prefix quedó vacío (intento de traversal), usar 'misc'
  const base = parts.length ? parts.slice(0, 5) : ['misc'];
  return base.concat([`${ts}-${safeName}`]).join('/');
}

export default async (req) => {
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  let store;
  try {
    store = getStore({ name: 'reto-ia-files', consistency: 'strong' });
  } catch (e) {
    return json({
      error: 'blobs_init_failed',
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }

  const url = new URL(req.url);

  try {
    if (method === 'GET') {
      const path = url.searchParams.get('path');
      if (!path) return json({ error: 'missing_path' }, 400);
      const blob = await store.get(path, { type: 'stream' });
      if (!blob) return json({ error: 'not_found', path }, 404);
      const meta = await store.getMetadata(path);
      const headers = {
        'content-type': (meta && meta.metadata && meta.metadata.contentType) || 'application/octet-stream',
        'cache-control': 'public, max-age=3600',
        ...CORS
      };
      const filename = meta && meta.metadata && meta.metadata.filename;
      if (filename) {
        headers['content-disposition'] = `inline; filename="${encodeURIComponent(filename)}"`;
      }
      return new Response(blob, { status: 200, headers });
    }

    if (method === 'POST' || method === 'PUT') {
      const prefix = url.searchParams.get('prefix') || 'misc';
      const filename = req.headers.get('x-filename') || 'file';
      const contentType = req.headers.get('x-content-type') || req.headers.get('content-type') || 'application/octet-stream';

      const buf = await req.arrayBuffer();
      if (!buf || buf.byteLength === 0) {
        return json({ error: 'empty_body' }, 400);
      }
      if (buf.byteLength > MAX_BYTES) {
        return json({ error: 'too_large', maxBytes: MAX_BYTES, gotBytes: buf.byteLength }, 413);
      }

      const path = safePath(prefix, filename);
      await store.set(path, buf, {
        metadata: { filename, contentType, size: buf.byteLength, uploadedAt: Date.now() }
      });

      const serveUrl = `/api/upload?path=${encodeURIComponent(path)}`;
      return json({ ok: true, path, url: serveUrl, size: buf.byteLength, contentType, filename });
    }

    if (method === 'DELETE') {
      const path = url.searchParams.get('path');
      if (!path) return json({ error: 'missing_path' }, 400);
      await store.delete(path);
      return json({ ok: true, path });
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
