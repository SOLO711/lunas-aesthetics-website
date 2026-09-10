// POST /api/public/book
// Creates a booking. Every rule is enforced here, on the server, because the
// browser copy can be edited by anyone. The booking record itself is unchanged
// in shape, so the admin panel and all reporting keep working exactly as before.
import { fsRead, fsMutate, json, bad, clean, isDateStr, isEmail, isPhone, minBookableDate , rateLimited } from '../../_lib.js';
import { computeAvailability, isDateBlocked, isSlotBlocked, isMonday, totalDurationMinutes, occupiedSlots } from '../../_slots.js';

export async function onRequestPost({ request, env }) {
  if (rateLimited(request, 'book', 8)) return bad('Too many requests. Please wait a few minutes and try again.', 429);

  let body;
  try { body = await request.json(); } catch { return bad('Malformed request'); }

  // Honeypot: real people never fill this.
  if (clean(body.website)) return json({ ok: true, ignored: true });

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 160);
  const notes = clean(body.notes, 1000);
  const date = clean(body.date, 10);
  const time = clean(body.time, 20);
  const esthetician = body.esthetician === 'timothy' ? 'timothy' : 'chel-c';
  const services = Array.isArray(body.services) ? body.services.slice(0, 12).map(s => ({
    name: clean(s && s.name, 160),
    price: clean(s && s.price, 40),
    duration: clean(s && s.duration, 40),
    category: s && s.category ? clean(s.category, 80) : null,
  })) : [];

  if (!name) return bad('Please enter your name.');
  if (!isPhone(phone)) return bad('Please enter a valid phone number.');
  if (email && !isEmail(email)) return bad('Please enter a valid email address.');
  if (!services.length) return bad('Please add at least one service.');
  if (!isDateStr(date)) return bad('Please choose a valid date.');
  if (!time) return bad('Please choose a time.');

  // No same-day bookings online.
  if (date < minBookableDate()) {
    return bad("Same-day bookings aren't available online. Please choose a date from tomorrow onwards, or call 1(868) 463-9306.", 409);
  }
  if (isMonday(date)) return bad("We're closed on Mondays — please choose another day.", 409);

  const bd = await fsRead(env, 'blocked_dates');
  if (!bd.ok) return json({ ok: false, error: 'Unable to verify availability right now — please try again.' }, 503);
  if (isDateBlocked(bd.data, date)) return bad('That date is no longer available. Please choose a different date.', 409);
  if (isSlotBlocked(bd.data, date, time)) return bad('That time is no longer available. Please choose a different time.', 409);

  // Blocked-client check now happens here. It used to run in the browser, which
  // required shipping the entire client list to every visitor.
  const cl = await fsRead(env, 'clients');
  if (!cl.ok) return json({ ok: false, error: 'Unable to verify your details right now — please try again.' }, 503);
  const existing = (cl.data || []).find(c => c && c.phone === phone);
  if (existing && (existing.blocked === true || existing.status === 'blocked')) {
    return bad('We are unable to take this booking online. Please contact us on 1(868) 463-9306.', 403);
  }

  const me = await fsRead(env, 'manual_events');
  if (!me.ok) return json({ ok: false, error: 'Unable to verify availability right now — please try again.' }, 503);

  const booking = {
    id: Date.now(),
    name, phone, email,
    services,
    service: clean(body.service, 400) || services.map(s => s.name).join(' + '),
    price: clean(body.price, 60),
    discountedPrice: body.discountedPrice ? clean(body.discountedPrice, 60) : null,
    promoApplied: body.promoApplied ? clean(body.promoApplied, 120) : null,
    date, time, notes,
    status: 'confirmed',
    esthetician,
    created: new Date().toISOString(),
  };

  let conflict = null;
  let duplicate = false;

  const res = await fsMutate(env, 'bookings', list => {
    // Idempotency: a retry after a lost response must not double-book.
    if (list.some(b => b && b.phone === phone && b.date === date && b.time === time && b.status !== 'cancelled')) {
      duplicate = true;
      return false;
    }
    // Authoritative double-booking check against the freshest data.
    const { chelcBooked, timothyBooked, manualBlocked } = computeAvailability(list, me.data || [], date);
    const taken = esthetician === 'timothy' ? timothyBooked : chelcBooked;
    const wanted = occupiedSlots(time, totalDurationMinutes(services));
    if (wanted.some(s => taken.includes(s) || manualBlocked.includes(s))) {
      conflict = 'slot';
      return false;
    }
    list.push(booking);
  });

  if (conflict === 'slot') return bad('That time was just taken. Please choose a different time.', 409);
  if (duplicate) return json({ ok: true, booking, duplicate: true });
  if (!res.ok) {
    return json({ ok: false, error: "We couldn't confirm your booking with our server — nothing was saved. Please try again, or call 1(868) 463-9306." }, 503);
  }

  // Client record is derived data; a failure here must not fail the booking.
  const cRes = await fsMutate(env, 'clients', clients => {
    const i = clients.findIndex(c => c && c.phone === phone);
    if (i >= 0) {
      clients[i].lastVisit = date;
      clients[i].totalVisits = (clients[i].totalVisits || 0) + 1;
      if (!clients[i].email && email) clients[i].email = email;
    } else {
      clients.push({
        id: Date.now() + 1, name, phone, email: email || '',
        dob: '', notes: '', lastVisit: date, totalVisits: 1,
        created: new Date().toISOString(),
      });
    }
  });
  if (!cRes.ok) console.warn('[book] client record not updated for', phone, cRes.reason);

  return json({ ok: true, booking });
}
