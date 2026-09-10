// Scheduling rules, ported verbatim from script.js so the server reaches the same
// answer as the booking page. These are now the AUTHORITATIVE copy: the browser
// can be tampered with, this cannot.

export const SLOT_GRID_24 = ['10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];

export function to12hr(t24) {
  const [h, m] = t24.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export const SLOT_GRID_12 = SLOT_GRID_24.map(to12hr);

export const CLOSING_MINUTES = 17 * 60; // salon closes 5:00 PM

export function toMins(t24) {
  const [h, m] = String(t24).split(':').map(Number);
  return h * 60 + m;
}

export function parseDurationMinutes(str) {
  if (!str) return 30;
  const hMatch = String(str).match(/(\d+)\s*h/i);
  const mMatch = String(str).match(/(\d+)\s*m/i);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
  const total = hours * 60 + mins;
  return total > 0 ? total : 30;
}

export function totalDurationMinutes(services) {
  if (!services || !services.length) return 30;
  return services.reduce((sum, s) => sum + parseDurationMinutes(s && s.duration), 0);
}

export function occupiedSlots(startTime12hr, durationMinutes) {
  const idx = SLOT_GRID_12.indexOf(startTime12hr);
  if (idx === -1) return [startTime12hr];
  const start = toMins(SLOT_GRID_24[idx]);
  const end = start + durationMinutes;
  return SLOT_GRID_24.filter(t => { const m = toMins(t); return m >= start && m < end; }).map(to12hr);
}

export function manualBlockedSlots(startTime, endTime) {
  const start = toMins(startTime);
  const end = toMins(endTime);
  return SLOT_GRID_24.filter(t => { const m = toMins(t); return m >= start && m < end; }).map(to12hr);
}

export function isDateBlocked(bd, dateStr) {
  bd = bd || {};
  return (bd.days || []).includes(dateStr) || (bd.months || []).includes(String(dateStr).substring(0, 7));
}

export function isSlotBlocked(bd, dateStr, timeStr) {
  bd = bd || {};
  return (bd.timeSlots || []).some(s => s.date === dateStr && s.slot === timeStr);
}

// Mondays are closed (0=Sun, 1=Mon). Parsed as local, never UTC.
export function isMonday(dateStr) {
  return new Date(dateStr + 'T00:00').getDay() === 1;
}

// Everything the booking page needs to draw the slot grid - and nothing more.
// Deliberately returns only time strings: no names, phones or emails ever leave
// the server for an anonymous caller.
export function computeAvailability(bookings, manualEvents, dateStr) {
  const chelcBooked = [];
  const timothyBooked = [];
  const manualBlocked = [];

  (bookings || [])
    .filter(b => b && b.date === dateStr && b.status !== 'cancelled')
    .forEach(b => {
      const occ = occupiedSlots(b.time, totalDurationMinutes(b.services));
      if (b.esthetician === 'timothy') timothyBooked.push(...occ);
      else chelcBooked.push(...occ);
    });

  (manualEvents || [])
    .filter(e => e && e.date === dateStr && e.startTime && e.endTime)
    .forEach(e => manualBlocked.push(...manualBlockedSlots(e.startTime, e.endTime)));

  return { chelcBooked, timothyBooked, manualBlocked };
}
