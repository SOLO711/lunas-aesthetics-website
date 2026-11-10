// GET /api/public/seats
// How many places are left on the courses that cap enrolment.
//
// Returns counts and nothing else. `course_enrollments` is a GUARDED key and
// never leaves the server - no name, phone, email or fee is exposed here, only
// how many rows matched. Deliberately NOT folded into /api/public/bootstrap,
// which every page on the site calls: this needs a second document read, and
// only the courses page has any use for it.
//
// The numbers here are for display. They are never what stops an eleventh
// student enrolling - /api/public/enroll does its own count inside the same
// read-modify-write that appends the row, because a figure fetched when the
// page loaded says nothing about who submitted in the meantime.
import { fsRead, json } from '../../_lib.js';

// Same normalisation enroll.js uses, so a course whose name was typed with a
// stray double space or a hyphen in place of an em dash still matches its own
// enrolments.
const norm = t => String(t || '')
  .replace(/[‐-―−]/g, '-')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

export async function onRequestGet({ env }) {
  const courses = await fsRead(env, 'courses');
  if (!courses.ok) return json({ ok: false, seats: {} }, 503);

  // Only courses that actually declare a cap. With none, the enrolments
  // document is never read at all.
  const capped = (courses.data || []).filter(c => c && parseInt(c.seats, 10) > 0);
  if (!capped.length) return json({ ok: true, seats: {} });

  const enrolments = await fsRead(env, 'course_enrollments');
  if (!enrolments.ok) return json({ ok: false, seats: {} }, 503);
  const list = enrolments.data || [];

  const seats = {};
  for (const c of capped) {
    const cap = parseInt(c.seats, 10);
    const key = norm(c.name);
    // A cancelled enrolment gives its place back; pending, confirmed and
    // completed all hold one.
    const taken = list.filter(
      e => e && norm(e.course) === key && e.status !== 'cancelled'
    ).length;
    seats[c.name] = {
      cap,
      taken,
      left: Math.max(0, cap - taken),
      full: taken >= cap,
    };
  }

  return json({ ok: true, seats });
}
