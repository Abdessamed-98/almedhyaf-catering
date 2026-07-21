import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Bike, Package, Wallet, User, MapPin, Navigation, Phone, Check, X, Store,
  ChevronLeft, Clock, Star, TrendingUp, CircleDollarSign, Banknote,
  Power, Globe, LogOut, Volume2, VolumeX, Zap,
  CreditCard, Smartphone, BadgeCheck, Route, ArrowDownToLine, ArrowUpFromLine, History, Camera, RefreshCw, Moon,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../ui';
import { useHardwareBack } from '../../hooks/useHardwareBack';
import { BRAND, ACCENT, INK } from '../../theme/tokens';
import {
  DriverJob, JobStage, makeJob, SEED_OFFERS, SEED_HISTORY, WEEKLY, DRIVER, RESTAURANT,
  hasCod, codOf, tripEarnings, OPay,
} from '../../data/delivery';
import { itemTotal } from '../../data/orders';

interface Props { onBackToPortal: () => void; }
type Tab = 'jobs' | 'trip' | 'history' | 'earnings' | 'account';

const PAY: Record<OPay, { ar: string; en: string; Icon: React.ComponentType<{ className?: string }> }> = {
  MADA: { ar: 'مدى', en: 'mada', Icon: CreditCard },
  APPLE_PAY: { ar: 'Apple Pay', en: 'Apple Pay', Icon: Smartphone },
  CASH: { ar: 'نقدي', en: 'Cash', Icon: Banknote },
  ONLINE: { ar: 'مدفوع', en: 'Paid online', Icon: Wallet },
};

// the four visible trip steps and how the live stage maps onto them
const STEPS: { key: string; ar: string; en: string }[] = [
  { key: 'TO_RESTAURANT', ar: 'للمطعم', en: 'To kitchen' },
  { key: 'PICKED', ar: 'الاستلام', en: 'Pickup' },
  { key: 'TO_CUSTOMER', ar: 'للعميل', en: 'To customer' },
  { key: 'DELIVERED', ar: 'التسليم', en: 'Delivered' },
];
const stepIndex = (s: JobStage) =>
  s === 'TO_RESTAURANT' ? 0 : s === 'AT_RESTAURANT' ? 1 : s === 'TO_CUSTOMER' || s === 'ARRIVED' ? 2 : 3;

// current-stage chip: short label + tone, used on the trips list
const STAGE_META: Record<string, { ar: string; en: string; tone: string }> = {
  TO_RESTAURANT: { ar: 'متجه للمطعم', en: 'To kitchen', tone: 'bg-indigo-50 text-indigo-600' },
  AT_RESTAURANT: { ar: 'استلام الطلب', en: 'At kitchen', tone: 'bg-amber-50 text-amber-700' },
  TO_CUSTOMER: { ar: 'متجه للعميل', en: 'To customer', tone: 'bg-brand-50 text-brand-700' },
  ARRIVED: { ar: 'عند العميل', en: 'At customer', tone: 'bg-green-50 text-green-600' },
};

const DRIVER_HOME = { lat: RESTAURANT.lat - 0.018, lng: RESTAURANT.lng - 0.022 };

// ── driver cash box (التحصيل والإيداع) ──
// collect = cash taken from customers (money in); deposit = cash handed to the company (money out)
type CashTxn = { id: number; type: 'collect' | 'deposit'; amount: number; at: number; ref?: string };
let _txn = 1;
// today's COD collections + a mid-day deposit
const SEED_LEDGER: CashTxn[] = [
  ...SEED_HISTORY.filter(hasCod).map(j => ({ id: _txn++, type: 'collect' as const, amount: codOf(j), at: j.deliveredAt ?? Date.now(), ref: j.order.id })),
  { id: _txn++, type: 'deposit' as const, amount: 150, at: Date.now() - 2 * 3600e3 },
].sort((a, b) => b.at - a.at);

// inline lucide icon paths, drawn straight into the Leaflet map pins (no emojis)
const IC_UTENSILS = '<path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>';
const IC_HOME = '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>';
const IC_BIKE = '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>';
const glyph = (paths: string, stroke: string, s: number) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

// ── live trip map: restaurant + customer pins, the active leg, and an
//    animated scooter marker that loops along the leg while in motion ──
const TripMap: React.FC<{ job: DriverJob }> = ({ job }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const rafRef = useRef<number>();
  const { order, stage } = job;
  useEffect(() => {
    if (!ref.current || mapRef.current || order.lat == null || order.lng == null) return;
    const rest = L.latLng(RESTAURANT.lat, RESTAURANT.lng);
    const cust = L.latLng(order.lat, order.lng);
    const home = L.latLng(DRIVER_HOME.lat, DRIVER_HOME.lng);
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const pin = (color: string, iconSvg: string, size = 30) => L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.35);display:grid;place-items:center;border:2px solid #fff"><span style="transform:rotate(45deg);display:grid;place-items:center">${iconSvg}</span></div>`,
      iconSize: [size, size], iconAnchor: [size / 2, size],
    });
    L.marker(rest, { icon: pin(BRAND, glyph(IC_UTENSILS, '#fff', 15)) }).addTo(map);
    L.marker(cust, { icon: pin(ACCENT, glyph(IC_HOME, INK, 15)) }).addTo(map);

    const moving = stage === 'TO_RESTAURANT' || stage === 'TO_CUSTOMER';
    const legFrom = stage === 'TO_RESTAURANT' ? home : rest;
    const legTo = stage === 'TO_RESTAURANT' ? rest : cust;
    const restPos = stage === 'AT_RESTAURANT' ? rest : stage === 'ARRIVED' || stage === 'DELIVERED' ? cust : legFrom;

    L.polyline([legFrom, legTo], { color: BRAND, weight: 4, dashArray: '2 10', opacity: 0.6, lineCap: 'round' }).addTo(map);
    const driver = L.marker(moving ? legFrom : restPos, { icon: pin(INK, glyph(IC_BIKE, '#fff', 19), 38), zIndexOffset: 1000 }).addTo(map);

    map.fitBounds(L.latLngBounds([legFrom, legTo]).pad(0.45));
    setTimeout(() => map.invalidateSize(), 80);

    if (moving) {
      const dur = 6500;
      let start: number | null = null;
      const tick = (ts: number) => {
        if (start == null) start = ts;
        const t = ((ts - start) % dur) / dur;
        driver.setLatLng([legFrom.lat + (legTo.lat - legFrom.lat) * t, legFrom.lng + (legTo.lng - legFrom.lng) * t]);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); map.remove(); mapRef.current = null; };
  }, [order.id, order.lat, order.lng, stage]);
  return <div ref={ref} className="h-full w-full bg-gray-100" />;
};

