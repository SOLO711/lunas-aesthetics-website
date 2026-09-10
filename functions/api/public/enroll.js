// POST /api/public/enroll
// Records a course enrolment from the contact form. The fee is looked up from
// the course catalogue server side rather than trusted from the browser.
import { fsRead, fsMutate, json, bad, clean, isEmail, isPhone } from '../../_lib.js';

function parseTTD(str) {
  const n = parseFloat(String(str == null ? '' : str).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

export async function onRequestPost({ request, env }) {
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

  const enrollment = {
    id: 'ce_' + Date.now(),
    name, phone, email,
    course,
    amount: matched ? parseTTD(matched.price) : 0,
    enrolledDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    source: 'website',
  };

  const res = await fsMutate(env, 'course_enrollments', list => { list.unshift(enrollment); });
  if (!res.ok) return json({ ok: false, error: 'Unable to record your enrolment right now — please try again.' }, 503);

  return json({ ok: true, enrollment });
}
