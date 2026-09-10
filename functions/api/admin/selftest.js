// GET /api/admin/selftest — configuration pre-flight, admin session required.
// Confirms the server can reach the database as the service account, so the
// Firestore lockdown can be published with confidence rather than hope.
import { json, requireAdmin, serverIdentity, fsRead } from '../../_lib.js';

export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const identity = await serverIdentity(env);

  // Presence only - never the values themselves. This pinpoints a missing or
  // misspelled variable without exposing a credential.
  const present = {
    FB_SERVER_EMAIL: !!env.FB_SERVER_EMAIL,
    FB_SERVER_PASSWORD: !!env.FB_SERVER_PASSWORD,
    FB_API_KEY: !!env.FB_API_KEY,
  };
  // Anything that looks like our variables but is spelled differently.
  const lookalikes = Object.keys(env || {}).filter(k =>
    /^FB|FIREBASE|SERVER_EMAIL|API_KEY|SERVER_PASSWORD/i.test(k) && !(k in present));
  const probe = await fsRead(env, 'clients', { retries: 1 });

  return json({
    ok: true,
    serviceAccount: identity,
    variablesPresent: present,
    similarlyNamedVariablesFound: lookalikes,
    emailEndsWith: env.FB_SERVER_EMAIL ? String(env.FB_SERVER_EMAIL).slice(-18) : null,
    apiKeyLooksRight: env.FB_API_KEY ? String(env.FB_API_KEY).startsWith('AIzaSy') : null,
    databaseReachable: probe.ok,
    recordsVisible: probe.ok && Array.isArray(probe.data) ? probe.data.length : null,
    readyToLockDown: identity.signedIn === true && probe.ok === true,
  });
}
