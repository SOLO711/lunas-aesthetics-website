// POST /api/admin/login
// The admin password is verified HERE. It used to be a SHA-256 hash shipped
// inside script.js, which anyone could read and attack offline, and the "login"
// only set a sessionStorage flag that any visitor could set themselves.
import { fsRead, json, bad, sha256Hex, safeEqual, issueSession, sessionCookie } from '../../_lib.js';

// Simple per-IP throttle held in the isolate. Not a substitute for a strong
// password, but it makes online guessing impractical.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;

function throttled(ip) {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (Date.now() > rec.until) { attempts.delete(ip); return false; }
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const rec = attempts.get(ip) || { count: 0, until: Date.now() + WINDOW_MS };
  rec.count++;
  rec.until = Date.now() + WINDOW_MS;
  attempts.set(ip, rec);
}

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (throttled(ip)) return bad('Too many attempts. Please try again later.', 429);

  let body;
  try { body = await request.json(); } catch { return bad('Malformed request'); }
  const password = String(body.password || '');
  if (!password) return bad('Password required');

  // Current hash lives in Firestore so it can be changed from the admin panel.
  // ADMIN_PASSWORD_HASH is only the initial seed.
  const stored = await fsRead(env, 'admin_auth');
  const hash = (stored.ok && stored.data && stored.data.hash) ? stored.data.hash : (env.ADMIN_PASSWORD_HASH || '');
  if (!hash) {
    console.error('[login] no admin password configured');
    return json({ ok: false, error: 'Admin login is not configured yet.' }, 503);
  }

  const supplied = await sha256Hex(password);
  if (!safeEqual(supplied, hash)) {
    recordFailure(ip);
    return bad('Incorrect password.', 401);
  }

  attempts.delete(ip);
  const token = await issueSession(env);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
}