const DeliveryApp: React.FC<Props> = ({ onBackToPortal }) => {
  const { language, setLanguage, dir } = useLanguage();
  const ar = language === 'ar';
  const toast = useToast();
  const sar = ar ? 'ر.س' : 'SAR';

  const [tab, setTab] = useState<Tab>('jobs');
  const [online, setOnline] = useState(true);
  const [sound, setSound] = useState(true);
  const [offers, setOffers] = useState<DriverJob[]>(SEED_OFFERS);
  const [trips, setTrips] = useState<DriverJob[]>([]);          // multiple active deliveries
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [history, setHistory] = useState<DriverJob[]>(SEED_HISTORY);
  const [histSelId, setHistSelId] = useState<string | null>(null); // open history record (details page)
  const [langOpen, setLangOpen] = useState(false); // language page (under Account)
  const [appDark, setAppDark] = useState(() => localStorage.getItem('del-dark') === '1'); // app dark mode (settings toggle)
  useEffect(() => { localStorage.setItem('del-dark', appDark ? '1' : '0'); }, [appDark]);
  const [now, setNow] = useState(Date.now());
  const [confirmDeliverId, setConfirmDeliverId] = useState<string | null>(null);
  const [proofShot, setProofShot] = useState<string | null>(null); // handoff photo staged in the confirm modal
  const [ledger, setLedger] = useState<CashTxn[]>(SEED_LEDGER);
  const [cashModal, setCashModal] = useState<null | 'collect' | 'deposit'>(null);
  const [cashAmount, setCashAmount] = useState('');

  // phone/browser back follows in-app navigation: modals → detail → jobs tab → portal
  useHardwareBack(() => {
    if (confirmDeliverId) { setConfirmDeliverId(null); return true; }
    if (cashModal) { setCashModal(null); return true; }
    if (langOpen) { setLangOpen(false); return true; }
    if (selectedTripId) { setSelectedTripId(null); return true; }
    if (histSelId) { setHistSelId(null); return true; }
    if (tab !== 'jobs') { setTab('jobs'); return true; }
    onBackToPortal(); return true;
  });
  const txnId = useRef(1000);
  const audioRef = useRef<AudioContext | null>(null);

  const driverName = ar ? DRIVER.nameAr : DRIVER.nameEn;
  const vehicle = ar ? DRIVER.vehicleAr : DRIVER.vehicleEn;

  // 1s tick drives relative labels
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const beep = () => {
    if (!sound) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioRef.current ?? (audioRef.current = new Ctx());
      [760, 1040].forEach((f, i) => {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination); osc.type = 'sine'; osc.frequency.value = f;
        const t0 = ctx.currentTime + i * 0.14;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.13);
        osc.start(t0); osc.stop(t0 + 0.14);
      });
    } catch { /* autoplay blocked until first gesture */ }
  };

  // live task assignment — keeps flowing while on-shift (driver can batch several)
  const spawnRef = useRef<() => void>(() => {});
  spawnRef.current = () => {
    setOffers(os => (os.length >= 3 ? os : [makeJob(), ...os]));
    beep();
    toast(ar ? 'طلب جديد مُسند إليك' : 'New order assigned to you');
  };
  useEffect(() => {
    if (!online) return;
    const t = setInterval(() => spawnRef.current(), 16000);
    return () => clearInterval(t);
  }, [online]);

  const accept = (j: DriverJob) => {
    const started: DriverJob = { ...j, stage: 'TO_RESTAURANT', acceptedAt: Date.now() };
    setTrips(ts => [...ts, started]);
    setOffers(os => os.filter(o => o.order.id !== j.order.id));
    setSelectedTripId(j.order.id);
    setTab('trip');
    toast(ar ? `بدأت توصيل ${j.order.id}` : `Started ${j.order.id}`);
  };

  const NEXT: Record<JobStage, JobStage> = {
    OFFERED: 'TO_RESTAURANT', TO_RESTAURANT: 'AT_RESTAURANT', AT_RESTAURANT: 'TO_CUSTOMER',
    TO_CUSTOMER: 'ARRIVED', ARRIVED: 'DELIVERED', DELIVERED: 'DELIVERED', DECLINED: 'DECLINED',
  };
  const advance = (j: DriverJob) => {
    if (j.stage === 'ARRIVED') {
      setProofShot(null);
      setConfirmDeliverId(j.order.id);
      return;
    }
    setTrips(ts => ts.map(t => (t.order.id === j.order.id ? { ...t, stage: NEXT[t.stage] } : t)));
  };
  const completeDelivery = (id: string) => {
    const done = trips.find(t => t.order.id === id);
    if (!done) return;
    const finished: DriverJob = { ...done, stage: 'DELIVERED', deliveredAt: Date.now(), proofPhoto: proofShot ?? undefined };
    setHistory(h => [finished, ...h]);
    setTrips(ts => ts.filter(t => t.order.id !== id));
    if (hasCod(finished)) {
      setLedger(l => [{ id: txnId.current++, type: 'collect', amount: codOf(finished), at: Date.now(), ref: finished.order.id }, ...l]);
    }
    setConfirmDeliverId(null);
    setSelectedTripId(null);
    toast(ar ? `تم تسليم ${finished.order.id} 🎉` : `Delivered ${finished.order.id} 🎉`);
  };

  // ── cash box (collections / deposits) ──
  const cashCollected = ledger.filter(t => t.type === 'collect').reduce((s, t) => s + t.amount, 0);
  const cashDeposited = ledger.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const cashOnHand = cashCollected - cashDeposited;

  const openCash = (type: 'collect' | 'deposit') => { setCashModal(type); setCashAmount(''); };
  const submitCash = () => {
    if (!cashModal) return;
    const raw = parseFloat(cashAmount);
    if (!raw || raw <= 0) return;
    const amount = cashModal === 'deposit' ? Math.min(raw, cashOnHand) : raw;
    if (amount <= 0) return;
    setLedger(l => [{ id: txnId.current++, type: cashModal, amount, at: Date.now() }, ...l]);
    const done = cashModal;
    setCashModal(null); setCashAmount('');
    toast(done === 'deposit'
      ? (ar ? `تم إيداع ${amount.toFixed(0)} ${sar}` : `Deposited ${amount.toFixed(0)} ${sar}`)
      : (ar ? `تم تحصيل ${amount.toFixed(0)} ${sar}` : `Collected ${amount.toFixed(0)} ${sar}`));
  };

  const actionLabel = (s: JobStage) => {
    switch (s) {
      case 'TO_RESTAURANT': return ar ? 'وصلت إلى المطعم' : 'Arrived at kitchen';
      case 'AT_RESTAURANT': return ar ? 'استلمت الطلب' : 'Confirm pickup';
      case 'TO_CUSTOMER': return ar ? 'وصلت إلى العميل' : 'Arrived at customer';
      case 'ARRIVED': return ar ? 'تأكيد التسليم' : 'Confirm delivery';
      default: return '';
    }
  };
  const stageHint = (j: DriverJob) => {
    switch (j.stage) {
      case 'TO_RESTAURANT': return ar ? 'توجّه إلى المطعم لاستلام الطلب' : 'Head to the kitchen to pick up';
      case 'AT_RESTAURANT': return ar ? 'استلم الطلب وتأكّد من الأصناف' : 'Collect the order, check the items';
      case 'TO_CUSTOMER': return ar ? 'في الطريق إلى العميل' : 'On the way to the customer';
      case 'ARRIVED': return ar ? 'سلّم الطلب' + (hasCod(j) ? ' واستلم المبلغ نقداً' : '') : 'Hand over the order' + (hasCod(j) ? ' & collect cash' : '');
      default: return '';
    }
  };

  const clockOf = (ms: number) => new Date(ms).toLocaleTimeString(ar ? 'ar-SA-u-nu-latn' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  const ago = (ms: number) => {
    const m = Math.max(0, Math.round((now - ms) / 60000));
    if (m < 1) return ar ? 'الآن' : 'now';
    if (m < 60) return ar ? `قبل ${m} د` : `${m}m ago`;
    return ar ? `قبل ${Math.floor(m / 60)} س` : `${Math.floor(m / 60)}h ago`;
  };
  const itemsSummary = (j: DriverJob) => j.order.items.map(it => `${it.product.name}${it.qty > 1 ? ` ×${it.qty}` : ''}`).join('، ');
  const itemCount = (j: DriverJob) => j.order.items.reduce((s, it) => s + it.qty, 0);

  // ── earnings figures (today = seeded history + session deliveries) ──
  const todayCount = history.length;
  const todayCash = history.reduce((s, j) => s + codOf(j), 0);
  const todayDistance = history.reduce((s, j) => s + j.distanceKm, 0);
  const weekData = WEEKLY.map((d, i) => (i === WEEKLY.length - 1 ? { ...d, total: Math.round(history.reduce((s, j) => s + tripEarnings(j), 0)) } : d));
  const weekMax = Math.max(...weekData.map(d => d.total), 1);

  // ── Jobs tab ──
  const offerCard = (j: DriverJob) => {
    return (
      <div key={j.order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden order-in">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0"><Bike className="w-5 h-5" /></span>
              <div>
                <p className="font-bold text-gray-900" dir="ltr">{j.order.id}</p>
                <p className="text-xs text-gray-400">{itemCount(j)} {ar ? 'صنف' : 'items'} · {ar ? PAY[j.order.payment].ar : PAY[j.order.payment].en} · {ar ? 'الإسناد' : 'Assigned'} <span dir="ltr">{clockOf(j.offeredAt)}</span></p>
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{ar ? 'مُسند إليك' : 'Assigned'}</span>
          </div>

          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 font-bold text-gray-600"><Route className="w-4 h-4 text-gray-400" />{j.distanceKm} {ar ? 'كم' : 'km'}</span>
            <span className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 font-bold text-gray-600"><Clock className="w-4 h-4 text-gray-400" />{j.etaMin} {ar ? 'د' : 'min'}</span>
            {hasCod(j) && <span className="flex items-center gap-1 bg-amber-50 text-amber-700 rounded-lg px-2 py-1 font-bold"><Banknote className="w-4 h-4" />{ar ? `استلام ${codOf(j).toFixed(0)}` : `collect ${codOf(j).toFixed(0)}`}</span>}
          </div>

          <div className="flex items-start gap-2 mt-3 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span>{ar ? 'إلى' : 'To'} <span className="font-bold text-gray-700">{j.order.area}</span> · {itemsSummary(j)}</span>
          </div>

          <button onClick={() => accept(j)} className="w-full mt-4 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5" />{ar ? 'بدء التوصيل' : 'Start delivery'}
          </button>
        </div>
      </div>
    );
  };

  const renderJobs = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'المهام المُسندة' : 'My tasks'}</h1>
          <div className="flex items-center gap-2.5">
            <span className={`flex items-center gap-1.5 text-xs font-bold ${online ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />{online ? (ar ? 'في الوردية' : 'On shift') : (ar ? 'خارج الوردية' : 'Off shift')}
            </span>
            <button onClick={() => setOnline(v => !v)} aria-label={ar ? 'تبديل الوردية' : 'Toggle shift'} className={`w-12 h-7 rounded-full p-0.5 transition-colors shrink-0 ${online ? 'bg-brand-600' : 'bg-gray-300'}`}>
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${online ? (ar ? '-translate-x-5' : 'translate-x-5') : ''}`} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {!online ? (
          <div className="text-center text-gray-400 py-16">
            <Power className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-gray-600">{ar ? 'أنت خارج الوردية' : "You're off shift"}</p>
            <p className="text-sm">{ar ? 'ابدأ ورديتك لاستلام الطلبات المُسندة إليك' : 'Start your shift to receive assigned orders'}</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <span className="inline-block w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
            <p className="font-bold text-gray-600">{ar ? 'لا توجد طلبات مُسندة حالياً' : 'No assigned orders right now'}</p>
            <p className="text-sm">{ar ? 'سيصلك تنبيه عند إسناد طلب إليك' : "We'll ping you when one is assigned"}</p>
          </div>
        ) : (
          <>
            {trips.length > 0 && (
              <button onClick={() => setTab('trip')} className="w-full flex items-center gap-2 bg-brand-50 text-brand-700 rounded-2xl px-4 py-2.5 text-sm font-bold">
                <Navigation className="w-4 h-4" />{ar ? `لديك ${trips.length} ${trips.length === 1 ? 'رحلة جارية' : 'رحلات جارية'}` : `${trips.length} active ${trips.length === 1 ? 'trip' : 'trips'}`}
                <ChevronLeft className={`w-4 h-4 ms-auto ${!ar ? 'rotate-180' : ''}`} />
              </button>
            )}
            {offers.map(offerCard)}
          </>
        )}
      </div>
    </div>
  );

  // ── Trips tab: a list of active deliveries, each opening a full detail ──
  const tripListCard = (j: DriverJob) => {
    const idx = stepIndex(j.stage);
    const meta = STAGE_META[j.stage] ?? STAGE_META.TO_RESTAURANT;
    const toRestaurant = j.stage === 'TO_RESTAURANT' || j.stage === 'AT_RESTAURANT';
    return (
      <button key={j.order.id} onClick={() => setSelectedTripId(j.order.id)} className="w-full text-start bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3 order-in hover:border-brand-200 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shrink-0"><Bike className="w-5 h-5" /></span>
            <div className="min-w-0">
              <p className="font-bold text-gray-900" dir="ltr">{j.order.id}</p>
              <p className="text-xs text-gray-400 truncate">{toRestaurant ? (ar ? 'المطبخ' : 'Kitchen') : j.order.area} · {itemsSummary(j)}</p>
              {j.acceptedAt && <p className="text-xs text-gray-400">{ar ? 'استلام المهمة' : 'Task received'} <span dir="ltr" className="font-bold text-gray-500">{clockOf(j.acceptedAt)}</span></p>}
            </div>
          </div>
          <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.tone}`}>{ar ? meta.ar : meta.en}</span>
        </div>

        {/* compact progress */}
        <div className="flex items-center px-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${i < idx ? 'bg-brand-600' : i === idx ? 'bg-brand-600 ring-2 ring-brand-100' : 'bg-gray-200'}`} />
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < idx ? 'bg-brand-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-gray-500 font-bold"><Route className="w-3.5 h-3.5 text-gray-400" />{j.distanceKm} {ar ? 'كم' : 'km'}</span>
            <span className="flex items-center gap-1 text-gray-500 font-bold"><Clock className="w-3.5 h-3.5 text-gray-400" />{j.etaMin} {ar ? 'د' : 'min'}</span>
            {hasCod(j) && <span className="flex items-center gap-1 bg-amber-50 text-amber-700 rounded-md px-1.5 py-0.5 font-bold"><Banknote className="w-3.5 h-3.5" />{codOf(j).toFixed(0)}</span>}
          </div>
          <span className="flex items-center gap-1 text-brand-600 font-bold text-sm">{ar ? 'متابعة' : 'Open'}<ChevronLeft className={`w-4 h-4 ${!ar ? 'rotate-180' : ''}`} /></span>
        </div>
      </button>
    );
  };

  const renderTripDetail = (j: DriverJob) => {
    const o = j.order;
    const idx = stepIndex(j.stage);
    const toRestaurant = j.stage === 'TO_RESTAURANT' || j.stage === 'AT_RESTAURANT';
    const dest = toRestaurant
      ? { title: RESTAURANT.name, sub: ar ? 'مطبخ المضياف العربي' : 'Al-Medhyaf kitchen', Icon: Store, line: ar ? 'استلام الطلب' : 'Pickup point' }
      : { title: o.customer, sub: o.address || o.area || '', Icon: MapPin, line: ar ? 'موقع التسليم' : 'Drop-off' };
    return (
      <div className="h-full flex flex-col relative">
        <div className="h-[54%] shrink-0 isolate">
          <TripMap job={j} />
        </div>

        {/* top bar over the map — back button + order id (a scrim keeps them legible) */}
        <div className="absolute top-0 inset-x-0 z-20 p-3 flex items-center gap-2 bg-gradient-to-b from-black/25 to-transparent pointer-events-none">
          <button onClick={() => setSelectedTripId(null)} aria-label={ar ? 'رجوع' : 'Back'} className="pointer-events-auto w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow-lg grid place-items-center text-gray-700 active:scale-95 transition-transform">
            <ChevronLeft className={`w-5 h-5 ${ar ? 'rotate-180' : ''}`} />
          </button>
          <span className="pointer-events-auto h-9 px-3 rounded-full bg-white/95 backdrop-blur shadow flex items-center gap-1.5 font-bold text-sm text-gray-800">
            <span className="text-gray-400 font-medium">{ar ? 'الطلب' : 'Order'}</span><span dir="ltr">{o.id}</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 -mt-9 relative z-10">
          {/* progress stepper — floats up over the map */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]">
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.key}>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold transition-all ${i < idx ? 'bg-brand-600 text-white' : i === idx ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-gray-100 text-gray-400'}`}>
                      {i < idx ? <Check className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className={`text-[10px] font-bold ${i <= idx ? 'text-brand-700' : 'text-gray-400'}`}>{ar ? s.ar : s.en}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-1 rounded-full mx-1.5 mb-4 ${i < idx ? 'bg-brand-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-gray-100 text-sm font-bold text-gray-700">
              {j.stage === 'TO_CUSTOMER' ? <Bike className="w-4 h-4 text-brand-600 shrink-0" /> : <Zap className="w-4 h-4 text-brand-600 shrink-0" />}
              {stageHint(j)}
            </div>
          </div>

          {/* destination card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">{dest.line}</p>
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shrink-0"><dest.Icon className="w-5 h-5" /></span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{dest.title}</p>
                <p className="text-sm text-gray-400 truncate">{dest.sub}</p>
              </div>
              <a href={toRestaurant ? 'tel:920018116' : `tel:${o.phone}`} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 grid place-items-center text-brand-600 shrink-0"><Phone className="w-5 h-5" /></a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${toRestaurant ? `${RESTAURANT.lat},${RESTAURANT.lng}` : `${o.lat},${o.lng}`}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-brand-600 grid place-items-center text-white shrink-0"><Navigation className="w-5 h-5" /></a>
            </div>
          </div>

          {/* COD reminder */}
          {hasCod(j) && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-2xl px-3.5 py-3 text-sm font-bold">
              <Banknote className="w-5 h-5 shrink-0" />{ar ? `استلم ${codOf(j).toFixed(0)} ${sar} نقداً عند التسليم` : `Collect ${codOf(j).toFixed(0)} ${sar} cash on delivery`}
            </div>
          )}

          {/* order summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-gray-900">{ar ? 'الطلب' : 'Order'} <span className="text-gray-400 font-medium" dir="ltr">{o.id}</span></h3>
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{ago(o.placedAt)}</span>
            </div>
            <div className="space-y-1.5">
              {o.items.map((it, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-md bg-gray-100 grid place-items-center text-[11px] font-bold text-gray-500 shrink-0">×{it.qty}</span>
                  <span className="flex-1 text-gray-700 truncate">{it.product.name}</span>
                </div>
              ))}
            </div>
            {/* when the driver received (was assigned) the task — a normal data row like the rest */}
            {j.acceptedAt && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">{ar ? 'وقت استلام المهمة' : 'Task received'}</span>
                <span className="font-bold text-gray-900" dir="ltr">{clockOf(j.acceptedAt)}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-200">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">{React.createElement(PAY[o.payment].Icon, { className: 'w-4 h-4' })}{ar ? PAY[o.payment].ar : PAY[o.payment].en}</span>
              <span className="font-display font-bold text-gray-900">{o.total.toFixed(0)} {sar}</span>
            </div>
          </div>

          {/* trip details */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl p-4">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">{ar ? 'تفاصيل التوصيلة' : 'Trip details'}</p>
            <div className="flex items-end justify-between">
              {hasCod(j)
                ? <p className="font-display font-extrabold text-3xl">{codOf(j).toFixed(0)} <span className="text-base font-bold text-white/70">{sar}</span></p>
                : <p className="font-display font-extrabold text-2xl">{ar ? 'مدفوع مسبقاً' : 'Prepaid'}</p>}
              <div className="text-end text-xs text-white/70 space-y-0.5">
                {hasCod(j) && <p>{ar ? 'تحصيل نقدي' : 'Collect cash'}</p>}
                <p>{j.distanceKm} {ar ? 'كم' : 'km'} · {j.etaMin} {ar ? 'د' : 'min'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* action bar */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button onClick={() => advance(j)} className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-transform">
            {j.stage === 'ARRIVED' ? <BadgeCheck className="w-6 h-6" /> : j.stage === 'AT_RESTAURANT' ? <Package className="w-6 h-6" /> : <Navigation className="w-6 h-6" />}
            {actionLabel(j.stage)}
          </button>
        </div>
      </div>
    );
  };

  const renderTrips = () => {
    const sel = trips.find(t => t.order.id === selectedTripId);
    if (sel) return renderTripDetail(sel);
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'الرحلات' : 'Trips'}</h1>
            {trips.length > 0 && <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">{trips.length} {ar ? 'جارية' : 'active'}</span>}
          </div>
        </div>
        {trips.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center text-gray-400 p-6">
            <div>
              <Navigation className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-gray-600">{ar ? 'لا توجد رحلات جارية' : 'No active trips'}</p>
              <p className="text-sm mb-4">{ar ? 'اقبل طلباً من تبويب العروض للبدء' : 'Accept an order to get started'}</p>
              <button onClick={() => setTab('jobs')} className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-bold text-sm">{ar ? 'تصفّح العروض' : 'Browse offers'}</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            {trips.map(tripListCard)}
          </div>
        )}
      </div>
    );
  };

  // ── Wallet tab (التحصيل والإيداع) ──
  const txnMeta = (t: CashTxn) =>
    t.type === 'collect'
      ? { Icon: Banknote, tone: 'bg-green-50 text-green-600', sign: '+', amtClass: 'text-green-600', label: ar ? 'تحصيل نقدي' : 'Cash collected', sub: t.ref && t.ref.startsWith('#') ? t.ref : (ar ? 'تحصيل يدوي' : 'Manual') }
      : { Icon: ArrowUpFromLine, tone: 'bg-brand-50 text-brand-600', sign: '−', amtClass: 'text-brand-700', label: ar ? 'إيداع للشركة' : 'Deposit to company', sub: ar ? 'توريد نقدي' : 'Cash handover' };

  const renderWallet = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'المحفظة' : 'Wallet'}</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6">
        {/* cash on hand */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-3xl p-5">
          <p className="text-white/70 text-sm font-bold mb-1">{ar ? 'النقد لديك' : 'Cash on hand'}</p>
          <p className="font-display font-extrabold text-4xl">{cashOnHand.toFixed(0)} <span className="text-lg font-bold text-white/70">{sar}</span></p>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-secondary-400" />{ar ? 'محصّل' : 'Collected'} {cashCollected.toFixed(0)}</span>
            <span className="flex items-center gap-1.5"><ArrowUpFromLine className="w-4 h-4 text-secondary-400" />{ar ? 'مودع' : 'Deposited'} {cashDeposited.toFixed(0)}</span>
          </div>
        </div>

        {/* actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => openCash('collect')} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold active:scale-[0.99] transition-transform">
            <ArrowDownToLine className="w-5 h-5" />{ar ? 'تحصيل' : 'Collect'}
          </button>
          <button onClick={() => openCash('deposit')} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-gray-200 text-brand-700 font-bold hover:bg-gray-50 active:scale-[0.99] transition-transform">
            <ArrowUpFromLine className="w-5 h-5" />{ar ? 'إيداع' : 'Deposit'}
          </button>
        </div>

        {/* ledger */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2.5">{ar ? 'آخر الحركات' : 'Recent activity'}</h3>
          <div className="space-y-2">
            {ledger.map(t => {
              const m = txnMeta(t);
              return (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${m.tone}`}><m.Icon className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{m.label}</p>
                    <p className="text-xs text-gray-400 truncate"><span dir="ltr">{m.sub}</span> · {ago(t.at)}</p>
                  </div>
                  <span className={`shrink-0 font-display font-bold text-sm ${m.amtClass}`}>{m.sign}{t.amount.toFixed(0)} {sar}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ── History tab (completed deliveries) ──
  // ── History detail — everything about one completed delivery ──
  const renderHistoryDetail = (j: DriverJob) => {
    const o = j.order;
    const durMin = j.acceptedAt && j.deliveredAt ? Math.max(1, Math.round((j.deliveredAt - j.acceptedAt) / 60000)) : null;
    const stat = (label: string, value: string, Icon: React.ComponentType<{ className?: string }>) => (
      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
        <Icon className="w-4 h-4 text-brand-600 mx-auto mb-1" />
        <p className="text-[10px] text-gray-400 font-bold">{label}</p>
        <p className="text-sm font-bold text-gray-900" dir="ltr">{value}</p>
      </div>
    );
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 shrink-0 flex items-center gap-2">
          <button onClick={() => setHistSelId(null)} aria-label={ar ? 'رجوع' : 'Back'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><ChevronLeft className={`w-6 h-6 ${ar ? 'rotate-180' : ''}`} /></button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-lg text-gray-900" dir="ltr">{o.id}</h1>
            <p className="text-xs text-gray-400">{j.deliveredAt ? clockOf(j.deliveredAt) : ''}</p>
          </div>
          <span className="shrink-0 text-xs font-bold bg-green-50 text-green-600 px-2.5 py-1 rounded-full flex items-center gap-1"><Check className="w-3.5 h-3.5" />{ar ? 'تم التسليم' : 'Delivered'}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6">
          {/* proof of delivery */}
          {j.proofPhoto && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative">
                <img src={j.proofPhoto} alt="" className="w-full h-40 object-cover" />
                <span className="absolute bottom-2 start-2 inline-flex items-center gap-1.5 bg-ink/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-full"><Camera className="w-3.5 h-3.5" />{ar ? 'صورة إثبات التسليم' : 'Proof of delivery'}</span>
              </div>
            </div>
          )}

          {/* trip stats — pickup / delivered / duration / distance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5">
            <h3 className="font-bold text-gray-900 text-sm mb-2.5">{ar ? 'الرحلة' : 'Trip'}</h3>
            <div className="grid grid-cols-4 gap-2">
              {stat(ar ? 'استلام المهمة' : 'Received', j.acceptedAt ? clockOf(j.acceptedAt) : '—', Zap)}
              {stat(ar ? 'التسليم' : 'Delivered', j.deliveredAt ? clockOf(j.deliveredAt) : '—', Check)}
              {stat(ar ? 'المدة' : 'Duration', durMin !== null ? `${durMin} ${ar ? 'د' : 'min'}` : '—', Clock)}
              {stat(ar ? 'المسافة' : 'Distance', `${j.distanceKm} ${ar ? 'كم' : 'km'}`, Route)}
            </div>
          </div>

          {/* customer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shrink-0"><MapPin className="w-5 h-5" /></span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{o.customer}</p>
                <p className="text-sm text-gray-400 truncate">{[o.area, o.address].filter(Boolean).join(' · ')}</p>
              </div>
              <a href={`tel:${o.phone}`} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 grid place-items-center text-brand-600 shrink-0"><Phone className="w-5 h-5" /></a>
            </div>
          </div>

          {/* order items + payment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5">
            <h3 className="font-bold text-gray-900 text-sm mb-2.5">{ar ? 'الطلب' : 'Order'}</h3>
            <div className="space-y-1.5 mb-3">
              {o.items.map((it, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-md bg-gray-100 grid place-items-center text-[11px] font-bold text-gray-500 shrink-0">×{it.qty}</span>
                  <span className="flex-1 text-gray-700 truncate">{it.product.name}</span>
                  <span className="text-gray-500 font-semibold shrink-0">{itemTotal(it).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-200 pt-2.5 space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span className="flex items-center gap-1.5">{React.createElement(PAY[o.payment].Icon, { className: 'w-4 h-4' })}{ar ? PAY[o.payment].ar : PAY[o.payment].en}</span>
                {hasCod(j) && <span className="text-[11px] font-bold text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">{ar ? 'حُصّل نقداً' : 'Collected in cash'}</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{ar ? 'الإجمالي' : 'Total'}</span>
                <span className="font-display font-bold text-lg text-gray-900">{o.total.toFixed(0)} <span className="text-xs text-gray-400 font-semibold">{sar}</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const sel = histSelId ? history.find(h => h.order.id === histSelId) : null;
    if (sel) return renderHistoryDetail(sel);
    return (
    <div className="h-full flex flex-col">
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'السجل' : 'History'}</h1>
          <span className="text-xs font-bold bg-green-50 text-green-600 px-2.5 py-1 rounded-full">{history.length} {ar ? 'اليوم' : 'today'}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-6">
        {history.length === 0 ? (
          <div className="h-full grid place-items-center text-center text-gray-400 p-6">
            <div>
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-gray-600">{ar ? 'لا توجد توصيلات بعد' : 'No deliveries yet'}</p>
              <p className="text-sm">{ar ? 'ستظهر توصيلاتك المكتملة هنا' : 'Your completed deliveries appear here'}</p>
            </div>
          </div>
        ) : history.map(j => {
          const durMin = j.acceptedAt && j.deliveredAt ? Math.max(1, Math.round((j.deliveredAt - j.acceptedAt) / 60000)) : null;
          return (
            // simple card — id, customer, one meta line; tap for the full details
            <button key={j.order.id} onClick={() => setHistSelId(j.order.id)} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex items-center gap-3 text-start hover:border-gray-200 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-green-50 text-green-600 grid place-items-center shrink-0"><Check className="w-5 h-5" /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-gray-900 text-sm" dir="ltr">{j.order.id}</p>
                  <span className="font-display font-bold text-gray-900 shrink-0">{j.order.total.toFixed(0)} <span className="text-[10px] text-gray-400 font-semibold">{sar}</span></span>
                </div>
                <p className="text-xs text-gray-400 truncate">{j.order.customer} · {j.order.area}</p>
                <p className="text-[11px] font-bold text-gray-400 mt-1">
                  {j.acceptedAt && <>{ar ? 'الاستلام' : 'Received'} <span dir="ltr">{clockOf(j.acceptedAt)}</span> · </>}
                  {j.deliveredAt && <>{ar ? 'التسليم' : 'Delivered'} <span dir="ltr">{clockOf(j.deliveredAt)}</span></>}
                  {durMin !== null && <> · {durMin} {ar ? 'د' : 'min'}</>}
                </p>
              </div>
              <ChevronLeft className={`w-5 h-5 text-gray-300 shrink-0 ${!ar ? 'rotate-180' : ''}`} />
            </button>
          );
        })}
      </div>
    </div>
    );
  };

  // ── Earnings tab ──
  const renderEarnings = () => {
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
          <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'الأداء' : 'Performance'}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6">
          {/* today hero — deliveries */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-3xl p-5">
            <p className="text-white/70 text-sm font-bold mb-1">{ar ? 'توصيلات اليوم' : "Today's deliveries"}</p>
            <p className="font-display font-extrabold text-4xl">{todayCount} <span className="text-lg font-bold text-white/70">{ar ? 'توصيلة' : 'trips'}</span></p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-secondary-400" />{ar ? 'الالتزام بالوقت' : 'On-time'} {DRIVER.acceptance}%</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-secondary-400 text-secondary-400" />{DRIVER.rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stat(Route, ar ? 'المسافة اليوم' : 'Distance today', `${todayDistance.toFixed(1)} ${ar ? 'كم' : 'km'}`, 'bg-indigo-50 text-indigo-600')}
            {stat(Banknote, ar ? 'نقد مُحصّل' : 'Cash collected', `${todayCash.toFixed(0)} ${sar}`, 'bg-amber-50 text-amber-600')}
          </div>

          {/* weekly activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-4">{ar ? 'نشاط الأسبوع' : "This week's activity"}</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {weekData.map((d, i) => {
                const last = i === weekData.length - 1;
                return (
                  <div key={d.en} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className={`w-full rounded-t-lg ${last ? 'bg-brand-600' : 'bg-secondary-400'}`} style={{ height: `${(d.total / weekMax) * 100}%`, minHeight: d.total ? 4 : 0 }} />
                    <span className={`text-[10px] font-bold ${last ? 'text-brand-600' : 'text-gray-400'}`}>{ar ? d.ar : d.en}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* recent deliveries */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2.5">{ar ? 'آخر التوصيلات' : 'Recent deliveries'}</h3>
            <div className="space-y-2">
              {history.map(j => (
                <div key={j.order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-green-50 text-green-600 grid place-items-center shrink-0"><Check className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm" dir="ltr">{j.order.id}</p>
                    <p className="text-xs text-gray-400 truncate">{j.order.area} · {j.distanceKm} {ar ? 'كم' : 'km'} · {j.deliveredAt ? ago(j.deliveredAt) : ''}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{ar ? 'تم التسليم' : 'Delivered'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Account tab ──
  const row = (Icon: React.ComponentType<{ className?: string }>, label: string, right?: React.ReactNode, onClick?: () => void) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-start">
      <span className="w-9 h-9 rounded-xl bg-gray-100 grid place-items-center text-gray-500 shrink-0"><Icon className="w-5 h-5" /></span>
      <span className="flex-1 font-semibold text-gray-800 text-sm">{label}</span>
      {right ?? <ChevronLeft className={`w-5 h-5 text-gray-300 ${!ar ? 'rotate-180' : ''}`} />}
    </button>
  );
  // language — a full page under Account (unified UX across the three apps)
  const renderLanguage = () => {
    const langs: { id: 'ar' | 'en'; avatar: string; native: string; other: string; hint: string }[] = [
      { id: 'ar', avatar: 'ع', native: 'العربية', other: 'Arabic', hint: 'المملكة العربية السعودية' },
      { id: 'en', avatar: 'EN', native: 'English', other: 'الإنجليزية', hint: 'English (US)' },
    ];
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white px-2 pt-4 pb-3 border-b border-gray-100 shrink-0 flex items-center gap-1">
          <button onClick={() => setLangOpen(false)} aria-label={ar ? 'رجوع' : 'Back'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><ChevronLeft className={`w-6 h-6 ${ar ? 'rotate-180' : ''}`} /></button>
          <h1 className="font-display font-bold text-lg text-gray-900">{ar ? 'اللغة' : 'Language'}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {langs.map(l => {
              const on = language === l.id;
              return (
                <button key={l.id} onClick={() => setLanguage(l.id)} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-start">
                  <span className={`w-11 h-11 rounded-full grid place-items-center font-black text-sm shrink-0 ${on ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'}`} dir="ltr">{l.avatar}</span>
                  <span className="flex-1 min-w-0">
                    <span className={`block font-bold ${on ? 'text-brand-700' : 'text-gray-800'}`}>{l.native}</span>
                    <span className="block text-xs text-gray-400 truncate">{l.other} · {l.hint}</span>
                  </span>
                  <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 border-2 transition-colors ${on ? 'bg-brand-600 border-brand-600' : 'border-gray-300'}`}>
                    {on && <Check className="w-3.5 h-3.5 text-white" />}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4 px-1 leading-relaxed">
            {ar ? 'يتم تطبيق اللغة على كامل التطبيق مباشرةً، بما في ذلك اتجاه الواجهة.' : 'The language applies to the whole app immediately, including the layout direction.'}
          </p>
        </div>
      </div>
    );
  };

  const renderAccount = () => langOpen ? renderLanguage() : (
    <div className="h-full overflow-y-auto pb-6">
      <div className="bg-brand-600 text-white px-4 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <span className="w-16 h-16 rounded-2xl bg-white/15 grid place-items-center font-display font-bold text-2xl shrink-0">{driverName.trim()[0]}</span>
          <div className="min-w-0">
            <h1 className="text-xl font-display font-bold truncate">{driverName}</h1>
            <p className="text-white/80 text-sm flex items-center gap-1.5"><Star className="w-4 h-4 fill-secondary-400 text-secondary-400" />{DRIVER.rating} · {vehicle} · <span dir="ltr">{DRIVER.plate}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { v: DRIVER.rating.toFixed(1), l: ar ? 'التقييم' : 'Rating' },
            { v: DRIVER.trips.toLocaleString('en'), l: ar ? 'توصيلة' : 'Trips' },
            { v: `${DRIVER.acceptance}%`, l: ar ? 'الالتزام' : 'On-time' },
          ].map(s => (
            <div key={s.l} className="bg-white/10 rounded-2xl py-2.5 text-center">
              <p className="font-display font-bold text-lg">{s.v}</p>
              <p className="text-white/70 text-[11px]">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-9 h-9 rounded-xl bg-gray-100 grid place-items-center text-gray-500 shrink-0"><Power className="w-5 h-5" /></span>
            <span className="flex-1 font-semibold text-gray-800 text-sm">{ar ? 'في الوردية' : 'On shift'}</span>
            <button onClick={() => setOnline(v => !v)} className={`w-12 h-7 rounded-full p-0.5 transition-colors ${online ? 'bg-brand-600' : 'bg-gray-300'}`}>
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${online ? (ar ? '-translate-x-5' : 'translate-x-5') : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-9 h-9 rounded-xl bg-gray-100 grid place-items-center text-gray-500 shrink-0">{sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</span>
            <span className="flex-1 font-semibold text-gray-800 text-sm">{ar ? 'صوت التنبيه' : 'Alert sound'}</span>
            <button onClick={() => setSound(v => !v)} className={`w-12 h-7 rounded-full p-0.5 transition-colors ${sound ? 'bg-brand-600' : 'bg-gray-300'}`}>
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${sound ? (ar ? '-translate-x-5' : 'translate-x-5') : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="w-9 h-9 rounded-xl bg-gray-100 grid place-items-center text-gray-500 shrink-0"><Moon className="w-5 h-5" /></span>
            <span className="flex-1 font-semibold text-gray-800 text-sm">{ar ? 'الوضع الداكن' : 'Dark mode'}</span>
            <button onClick={() => setAppDark(v => !v)} className={`w-12 h-7 rounded-full p-0.5 transition-colors ${appDark ? 'bg-brand-600' : 'bg-gray-300'}`}>
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${appDark ? (ar ? '-translate-x-5' : 'translate-x-5') : ''}`} />
            </button>
          </div>
          {row(Globe, ar ? 'اللغة' : 'Language', (
            <>
              <span className="text-sm font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">{ar ? 'العربية' : 'English'}</span>
              <ChevronLeft className={`w-5 h-5 text-gray-300 ${!ar ? 'rotate-180' : ''}`} />
            </>
          ), () => setLangOpen(true))}
        </div>
        <button onClick={onBackToPortal} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-red-600 font-bold hover:bg-red-50 transition-colors">
          <LogOut className={`w-5 h-5 ${ar ? 'rotate-180' : ''}`} />{ar ? 'تسجيل الخروج' : 'Log out'}
        </button>
      </div>
    </div>
  );

  const NAV: { id: Tab; ar: string; en: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'jobs', ar: 'العروض', en: 'Offers', Icon: Package },
    { id: 'trip', ar: 'الرحلات', en: 'Trips', Icon: Navigation },
    { id: 'history', ar: 'السجل', en: 'History', Icon: History },
    { id: 'earnings', ar: 'الأداء', en: 'Performance', Icon: TrendingUp },
    { id: 'account', ar: 'حسابي', en: 'Account', Icon: User },
  ];

  const confirmJob = confirmDeliverId ? trips.find(t => t.order.id === confirmDeliverId) : null;
  const depositMax = cashModal === 'deposit';
  const cashValid = (() => { const v = parseFloat(cashAmount); return !!v && v > 0 && (!depositMax || v <= cashOnHand + 0.001); })();

  return (
    <div dir={dir} className={`h-screen bg-[#FAF7F2] flex justify-center font-sans text-ink ${appDark ? 'dark' : ''}`}>
      <div className="w-full max-w-md h-screen flex flex-col relative bg-[#FAF7F2] shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {tab === 'jobs' && renderJobs()}
          {tab === 'trip' && renderTrips()}
          {tab === 'history' && renderHistory()}
          {tab === 'earnings' && renderEarnings()}
          {tab === 'account' && renderAccount()}
        </div>

        <nav className="border-t border-gray-100 bg-white grid grid-cols-5 shrink-0">
          {NAV.map(n => {
            const on = tab === n.id;
            return (
              <button key={n.id} onClick={() => { if (n.id === 'trip') setSelectedTripId(null); if (n.id === 'history') setHistSelId(null); if (n.id === 'account') setLangOpen(false); setTab(n.id); }} className={`relative flex flex-col items-center gap-1 py-2.5 transition-colors ${on ? 'text-brand-600' : 'text-gray-400'}`}>
                <n.Icon className="w-6 h-6" />
                <span className="text-[11px] font-bold">{ar ? n.ar : n.en}</span>
                {n.id === 'jobs' && online && offers.length > 0 && <span className="absolute top-1.5 ms-6 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">{offers.length}</span>}
                {n.id === 'trip' && trips.length > 0 && <span className="absolute top-1.5 ms-6 min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[10px] font-bold grid place-items-center">{trips.length}</span>}
              </button>
            );
          })}
        </nav>

        {/* deliver confirmation — cash collection for COD, simple confirm otherwise */}
        {confirmJob && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={() => setConfirmDeliverId(null)}>
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl w-full max-w-xs p-5" onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <span className="w-16 h-16 rounded-full bg-green-50 text-green-600 grid place-items-center mx-auto mb-3"><BadgeCheck className="w-9 h-9" /></span>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-1">{ar ? 'تأكيد التسليم' : 'Confirm delivery'}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {hasCod(confirmJob)
                    ? (ar ? `تأكّد من استلام ${codOf(confirmJob).toFixed(0)} ${sar} نقداً من العميل.` : `Make sure you collected ${codOf(confirmJob).toFixed(0)} ${sar} cash.`)
                    : (ar ? 'هل سلّمت الطلب للعميل؟' : 'Did you hand the order to the customer?')}
                </p>
                {/* proof photo — required before confirming */}
                {proofShot ? (
                  <div className="relative rounded-2xl overflow-hidden mb-4">
                    <img src={proofShot} alt="" className="w-full h-32 object-cover" />
                    <span className="absolute bottom-2 start-2 inline-flex items-center gap-1 bg-ink/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"><Camera className="w-3 h-3" />{ar ? 'صورة الإثبات' : 'Proof photo'}</span>
                    <button onClick={() => setProofShot('concept/07.jpg')} className="absolute top-2 end-2 w-8 h-8 rounded-full bg-white/90 grid place-items-center text-gray-600 shadow"><RefreshCw className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => setProofShot('concept/07.jpg')} className="w-full mb-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-400 text-gray-500 hover:text-brand-600 py-5 flex flex-col items-center gap-1.5 transition-colors">
                    <Camera className="w-7 h-7" />
                    <span className="text-sm font-bold">{ar ? 'التقط صورة إثبات التسليم' : 'Capture proof photo'}</span>
                    <span className="text-[11px] text-gray-400">{ar ? 'مطلوبة لإتمام التسليم' : 'Required to complete delivery'}</span>
                  </button>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDeliverId(null)} className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold">{ar ? 'تراجع' : 'Back'}</button>
                  <button onClick={() => completeDelivery(confirmJob.order.id)} disabled={!proofShot} className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2"><Check className="w-5 h-5" />{ar ? 'تم التسليم' : 'Delivered'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* cash collect / deposit */}
        {cashModal && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={() => setCashModal(null)}>
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl w-full max-w-xs p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${cashModal === 'collect' ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-600'}`}>
                  {cashModal === 'collect' ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
                </span>
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-900">{cashModal === 'collect' ? (ar ? 'تحصيل نقدي' : 'Cash collect') : (ar ? 'إيداع نقدي' : 'Cash deposit')}</h2>
                  <p className="text-xs text-gray-400">{cashModal === 'collect' ? (ar ? 'تسجيل مبلغ محصّل' : 'Record collected cash') : (ar ? 'توريد النقد للشركة' : 'Hand cash to the company')}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 mb-2 text-center">
                <input
                  value={cashAmount}
                  onChange={e => setCashAmount(e.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  autoFocus
                  placeholder="0"
                  className="w-full text-center text-3xl font-display font-extrabold text-gray-900 bg-transparent outline-none placeholder:text-gray-300"
                />
                <p className="text-xs font-bold text-gray-400 mt-0.5">{sar}</p>
              </div>
              <p className="text-xs text-gray-400 text-center mb-3">{ar ? 'النقد لديك' : 'Cash on hand'}: <span className="font-bold text-gray-600">{cashOnHand.toFixed(0)} {sar}</span></p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[50, 100, 200].map(v => (
                  <button key={v} onClick={() => setCashAmount(String(v))} className="py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">{v}</button>
                ))}
                {cashModal === 'deposit' ? (
                  <button onClick={() => setCashAmount(String(Math.round(cashOnHand)))} className="py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">{ar ? 'الكل' : 'All'}</button>
                ) : (
                  <button onClick={() => setCashAmount('500')} className="py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">500</button>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setCashModal(null)} className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold">{ar ? 'تراجع' : 'Back'}</button>
                <button disabled={!cashValid} onClick={submitCash} className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />{ar ? 'تأكيد' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryApp;
