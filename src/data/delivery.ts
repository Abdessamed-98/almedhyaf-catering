// Mock job feed for the Delivery Man (driver) app.
// A driver job wraps a DELIVERY order from orders.ts and adds the
// driver-facing economics (payout, tip, distance, COD) + a trip lifecycle.
import { Order, OPay, RESTAURANT, makeOrder, orderTotal } from './orders';

// driver-side lifecycle (distinct from the kitchen's OStatus)
export type JobStage =
  | 'OFFERED'        // an offer the driver can accept / decline
  | 'TO_RESTAURANT'  // accepted, heading to pick up
  | 'AT_RESTAURANT'  // arrived, waiting on / collecting the order
  | 'TO_CUSTOMER'    // picked up, on the way
  | 'ARRIVED'        // at the customer's location
  | 'DELIVERED'      // completed
  | 'DECLINED';

export interface DriverJob {
  order: Order;        // underlying DELIVERY order (has lat/lng/address/customer)
  stage: JobStage;
  distanceKm: number;  // restaurant → customer, straight-line
  payout: number;      // driver earnings (base + per-km), excl. tip
  tip: number;         // customer tip
  etaMin: number;      // estimated trip minutes
  offeredAt: number;   // when the offer arrived (for the accept countdown)
  acceptedAt?: number;
  deliveredAt?: number;
}

// ── the logged-in driver (bilingual profile) ──
export const DRIVER = {
  nameAr: 'سعد المطيري',
  nameEn: 'Saad Al-Mutairi',
  rating: 4.9,
  trips: 1284,
  acceptance: 96,           // %
  vehicleAr: 'دباب',
  vehicleEn: 'Motorbike',
  plate: 'ر ن ق 4821',
  joinedAr: 'منذ 2023',
  joinedEn: 'Since 2023',
};

// ── economics ──
const BASE_FARE = 6;        // SAR flat
const PER_KM = 2.5;         // SAR per km
const codAmount = (o: Order): number => (o.payment === 'CASH' ? o.total : 0);

// haversine distance (km)
export const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number): number => {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const round1 = (n: number) => Math.round(n * 10) / 10;
export const hasCod = (j: DriverJob) => codAmount(j.order) > 0;
export const codOf = (j: DriverJob) => codAmount(j.order);
export const tripEarnings = (j: DriverJob) => j.payout + j.tip;

const rnd = (n: number) => Math.floor(Math.random() * n);

// turn any order into a delivery order (force the type so we always get coords)
const deliveryOrder = (): Order => {
  let o = makeOrder();
  for (let i = 0; i < 6 && (o.type !== 'DELIVERY' || o.lat == null); i++) o = makeOrder();
  if (o.lat == null) {
    // extremely unlikely fallback — pin near the restaurant
    o = { ...o, type: 'DELIVERY', lat: RESTAURANT.lat + 0.02, lng: RESTAURANT.lng + 0.02, area: 'العزيزية', address: 'العزيزية - شارع 12', total: orderTotal(o.items) };
  }
  return o;
};

// build a fresh offer (used by the live simulation + the seed)
export const makeJob = (): DriverJob => {
  const order = deliveryOrder();
  const dist = round1(distanceKm(RESTAURANT.lat, RESTAURANT.lng, order.lat!, order.lng!));
  const payout = Math.round(BASE_FARE + dist * PER_KM);
  const tip = Math.random() < 0.4 ? [3, 5, 5, 10][rnd(4)] : 0;
  const etaMin = Math.max(10, Math.round(dist * 3 + 8));
  return { order, stage: 'OFFERED', distanceKm: dist, payout, tip, etaMin, offeredAt: Date.now() };
};

// a delivered job for the earnings history / seeded ledger
const deliveredJob = (minsAgo: number): DriverJob => {
  const j = makeJob();
  return { ...j, stage: 'DELIVERED', acceptedAt: Date.now() - (minsAgo + 25) * 60000, deliveredAt: Date.now() - minsAgo * 60000 };
};

// ── seeds ──
// a couple of fresh offers so the Jobs tab looks alive on open
export const SEED_OFFERS: DriverJob[] = [makeJob(), makeJob()];

// today's completed deliveries (drives the Earnings tab)
export const SEED_HISTORY: DriverJob[] = [
  deliveredJob(35),
  deliveredJob(95),
  deliveredJob(150),
  deliveredJob(220),
  deliveredJob(290),
];

// last 7 days of earnings totals (SAR) for the weekly bar chart — today is last
export const WEEKLY: { ar: string; en: string; total: number }[] = [
  { ar: 'سبت', en: 'Sat', total: 218 },
  { ar: 'أحد', en: 'Sun', total: 264 },
  { ar: 'إثن', en: 'Mon', total: 175 },
  { ar: 'ثلا', en: 'Tue', total: 312 },
  { ar: 'أرب', en: 'Wed', total: 240 },
  { ar: 'خمي', en: 'Thu', total: 358 },
  { ar: 'جمع', en: 'Fri', total: 0 }, // today, filled live
];

export { type Order, type OPay, RESTAURANT } from './orders';
