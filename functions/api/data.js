// /api/data - the single door to the database for the browser.
//
//   GET  ?key=<key>   read one document
//   PUT  {key, value} write one document
//
// This is where the public/private boundary is enforced. A signed-out visitor
// may read only the non-personal catalogue documents; bookings, clients,
// enrolments, orders and inventory require a valid admin session. All writes
// require an admin session - the public site creates records through the
// dedicated /api/public/* endpoints, which validate what they are given.
import { fsRead, fsWrite, json, bad, verifySession, PUBLIC_KEYS, GUARDED_KEYS } from '../_lib.js';

const ALL_KEYS = [
  'services', 'specials', 'courses', 'bookings', 'clients', 'inventory',
  'blocked_dates', 'manual_events', 'course_enrollments', 'pro_orders', 'pro_order_counter',
];

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!ALL_KEYS.includes(key)) return bad('Unknown key', 404);

  if (!PUBLIC_KEYS.includes(key)) {
    if (!(await verifySession(request, env))) return bad('Not authorised', 401);
  }

  const r = await fsRead(env, key);
  if (!r.ok) return json({ ok: false, error: 'unavailable' }, 503);
  return json({ ok: true, key, value: r.data, updateTime: r.updateTime });
}

export async function onRequestPut({ request, env }) {
  if (!(await verifySession(request, env))) return bad('Not authorised', 401);

  let body;
  try { body = await request.json(); } catch { return bad('Malformed request'); }
  const key = String(body.key || '');
  if (!ALL_KEYS.includes(key)) return bad('Unknown key', 404);
  if (body.value === undefined) return bad('Missing value');

  // Safety net against the whole-document overwrite that destroyed ~100 bookings.
  // A deliberate bulk delete has to come through in smaller steps.
  if (GUARDED_KEYS.includes(key) && Array.isArray(body.value)) {
    const cur = await fsRead(env, key);
    if (!cur.ok) return json({ ok: false, error: 'unavailable' }, 503);
    const before = Array.isArray(cur.data) ? cur.data.length : 0;
    if (before > 5 && body.value.length < Math.floor(before * 0.6)) {
      return bad(`Refusing to shrink ${key} from ${before} to ${body.value.length} records.`, 409);
    }
  }

  const w = await fsWrite(env, key, body.value, body.baseUpdateTime || null);
  if (!w.ok) {
    if (w.conflict) return bad('Someone else changed this a moment ago. Reload and try again.', 409);
    return json({ ok: false, error: 'write-failed' }, 503);
  }
  return json({ ok: true });
}
