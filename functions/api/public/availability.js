// GET /api/public/availability?date=YYYY-MM-DD
// Replaces the browser reading the whole bookings collection. Returns only which
// 30-minute slots are taken - never who booked them.
import { fsRead, json, bad, isDateStr } from '../../_lib.js';
import { computeAvailability, isDateBlocked, isSlotBlocked, SLOT_GRID_12, isMonday } from '../../_slots.js';

export async function onRequestGet({ request, env }) {
  const date = new URL(request.url).searchParams.get('date') || '';
  if (!isDateStr(date)) return bad('A valid date is required');

  const [bk, me, bd] = await Promise.all([
    fsRead(env, 'bookings'),
    fsRead(env, 'manual_events'),
    fsRead(env, 'blocked_dates'),
  ]);

  // Fail closed: if we cannot verify, the page must not render slots as free.
  if (!bk.ok || !me.ok || !bd.ok) return json({ ok: false, error: 'unavailable' }, 503);

  const { chelcBooked, timothyBooked, manualBlocked } = computeAvailability(bk.data || [], me.data || [], date);
  const blocked = bd.data || {};

  return json({
    ok: true,
    date,
    chelcBooked,
    timothyBooked,
    manualBlocked,
    dateBlocked: isDateBlocked(blocked, date),
    monday: isMonday(date),
    blockedSlots: SLOT_GRID_12.filter(t => isSlotBlocked(blocked, date, t)),
  });
}
