// GET /api/admin/session  -> is the caller signed in?
import { verifySession, json } from '../../_lib.js';

export async function onRequestGet({ request, env }) {
  return json({ ok: true, authed: await verifySession(request, env) });
}
