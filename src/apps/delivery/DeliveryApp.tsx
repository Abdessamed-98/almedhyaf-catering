import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Bike, Package, Wallet, User, MapPin, Navigation, Phone, Check, X, Store,
  ChevronLeft, Clock, Star, TrendingUp, CircleDollarSign, Banknote,
  Power, Globe, LogOut, Volume2, VolumeX, Zap, ShieldCheck, HelpCircle,
  CreditCard, Smartphone, BadgeCheck, Route,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../ui';
import { BRAND, ACCENT, INK } from '../../theme/tokens';
import {
  DriverJob, JobStage, makeJob, SEED_OFFERS, SEED_HISTORY, WEEKLY, DRIVER, RESTAURANT,
  hasCod, codOf, tripEarnings, OPay,
} from '../../data/delivery';

interface Props { onBackToPortal: () => void; }
type Tab = 'jobs' | 'trip' | 'earnings' | 'account';

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

const OFFER_TTL = 30000;     // after this, the offer is taken by another driver
const TAKEN_LINGER = 3500;   // how long the "taken" notice stays before the card is removed
const DRIVER_HOME = { lat: RESTAURANT.lat - 0.018, lng: RESTAURANT.lng - 0.022 };

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
  const { language, toggleLanguage, dir } = useLanguage();
  const ar = language === 'ar';
  const toast = useToast();
  const sar = ar ? 'ر.س' : 'SAR';

  const [tab, setTab] = useState<Tab>('jobs');
  const [online, setOnline] = useState(true);
  const [sound, setSound] = useState(true);
  const [offers, setOffers] = useState<DriverJob[]>(SEED_OFFERS);
  const [active, setActive] = useState<DriverJob | null>(null);
  const [history, setHistory] = useState<DriverJob[]>(SEED_HISTORY);
  const [now, setNow] = useState(Date.now());
  const [confirmDeliver, setConfirmDeliver] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const driverName = ar ? DRIVER.nameAr : DRIVER.nameEn;
  const vehicle = ar ? DRIVER.vehicleAr : DRIVER.vehicleEn;

  // 1s tick drives offer countdowns + relative labels
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

  // live offers — only while online with no trip in progress
  const spawnRef = useRef<() => void>(() => {});
  spawnRef.current = () => {
    setOffers(os => (os.length >= 3 ? os : [makeJob(), ...os]));
    beep();
    toast(ar ? 'عرض توصيل جديد' : 'New delivery offer');
  };
  useEffect(() => {
    if (!online || active) return;
    const t = setInterval(() => spawnRef.current(), 16000);
    return () => clearInterval(t);
  }, [online, active]);

  // remove offers once the "taken by another driver" notice has shown for a moment
  useEffect(() => {
    setOffers(os => os.filter(o => now - o.offeredAt < OFFER_TTL + TAKEN_LINGER));
  }, [now]);

  const accept = (j: DriverJob) => {
    setActive({ ...j, stage: 'TO_RESTAURANT', acceptedAt: Date.now() });
    setOffers([]);
    setTab('trip');
    toast(ar ? `تم قبول الطلب ${j.order.id}` : `Accepted ${j.order.id}`);
  };
  const decline = (j: DriverJob) => setOffers(os => os.filter(o => o.order.id !== j.order.id));

  const NEXT: Record<JobStage, JobStage> = {
    OFFERED: 'TO_RESTAURANT', TO_RESTAURANT: 'AT_RESTAURANT', AT_RESTAURANT: 'TO_CUSTOMER',
    TO_CUSTOMER: 'ARRIVED', ARRIVED: 'DELIVERED', DELIVERED: 'DELIVERED', DECLINED: 'DECLINED',
  };
  const advance = () => {
    if (!active) return;
    if (active.stage === 'ARRIVED') { setConfirmDeliver(true); return; }
    setActive({ ...active, stage: NEXT[active.stage] });
  };
  const completeDelivery = () => {
    if (!active) return;
    const done: DriverJob = { ...active, stage: 'DELIVERED', deliveredAt: Date.now() };
    setHistory(h => [done, ...h]);
    setActive(null);
    setConfirmDeliver(false);
    setTab('earnings');
    toast(ar ? `تم تسليم ${done.order.id} 🎉` : `Delivered ${done.order.id} 🎉`);
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
  const stageHint = (s: JobStage) => {
    switch (s) {
      case 'TO_RESTAURANT': return ar ? 'توجّه إلى المطعم لاستلام الطلب' : 'Head to the kitchen to pick up';
      case 'AT_RESTAURANT': return ar ? 'استلم الطلب وتأكّد من الأصناف' : 'Collect the order, check the items';
      case 'TO_CUSTOMER': return ar ? 'في الطريق إلى العميل' : 'On the way to the customer';
      case 'ARRIVED': return ar ? 'سلّم الطلب' + (hasCod(active!) ? ' واستلم المبلغ نقداً' : '') : 'Hand over the order' + (hasCod(active!) ? ' & collect cash' : '');
      default: return '';
    }
  };

  const ago = (ms: number) => {
    const m = Math.max(0, Math.round((now - ms) / 60000));
    if (m < 1) return ar ? 'الآن' : 'now';
    if (m < 60) return ar ? `قبل ${m} د` : `${m}m ago`;
    return ar ? `قبل ${Math.floor(m / 60)} س` : `${Math.floor(m / 60)}h ago`;
  };
  const itemsSummary = (j: DriverJob) => j.order.items.map(it => `${it.product.name}${it.qty > 1 ? ` ×${it.qty}` : ''}`).join('، ');
  const itemCount = (j: DriverJob) => j.order.items.reduce((s, it) => s + it.qty, 0);

  // ── earnings figures (today = seeded history + session deliveries) ──
  const todayTotal = history.reduce((s, j) => s + tripEarnings(j), 0);
  const todayTips = history.reduce((s, j) => s + j.tip, 0);
  const todayCash = history.reduce((s, j) => s + codOf(j), 0);
  const weekData = WEEKLY.map((d, i) => (i === WEEKLY.length - 1 ? { ...d, total: Math.round(todayTotal) } : d));
  const weekMax = Math.max(...weekData.map(d => d.total), 1);

  // ── Jobs tab ──
  const offerCard = (j: DriverJob) => {
    const taken = now - j.offeredAt >= OFFER_TTL;
    return (
      <div key={j.order.id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden order-in transition-opacity ${taken ? 'opacity-60' : ''}`}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0"><Bike className="w-5 h-5" /></span>
              <div>
                <p className="font-bold text-gray-900" dir="ltr">{j.order.id}</p>
                <p className="text-xs text-gray-400">{itemCount(j)} {ar ? 'صنف' : 'items'} · {ar ? PAY[j.order.payment].ar : PAY[j.order.payment].en}</p>
              </div>
            </div>
            <div className="text-end">
              <p className="font-display font-extrabold text-2xl text-brand-700 leading-none">{(j.payout + j.tip).toFixed(0)} <span className="text-xs text-gray-400 font-bold">{sar}</span></p>
            </div>
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

          {taken ? (
            <div className="mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm">
              <X className="w-4 h-4 shrink-0" />{ar ? 'قَبِل الطلب مندوب آخر' : 'Another driver took this order'}
            </div>
          ) : (
            <div className="flex gap-2 mt-4">
              <button onClick={() => decline(j)} className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200">{ar ? 'رفض' : 'Decline'}</button>
              <button onClick={() => accept(j)} className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />{ar ? 'قبول' : 'Accept'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderJobs = () => (
    <div className="h-full flex flex-col">
      <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'العروض' : 'Offers'}</h1>
          <div className="flex items-center gap-2.5">
            <span className={`flex items-center gap-1.5 text-xs font-bold ${online ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />{online ? (ar ? 'متصل' : 'Online') : (ar ? 'غير متصل' : 'Offline')}
            </span>
            <button onClick={() => setOnline(v => !v)} aria-label={ar ? 'تبديل الاستقبال' : 'Toggle availability'} className={`w-12 h-7 rounded-full p-0.5 transition-colors shrink-0 ${online ? 'bg-brand-600' : 'bg-gray-300'}`}>
              <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${online ? (ar ? '-translate-x-5' : 'translate-x-5') : ''}`} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {active ? (
          <div className="text-center text-gray-400 py-16">
            <Bike className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-gray-600">{ar ? 'لديك توصيلة جارية' : 'You have an active delivery'}</p>
            <p className="text-sm mb-4">{ar ? 'أكمل التوصيلة الحالية لاستقبال عروض جديدة' : 'Finish it to receive new offers'}</p>
            <button onClick={() => setTab('trip')} className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-bold text-sm">{ar ? 'فتح الرحلة' : 'Open trip'}</button>
          </div>
        ) : !online ? (
          <div className="text-center text-gray-400 py-16">
            <Power className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-gray-600">{ar ? 'أنت غير متصل' : "You're offline"}</p>
            <p className="text-sm">{ar ? 'فعّل الاستقبال لرؤية عروض التوصيل' : 'Go online to see delivery offers'}</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <span className="inline-block w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
            <p className="font-bold text-gray-600">{ar ? 'بانتظار العروض…' : 'Waiting for offers…'}</p>
            <p className="text-sm">{ar ? 'سيصلك تنبيه عند توفّر توصيلة' : "We'll ping you when one comes in"}</p>
          </div>
        ) : offers.map(offerCard)}
      </div>
    </div>
  );

  // ── Trip tab ──
  const renderTrip = () => {
    if (!active) return (
      <div className="h-full flex flex-col">
        <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'الرحلة' : 'Trip'}</h1>
        </div>
        <div className="flex-1 grid place-items-center text-center text-gray-400 p-6">
          <div>
            <Navigation className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-gray-600">{ar ? 'لا توجد رحلة حالية' : 'No active trip'}</p>
            <p className="text-sm mb-4">{ar ? 'اقبل عرضاً من تبويب العروض للبدء' : 'Accept an offer to get started'}</p>
            <button onClick={() => setTab('jobs')} className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-bold text-sm">{ar ? 'تصفّح العروض' : 'Browse offers'}</button>
          </div>
        </div>
      </div>
    );
    const j = active, o = j.order;
    const idx = stepIndex(j.stage);
    const toRestaurant = j.stage === 'TO_RESTAURANT' || j.stage === 'AT_RESTAURANT';
    const dest = toRestaurant
      ? { title: RESTAURANT.name, sub: ar ? 'مطبخ المضياف العربي' : 'Al-Medhyaf kitchen', Icon: Store, line: ar ? 'استلام الطلب' : 'Pickup point' }
      : { title: o.customer, sub: o.address || o.area || '', Icon: MapPin, line: ar ? 'موقع التسليم' : 'Drop-off' };
    return (
      <div className="h-full flex flex-col">
        <div className="h-[46%] shrink-0">
          <TripMap job={j} />
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
              {stageHint(j.stage)}
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
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-200">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">{React.createElement(PAY[o.payment].Icon, { className: 'w-4 h-4' })}{ar ? PAY[o.payment].ar : PAY[o.payment].en}</span>
              <span className="font-display font-bold text-gray-900">{o.total.toFixed(0)} {sar}</span>
            </div>
          </div>

          {/* your earnings */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl p-4">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">{ar ? 'أرباحك من هذه التوصيلة' : 'Your earnings'}</p>
            <div className="flex items-end justify-between">
              <p className="font-display font-extrabold text-3xl">{tripEarnings(j).toFixed(0)} <span className="text-base font-bold text-white/70">{sar}</span></p>
              <div className="text-end text-xs text-white/70 space-y-0.5">
                <p>{ar ? 'أجرة' : 'Fare'} {j.payout} {j.tip > 0 ? <> · {ar ? 'بقشيش' : 'tip'} {j.tip}</> : null}</p>
                <p>{j.distanceKm} {ar ? 'كم' : 'km'} · {j.etaMin} {ar ? 'د' : 'min'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* action bar */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button onClick={advance} className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-transform">
            {j.stage === 'ARRIVED' ? <BadgeCheck className="w-6 h-6" /> : j.stage === 'AT_RESTAURANT' ? <Package className="w-6 h-6" /> : <Navigation className="w-6 h-6" />}
            {actionLabel(j.stage)}
          </button>
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
          <h1 className="text-2xl font-display font-bold text-gray-900">{ar ? 'الأرباح' : 'Earnings'}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6">
          {/* today hero */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-3xl p-5">
            <p className="text-white/70 text-sm font-bold mb-1">{ar ? 'إجمالي اليوم' : "Today's earnings"}</p>
            <p className="font-display font-extrabold text-4xl">{todayTotal.toFixed(0)} <span className="text-lg font-bold text-white/70">{sar}</span></p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-secondary-400" />{history.length} {ar ? 'توصيلة' : 'trips'}</span>
              <span className="flex items-center gap-1.5"><CircleDollarSign className="w-4 h-4 text-secondary-400" />{ar ? 'بقشيش' : 'tips'} {todayTips}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stat(Banknote, ar ? 'نقد مستلم' : 'Cash collected', `${todayCash.toFixed(0)} ${sar}`, 'bg-amber-50 text-amber-600')}
            {stat(TrendingUp, ar ? 'متوسط التوصيلة' : 'Avg / trip', `${history.length ? (todayTotal / history.length).toFixed(0) : 0} ${sar}`, 'bg-green-50 text-green-600')}
          </div>

          {/* weekly chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-4">{ar ? 'آخر 7 أيام' : 'Last 7 days'}</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {weekData.map((d, i) => {
                const last = i === weekData.length - 1;
                return (
                  <div key={d.en} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-bold text-gray-400">{d.total || ''}</span>
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
                  <span className="font-display font-bold text-brand-700 shrink-0">+{tripEarnings(j).toFixed(0)} <span className="text-[10px] text-gray-400">{sar}</span></span>
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
  const renderAccount = () => (
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
            { v: `${DRIVER.acceptance}%`, l: ar ? 'القبول' : 'Acceptance' },
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
            <span className="flex-1 font-semibold text-gray-800 text-sm">{ar ? 'متاح للتوصيل' : 'Available'}</span>
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
          {row(Globe, ar ? 'اللغة' : 'Language', <span className="text-sm font-bold text-brand-600">{ar ? 'English' : 'عربي'}</span>, toggleLanguage)}
          {row(Bike, ar ? 'بيانات المركبة' : 'Vehicle')}
          {row(ShieldCheck, ar ? 'الوثائق والتأمين' : 'Documents')}
          {row(HelpCircle, ar ? 'المساعدة والدعم' : 'Help & support')}
        </div>
        <button onClick={onBackToPortal} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-red-600 font-bold hover:bg-red-50 transition-colors">
          <LogOut className={`w-5 h-5 ${ar ? 'rotate-180' : ''}`} />{ar ? 'تسجيل الخروج' : 'Log out'}
        </button>
      </div>
    </div>
  );

  const NAV: { id: Tab; ar: string; en: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'jobs', ar: 'العروض', en: 'Offers', Icon: Package },
    { id: 'trip', ar: 'الرحلة', en: 'Trip', Icon: Navigation },
    { id: 'earnings', ar: 'الأرباح', en: 'Earnings', Icon: Wallet },
    { id: 'account', ar: 'حسابي', en: 'Account', Icon: User },
  ];

  return (
    <div dir={dir} className="h-screen bg-[#FAF7F2] flex justify-center font-sans text-ink">
      <div className="w-full max-w-md h-screen flex flex-col relative bg-[#FAF7F2] shadow-2xl overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {tab === 'jobs' && renderJobs()}
          {tab === 'trip' && renderTrip()}
          {tab === 'earnings' && renderEarnings()}
          {tab === 'account' && renderAccount()}
        </div>

        <nav className="border-t border-gray-100 bg-white grid grid-cols-4 shrink-0">
          {NAV.map(n => {
            const on = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} className={`relative flex flex-col items-center gap-1 py-2.5 transition-colors ${on ? 'text-brand-600' : 'text-gray-400'}`}>
                <n.Icon className="w-6 h-6" />
                <span className="text-[11px] font-bold">{ar ? n.ar : n.en}</span>
                {n.id === 'jobs' && online && !active && offers.length > 0 && <span className="absolute top-1.5 ms-5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">{offers.length}</span>}
                {n.id === 'trip' && active && <span className="absolute top-2.5 ms-5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* deliver confirmation */}
        {confirmDeliver && active && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4" onClick={() => setConfirmDeliver(false)}>
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl w-full max-w-xs p-5 text-center" onClick={e => e.stopPropagation()}>
              <span className="w-16 h-16 rounded-full bg-green-50 text-green-600 grid place-items-center mx-auto mb-3"><BadgeCheck className="w-9 h-9" /></span>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-1">{ar ? 'تأكيد التسليم' : 'Confirm delivery'}</h2>
              <p className="text-sm text-gray-500 mb-4">
                {hasCod(active)
                  ? (ar ? `تأكّد من استلام ${codOf(active).toFixed(0)} ${sar} نقداً من العميل.` : `Make sure you collected ${codOf(active).toFixed(0)} ${sar} cash.`)
                  : (ar ? 'هل سلّمت الطلب للعميل؟' : 'Did you hand the order to the customer?')}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDeliver(false)} className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold">{ar ? 'تراجع' : 'Back'}</button>
                <button onClick={completeDelivery} className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2"><Check className="w-5 h-5" />{ar ? 'تم التسليم' : 'Delivered'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryApp;
