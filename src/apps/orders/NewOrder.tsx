import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, X, Search, Plus, Minus, Trash2, Bike, ShoppingBag, Utensils,
  User, Phone, MapPin, Banknote, CreditCard, Smartphone, Wallet, Check,
} from 'lucide-react';
import { POS_MENU, POS_CATEGORIES, PosProduct } from '../../data/menu';
import { Order, OType, OPay, OItem, OAddon, itemTotal, orderTotal, newOrderId } from '../../data/orders';
import { AddressPicker } from './maps';

// Mock "saved clients" — typing a phone surfaces these as if pulled from the CRM.
const SAVED_CLIENTS: { phone: string; name: string; address: string }[] = [
  { phone: '512345678', name: 'عبدالله العمري', address: 'العزيزية - شارع 10' },
  { phone: '505551234', name: 'سارة الحربي', address: 'الششة - طريق الملك عبدالعزيز' },
  { phone: '533207788', name: 'محمد الغامدي', address: 'العوالي - حي النور' },
  { phone: '561109923', name: 'نورة القحطاني', address: 'الزاهر - شارع الحج' },
  { phone: '598812200', name: 'فهد الشهري', address: 'الرصيفة - شارع 22' },
];

interface Props {
  ar: boolean; dir: string; onCancel: () => void; onCreate: (o: Order) => void;
  /** host delegates the back gesture here; handler returns true when consumed (stepped a phase / closed an overlay) */
  registerBack?: (handler: (() => boolean) | null) => void;
}

// a parallel draft order (3 held at once, like the POS multi-cart)
interface Draft { id: number; otype: OType; lines: OItem[]; customer: string; phone: string; address: string; loc: { lat: number; lng: number } | null; payment: OPay; }

const TYPES: { id: OType; ar: string; en: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'DELIVERY', ar: 'توصيل', en: 'Delivery', Icon: Bike },
  { id: 'PICKUP', ar: 'استلام', en: 'Pickup', Icon: ShoppingBag },
  { id: 'DINE_IN', ar: 'في المكان', en: 'Dine in', Icon: Utensils },
];
const PAYS: { id: OPay; ar: string; en: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'CASH', ar: 'نقدي', en: 'Cash', Icon: Banknote },
  { id: 'MADA', ar: 'مدى', en: 'mada', Icon: CreditCard },
  { id: 'APPLE_PAY', ar: 'Apple Pay', en: 'Apple', Icon: Smartphone },
  { id: 'ONLINE', ar: 'إلكتروني', en: 'Online', Icon: Wallet },
];

