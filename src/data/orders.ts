// Mock order feed for the Order Management app — orders "placed in the ordering app".
import { POS_MENU, PosProduct } from './menu';

export type OType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';
export type OStatus = 'NEW' | 'PREPARING' | 'READY' | 'ON_WAY' | 'DONE' | 'CANCELLED';
export type OSource = 'APP' | 'WEBSITE' | 'PHONE';
export type OPay = 'MADA' | 'APPLE_PAY' | 'CASH' | 'ONLINE';

export interface OAddon { name: string; price: number; }
export interface OItem { product: PosProduct; qty: number; addons: OAddon[]; }
export interface Order {
  id: string;
  source: OSource;
  type: OType;
  status: OStatus;
  items: OItem[];
  customer: string;
  phone: string;
  area?: string;
  address?: string;
  lat?: number;
  lng?: number;
  driver?: string;
  payment: OPay;
  placedAt: number;     // epoch ms
  statusSince: number;  // when it entered the current status (for SLA aging)
  scheduledFor?: number; // set => scheduled order; absent => ASAP / "now"
  prepMin?: number;     // promised prep time set on accept
  notifyBefore?: number; // scheduled orders: minutes before the slot to remind the kitchen
  rejectReason?: string;
  total: number;        // VAT-inclusive
}

export const RESTAURANT = { name: 'مطبخ المضياف العربي', lat: 21.4012, lng: 39.8579 };

export const ACTIVE: OStatus[] = ['NEW', 'PREPARING', 'READY', 'ON_WAY'];

// status flow differs for delivery (adds ON_WAY)
export const nextStatus = (o: Order): OStatus | null => {
  const flow: OStatus[] = o.type === 'DELIVERY' ? ['NEW', 'PREPARING', 'READY', 'ON_WAY', 'DONE'] : ['NEW', 'PREPARING', 'READY', 'DONE'];
  const i = flow.indexOf(o.status);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
};

export const itemTotal = (it: OItem) => (it.product.price + it.addons.reduce((s, a) => s + a.price, 0)) * it.qty;
export const orderTotal = (items: OItem[]) => items.reduce((s, it) => s + itemTotal(it), 0);

const AREAS = [
  { name: 'العزيزية', lat: 21.4012, lng: 39.8579 },
  { name: 'الشرائع', lat: 21.3539, lng: 39.9869 },
  { name: 'النسيم', lat: 21.4475, lng: 39.9180 },
  { name: 'الرصيفة', lat: 21.3700, lng: 39.8400 },
  { name: 'العوالي', lat: 21.3200, lng: 39.9300 },
  { name: 'الكعكية', lat: 21.4100, lng: 39.8000 },
];
const CUSTOMERS = ['أبو محمد العتيبي', 'سارة القحطاني', 'فهد الشهري', 'نورة الزهراني', 'عبدالله العمري', 'ريم السبيعي', 'تركي الدوسري', 'منى الحربي', 'ماجد الغامدي', 'هند المالكي'];
export const DRIVERS = ['أحمد المالكي', 'سعيد الغامدي', 'خالد الحربي', 'ماجد العتيبي'];
const PAYS: OPay[] = ['MADA', 'APPLE_PAY', 'CASH', 'ONLINE'];

const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: T[]): T => a[rnd(a.length)];
const phone = () => '05' + Array.from({ length: 8 }, () => rnd(10)).join('');
const prod = (id: number) => POS_MENU.find(p => p.id === id)!;
const item = (id: number, qty: number, addons: OAddon[] = []): OItem => ({ product: prod(id), qty, addons });

let seq = 1051;

// build a fresh, realistic order (used by the + button and the live simulation)
export const makeOrder = (): Order => {
  const type: OType = pick<OType>(['DELIVERY', 'DELIVERY', 'PICKUP', 'DINE_IN']);
  const n = 1 + rnd(3);
  const items: OItem[] = Array.from({ length: n }, () => {
    const p = pick(POS_MENU);
    const addons: OAddon[] = (p.modifiers || []).flatMap(g => Math.random() < 0.55 ? [pick(g.options)] : [])
      .filter(o => o.price > 0 || Math.random() < 0.5).map(o => ({ name: o.name, price: o.price }));
    return { product: p, qty: 1 + rnd(2), addons };
  });
  const area = pick(AREAS);
  const o: Order = {
    id: `#${seq++}`,
    source: Math.random() < 0.85 ? 'APP' : 'WEBSITE',
    type,
    status: 'NEW',
    items,
    customer: pick(CUSTOMERS),
    phone: phone(),
    payment: pick(PAYS),
    placedAt: Date.now(),
    statusSince: Date.now(),
    total: orderTotal(items),
  };
  if (type === 'DELIVERY') {
    o.area = area.name;
    o.address = `${area.name} - شارع ${1 + rnd(40)}، مبنى ${1 + rnd(80)}`;
    o.lat = area.lat + (Math.random() - 0.5) * 0.02;
    o.lng = area.lng + (Math.random() - 0.5) * 0.02;
  }
  if (Math.random() < 0.18) o.scheduledFor = Date.now() + (1 + rnd(6)) * 3600000;
  return o;
};

