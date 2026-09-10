// Shared server-side helpers for Luna's API (Cloudflare Pages Functions).
//
// WHY THIS EXISTS: the browser used to talk to Firestore directly, which meant
// every visitor could read the whole customer database (names, phones, emails)
// and anyone could overwrite it. All database access now happens here, server
// side, and Firestore itself is closed to the public.

export const FB_PROJECT_DEFAULT = 'lunas-2305d';

// The only documents a signed-out visitor may read. Everything else -
// bookings, clients, course_enrollments, pro_orders, inventory - is admin only.
export const PUBLIC_KEYS = ['services', 'specials', 'courses', 'blocked_dates'];

// Documents whose contents are irreplaceable; a write that shrinks one of these
// dramatically is refused as a safety net against the 2026-08-30 wipe class of bug.
export const GUARDED_KEYS = ['bookings', 'clients', 'course_enrollments', 'pro_orders'];

const SESSION_COOKIE = 'lunas_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

/* ─────────────────────────── small helpers ─────────────────────────── */

export function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

export const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);

const enc = new TextEncoder();

export async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string compare, so a wrong password cannot be found by timing.
export function safeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function b64url(bytes) {
  let s = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

/* ─────────────────────────── admin session ─────────────────────────── */

// The signing secret comes from the Cloudflare environment if set, otherwise
// from a server-only document in the database. Keeping a fallback there means
// admin sign-in keeps working without any manual configuration step.
let _secretCache = { value: null, at: 0 };
async function getSessionSecret(env) {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  if (_secretCache.value && Date.now() - _secretCache.at < 300000) return _secretCache.value;
  const r = await fsRead(env, 'server_config', { retries: 1 });
  const v = r.ok && r.data && r.data.sessionSecret ? r.data.sessionSecret : null;
  if (v) _secretCache = { value: v, at: Date.now() };
  return v;
}

export async function issueSession(env) {
  const secret = await getSessionSecret(env);
  if (!secret) throw new Error('No session secret configured');
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `v1.${exp}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifySession(request, env) {
  const secret = await getSessionSecret(env);
  if (!secret) return false;
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp('(?:^|;\\s*)' + SESSION_COOKIE + '=([^;]+)'));
  if (!m) return false;
  const token = decodeURIComponent(m[1]);
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [v, expStr, sig] = parts;
  const expected = await hmac(secret, `${v}.${expStr}`);
  if (!safeEqual(sig, expected)) return false;
  return Number(expStr) > Date.now();
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`;
}

export function clearCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export async function requireAdmin(request, env) {
  return (await verifySession(request, env)) ? null : bad('Not authorised', 401);
}

/* ──────────────────── Firestore access (server side) ──────────────────── */

// The server authenticates to Firestore as a dedicated Firebase Auth user, so
// security rules can deny everyone else. Token is cached per isolate.
let _tokenCache = { token: null, uid: null, exp: 0 };
let _lastAuthError = null;

async function getIdToken(env) {
  if (!env.FB_SERVER_EMAIL || !env.FB_SERVER_PASSWORD || !env.FB_API_KEY) return null;
  // Dashboard fields pick up stray spaces very easily. Whitespace is never valid
  // in an email address or an API key, so trim those; the password is passed
  // through untouched in case a space is genuinely part of it.
  const email = String(env.FB_SERVER_EMAIL).trim();
  const apiKey = String(env.FB_API_KEY).trim();
  if (_tokenCache.token && Date.now() < _tokenCache.exp - 60000) return _tokenCache.token;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: env.FB_SERVER_PASSWORD, returnSecureToken: true }),
    }
  );
  if (!res.ok) {
    let reason = 'HTTP ' + res.status;
    try { const e = await res.json(); reason = (e.error && e.error.message) || reason; } catch (x) {}
    _lastAuthError = reason;
    console.error('[auth] server sign-in failed', reason);
    return null;
  }
  _lastAuthError = null;
  const data = await res.json();
  _tokenCache = { token: data.idToken, uid: data.localId, exp: Date.now() + (Number(data.expiresIn || 3600) * 1000) };
  return _tokenCache.token;
}

