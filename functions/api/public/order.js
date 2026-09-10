// POST /api/public/order
// Places a Professionals-shop order. Prices and shipping are recalculated here
// from the server's own price list, so a tampered browser cannot set its own
// totals, and the invoice number is allocated atomically.
import { fsRead, fsMutate, fsWrite, json, bad, clean, isEmail, isPhone , rateLimited } from '../../_lib.js';
import { PRO_PRICES } from '../../_proPrices.js';

const SHIP_TRINIDAD = 50;
const SHIP_TOBAGO = 70;

export async function onRequestPost({ request, env }) {
  if (rateLimited(request, 'order', 6)) return bad('Too many requests. Please wait a few minutes and try again.', 429);

  let body;
  try { body = await request.json(); } catch { return bad('Malformed request'); }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const deliveryMethod = body.deliveryMethod === 'delivery' ? 'delivery' : 'pickup';
  const island = body.island === 'tobago' ? 'tobago' : 'trinidad';
  const address = clean(body.address, 500);

  if (!name) return bad('Please enter your name.');
  if (!isPhone(phone)) return bad('Please enter a valid phone number.');
  if (!isEmail(email)) return bad('Please enter a valid email address.');
  if (deliveryMethod === 'delivery' && !address) return bad('Please enter a shipping address.');

  const raw = Array.isArray(body.items) ? body.items.slice(0, 60) : [];
  if (!raw.length) return bad('Your cart is empty.');

  // Reprice from the server's own list; ignore whatever the browser claimed.
  const byName = {};
  for (const [id, p] of Object.entries(PRO_PRICES)) byName[p.name] = { id, ...p };

  const items = [];
  for (const it of raw) {
    // Prefer the id; fall back to an exact name match so carts saved in a
    // visitor's browser before this change still check out correctly.
    let ref = PRO_PRICES[String(it && it.id)];
    let id = it && it.id;
    if (!ref && it && it.name && byName[it.name]) { ref = byName[it.name]; id = byName[it.name].id; }
    if (!ref) return bad('One of the items in your cart is no longer available.');
    const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
    items.push({ id: Number(id), name: ref.name, price: ref.price, qty });
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = deliveryMethod === 'delivery' ? (island === 'tobago' ? SHIP_TOBAGO : SHIP_TRINIDAD) : 0;
  const total = subtotal + shipping;

  // Allocate the invoice number atomically - two simultaneous orders must never
  // be handed the same number.
  let invoiceNo = null;
  const counter = await fsMutate(env, 'pro_order_counter', () => false, { emptyValue: 0 });
  if (!counter.ok) {
    return json({ ok: false, error: "We couldn't reach our server to raise your invoice — nothing was ordered. Please try again." }, 503);
  }
  for (let attempt = 0; attempt < 4 && invoiceNo === null; attempt++) {
    const cur = await fsRead(env, 'pro_order_counter');
    if (!cur.ok) break;
    const next = (typeof cur.data === 'number' && !isNaN(cur.data) ? cur.data : 0) + 1;
    const w = await fsWrite(env, 'pro_order_counter', next, cur.updateTime);
    if (w.ok) invoiceNo = next;
    else if (!w.conflict) break;
  }
  if (invoiceNo === null) {
    return json({ ok: false, error: "We couldn't reach our server to raise your invoice — nothing was ordered. Please try again." }, 503);
  }

  const order = {
    id: Date.now(),
    invoiceId: 'INV-LEABUSH' + String(invoiceNo).padStart(6, '0'),
    name, email, phone,
    deliveryMethod,
    island: deliveryMethod === 'delivery' ? island : null,
    address: deliveryMethod === 'delivery' ? address : null,
    items, subtotal, shipping, total,
    status: 'pending',
    created: new Date().toISOString(),
  };

  const res = await fsMutate(env, 'pro_orders', list => { list.push(order); });
  if (!res.ok) {
    return json({ ok: false, error: "We couldn't confirm your order with our server — nothing was saved. Please try again, or call 1(868) 463-9306." }, 503);
  }

  return json({ ok: true, order });
}
