/**
 * /.netlify/functions/community — chat público + mensajes directos del Reto IA.
 *
 * IMPORTANTE: Este endpoint usa un store APARTE ("reto-ia-community").
 * NUNCA escribe en el store "reto-ia-portal" (usuarios/DB) ni borra usuarios.
 * Toda la mensajería es APPEND-ONLY: borrar mensaje sólo marca hidden:true,
 * nunca elimina el registro físicamente.
 *
 * Esquemas:
 *   GET  /api/community?kind=chat
 *        → { items: [ {id, ts, fromEmail, fromName, text, hidden?} ] }
 *
 *   POST /api/community?kind=chat
 *        body: { fromEmail, fromName, text }
 *        → { ok:true, item }
 *
 *   GET  /api/community?kind=dm&a=email1&b=email2
 *        → { items: [ {id, ts, fromEmail, fromName, toEmail, text, hidden?} ] }
 *
 *   POST /api/community?kind=dm
 *        body: { fromEmail, fromName, toEmail, text }
 *        → { ok:true, item }
 *
 *   POST /api/community?kind=hide
 *        body: { channel, id, byEmail }  // sólo el autor o admin
 *        → marca el mensaje hidden:true (no se borra)
 */
import { getStore } from '@netlify/blobs';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};

const MAX_TEXT = 2000;
const MAX_ITEMS_PER_CHANNEL = 5000; // límite suave para no inflar el blob

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...CORS }
  });
}

function normEmail(e) {
  return String(e || '').trim().toLowerCase();
}

function dmKey(a, b) {
  const x = normEmail(a), y = normEmail(b);
  if (!x || !y) return '';
  return 'dm/' + [x, y].sort().join('__');
}

function chatKey() { return 'chat/global'; }

function newId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function clean(s, max) {
  return String(s || '').slice(0, max).trim();
}

async function readChannel(store, key) {
  if (!key) return [];
  const raw = await store.get(key);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

async function writeChannel(store, key, items) {
  // truncar si crece de más
  const trimmed = items.length > MAX_ITEMS_PER_CHANNEL
    ? items.slice(items.length - MAX_ITEMS_PER_CHANNEL)
    : items;
  await store.set(key, JSON.stringify(trimmed));
}

export default async (req) => {
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response('', { status: 204, headers: CORS });
  }

  let store;
  try {
    store = getStore({ name: 'reto-ia-community', consistency: 'strong' });
  } catch (e) {
    return json({
      error: 'blobs_init_failed',
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }

  const url = new URL(req.url);
  const kind = url.searchParams.get('kind') || 'chat';

  try {
    if (method === 'GET') {
      if (kind === 'chat') {
        const items = await readChannel(store, chatKey());
        return json({ items });
      }
      if (kind === 'dm') {
        const a = url.searchParams.get('a');
        const b = url.searchParams.get('b');
        const key = dmKey(a, b);
        if (!key) return json({ error: 'missing_participants' }, 400);
        const items = await readChannel(store, key);
        return json({ items });
      }
      if (kind === 'inbox') {
        // todos los DMs donde participa "me"
        const me = normEmail(url.searchParams.get('me'));
        if (!me) return json({ error: 'missing_me' }, 400);
        const { blobs } = await store.list({ prefix: 'dm/' });
        const summaries = [];
        for (const b of (blobs || [])) {
          const k = b.key;
          // dm/email1__email2 — sólo los que contienen "me"
          const pair = k.slice(3).split('__');
          if (pair.length !== 2) continue;
          if (pair[0] !== me && pair[1] !== me) continue;
          const arr = await readChannel(store, k);
          const last = arr.filter(x => !x.hidden).slice(-1)[0];
          if (!last) continue;
          const other = pair[0] === me ? pair[1] : pair[0];
          summaries.push({
            other,
            lastTs: last.ts,
            lastText: last.text,
            lastFromMe: normEmail(last.fromEmail) === me,
            count: arr.length
          });
        }
        summaries.sort((a, b) => b.lastTs - a.lastTs);
        return json({ items: summaries });
      }
      return json({ error: 'unknown_kind', kind }, 400);
    }

    if (method === 'POST') {
      const body = await req.json().catch(() => ({}));

      if (kind === 'chat') {
        const fromEmail = normEmail(body.fromEmail);
        const fromName = clean(body.fromName, 100);
        const text = clean(body.text, MAX_TEXT);
        if (!fromEmail || !text) {
          return json({ error: 'missing_fields' }, 400);
        }
        const items = await readChannel(store, chatKey());
        const item = { id: newId(), ts: Date.now(), fromEmail, fromName, text };
        items.push(item);
        await writeChannel(store, chatKey(), items);
        return json({ ok: true, item });
      }

      if (kind === 'dm') {
        const fromEmail = normEmail(body.fromEmail);
        const toEmail = normEmail(body.toEmail);
        const fromName = clean(body.fromName, 100);
        const text = clean(body.text, MAX_TEXT);
        if (!fromEmail || !toEmail || !text) {
          return json({ error: 'missing_fields' }, 400);
        }
        const key = dmKey(fromEmail, toEmail);
        const items = await readChannel(store, key);
        const item = { id: newId(), ts: Date.now(), fromEmail, fromName, toEmail, text };
        items.push(item);
        await writeChannel(store, key, items);
        return json({ ok: true, item });
      }

      if (kind === 'hide') {
        // soft hide — el dato no se borra, sólo se marca para no mostrarse
        const channel = clean(body.channel, 200); // "chat" o "dm:a__b"
        const id = clean(body.id, 200);
        const byEmail = normEmail(body.byEmail);
        if (!channel || !id || !byEmail) return json({ error: 'missing_fields' }, 400);
        const key = channel === 'chat' ? chatKey() : 'dm/' + channel.replace(/^dm:/, '');
        const items = await readChannel(store, key);
        const i = items.findIndex(x => x.id === id);
        if (i < 0) return json({ error: 'not_found' }, 404);
        // sólo el autor puede ocultar su propio mensaje
        if (normEmail(items[i].fromEmail) !== byEmail) {
          return json({ error: 'forbidden' }, 403);
        }
        items[i] = { ...items[i], hidden: true, hiddenAt: Date.now() };
        await writeChannel(store, key, items);
        return json({ ok: true });
      }

      return json({ error: 'unknown_kind', kind }, 400);
    }

    return json({ error: 'method_not_allowed', method }, 405);
  } catch (e) {
    return json({
      error: 'runtime_error',
      detail: String(e && e.message ? e.message : e)
    }, 500);
  }
};
