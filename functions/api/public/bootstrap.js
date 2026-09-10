// GET /api/public/bootstrap
// The non-personal configuration every page needs to render: the service menu,
// active specials, courses and which dates are closed. No customer data.
import { fsRead, json, PUBLIC_KEYS } from '../../_lib.js';

export async function onRequestGet({ env }) {
  const out = {};
  const failed = [];
  await Promise.all(
    PUBLIC_KEYS.map(async key => {
      const r = await fsRead(env, key);
      if (r.ok) out[key] = r.data;
      else failed.push(key);
    })
  );
  // Report partial failure so the browser can fail closed rather than treat a
  // failed read as "nothing is blocked".
  return json({ ok: failed.length === 0, data: out, failed }, failed.length ? 503 : 200);
}