function docUrl(env, key, extra = '') {
  const project = env.FB_PROJECT || FB_PROJECT_DEFAULT;
  const base = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/site_data/${key}`;
  return extra ? `${base}?${extra}` : base;
}

async function authHeaders(env) {
  const t = await getIdToken(env);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Reads one document. { ok, data, updateTime }. ok:false means the read FAILED -
// callers must never treat that as "no data" (that mistake destroyed ~100 bookings).
export async function fsRead(env, key, { retries = 2, timeoutMs = 10000 } = {}) {
  let lastErr = 'unknown';
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt) await new Promise(r => setTimeout(r, 300 * attempt));
    try {
      const res = await fetch(docUrl(env, key), {
        headers: await authHeaders(env),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status === 404) return { ok: true, data: null, updateTime: null };
      if (!res.ok) { lastErr = 'HTTP ' + res.status; continue; }
      const doc = await res.json();
      const sv = doc.fields?.value?.stringValue;
      return {
        ok: true,
        data: sv === undefined || sv === '' ? null : JSON.parse(sv),
        updateTime: doc.updateTime || null,
      };
    } catch (e) {
      lastErr = e.name === 'TimeoutError' ? 'timeout' : (e.message || 'network error');
    }
  }
  console.error('[fs] read failed', key, lastErr);
  return { ok: false, data: null, updateTime: null, error: lastErr };
}

// Writes one document. Pass baseUpdateTime for compare-and-swap; a concurrent
// change then fails with conflict:true instead of silently clobbering.
export async function fsWrite(env, key, value, baseUpdateTime = null) {
  let qs = 'updateMask.fieldPaths=value';
  if (baseUpdateTime) qs += `&currentDocument.updateTime=${encodeURIComponent(baseUpdateTime)}`;
  try {
    const res = await fetch(docUrl(env, key, qs), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders(env)) },
      body: JSON.stringify({ fields: { value: { stringValue: JSON.stringify(value) } } }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) return { ok: true };
    const txt = (await res.text()).slice(0, 300);
    const conflict = res.status === 409 || /FAILED_PRECONDITION/i.test(txt);
    console.error('[fs] write failed', key, res.status, txt);
    return { ok: false, conflict, status: res.status };
  } catch (e) {
    console.error('[fs] write threw', key, e.message);
    return { ok: false, conflict: false };
  }
}

// Read-modify-write with compare-and-swap and retry. mutator(list) may return
// false to signal "no change needed". Fails closed: a failed read never writes.
export async function fsMutate(env, key, mutator, { emptyValue = [], attempts = 4 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const cur = await fsRead(env, key);
    if (!cur.ok) return { ok: false, reason: 'read-failed' };
    const value = cur.data === null ? emptyValue : cur.data;

    const before = Array.isArray(value) ? value.length : null;
    const result = mutator(value);
    if (result === false) return { ok: true, noop: true, value };

    if (GUARDED_KEYS.includes(key) && before !== null && Array.isArray(value)) {
      if (before > 5 && value.length < before - 1) {
        console.error('[fs] refusing implausible shrink', key, before, '->', value.length);
        return { ok: false, reason: 'implausible-shrink' };
      }
    }

    const w = await fsWrite(env, key, value, cur.updateTime);
    if (w.ok) return { ok: true, value, extra: result };
    if (!w.conflict) return { ok: false, reason: 'write-failed' };
    // Someone else wrote in between - loop and reapply on fresh data.
  }
  return { ok: false, reason: 'conflict' };
}

/* ─────────────────────────── abuse limiting ─────────────────────────── */

// Per-IP limiter for the public write endpoints. Held in the isolate, so it is
// a speed bump rather than a hard guarantee, but it stops one caller hammering
// bookings or orders in a loop. The booking form also enforces its own cooldown.
const _hits = new Map();
export function rateLimited(request, bucket, max = 8, windowMs = 10 * 60 * 1000) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = bucket + ':' + ip;
  const now = Date.now();
  const rec = _hits.get(key);
  if (!rec || now > rec.reset) { _hits.set(key, { count: 1, reset: now + windowMs }); return false; }
  rec.count++;
  if (_hits.size > 5000) _hits.clear();   // never grow without bound
  return rec.count > max;
}

/* ─────────────────────────── validation ─────────────────────────── */

export const clean = (s, max = 300) => String(s == null ? '' : s).trim().slice(0, max);

export const isDateStr = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

export const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));

export const isPhone = s => /^[0-9+\-()\s]{7,30}$/.test(String(s || ''));

// Trinidad is UTC-4 with no DST; "today" must never be derived from UTC.
export function todayLocal() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Port_of_Spain' });
}

export function minBookableDate() {
  const d = new Date(todayLocal() + 'T12:00');
  d.setDate(d.getDate() + 1);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Reports whether the server can sign in to the database as the service account.
// Used by /api/admin/selftest to confirm configuration BEFORE the rules are
// locked down - once they are, a wrong password means an unreachable database.
export async function serverIdentity(env) {
  const configured = !!(env.FB_SERVER_EMAIL && env.FB_SERVER_PASSWORD && env.FB_API_KEY);
  if (!configured) {
    return { configured: false, signedIn: false, uid: null,
             detail: 'FB_SERVER_EMAIL / FB_SERVER_PASSWORD / FB_API_KEY are not all set on this deployment.' };
  }
  const token = await getIdToken(env);
  if (!token) {
    const pw = String(env.FB_SERVER_PASSWORD || '');
    const em = String(env.FB_SERVER_EMAIL || '');
    return {
      configured: true, signedIn: false, uid: null,
      detail: 'Credentials are set but sign-in was rejected.',
      firebaseSaid: _lastAuthError,
      passwordLength: pw.length,
      passwordHasEdgeSpace: pw !== pw.trim(),
      emailHasEdgeSpace: em !== em.trim(),
    };
  }
  return { configured: true, signedIn: true, uid: _tokenCache.uid || null, detail: 'Signed in successfully.' };
}
