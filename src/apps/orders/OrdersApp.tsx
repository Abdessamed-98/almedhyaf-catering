import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, History, BarChart3, User, Bike, ShoppingBag, Utensils, Phone, MapPin,
  Navigation, Check, X, Plus, Clock, ChevronLeft, CreditCard, Banknote, Smartphone, Wallet,
  Store, Bell, Globe, LogOut, TrendingUp, Package, Search, Timer, CircleDollarSign,
  CalendarClock, Zap, Volume2, VolumeX, RotateCcw, MoreVertical, Pencil, Star, Car,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../ui';
import { Order, OType, OStatus, OPay, SEED_ORDERS, makeOrder, nextStatus, ACTIVE, itemTotal } from '../../data/orders';
import { MiniMap, AddressPicker } from './maps';
import NewOrder from './NewOrder';

interface Props { onBackToPortal: () => void; }
type Tab = 'orders' | 'history' | 'stats' | 'account';

const TYPE: Record<OType, { ar: string; en: string; Icon: React.ComponentType<{ className?: string }>; tile: string }> = {
  DELIVERY: { ar: 'توصيل', en: 'Delivery', Icon: Bike, tile: 'bg-indigo-50 text-indigo-600' },
  PICKUP: { ar: 'استلام', en: 'Pickup', Icon: ShoppingBag, tile: 'bg-amber-50 text-amber-600' },
  DINE_IN: { ar: 'في المكان', en: 'Dine in', Icon: Utensils, tile: 'bg-emerald-50 text-emerald-600' },
};
const STATUS: Record<OStatus, { ar: string; en: string; cls: string; dot: string }> = {
  NEW: { ar: 'جديد', en: 'New', cls: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  PREPARING: { ar: 'قيد التحضير', en: 'Preparing', cls: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
  READY: { ar: 'جاهز', en: 'Ready', cls: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
  ON_WAY: { ar: 'في الطريق', en: 'On the way', cls: 'bg-indigo-50 text-indigo-600', dot: 'bg-indigo-500' },
  DONE: { ar: 'مكتمل', en: 'Done', cls: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
  CANCELLED: { ar: 'ملغي', en: 'Cancelled', cls: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};
const DRIVERS_INFO: { name: string; status: 'available' | 'busy'; load: number; rating: number; vehicle: 'bike' | 'car' }[] = [
  { name: 'أحمد المالكي', status: 'available', load: 0, rating: 4.9, vehicle: 'bike' },
  { name: 'خالد الحربي', status: 'available', load: 1, rating: 4.8, vehicle: 'car' },
  { name: 'ماجد العتيبي', status: 'available', load: 1, rating: 4.6, vehicle: 'bike' },
  { name: 'سعيد الغامدي', status: 'busy', load: 3, rating: 4.7, vehicle: 'bike' },
];
const REC_DRIVER = [...DRIVERS_INFO].filter(d => d.status === 'available').sort((a, b) => a.load - b.load)[0] ?? DRIVERS_INFO[0];
const SORTED_DRIVERS = [...DRIVERS_INFO].sort((a, b) => (a.status === b.status ? a.load - b.load : a.status === 'available' ? -1 : 1));

const REJECT_REASONS = [
  { ar: 'نفاد أحد الأصناف', en: 'Item out of stock' },
  { ar: 'المطبخ مزحوم حالياً', en: 'Kitchen too busy' },
  { ar: 'خارج وقت العمل', en: 'Outside working hours' },
  { ar: 'خارج نطاق التوصيل', en: 'Out of delivery range' },
  { ar: 'العميل طلب الإلغاء', en: 'Customer cancelled' },
];

const PAY: Record<OPay, { ar: string; en: string; Icon: React.ComponentType<{ className?: string }> }> = {
  MADA: { ar: 'مدى', en: 'mada', Icon: CreditCard },
  APPLE_PAY: { ar: 'Apple Pay', en: 'Apple Pay', Icon: Smartphone },
  CASH: { ar: 'نقدي', en: 'Cash', Icon: Banknote },
  ONLINE: { ar: 'دفع إلكتروني', en: 'Online', Icon: Wallet },
};


const OrdersApp: React.FC<Props> = ({ onBackToPortal }) => {
  const { language, toggleLanguage, dir } = useLanguage();
  const ar = language === 'ar';
  const toast = useToast();
  const sar = ar ? 'ر.س' : 'SAR';

  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [tab, setTab] = useState<Tab>('orders');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OStatus>('NEW');
  const [scrolled, setScrolled] = useState(false);
  const [liveSim, setLiveSim] = useState(true);
  const [sound, setSound] = useState(true);
  const [hist, setHist] = useState('');
  const [now, setNow] = useState(Date.now());
  const [entering, setEntering] = useState<Set<string>>(() => new Set());
  const [undo, setUndo] = useState<{ msg: string; prev: Order } | null>(null);
  const [accepting, setAccepting] = useState<Order | null>(null);
  const [rejecting, setRejecting] = useState<Order | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editAddr, setEditAddr] = useState<Order | null>(null);
  const [pickDriver, setPickDriver] = useState<Order | null>(null);
  const [creating, setCreating] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>();
  const audioRef = useRef<AudioContext | null>(null);

  const selected = orders.find(o => o.id === selectedId) ?? null;

  // refresh aging labels
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, []);

  const beep = () => {
    if (!sound) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioRef.current ?? (audioRef.current = new Ctx());
      [880, 1180].forEach((f, i) => {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination); osc.type = 'sine'; osc.frequency.value = f;
        const t0 = ctx.currentTime + i * 0.13;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
        osc.start(t0); osc.stop(t0 + 0.13);
      });
    } catch { /* autoplay blocked until first gesture */ }
  };
  const addOrder = (o: Order) => {
    setOrders(os => [o, ...os]);
    setEntering(s => { const n = new Set(s); n.add(o.id); return n; });
    setTimeout(() => setEntering(s => { const n = new Set(s); n.delete(o.id); return n; }), 500);
    beep();
  };

  // live incoming orders — spawnRef holds the latest closure so the interval never resets
  const spawnRef = useRef<() => void>(() => {});
  spawnRef.current = () => { const o = makeOrder(); addOrder(o); toast(ar ? `طلب جديد ${o.id}` : `New order ${o.id}`); };
  useEffect(() => {
    if (!liveSim) return;
    const t = setInterval(() => spawnRef.current(), 22000);
    return () => clearInterval(t);
  }, [liveSim]);

  const patch = (id: string, fn: (o: Order) => Order) => setOrders(os => os.map(o => o.id === id ? fn(o) : o));
  const withUndo = (snap: Order, msg: string, mutate: () => void) => {
    mutate();
    setUndo({ msg, prev: snap });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 4000);
  };
  const revert = () => { if (!undo) return; const p = undo.prev; setOrders(os => os.map(x => x.id === p.id ? p : x)); setUndo(null); };

  const accept = (o: Order) => setAccepting(o);
  const confirmAccept = (o: Order, mins: number) => {
    setAccepting(null);
    withUndo(o, `${ar ? 'تم قبول' : 'Accepted'} ${o.id}`, () => patch(o.id, p => ({ ...p, status: 'PREPARING', prepMin: mins, statusSince: Date.now() })));
  };
  const reject = (o: Order) => setRejecting(o);
  const confirmReject = (o: Order, reason: string) => {
    setRejecting(null); setSelectedId(null);
    withUndo(o, `${ar ? 'تم رفض' : 'Rejected'} ${o.id}`, () => patch(o.id, p => ({ ...p, status: 'CANCELLED', rejectReason: reason, statusSince: Date.now() })));
  };
  const advance = (o: Order) => {
    const ns = nextStatus(o);
    if (!ns) return;
    withUndo(o, `${o.id} → ${ar ? STATUS[ns].ar : STATUS[ns].en}`, () => patch(o.id, p => ({ ...p, status: ns, statusSince: Date.now(), driver: ns === 'ON_WAY' && !p.driver ? REC_DRIVER.name : p.driver })));
  };
  const setDriver = (o: Order, name: string) => { patch(o.id, p => ({ ...p, driver: name })); setPickDriver(null); toast(ar ? `تم تعيين ${name}` : `Assigned ${name}`); };
  // manual corrections (when the undo window is missed)
  const flowOf = (o: Order): OStatus[] => o.type === 'DELIVERY' ? ['NEW', 'PREPARING', 'READY', 'ON_WAY', 'DONE'] : ['NEW', 'PREPARING', 'READY', 'DONE'];
  const prevStatus = (o: Order): OStatus | null => { const f = flowOf(o); const i = f.indexOf(o.status); return i > 0 ? f[i - 1] : null; };
  const stepBack = (o: Order) => { const ps = prevStatus(o); if (!ps) return; withUndo(o, `${o.id} ← ${ar ? STATUS[ps].ar : STATUS[ps].en}`, () => patch(o.id, p => ({ ...p, status: ps, statusSince: Date.now() }))); };
  const restore = (o: Order) => withUndo(o, `${ar ? 'تمت الاستعادة' : 'Restored'} ${o.id}`, () => patch(o.id, p => ({ ...p, status: 'PREPARING', statusSince: Date.now(), rejectReason: undefined })));
  const submitOrder = (o: Order) => { addOrder(o); setCreating(false); setTab('orders'); setFilter('NEW'); toast(ar ? `تم إنشاء ${o.id}` : `Created ${o.id}`); };

  const ago = (ms: number) => {
    const m = Math.max(0, Math.round((now - ms) / 60000));
    if (m < 1) return ar ? 'الآن' : 'now';
    if (m < 60) return ar ? `قبل ${m} د` : `${m}m`;
    return ar ? `قبل ${Math.floor(m / 60)} س` : `${Math.floor(m / 60)}h`;
  };
  // ── aging / SLA ──
  const SLA: Record<OStatus, [number, number]> = { NEW: [3, 6], PREPARING: [10, 20], READY: [8, 15], ON_WAY: [25, 40], DONE: [1e9, 1e9], CANCELLED: [1e9, 1e9] };
  const ageTone = (o: Order): 'green' | 'amber' | 'red' => { const [a, r] = SLA[o.status]; const m = (now - o.statusSince) / 60000; return m >= r ? 'red' : m >= a ? 'amber' : 'green'; };
  const elapsed = (ms: number) => { const m = Math.max(0, Math.round((now - ms) / 60000)); if (m < 60) return ar ? `${m} د` : `${m}m`; return ar ? `${Math.floor(m / 60)}س ${m % 60}د` : `${Math.floor(m / 60)}h`; };
  const clock = (ms: number) => new Date(ms).toLocaleTimeString(ar ? 'ar-SA-u-nu-latn' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  const TONE = { green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600' };
  const inits = (s: string) => s.trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('');
  const itemsSummary = (o: Order) => o.items.map(it => `${it.product.name}${it.qty > 1 ? ` ×${it.qty}` : ''}`).join('، ');
  const actionLabel = (o: Order) => {
    switch (nextStatus(o)) {
      case 'READY': return ar ? 'جاهز' : 'Mark ready';
      case 'ON_WAY': return ar ? 'خرج للتوصيل' : 'Out for delivery';
      case 'DONE': return ar ? 'تم التسليم' : 'Complete';
      default: return '';
    }
  };

  const active = orders.filter(o => ACTIVE.includes(o.status));
  const newCount = orders.filter(o => o.status === 'NEW').length;
  const shown = active.filter(o => o.status === filter).sort((a, b) => filter === 'NEW' ? b.placedAt - a.placedAt : a.statusSince - b.statusSince);
  const past = orders.filter(o => !ACTIVE.includes(o.status)).filter(o => !hist.trim() || o.id.includes(hist) || o.customer.includes(hist)).sort((a, b) => b.placedAt - a.placedAt);

  // ── order card ──
  const card = (o: Order, withActions: boolean) => {
    const t = TYPE[o.type], st = STATUS[o.status];
    return (
      <div key={o.id} onClick={() => setSelectedId(o.id)} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-3 cursor-pointer active:scale-[0.99] transition-transform ${entering.has(o.id) ? 'order-in' : ''}`}>
        <div className="flex items-start gap-2.5">
          <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${t.tile}`}><t.Icon className="w-5 h-5" /></span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-900" dir="ltr">{o.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{ar ? st.ar : st.en}</span>
              {o.scheduledFor != null
                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1"><CalendarClock className="w-3 h-3" />{clock(o.scheduledFor)}</span>
                : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1"><Zap className="w-3 h-3" />{ar ? 'فوري' : 'ASAP'}</span>}
            </div>
            <span className="text-xs text-gray-400">{ar ? t.ar : t.en}{o.area ? ` · ${o.area}` : ''}{o.source === 'WEBSITE' ? ` · ${ar ? 'الموقع' : 'web'}` : o.source === 'PHONE' ? ` · ${ar ? 'هاتفي' : 'phone'}` : ''}</span>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-display font-bold text-brand-700">{o.total.toFixed(0)} <span className="text-[10px] text-gray-400">{sar}</span></span>
            {o.scheduledFor == null && <span className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${TONE[ageTone(o)]} ${ageTone(o) === 'red' ? 'animate-pulse' : ''}`}><Timer className="w-3 h-3" />{elapsed(o.statusSince)}</span>}
          </div>
        </div>
        <p className="text-sm text-gray-600 truncate mt-2"><span className="font-semibold text-gray-700">{o.customer}</span> · {itemsSummary(o)}</p>
        {withActions && (o.status === 'NEW' ? (
          <div className="flex gap-2 mt-3">
            <button onClick={e => { e.stopPropagation(); reject(o); }} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200">{ar ? 'رفض' : 'Reject'}</button>
            <button onClick={e => { e.stopPropagation(); accept(o); }} className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-1.5"><Check className="w-4 h-4" />{ar ? 'قبول الطلب' : 'Accept'}</button>
          </div>
        ) : (
          <button onClick={e => { e.stopPropagation(); advance(o); }} className="w-full mt-3 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-1.5">{o.type === 'DELIVERY' && o.status === 'READY' ? <Navigation className="w-4 h-4" /> : <Check className="w-4 h-4" />}{actionLabel(o)}</button>
        ))}
      </div>
    );
  };

  // ── tab: orders board ──
  const FILTERS: OStatus[] = ['NEW', 'PREPARING', 'READY', 'ON_WAY'];
  const renderOrders = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <div className={`flex items-center justify-between overflow-hidden transition-all duration-200 ${scrolled ? 'h-0 opacity-0' : 'h-10 opacity-100 mb-3'}`}>
          <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'الطلبات' : 'Orders'}</h1>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${liveSim ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${liveSim ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />{ar ? 'مباشر' : 'Live'}
          </span>
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => {
            const on = filter === f;
            const cnt = active.filter(o => o.status === f).length;
            return (
              <button key={f} onClick={() => { setFilter(f); setScrolled(false); }} className={`flex-1 min-w-0 px-1 h-9 rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-1 ${on ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <span className="truncate">{ar ? STATUS[f].ar : STATUS[f].en}</span>
                <span className={on ? 'text-white/70' : 'text-gray-400'}>{cnt}</span>
              </button>
            );
          })}
        </div>
        {newCount > 0 && filter !== 'NEW' && (
          <button onClick={() => { setFilter('NEW'); setScrolled(false); }} className="mt-2 w-full flex items-center gap-2 bg-blue-50 text-blue-700 rounded-xl px-3 py-2 text-sm font-bold">
            <ChevronLeft className={`w-4 h-4 shrink-0 ${ar ? 'rotate-180' : ''}`} />
            <Bell className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-start">{ar ? `${newCount} طلبات جديدة بانتظار القبول` : `${newCount} new orders waiting`}</span>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24" onScroll={e => setScrolled(e.currentTarget.scrollTop > 16)}>
        {shown.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">{ar ? 'لا توجد طلبات' : 'No orders'}</p>
          </div>
        ) : shown.map(o => card(o, true))}
      </div>
    </div>
  );

  // ── tab: history ──
  const renderHistory = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">{ar ? 'السجل' : 'History'}</h1>
        <div className="relative">
          <input value={hist} onChange={e => setHist(e.target.value)} placeholder={ar ? 'ابحث برقم الطلب أو العميل…' : 'Search order # or customer…'} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl ps-10 pe-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500" />
          <Search className="w-5 h-5 text-gray-400 absolute top-3 start-3" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6">
        {past.length === 0 ? <p className="text-center text-gray-400 py-20 font-semibold">{ar ? 'لا يوجد سجل' : 'Nothing here'}</p> : past.map(o => card(o, false))}
      </div>
    </div>
  );

  // ── tab: stats ──
  const renderStats = () => {
    const live = orders.filter(o => o.status !== 'CANCELLED');
    const revenue = live.reduce((s, o) => s + o.total, 0);
    const done = orders.filter(o => o.status === 'DONE').length;
    const avg = live.length ? revenue / live.length : 0;
    const counts: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(it => { counts[it.product.name] = (counts[it.product.name] || 0) + it.qty; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const topMax = top[0]?.[1] || 1;
    const byType = (t: OType) => orders.filter(o => o.type === t).length;
    const stat = (Icon: React.ComponentType<{ className?: string }>, label: string, value: string, tone: string) => (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5">
        <span className={`w-9 h-9 rounded-xl grid place-items-center mb-2 ${tone}`}><Icon className="w-5 h-5" /></span>
        <p className="font-display font-bold text-xl text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    );
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'إحصائيات اليوم' : "Today's stats"}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {stat(CircleDollarSign, ar ? 'المبيعات' : 'Revenue', `${revenue.toFixed(0)} ${sar}`, 'bg-brand-50 text-brand-600')}
            {stat(ClipboardList, ar ? 'الطلبات' : 'Orders', String(orders.length), 'bg-blue-50 text-blue-600')}
            {stat(Check, ar ? 'مكتملة' : 'Completed', String(done), 'bg-green-50 text-green-600')}
            {stat(TrendingUp, ar ? 'متوسط الطلب' : 'Avg order', `${avg.toFixed(0)} ${sar}`, 'bg-amber-50 text-amber-600')}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">{ar ? 'حسب النوع' : 'By type'}</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(['DELIVERY', 'PICKUP', 'DINE_IN'] as OType[]).map(t => {
                const T = TYPE[t];
                return (
                  <div key={t} className="bg-gray-50 rounded-xl py-3">
                    <span className={`w-9 h-9 rounded-xl grid place-items-center mx-auto mb-1.5 ${T.tile}`}><T.Icon className="w-5 h-5" /></span>
                    <p className="font-display font-bold text-lg text-gray-900">{byType(t)}</p>
                    <p className="text-[11px] text-gray-400">{ar ? T.ar : T.en}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">{ar ? 'الأكثر طلباً' : 'Top items'}</h3>
            <div className="space-y-2.5">
              {top.map(([name, n]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-semibold truncate">{name}</span><span className="text-gray-400 shrink-0 ms-2">{n}</span></div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-secondary-500 rounded-full" style={{ width: `${(n / topMax) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── tab: account ──
  const row = (Icon: React.ComponentType<{ className?: string }>, label: string, right?: React.ReactNode, onClick?: () => void) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-start">
      <span className="w-9 h-9 rounded-xl bg-gray-100 grid place-items-center text-gray-500 shrink-0"><Icon className="w-5 h-5" /></span>
      <span className="flex-1 font-semibold text-gray-800 text-sm">{label}</span>
      {right ?? <ChevronLeft className={`w-5 h-5 text-gray-300 ${!ar ? 'rotate-180' : ''}`} />}
    </button>
  );
  const renderAccount = () => (
    <div className="h-full overflow-y-auto pb-6">
      <div className="bg-brand-600 text-white px-4 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <img src="logo-mark.png" alt="" className="w-14 h-14 rounded-2xl bg-white/10 p-1.5" />
          <div>
            <h1 className="text-xl font-display font-bold">{ar ? 'مطبخ المضياف العربي' : 'Al-Medhyaf Kitchen'}</h1>
            <p className="text-white/70 text-sm">{ar ? 'فرع مكة - الشرائع' : 'Makkah - Sharai branch'}</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-9 h-9 rounded-xl bg-gray-100 grid place-items-center text-gray-500 shrink-0"><Bell className="w-5 h-5" /></span>
            <span className="flex-1 font-semibold text-gray-800 text-sm">{ar ? 'الطلبات المباشرة' : 'Live orders'}</span>
            <button onClick={() => setLiveSim(v => !v)} className={`w-12 h-7 rounded-full p-0.5 transition-colors ${liveSim ? 'bg-brand-600' : 'bg-gray-300'}`}>
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${liveSim ? (ar ? '-translate-x-5' : 'translate-x-5') : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-9 h-9 rounded-xl bg-gray-100 grid place-items-center text-gray-500 shrink-0">{sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</span>
            <span className="flex-1 font-semibold text-gray-800 text-sm">{ar ? 'صوت التنبيه' : 'Alert sound'}</span>
            <button onClick={() => setSound(v => !v)} className={`w-12 h-7 rounded-full p-0.5 transition-colors ${sound ? 'bg-brand-600' : 'bg-gray-300'}`}>
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${sound ? (ar ? '-translate-x-5' : 'translate-x-5') : ''}`} />
            </button>
          </div>
          {row(Globe, ar ? 'اللغة' : 'Language', <span className="text-sm font-bold text-brand-600">{ar ? 'English' : 'عربي'}</span>, toggleLanguage)}
          {row(Store, ar ? 'بيانات الفرع' : 'Branch info')}
          {row(Clock, ar ? 'ساعات العمل' : 'Working hours')}
        </div>
        <button onClick={onBackToPortal} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-red-600 font-bold hover:bg-red-50 transition-colors">
          <LogOut className={`w-5 h-5 ${ar ? 'rotate-180' : ''}`} />{ar ? 'تسجيل الخروج' : 'Log out'}
        </button>
      </div>
    </div>
  );

  // ── detail sheet ──
  const renderDetail = (o: Order) => {
    const t = TYPE[o.type], st = STATUS[o.status], p = PAY[o.payment];
    const vat = o.total * 15 / 115;
    const steps: OStatus[] = o.type === 'DELIVERY' ? ['NEW', 'PREPARING', 'READY', 'ON_WAY', 'DONE'] : ['NEW', 'PREPARING', 'READY', 'DONE'];
    const curIdx = steps.indexOf(o.status);
    const terminal = o.status === 'DONE' || o.status === 'CANCELLED';
    return (
      <div className="absolute inset-0 z-30 bg-[#FAF7F2] flex flex-col">
        <div className="relative bg-white p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
          <button onClick={() => { setSelectedId(null); setMenuOpen(false); }} aria-label={ar ? 'رجوع' : 'Back'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><ChevronLeft className={`w-6 h-6 ${ar ? 'rotate-180' : ''}`} /></button>
          <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${t.tile}`}><t.Icon className="w-5 h-5" /></span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-gray-900" dir="ltr">{o.id}</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{ar ? st.ar : st.en}</span>
            </div>
            <p className="text-xs text-gray-400">{ar ? t.ar : t.en} · {ago(o.placedAt)} · {o.source === 'APP' ? (ar ? 'التطبيق' : 'App') : o.source === 'PHONE' ? (ar ? 'هاتفي' : 'Phone') : (ar ? 'الموقع' : 'Web')}</p>
          </div>
          <button onClick={() => setMenuOpen(v => !v)} aria-label={ar ? 'خيارات' : 'Options'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><MoreVertical className="w-5 h-5" /></button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute top-full end-2 z-20 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 text-sm overflow-hidden">
                {prevStatus(o) && (
                  <button onClick={() => { stepBack(o); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50 font-semibold text-gray-700 text-start">
                    <RotateCcw className="w-4 h-4 text-gray-400 shrink-0" />{ar ? `إرجاع إلى «${STATUS[prevStatus(o)!].ar}»` : `Move back to "${STATUS[prevStatus(o)!].en}"`}
                  </button>
                )}
                {ACTIVE.includes(o.status) && (
                  <button onClick={() => { setMenuOpen(false); reject(o); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-red-50 font-semibold text-red-600 text-start">
                    <X className="w-4 h-4 shrink-0" />{ar ? 'إلغاء الطلب' : 'Cancel order'}
                  </button>
                )}
                {(o.status === 'CANCELLED' || o.status === 'DONE') && (
                  <button onClick={() => { restore(o); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50 font-semibold text-gray-700 text-start">
                    <RotateCcw className="w-4 h-4 text-gray-400 shrink-0" />{ar ? 'استعادة الطلب' : 'Restore order'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* timeline */}
            {o.status === 'CANCELLED' ? (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-3 py-2.5 text-sm font-semibold"><X className="w-4 h-4 shrink-0" />{ar ? 'تم إلغاء الطلب' : 'Order cancelled'}{o.rejectReason ? ` · ${o.rejectReason}` : ''}</div>
            ) : (
              <div className="flex items-center">
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold ${i <= curIdx ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{i < curIdx ? <Check className="w-4 h-4" /> : i + 1}</span>
                      <span className={`text-[9px] font-semibold ${i <= curIdx ? 'text-brand-600' : 'text-gray-400'}`}>{ar ? STATUS[s].ar : STATUS[s].en}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < curIdx ? 'bg-brand-600' : 'bg-gray-200'}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {(o.scheduledFor != null || (o.prepMin && o.status === 'PREPARING')) && (
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-xl px-3 py-2.5 text-sm font-semibold">
                {o.scheduledFor != null
                  ? <><CalendarClock className="w-4 h-4 shrink-0" />{ar ? 'مجدول لـ' : 'Scheduled for'} {clock(o.scheduledFor)}</>
                  : <><Timer className="w-4 h-4 shrink-0" />{ar ? `جاهز خلال ~${o.prepMin} دقيقة` : `Ready in ~${o.prepMin} min`}</>}
              </div>
            )}

            {/* customer */}
            <div className="bg-white border border-gray-100 rounded-2xl p-3.5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-brand-600 text-white grid place-items-center font-bold">{o.customer.trim()[0]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{o.customer}</p>
                  <p className="text-sm text-gray-400" dir="ltr">{o.phone}</p>
                </div>
                <a href={`tel:${o.phone}`} onClick={e => e.stopPropagation()} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 grid place-items-center text-brand-600"><Phone className="w-5 h-5" /></a>
              </div>
              {o.type === 'DELIVERY' && o.address && (
                <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-100 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-600 flex-1">{o.address}</span>
                  <button onClick={() => setEditAddr(o)} aria-label={ar ? 'تعديل العنوان' : 'Edit address'} className="w-7 h-7 -mt-1 rounded-lg hover:bg-gray-100 grid place-items-center text-brand-600 shrink-0"><Pencil className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {/* map + driver */}
            {o.type === 'DELIVERY' && o.lat != null && (
              <div>
                <MiniMap order={o} />
                <div className="flex items-center gap-3 mt-2 bg-gray-50 rounded-2xl p-3">
                  <span className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center shrink-0"><Bike className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{o.driver || (ar ? 'لم يُعيّن سائق' : 'No driver yet')}</p>
                    <p className="text-xs text-gray-400">{ar ? 'الوقت المقدّر ٢٥–٣٥ دقيقة' : 'ETA 25–35 min'}</p>
                  </div>
                  {!terminal && <button onClick={() => setPickDriver(o)} className="text-sm font-bold text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 shrink-0">{o.driver ? (ar ? 'تغيير السائق' : 'Change driver') : (ar ? 'تعيين سائق' : 'Assign driver')}</button>}
                </div>
              </div>
            )}

            {/* items */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2">{ar ? 'الأصناف' : 'Items'} ({o.items.length})</h3>
              <div className="space-y-2">
                {o.items.map((it, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50 rounded-2xl p-2.5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img src={it.product.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-1 start-1 bg-ink/70 text-white text-[11px] font-bold rounded-md px-1.5">×{it.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <h4 className="font-bold text-sm text-gray-900">{it.product.name}</h4>
                        <span className="font-display font-bold text-brand-700 text-sm shrink-0">{itemTotal(it).toFixed(0)}</span>
                      </div>
                      {it.addons.map((a, j) => (
                        <div key={j} className="flex justify-between text-[11px] text-gray-500 mt-0.5">
                          <span className="truncate">{a.name}</span>{a.price > 0 && <span dir="ltr" className="shrink-0">+{a.price}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* totals */}
            <div className="bg-gray-50 rounded-2xl p-3.5 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>{ar ? 'المجموع قبل الضريبة' : 'Subtotal'}</span><span>{(o.total - vat).toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>{ar ? 'ض.ق.م (15%)' : 'VAT (15%)'}</span><span>{vat.toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-gray-200">
                <span className="font-display font-bold text-gray-900">{ar ? 'الإجمالي' : 'Total'}</span>
                <span className="font-display font-bold text-lg text-brand-700">{o.total.toFixed(2)} {sar}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1"><p.Icon className="w-4 h-4" />{ar ? p.ar : p.en}</div>
            </div>
          </div>

          {/* action bar */}
          {!terminal && (
            <div className="p-4 border-t border-gray-100 shrink-0 flex gap-2">
              {o.status === 'NEW' ? (
                <>
                  <button onClick={() => { reject(o); setSelectedId(null); }} className="px-5 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">{ar ? 'رفض' : 'Reject'}</button>
                  <button onClick={() => accept(o)} className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2"><Check className="w-5 h-5" />{ar ? 'قبول الطلب' : 'Accept order'}</button>
                </>
              ) : (
                <button onClick={() => advance(o)} className="flex-1 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2">{o.type === 'DELIVERY' && o.status === 'READY' ? <Navigation className="w-5 h-5" /> : <Check className="w-5 h-5" />}{actionLabel(o)}</button>
              )}
            </div>
          )}
      </div>
    );
  };

  const NAV: { id: Tab; ar: string; en: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'orders', ar: 'الطلبات', en: 'Orders', Icon: ClipboardList },
    { id: 'history', ar: 'السجل', en: 'History', Icon: History },
    { id: 'stats', ar: 'إحصائيات', en: 'Stats', Icon: BarChart3 },
    { id: 'account', ar: 'حسابي', en: 'Account', Icon: User },
  ];

  return (
    <div dir={dir} className="h-screen bg-[#FAF7F2] flex justify-center font-sans text-ink">
      <div className="w-full max-w-md h-screen flex flex-col relative bg-[#FAF7F2] shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {tab === 'orders' && renderOrders()}
          {tab === 'history' && renderHistory()}
          {tab === 'stats' && renderStats()}
          {tab === 'account' && renderAccount()}
        </div>

        {tab === 'orders' && (
          <button onClick={() => setCreating(true)} aria-label={ar ? 'طلب جديد' : 'New order'} className="absolute bottom-[88px] end-4 z-20 w-14 h-14 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/40 grid place-items-center active:scale-95 transition-transform">
            <Plus className="w-7 h-7" />
          </button>
        )}

        <nav className="border-t border-gray-100 bg-white grid grid-cols-4 shrink-0">
          {NAV.map(n => {
            const on = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} className={`relative flex flex-col items-center gap-1 py-2.5 transition-colors ${on ? 'text-brand-600' : 'text-gray-400'}`}>
                <n.Icon className="w-6 h-6" />
                <span className="text-[11px] font-bold">{ar ? n.ar : n.en}</span>
                {n.id === 'orders' && newCount > 0 && <span className="absolute top-1.5 ms-5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">{newCount}</span>}
              </button>
            );
          })}
        </nav>

        {selected && renderDetail(selected)}

        {creating && <NewOrder ar={ar} dir={dir} onCancel={() => setCreating(false)} onCreate={submitOrder} />}

        {/* accept → prep time (centered popup) */}
        {accepting && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={() => setAccepting(null)}>
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl w-full max-w-xs p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="font-display font-bold text-xl text-gray-900">{ar ? 'قبول الطلب' : 'Accept'} <span dir="ltr">{accepting.id}</span></h2>
                <button onClick={() => setAccepting(null)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{ar ? 'كم يحتاج التحضير؟ سيُبلَّغ العميل بالوقت.' : 'How long to prepare? The customer is notified.'}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[15, 20, 30, 45].map(m => (
                  <button key={m} onClick={() => confirmAccept(accepting, m)} className="py-5 rounded-2xl bg-gray-50 border-2 border-gray-200 hover:border-brand-600 hover:bg-brand-50 active:scale-95 transition-all">
                    <span className="block font-display font-bold text-2xl text-gray-900">{m}</span><span className="block text-[11px] text-gray-400 font-semibold mt-0.5">{ar ? 'دقيقة' : 'min'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* reject → reason (centered popup) */}
        {rejecting && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={() => setRejecting(null)}>
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl w-full max-w-xs p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-gray-900">{ar ? 'سبب الرفض' : 'Reject reason'}</h2>
                <button onClick={() => setRejecting(null)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-2">
                {REJECT_REASONS.map(r => (
                  <button key={r.en} onClick={() => confirmReject(rejecting, ar ? r.ar : r.en)} className="w-full text-start px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-600 font-semibold text-gray-700 text-sm transition-colors">{ar ? r.ar : r.en}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* driver picker */}
        {pickDriver && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={() => setPickDriver(null)}>
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl w-full max-w-sm max-h-[80%] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-5 pb-3 flex items-center justify-between shrink-0">
                <h2 className="font-display font-bold text-xl text-gray-900">{ar ? 'اختر السائق' : 'Choose driver'}</h2>
                <button onClick={() => setPickDriver(null)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-5 pb-5 overflow-y-auto space-y-2">
                {SORTED_DRIVERS.map(d => {
                  const selected = pickDriver.driver === d.name;
                  const recommended = d.name === REC_DRIVER.name;
                  return (
                    <button key={d.name} onClick={() => setDriver(pickDriver, d.name)} className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border-2 text-start transition-colors ${selected ? 'border-brand-600 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <span className="relative w-11 h-11 rounded-full bg-gray-100 text-gray-600 grid place-items-center font-bold shrink-0">
                        {inits(d.name)}
                        <span className={`absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white ${d.status === 'available' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 truncate">{d.name}</p>
                          {recommended && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary-500 text-ink shrink-0">{ar ? 'موصى' : 'Best'}</span>}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-gray-400 mt-0.5">
                          {d.vehicle === 'bike' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                          <span className={d.status === 'available' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>{d.status === 'available' ? (ar ? 'متاح' : 'Available') : (ar ? `مشغول · ${d.load}` : `Busy · ${d.load}`)}</span>
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-secondary-500 text-secondary-500" />{d.rating}</span>
                        </div>
                      </div>
                      {selected && <Check className="w-5 h-5 text-brand-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* edit delivery address — full map picker */}
        {editAddr && (
          <AddressPicker
            initial={{ lat: editAddr.lat, lng: editAddr.lng, address: editAddr.address }}
            ar={ar}
            onCancel={() => setEditAddr(null)}
            onSave={(lat, lng, address) => { patch(editAddr.id, p => ({ ...p, lat, lng, address: address.trim() || p.address })); setEditAddr(null); toast(ar ? 'تم تحديث الموقع' : 'Location updated'); }}
          />
        )}

        {/* undo snackbar */}
        {undo && (
          <div className="absolute bottom-[72px] inset-x-3 z-40 bg-ink text-white rounded-2xl ps-4 pe-1.5 py-1.5 flex items-center gap-2 shadow-xl">
            <span className="text-sm font-semibold flex-1 truncate">{undo.msg}</span>
            <button onClick={revert} className="flex items-center gap-1 bg-white/15 hover:bg-white/25 rounded-xl px-3 py-1.5 text-sm font-bold"><RotateCcw className="w-4 h-4" />{ar ? 'تراجع' : 'Undo'}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersApp;
