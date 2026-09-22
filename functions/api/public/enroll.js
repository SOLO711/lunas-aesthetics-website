// POST /api/public/enroll
// Records a course enrolment from the contact form. The fee is looked up from
// the course catalogue server side rather than trusted from the browser.
import { fsRead, fsMutate, json, bad, clean, isEmail, isPhone , rateLimited } from '../../_lib.js';

// Trinidad dollars are the reporting currency: every revenue total in the admin
// panel (dashboard, analytics, enrolments) sums `amount` as TTD. A course priced
// in another currency is converted HERE so those totals stay in one currency and
// need no special cases. Update this one constant if the rate moves.
const USD_TO_TTD = 6.80;

// Pulls the number out of a free-text price like "TTD 5,000" or "USD 1,300".
// Note it strips every non-digit, so a price string must contain exactly ONE
// number - "USD 1,300 (approx TTD 8,840)" would parse as 13008840.
function parseAmount(str) {
  const n = parseFloat(String(str == null ? '' : str).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Works out what to record for a course fee. Returns the TTD figure used for
// reporting plus what was actually quoted, so a USD course is never silently
// flattened into TTD at 1:1.
function priceEnrolment(priceStr) {
  const raw = parseAmount(priceStr);
  const isUSD = /USD|US\$|(?:^|[^A-Z])\$/i.test(String(priceStr || ''));
  if (!isUSD || !raw) {
    return { amount: raw, currency: 'TTD', amountOriginal: raw, note: '' };
  }
  return {
    amount: Math.round(raw * USD_TO_TTD * 100) / 100,
    currency: 'USD',
    amountOriginal: raw,
    note: `Quoted USD ${raw.toLocaleString()} — recorded in TTD at ${USD_TO_TTD}`,
  };
}

export async function onRequestPost({ request, env }) {
  if (rateLimited(request, 'enroll', 6)) return bad('Too many requests. Please wait a few minutes and try again.', 429);

  let body;
  try { body = await request.json(); } catch { return bad('Malformed request'); }

  if (clean(body.website)) return json({ ok: true, ignored: true }); // honeypot

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 160);
  const course = clean(body.course, 200) || 'Unknown Course';

  if (!name) return bad('Please enter your name.');
  if (phone && !isPhone(phone)) return bad('Please enter a valid phone number.');
  if (email && !isEmail(email)) return bad('Please enter a valid email address.');

  const courses = await fsRead(env, 'courses');
  if (!courses.ok) return json({ ok: false, error: 'Unable to record your enrolment right now — please try again.' }, 503);
  const matched = (courses.data || []).find(c => c && c.name === course);

  const priced = matched
    ? priceEnrolment(matched.price)
    : { amount: 0, currency: 'TTD', amountOriginal: 0, note: '' };

  const enrollment = {
    id: 'ce_' + Date.now(),
    name, phone, email,
    course,
    amount: priced.amount,               // always TTD - what the revenue totals use
    currency: priced.currency,           // what the student was actually quoted
    amountOriginal: priced.amountOriginal,
    enrolledDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: priced.note,
    source: 'website',
  };

  const res = await fsMutate(env, 'course_enrollments', list => { list.unshift(enrollment); });
  if (!res.ok) return json({ ok: false, error: 'Unable to record your enrolment right now — please try again.' }, 503);

  return json({ ok: true, enrollment });
}