const NewOrder: React.FC<Props> = ({ ar, dir, onCancel, onCreate, registerBack }) => {
  const sar = ar ? 'ر.س' : 'SAR';
  const [phase, setPhase] = useState<'menu' | 'cart' | 'checkout'>('menu');
  const [cat, setCat] = useState('الكل');
  const [q, setQ] = useState('');
  const [modProduct, setModProduct] = useState<PosProduct | null>(null);
  const [modSel, setModSel] = useState<Record<number, number[]>>({});
  const [modQty, setModQty] = useState(1);
  const [picking, setPicking] = useState(false);
  const [sugOpen, setSugOpen] = useState(false);

  // system back: overlays close first, phases step back; false = at menu root (host closes the screen)
  useEffect(() => {
    registerBack?.(() => {
      if (picking) { setPicking(false); return true; }
      if (modProduct) { setModProduct(null); return true; }
      if (phase === 'checkout') { setPhase('cart'); return true; }
      if (phase === 'cart') { setPhase('menu'); return true; }
      return false;
    });
  });
  useEffect(() => () => registerBack?.(null), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3 parallel draft orders ──
  const mkDraft = (id: number): Draft => ({ id, otype: 'DELIVERY', lines: [], customer: '', phone: '', address: '', loc: null, payment: 'CASH' });
  const [drafts, setDrafts] = useState<Draft[]>(() => [mkDraft(1), mkDraft(2), mkDraft(3)]);
  const [activeId, setActiveId] = useState(1);
  const draft = drafts.find(d => d.id === activeId) ?? drafts[0];
  const patchDraft = (fn: (d: Draft) => Draft) => setDrafts(ds => ds.map(d => d.id === activeId ? fn(d) : d));
  const switchTab = (id: number) => { setActiveId(id); setPhase('menu'); };

  // active-draft aliases so the rest of the screen reads/writes the current tab unchanged
  const otype = draft.otype;
  const lines = draft.lines;
  const customer = draft.customer;
  const phone = draft.phone;
  const address = draft.address;
  const loc = draft.loc;
  const payment = draft.payment;
  const setOtype = (t: OType) => patchDraft(d => ({ ...d, otype: t }));
  const setLines = (upd: OItem[] | ((ls: OItem[]) => OItem[])) => patchDraft(d => ({ ...d, lines: typeof upd === 'function' ? (upd as (ls: OItem[]) => OItem[])(d.lines) : upd }));
  const setCustomer = (v: string) => patchDraft(d => ({ ...d, customer: v }));
  const setPhone = (v: string) => patchDraft(d => ({ ...d, phone: v }));
  const setAddress = (v: string) => patchDraft(d => ({ ...d, address: v }));
  const setLoc = (v: { lat: number; lng: number } | null) => patchDraft(d => ({ ...d, loc: v }));
  const setPayment = (v: OPay) => patchDraft(d => ({ ...d, payment: v }));

  const cats = ['الكل', ...POS_CATEGORIES];
  const filtered = POS_MENU.filter(p => (cat === 'الكل' || p.category === cat) && (!q.trim() || p.name.includes(q)));
  const total = orderTotal(lines);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const clientMatches = phone.length >= 2 ? SAVED_CLIENTS.filter(c => c.phone.startsWith(phone)).slice(0, 4) : [];
  const pickClient = (c: typeof SAVED_CLIENTS[number]) => { setPhone(c.phone); setCustomer(c.name); setAddress(c.address); setSugOpen(false); };

  const lineKey = (p: PosProduct, addons: OAddon[]) => p.id + '|' + addons.map(a => a.name).slice().sort().join(',');
  const addLine = (p: PosProduct, addons: OAddon[], qty: number) => setLines(ls => {
    const k = lineKey(p, addons);
    const i = ls.findIndex(l => lineKey(l.product, l.addons) === k);
    if (i >= 0) { const n = [...ls]; n[i] = { ...n[i], qty: n[i].qty + qty }; return n; }
    return [...ls, { product: p, qty, addons }];
  });
  const setQty = (idx: number, qty: number) => setLines(ls => qty <= 0 ? ls.filter((_, i) => i !== idx) : ls.map((l, i) => i === idx ? { ...l, qty } : l));

  const addonsFromSel = (p: PosProduct, sel: Record<number, number[]>): OAddon[] => {
    const out: OAddon[] = [];
    p.modifiers?.forEach(g => (sel[g.id] || []).forEach(oid => { const o = g.options.find(x => x.id === oid); if (o) out.push({ name: o.name, price: o.price }); }));
    return out;
  };
  const openProduct = (p: PosProduct) => {
    if (!p.modifiers?.length) { addLine(p, [], 1); return; }
    const def: Record<number, number[]> = {};
    p.modifiers.forEach(g => { if (g.required && g.max === 1) def[g.id] = [g.options[0].id]; });
    setModSel(def); setModQty(1); setModProduct(p);
  };
  const toggleMod = (g: { id: number; max: number }, optId: number) => setModSel(s => {
    const cur = s[g.id] || [];
    if (g.max === 1) return { ...s, [g.id]: [optId] };
    if (cur.includes(optId)) return { ...s, [g.id]: cur.filter(x => x !== optId) };
    if (cur.length < g.max) return { ...s, [g.id]: [...cur, optId] };
    return s;
  });
  const confirmMod = () => {
    const p = modProduct!;
    if (!p.modifiers!.every(g => !g.required || (modSel[g.id]?.length))) return;
    addLine(p, addonsFromSel(p, modSel), modQty);
    setModProduct(null);
  };
  const modExtra = modProduct ? modProduct.modifiers!.reduce((s, g) => s + (modSel[g.id] || []).reduce((t, oid) => t + (g.options.find(o => o.id === oid)?.price || 0), 0), 0) : 0;
  const modUnit = (modProduct?.price ?? 0) + modExtra;

  const create = () => {
    if (!lines.length) return;
    const o: Order = {
      id: newOrderId(), source: 'PHONE', type: otype, status: 'NEW', items: lines,
      customer: customer.trim() || (ar ? 'عميل' : 'Customer'), phone: phone.trim(),
      payment, placedAt: Date.now(), statusSince: Date.now(), total: orderTotal(lines),
    };
    if (otype === 'DELIVERY') { if (address.trim()) o.address = address.trim(); if (loc) { o.lat = loc.lat; o.lng = loc.lng; } }
    onCreate(o);
    patchDraft(() => mkDraft(activeId)); // clear this tab, keep the other drafts
    setPhase('menu');
  };

  // 3 draft-order tabs — square number buttons (POS style, no icons), aligned to the top-left
  const draftTabs = (
    <div className="flex items-center gap-1.5 ms-auto shrink-0">
      {drafts.map((d, i) => {
        const on = d.id === activeId;
        const n = d.lines.reduce((s, l) => s + l.qty, 0);
        const filled = n > 0;
        return (
          <button key={d.id} onClick={() => switchTab(d.id)} className={`relative w-11 h-11 rounded-xl grid place-items-center text-sm font-bold transition-colors ${on ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : filled ? 'bg-white border border-gray-200 text-gray-700 hover:border-brand-300' : 'bg-gray-50 border border-dashed border-gray-200 text-gray-400 hover:border-gray-300'}`}>
            {filled && <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold grid place-items-center ring-2 ring-white bg-secondary-500 text-ink">{n}</span>}
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div dir={dir} className="absolute inset-0 z-50 bg-[#FAF7F2] flex flex-col font-sans text-ink">
      {phase === 'menu' ? (
        <>
          <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 shrink-0 space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={onCancel} aria-label={ar ? 'إلغاء' : 'Cancel'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><X className="w-5 h-5" /></button>
              <h1 className="font-display font-bold text-xl text-gray-900">{ar ? 'طلب جديد' : 'New order'}</h1>
              {draftTabs}
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {TYPES.map(tp => { const on = otype === tp.id; return (
                <button key={tp.id} onClick={() => setOtype(tp.id)} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors ${on ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><tp.Icon className="w-5 h-5" />{ar ? tp.ar : tp.en}</button>
              ); })}
            </div>
            <div className="relative">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={ar ? 'ابحث عن منتج…' : 'Search…'} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl ps-10 pe-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500" />
              <Search className="w-5 h-5 text-gray-400 absolute top-3 start-3" />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {cats.map(c => { const on = cat === c; return (
                <button key={c} onClick={() => setCat(c)} className={`shrink-0 px-3.5 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${on ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{c === 'الكل' ? (ar ? 'الكل' : 'All') : c}</button>
              ); })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-28">
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => (
                <button key={p.id} onClick={() => openProduct(p)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-start active:scale-[0.98] transition-transform">
                  <div className="relative h-24 bg-gray-100">
                    <img src={p.image} loading="lazy" alt="" className="w-full h-full object-cover" />
                    {p.modifiers?.length ? <span className="absolute top-1.5 start-1.5 text-[10px] font-semibold bg-white/90 text-brand-700 rounded-full px-2 py-0.5">{ar ? 'خيارات' : 'Options'}</span> : null}
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug h-10">{p.name}</h3>
                    <span className="font-display font-bold text-brand-700">{p.price} <span className="text-[10px] text-gray-400 font-semibold">{sar}</span></span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {count > 0 && (
            <div className="absolute bottom-4 inset-x-4 z-20">
              <button onClick={() => setPhase('cart')} className="w-full h-14 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/40 flex items-center gap-3 px-4 font-bold transition-colors">
                <span className="w-8 h-8 rounded-full bg-white/20 grid place-items-center text-sm">{count}</span>
                <span className="flex-1 text-start">{ar ? 'عرض السلة' : 'View cart'}</span>
                <span>{total.toFixed(0)} {sar}</span>
              </button>
            </div>
          )}
        </>
      ) : phase === 'cart' ? (
        <>
          <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 shrink-0 flex items-center gap-2">
            <button onClick={() => setPhase('menu')} aria-label={ar ? 'رجوع' : 'Back'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><ChevronLeft className={`w-6 h-6 ${ar ? 'rotate-180' : ''}`} /></button>
            <h1 className="font-display font-bold text-xl text-gray-900">{ar ? 'السلة' : 'Cart'}</h1>
            {draftTabs}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-500">{ar ? 'نوع الطلب:' : 'Type:'}</span>
              {(() => { const T = TYPES.find(x => x.id === otype)!; return <span className="inline-flex items-center gap-1.5 font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full"><T.Icon className="w-4 h-4" />{ar ? T.ar : T.en}</span>; })()}
            </div>

            <div className="space-y-2">
              {lines.map((l, idx) => (
                <div key={idx} className="flex gap-3 bg-white border border-gray-100 rounded-2xl p-2.5">
                  <img src={l.product.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2"><h4 className="font-bold text-sm text-gray-900">{l.product.name}</h4><span className="font-display font-bold text-brand-700 text-sm shrink-0">{itemTotal(l).toFixed(0)}</span></div>
                    {l.addons.length > 0 && <p className="text-[11px] text-gray-400 truncate">{l.addons.map(a => a.name).join(' · ')}</p>}
                    <div className="flex items-center bg-gray-100 rounded-full w-fit mt-1.5">
                      <button onClick={() => setQty(idx, l.qty - 1)} className="w-8 h-8 grid place-items-center text-brand-600">{l.qty === 1 ? <Trash2 className="w-4 h-4 text-gray-400" /> : <Minus className="w-4 h-4" />}</button>
                      <span className="w-6 text-center font-bold text-sm">{l.qty}</span>
                      <button onClick={() => setQty(idx, l.qty + 1)} className="w-8 h-8 grid place-items-center text-brand-600"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setPhase('menu')} className="w-full py-2.5 rounded-xl border border-dashed border-brand-300 text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-colors">+ {ar ? 'إضافة أصناف' : 'Add items'}</button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>{ar ? 'المجموع قبل الضريبة' : 'Subtotal'}</span><span>{(total - total * 15 / 115).toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>{ar ? 'ض.ق.م (15%)' : 'VAT (15%)'}</span><span>{(total * 15 / 115).toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-gray-200"><span className="font-display font-bold text-gray-900">{ar ? 'الإجمالي' : 'Total'}</span><span className="font-display font-bold text-lg text-brand-700">{total.toFixed(2)} {sar}</span></div>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-gray-100">
            <button onClick={() => setPhase('checkout')} disabled={!lines.length} className="w-full h-14 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition-colors">{ar ? 'متابعة للدفع' : 'Proceed to checkout'}<ChevronLeft className={`w-5 h-5 ${!ar ? 'rotate-180' : ''}`} /></button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 shrink-0 flex items-center gap-2">
            <button onClick={() => setPhase('cart')} aria-label={ar ? 'رجوع' : 'Back'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><ChevronLeft className={`w-6 h-6 ${ar ? 'rotate-180' : ''}`} /></button>
            <h1 className="font-display font-bold text-xl text-gray-900">{ar ? 'إتمام الطلب' : 'Checkout'}</h1>
            {draftTabs}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
            {/* order recap — tap to jump back to the cart and edit items */}
            <button onClick={() => setPhase('cart')} className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 text-start hover:border-brand-300 transition-colors">
              <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0"><ShoppingBag className="w-5 h-5" /></span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{count} {ar ? 'صنف' : 'items'} · {(() => { const T = TYPES.find(x => x.id === otype)!; return ar ? T.ar : T.en; })()}</p>
                <p className="text-xs text-gray-400 truncate">{lines.map(l => `${l.product.name}${l.qty > 1 ? ` ×${l.qty}` : ''}`).join('، ')}</p>
              </div>
              <span className="text-sm font-bold text-brand-600 shrink-0">{ar ? 'تعديل' : 'Edit'}</span>
            </button>

            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-3">
              <h3 className="font-bold text-gray-900">{ar ? 'بيانات العميل' : 'Customer'}</h3>
              {/* phone first — typing surfaces matching saved clients */}
              <div className="relative">
                <div className="flex gap-2" dir="ltr">
                  <span className="h-11 px-3 grid place-items-center rounded-xl bg-gray-100 text-sm font-bold text-gray-500 shrink-0">🇸🇦 +966</span>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-gray-400 absolute top-3.5 start-3" />
                    <input value={phone} onChange={e => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setSugOpen(true); }} onFocus={() => setSugOpen(true)} onBlur={() => setTimeout(() => setSugOpen(false), 150)} inputMode="tel" placeholder="5x xxx xxxx" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl ps-9 pe-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
                {sugOpen && clientMatches.length > 0 && (
                  <div className="absolute z-30 top-full mt-1.5 inset-x-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden" dir={ar ? 'rtl' : 'ltr'}>
                    {clientMatches.map(c => (
                      <button key={c.phone} onMouseDown={e => e.preventDefault()} onClick={() => pickClient(c)} className="w-full flex items-center gap-3 px-3 py-2.5 text-start hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 grid place-items-center text-xs font-bold shrink-0">{c.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('')}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold text-sm text-gray-900 truncate">{c.name}</span>
                          <span className="block text-xs text-gray-400" dir="ltr">+966 {c.phone}</span>
                        </span>
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 rounded-full px-2 py-0.5 shrink-0">{ar ? 'عميل مسجّل' : 'Saved'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* name second */}
              <div className="relative"><User className="w-4 h-4 text-gray-400 absolute top-3.5 start-3" /><input value={customer} onChange={e => setCustomer(e.target.value)} placeholder={ar ? 'اسم العميل' : 'Customer name'} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl ps-9 pe-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500" /></div>
            </div>

            {otype === 'DELIVERY' && (
              <button onClick={() => setPicking(true)} className="w-full bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3 text-start hover:border-brand-300 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0"><MapPin className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0"><p className="font-bold text-gray-900 text-sm">{ar ? 'موقع التوصيل' : 'Delivery location'}</p><p className="text-xs text-gray-400 truncate">{address.trim() ? address : (ar ? 'اضغط لتحديد الموقع على الخريطة' : 'Tap to set on the map')}</p></div>
                <ChevronLeft className={`w-5 h-5 text-gray-300 shrink-0 ${!ar ? 'rotate-180' : ''}`} />
              </button>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-3.5">
              <h3 className="font-bold text-gray-900 mb-2">{ar ? 'الدفع' : 'Payment'}</h3>
              <div className="grid grid-cols-4 gap-2">
                {PAYS.map(pm => { const on = payment === pm.id; return (
                  <button key={pm.id} onClick={() => setPayment(pm.id)} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-[11px] font-semibold transition-colors ${on ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}><pm.Icon className="w-5 h-5" />{ar ? pm.ar : pm.en}</button>
                ); })}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-3.5 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>{ar ? 'المجموع قبل الضريبة' : 'Subtotal'}</span><span>{(total - total * 15 / 115).toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>{ar ? 'ض.ق.م (15%)' : 'VAT (15%)'}</span><span>{(total * 15 / 115).toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-gray-200"><span className="font-display font-bold text-gray-900">{ar ? 'الإجمالي' : 'Total'}</span><span className="font-display font-bold text-lg text-brand-700">{total.toFixed(2)} {sar}</span></div>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-gray-100">
            <button onClick={create} disabled={!lines.length} className="w-full h-14 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition-colors"><Check className="w-5 h-5" />{ar ? 'إنشاء الطلب' : 'Create order'} · {total.toFixed(0)} {sar}</button>
          </div>
        </>
      )}

      {/* modifier sheet */}
      {modProduct && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end" onClick={() => setModProduct(null)}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-t-3xl max-h-[85%] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <img src={modProduct.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0"><h2 className="font-display font-bold text-lg text-gray-900 truncate">{modProduct.name}</h2><span className="text-sm text-gray-400 font-semibold">{modProduct.price} {sar}</span></div>
              <button onClick={() => setModProduct(null)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {modProduct.modifiers!.map(g => (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><span className="w-1.5 h-4 rounded-full bg-secondary-500" />{g.name}</h3><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${g.required ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>{g.required ? (ar ? 'مطلوب' : 'Required') : (ar ? 'اختياري' : 'Optional')}</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    {g.options.map(o => { const on = (modSel[g.id] || []).includes(o.id); return (
                      <button key={o.id} onClick={() => toggleMod(g, o.id)} className={`flex items-center justify-between px-3 py-3 rounded-xl border-2 text-sm text-start transition-colors ${on ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}><span className={`font-semibold ${on ? 'text-brand-700' : 'text-gray-700'}`}>{o.name}</span>{o.price > 0 && <span className={`text-xs font-semibold ${on ? 'text-brand-600' : 'text-gray-400'}`}>+{o.price}</span>}</button>
                    ); })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center gap-3 shrink-0">
              <div className="flex items-center bg-gray-100 rounded-full h-12 px-1.5 shrink-0"><button onClick={() => setModQty(Math.max(1, modQty - 1))} className="w-9 h-9 rounded-full grid place-items-center text-gray-700"><Minus className="w-5 h-5" /></button><span className="w-8 text-center font-bold">{modQty}</span><button onClick={() => setModQty(modQty + 1)} className="w-9 h-9 rounded-full grid place-items-center text-gray-700"><Plus className="w-5 h-5" /></button></div>
              <button onClick={confirmMod} className="flex-1 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2 transition-colors"><Plus className="w-5 h-5" />{ar ? 'إضافة' : 'Add'} · {(modUnit * modQty).toFixed(0)} {sar}</button>
            </div>
          </div>
        </div>
      )}

      {/* address map picker */}
      {picking && (
        <AddressPicker initial={{ lat: loc?.lat, lng: loc?.lng, address }} ar={ar} onCancel={() => setPicking(false)} onSave={(lat, lng, a) => { setLoc({ lat, lng }); setAddress(a); setPicking(false); }} />
      )}
    </div>
  );
};

export default NewOrder;
