// GET /api/admin/selftest — configuration pre-flight, admin session required.
// Confirms the server can reach the database as the service account, so the
// Firestore lockdown can be published with confidence rather than hope.
import { json, requireAdmin, serverIdentity, fsRead } from '../../_lib.js';

export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const identity = await serverIdentity(env);
  const probe = await fsRead(env, 'clients', { retries: 1 });

  return json({
    ok: true,
    serviceAccount: identity,
    databaseReachable: probe.ok,
    recordsVisible: probe.ok && Array.isArray(probe.data) ? probe.data.length : null,
    readyToLockDown: identity.signedIn === true && probe.ok === true,
  });
}
