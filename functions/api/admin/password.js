// POST /api/admin/password  -> change the admin password (requires a live session)
import { fsRead, fsWrite, json, bad, sha256Hex, safeEqual, requireAdmin } from '../../_lib.js';

export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  let body;
  try { body = await request.json(); } catch { return bad('Malformed request'); }
  const current = String(body.current || '');
  const next = String(body.next || '');
  if (next.length < 8) return bad('New password must be at least 8 characters.');

  const stored = await fsRead(env, 'admin_auth');
  if (!stored.ok) return json({ ok: false, error: 'Could not reach the server. Try again.' }, 503);
  const hash = (stored.data && stored.data.hash) ? stored.data.hash : (env.ADMIN_PASSWORD_HASH || '');
  if (!safeEqual(await sha256Hex(current), hash)) return bad('Current password is incorrect.', 401);

  const w = await fsWrite(env, 'admin_auth', { hash: await sha256Hex(next), updated: new Date().toISOString() }, stored.updateTime);
  if (!w.ok) return json({ ok: false, error: 'Could not save the new password. Try again.' }, 503);
  return json({ ok: true });
}