// sequential id for staff-created orders (shares the same counter)
export const newOrderId = () => `#${seq++}`;

const min = (m: number) => Date.now() - m * 60000;
const deliv = (i: number) => ({ area: AREAS[i].name, address: `${AREAS[i].name} - شارع ${10 + i * 3}`, lat: AREAS[i].lat + 0.004, lng: AREAS[i].lng - 0.003 });

// seeded snapshot so the board looks alive on open
export const SEED_ORDERS: Order[] = ([
  { id: '#1050', source: 'APP', type: 'DELIVERY', status: 'NEW', items: [item(1, 1, [{ name: 'بخاري', price: 4 }, { name: 'صنوبر', price: 6 }]), item(31, 2)], customer: 'سارة القحطاني', phone: '0559876543', payment: 'APPLE_PAY', placedAt: min(1), total: 0, ...deliv(1) },
  { id: '#1049', source: 'APP', type: 'PICKUP', status: 'NEW', items: [item(9, 1, [{ name: 'حار', price: 0 }, { name: 'صلصة ثوم', price: 3 }]), item(33, 2)], customer: 'تركي الدوسري', phone: '0533219876', payment: 'MADA', placedAt: min(3), scheduledFor: min(-150), total: 0 },
  { id: '#1048', source: 'WEBSITE', type: 'DELIVERY', status: 'PREPARING', items: [item(3, 1, [{ name: 'عائلي (يكفي 4)', price: 95 }]), item(27, 1)], customer: 'عبدالله العمري', phone: '0501122334', payment: 'ONLINE', placedAt: min(8), total: 0, ...deliv(0) },
  { id: '#1047', source: 'APP', type: 'DINE_IN', status: 'PREPARING', items: [item(11, 2), item(21, 1), item(30, 2)], customer: 'نورة الزهراني', phone: '0567788991', payment: 'CASH', placedAt: min(12), total: 0 },
  { id: '#1046', source: 'APP', type: 'DELIVERY', status: 'READY', items: [item(4, 2, [{ name: 'وليمة (يكفي 8)', price: 210 }])], customer: 'هند المالكي', phone: '0544455667', payment: 'MADA', placedAt: min(18), total: 0, ...deliv(2) },
  { id: '#1045', source: 'APP', type: 'DELIVERY', status: 'ON_WAY', items: [item(2, 1), item(10, 1, [{ name: 'كمّاج', price: 3 }]), item(32, 2)], customer: 'فهد الشهري', phone: '0509988776', driver: 'أحمد المالكي', payment: 'APPLE_PAY', placedAt: min(26), total: 0, ...deliv(3) },
  { id: '#1044', source: 'WEBSITE', type: 'PICKUP', status: 'READY', items: [item(26, 3), item(28, 2)], customer: 'ريم السبيعي', phone: '0521234567', payment: 'MADA', placedAt: min(22), total: 0 },
  { id: '#1043', source: 'APP', type: 'DELIVERY', status: 'DONE', items: [item(5, 1), item(19, 2)], customer: 'ماجد الغامدي', phone: '0566677889', driver: 'سعيد الغامدي', payment: 'ONLINE', placedAt: min(75), total: 0, ...deliv(4) },
  { id: '#1042', source: 'APP', type: 'DINE_IN', status: 'DONE', items: [item(12, 1), item(9, 1), item(31, 3)], customer: 'أبو محمد العتيبي', phone: '0501234567', payment: 'CASH', placedAt: min(95), total: 0 },
  { id: '#1041', source: 'WEBSITE', type: 'DELIVERY', status: 'CANCELLED', items: [item(8, 1)], customer: 'عبدالله العمري', phone: '0512345678', payment: 'ONLINE', placedAt: min(140), total: 0, ...deliv(5) },
  { id: '#1040', source: 'APP', type: 'PICKUP', status: 'DONE', items: [item(6, 2), item(23, 4)], customer: 'منى الحربي', phone: '0577788990', payment: 'MADA', placedAt: min(160), total: 0 },
] as Omit<Order, 'statusSince'>[]).map(o => ({ ...o, statusSince: o.placedAt, total: orderTotal(o.items) }));
