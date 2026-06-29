import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, Minus, Trash2, X, Check, Banknote, CreditCard, Smartphone, Printer, Utensils, ShoppingBag, Bike, ChevronLeft, TicketPercent, UserPlus, Hash, Users, User, Phone, Clock, Wallet, ArrowDownLeft, ArrowUpRight, Grid2x2, Grid3x3, AlignJustify } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../ui';
import { POS_MENU, POS_CATEGORIES, PosProduct } from '../../data/menu';

interface POSProps { onBackToPortal: () => void; }

type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
type PayMethod = 'CASH' | 'MADA' | 'TRANSFER';
interface Line { uid: string; product: PosProduct; qty: number; mods: Record<number, number[]>; unitPrice: number; modText: string; }
interface Discount { type: 'PCT' | 'AMT'; value: number; }
interface Cart { id: number; customer?: string; phone?: string; table?: string; lines: Line[]; orderType: OrderType; discount: Discount | null; }
interface Sale { no: string; time: string; customer?: string; phone?: string; table?: string; orderType: OrderType; lines: Line[]; gross: number; discountAmount: number; vat: number; net: number; method: PayMethod; tendered?: number; change?: number; qr: string; }
interface ShiftData { start: string; cashier: string; float: number; count: number; cash: number; mada: number; transfer: number; }
interface Move { id: number; type: 'IN' | 'OUT'; amount: number; reason: string; time: string; }

const SELLER = 'مطبخ المضياف العربي';
const VAT_NO = '300000000000003';

// ── ZATCA QR (TLV → base64) ──
const enc = new TextEncoder();
const tlv = (tag: number, value: string): number[] => { const v = Array.from(enc.encode(value)); return [tag, v.length, ...v]; };
const zatcaB64 = (time: string, total: string, vat: string): string => {
  const bytes = [...tlv(1, SELLER), ...tlv(2, VAT_NO), ...tlv(3, time), ...tlv(4, total), ...tlv(5, vat)];
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
};

const discAmount = (gross: number, d: Discount | null) => !d ? 0 : d.type === 'PCT' ? Math.round(gross * d.value / 100 * 100) / 100 : Math.min(d.value, gross);

const POS: React.FC<POSProps> = ({ onBackToPortal }) => {
  const { language, dir } = useLanguage();
  const ar = language === 'ar';
  const toast = useToast();
  const sar = ar ? 'ر.س' : 'SAR';

  const [cat, setCat] = useState('الكل');
  const [q, setQ] = useState('');
  const [cardSize, setCardSize] = useState<'big' | 'small' | 'text'>('small');
  const [carts, setCarts] = useState<Cart[]>(() => Array.from({ length: 5 }, (_, i) => ({ id: i + 1, lines: [], orderType: 'DINE_IN', discount: null })));
  const [activeId, setActiveId] = useState(1);
  const orderNo = useRef(1);

  const [modProduct, setModProduct] = useState<PosProduct | null>(null);
  const [modSel, setModSel] = useState<Record<number, number[]>>({});
  const [modQty, setModQty] = useState(1);

  const [discOpen, setDiscOpen] = useState(false);
  const [discType, setDiscType] = useState<'PCT' | 'AMT'>('PCT');
  const [discValue, setDiscValue] = useState('');

  const [pay, setPay] = useState(false);
  const [method, setMethod] = useState<PayMethod>('CASH');
  const [tendered, setTendered] = useState('');
  const [sale, setSale] = useState<Sale | null>(null);
  const [infoModal, setInfoModal] = useState<null | 'customer' | 'table'>(null);

  // shift + cash drawer
  const [shift, setShift] = useState<ShiftData | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const moveId = useRef(1);
  const [shiftModal, setShiftModal] = useState(false);
  const [drawerModal, setDrawerModal] = useState(false);
  const [openFloat, setOpenFloat] = useState('');
  const [drawerAction, setDrawerAction] = useState<null | 'IN' | 'OUT'>(null);
  const [moveAmount, setMoveAmount] = useState('');
  const [moveReason, setMoveReason] = useState('');

  const cart = carts.find(c => c.id === activeId) ?? carts[0];
  const lines = cart.lines;

  const cats = ['الكل', ...POS_CATEGORIES];
  const counts = useMemo(() => {
    const m: Record<string, number> = { 'الكل': POS_MENU.length };
    POS_MENU.forEach(p => { m[p.category] = (m[p.category] || 0) + 1; });
    return m;
  }, []);
  const filtered = POS_MENU.filter(p => (cat === 'الكل' || p.category === cat) && (!q.trim() || p.name.includes(q)));

  const patchCart = (fn: (c: Cart) => Cart) => setCarts(cs => cs.map(c => c.id === activeId ? fn(c) : c));

  const sig = (id: number, mods: Record<number, number[]>) => id + ':' + Object.entries(mods).map(([g, o]) => g + '=' + [...o].sort().join(',')).sort().join('|');
  const addLine = (p: PosProduct, mods: Record<number, number[]>, unit: number, modText: string, qty = 1) => patchCart(c => {
    const uid = sig(p.id, mods);
    const i = c.lines.findIndex(l => l.uid === uid);
    if (i >= 0) { const ls = [...c.lines]; ls[i] = { ...ls[i], qty: ls[i].qty + qty }; return { ...c, lines: ls }; }
    return { ...c, lines: [...c.lines, { uid, product: p, qty, mods, unitPrice: unit, modText }] };
  });
  const setQty = (uid: string, qty: number) => patchCart(c => ({ ...c, lines: qty <= 0 ? c.lines.filter(l => l.uid !== uid) : c.lines.map(l => l.uid === uid ? { ...l, qty } : l) }));
  const clearActive = () => setCarts(cs => cs.map(c => c.id === activeId ? { id: c.id, lines: [], orderType: 'DINE_IN', discount: null } : c));
  const setOrderType = (t: OrderType) => patchCart(c => ({ ...c, orderType: t }));

  // open product → modifier sheet (or add directly)
  const openProduct = (p: PosProduct) => {
    if (!p.modifiers?.length) { addLine(p, {}, p.price, ''); return; }
    const def: Record<number, number[]> = {};
    p.modifiers.forEach(g => { if (g.required && g.max === 1) def[g.id] = [g.options[0].id]; });
    setModSel(def);
    setModQty(1);
    setModProduct(p);
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
    let extra = 0; const names: string[] = [];
    p.modifiers!.forEach(g => (modSel[g.id] || []).forEach(oid => {
      const o = g.options.find(x => x.id === oid)!;
      extra += o.price;
      if (o.price > 0 || g.options.length > 1) names.push(o.name);
    }));
    addLine(p, modSel, p.price + extra, names.join(' · '), modQty);
    setModProduct(null);
  };

  // totals (VAT-inclusive prices)
  const gross = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const discountAmount = discAmount(gross, cart.discount);
  const net = Math.max(0, Math.round((gross - discountAmount) * 100) / 100);
  const vat = Math.round(net * 15 / 115 * 100) / 100;

  const orderTypes: { id: OrderType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'DINE_IN', label: ar ? 'في المكان' : 'Dine in', Icon: Utensils },
    { id: 'TAKEAWAY', label: ar ? 'سفري' : 'Takeaway', Icon: ShoppingBag },
    { id: 'DELIVERY', label: ar ? 'توصيل' : 'Delivery', Icon: Bike },
  ];

  const inits = (s?: string) => (s || '').trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const recentCustomers = [
    { name: 'أبو محمد العتيبي', phone: '0501234567' },
    { name: 'سارة القحطاني', phone: '0559876543' },
    { name: 'فهد الشهري', phone: '0533219876' },
  ];

  const tableAreas = [
    { name: ar ? 'الصالة الرئيسية' : 'Main hall', tables: [{ n: '1', s: 4 }, { n: '2', s: 4 }, { n: '3', s: 4 }, { n: '4', s: 6 }, { n: '5', s: 6 }, { n: '6', s: 2 }, { n: '7', s: 2 }, { n: '8', s: 8 }] },
    { name: ar ? 'التراس الخارجي' : 'Terrace', tables: [{ n: '9', s: 4 }, { n: '10', s: 4 }, { n: '11', s: 6 }, { n: '12', s: 6 }] },
    { name: ar ? 'مجالس خاصة' : 'Private majlis', tables: [{ n: 'A', s: 10 }, { n: 'B', s: 12 }] },
  ];

  // drawer / shift math
  const drawerIn = moves.filter(m => m.type === 'IN').reduce((s, m) => s + m.amount, 0);
  const drawerOut = moves.filter(m => m.type === 'OUT').reduce((s, m) => s + m.amount, 0);
  const expectedCash = (shift?.float ?? 0) + (shift?.cash ?? 0) + drawerIn - drawerOut;
  const shiftTotal = shift ? shift.cash + shift.mada + shift.transfer : 0;

  const startShift = () => {
    setShift({ start: new Date().toISOString(), cashier: ar ? 'الكاشير' : 'Cashier', float: Number(openFloat) || 0, count: 0, cash: 0, mada: 0, transfer: 0 });
    setMoves([]);
    setOpenFloat('');
    toast(ar ? 'تم بدء الوردية' : 'Shift started');
  };
  const endShift = () => { setShift(null); setMoves([]); setShiftModal(false); toast(ar ? 'تم إغلاق الوردية' : 'Shift closed'); };
  const openDrawer = () => toast(ar ? 'تم فتح الدرج' : 'Drawer opened');
  const addMove = () => {
    const amt = Number(moveAmount);
    if (!amt || amt <= 0) return;
    setMoves(m => [{ id: moveId.current++, type: drawerAction!, amount: amt, reason: moveReason.trim() || (drawerAction === 'IN' ? (ar ? 'إيداع' : 'Cash in') : (ar ? 'سحب' : 'Cash out')), time: new Date().toISOString() }, ...m]);
    setMoveAmount(''); setMoveReason(''); setDrawerAction(null);
  };

  const applyDiscount = () => {
    const v = parseFloat(discValue);
    if (!v || v <= 0) { patchCart(c => ({ ...c, discount: null })); }
    else patchCart(c => ({ ...c, discount: { type: discType, value: v } }));
    setDiscOpen(false);
  };

  const confirmPay = () => {
    const time = new Date().toISOString();
    const no = `INV-${String(orderNo.current++).padStart(4, '0')}`;
    const tend = method === 'CASH' && tendered ? Number(tendered) : undefined;
    const s: Sale = {
      no, time, customer: cart.customer, phone: cart.phone, table: cart.table, orderType: cart.orderType, lines, gross, discountAmount, vat, net, method,
      tendered: tend, change: tend !== undefined ? Math.max(0, tend - net) : undefined,
      qr: zatcaB64(time, net.toFixed(2), vat.toFixed(2)),
    };
    setSale(s);
    setShift(sh => {
      if (!sh) return sh;
      const k = method === 'CASH' ? 'cash' : method === 'MADA' ? 'mada' : 'transfer';
      return { ...sh, count: sh.count + 1, [k]: sh[k] + net };
    });
    setPay(false);
    setTendered('');
    clearActive();
  };

  const cashChips = Array.from(new Set([net, Math.ceil(net / 10) * 10, Math.ceil(net / 50) * 50, Math.ceil(net / 100) * 100])).slice(0, 4);
  const tabLabel = (c: Cart, i: number) => (c.customer && c.customer.trim()) ? c.customer : (c.table && c.table.trim()) ? (ar ? `طاولة ${c.table}` : `Table ${c.table}`) : `#${i + 1}`;
  const lineAddons = (l: Line) => {
    const out: { name: string; price: number }[] = [];
    l.product.modifiers?.forEach(g => (l.mods[g.id] || []).forEach(oid => {
      const o = g.options.find(x => x.id === oid);
      if (o) out.push({ name: o.name, price: o.price });
    }));
    return out;
  };

  // live unit price inside the modifier sheet
  const modExtra = modProduct ? modProduct.modifiers!.reduce((s, g) => s + (modSel[g.id] || []).reduce((t, oid) => t + (g.options.find(o => o.id === oid)?.price || 0), 0), 0) : 0;
  const modUnit = (modProduct?.price ?? 0) + modExtra;

  return (
    <div dir={dir} className="h-screen flex bg-[#f4f1ea] text-ink overflow-hidden font-sans">

      {/* ── main column (header + categories + grid) ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-white border-b border-[#eadfce] flex items-center gap-3 px-3 sm:px-4 shrink-0">
          <button onClick={onBackToPortal} aria-label={ar ? 'خروج' : 'Exit'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><ChevronLeft className={`w-6 h-6 ${ar ? 'rotate-180' : ''}`} /></button>
          <img src="logo-mark.png" alt="" className="w-9 h-9 shrink-0" />
          <div className="relative flex-1 max-w-xl">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={ar ? 'ابحث عن منتج…' : 'Search products…'} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl ps-11 pe-4 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
            <Search className="w-5 h-5 text-gray-400 absolute top-3 start-4" />
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
            {([['big', Grid2x2], ['small', Grid3x3], ['text', AlignJustify]] as const).map(([mode, Icon]) => (
              <button key={mode} onClick={() => setCardSize(mode)} title={mode === 'big' ? (ar ? 'بطاقات كبيرة' : 'Big cards') : mode === 'small' ? (ar ? 'بطاقات صغيرة' : 'Small cards') : (ar ? 'بدون صور' : 'No images')} className={`w-9 h-9 rounded-lg grid place-items-center transition-colors ${cardSize === mode ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
          <button onClick={() => setShiftModal(true)} title={ar ? 'الوردية' : 'Shift'} className="relative w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><Clock className="w-5 h-5" /><span className={`absolute top-1.5 end-1.5 w-2 h-2 rounded-full ring-2 ring-white ${shift ? 'bg-green-500' : 'bg-gray-300'}`} /></button>
          <button onClick={() => setDrawerModal(true)} title={ar ? 'درج النقود' : 'Cash drawer'} className="w-10 h-10 rounded-xl hover:bg-gray-100 grid place-items-center text-gray-500 shrink-0"><Wallet className="w-5 h-5" /></button>
          <span className="hidden lg:inline-flex items-center gap-2 text-sm text-gray-500 font-semibold ps-1"><span className="w-2 h-2 rounded-full bg-green-500" />{ar ? 'مكة - الشرائع' : 'Makkah - Sharai'}</span>
        </header>

        {/* category tabs — share the content background */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 sm:px-4 pt-3 pb-1 shrink-0">
          {cats.map(c => {
            const on = cat === c;
            const label = c === 'الكل' ? (ar ? 'الكل' : 'All') : c;
            return (
              <button key={c} onClick={() => setCat(c)} className={`shrink-0 px-4 h-10 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${on ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
                {label}{c !== 'الكل' && <span className={`ms-1.5 text-xs ${on ? 'text-white/70' : 'text-gray-400'}`}>{counts[c]}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className={cardSize === 'big' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3' : cardSize === 'small' ? 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2'}>
            {filtered.map(p => cardSize === 'text' ? (
              <button key={p.id} onClick={() => openProduct(p)} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-300 text-start p-3 flex flex-col justify-between min-h-[76px] transition-all active:scale-[0.98]">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug">{p.name}</h3>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-display font-bold text-brand-700 text-sm">{p.price} <span className="text-[10px] text-gray-400 font-semibold">{sar}</span></span>
                  {p.modifiers?.length ? <span className="text-[9px] font-semibold text-brand-600 bg-brand-50 rounded-full px-1.5 py-0.5">{ar ? 'خيارات' : 'Opt'}</span> : null}
                </div>
              </button>
            ) : (
              <button key={p.id} onClick={() => openProduct(p)} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-300 text-start overflow-hidden transition-all active:scale-[0.98]">
                <div className={`relative ${cardSize === 'small' ? 'h-28' : 'h-32'} bg-gray-100`}>
                  <img src={p.image} loading="lazy" alt="" className="w-full h-full object-cover" />
                  {p.modifiers?.length ? <span className="absolute top-1.5 start-1.5 text-[10px] font-semibold bg-white/90 text-brand-700 rounded-full px-2 py-0.5">{ar ? 'خيارات' : 'Options'}</span> : null}
                </div>
                <div className={cardSize === 'small' ? 'p-2' : 'p-2.5'}>
                  <h3 className={`font-semibold text-gray-900 line-clamp-2 leading-snug ${cardSize === 'small' ? 'text-xs h-8' : 'text-sm h-10'}`}>{p.name}</h3>
                  <span className={`font-display font-bold text-brand-700 ${cardSize === 'small' ? 'text-sm' : 'text-base'}`}>{p.price} <span className="text-[10px] text-gray-400 font-semibold">{sar}</span></span>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && <div className="text-center text-gray-400 py-16 font-semibold">{ar ? 'لا توجد منتجات مطابقة' : 'No matching products'}</div>}
        </div>
      </div>

      {/* ── order panel (multi-cart) ── */}
      <aside className="w-[320px] xl:w-[380px] bg-white border-s border-[#eadfce] flex flex-col shrink-0">
        {/* cart tabs — 5 fixed slots */}
        <div className="flex items-stretch gap-1.5 p-2 pt-3 border-b border-gray-100 shrink-0">
          {carts.map((c, i) => {
            const on = c.id === activeId;
            const n = c.lines.reduce((s, l) => s + l.qty, 0);
            const filled = n > 0;
            const OIcon = orderTypes.find(o => o.id === c.orderType)?.Icon ?? Utensils;
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`relative flex-1 min-w-0 h-11 rounded-xl flex items-center justify-center gap-1 px-1 transition-colors ${on ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : filled ? 'bg-white border border-gray-200 text-gray-700 hover:border-brand-300' : 'bg-gray-50 border border-dashed border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                {filled && <span className="absolute -top-1.5 -end-1.5 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold grid place-items-center ring-2 ring-white bg-secondary-500 text-ink">{n}</span>}
                <span className="truncate text-sm font-bold">{tabLabel(c, i)}</span>
                <OIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
              </button>
            );
          })}
        </div>

        {/* customer / order type */}
        <div className="p-3 border-b border-gray-100 shrink-0 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setInfoModal('customer')} className="h-10 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm font-semibold hover:border-gray-300 transition-colors min-w-0">
              <UserPlus className="w-4 h-4 text-gray-400 shrink-0" />
              <span className={`flex-1 text-start truncate ${cart.customer?.trim() ? 'text-gray-700' : 'text-gray-400 font-normal'}`}>{cart.customer?.trim() || (ar ? 'عميل' : 'Customer')}</span>
            </button>
            <button onClick={() => setInfoModal('table')} className="h-10 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm font-semibold hover:border-gray-300 transition-colors min-w-0">
              <Hash className="w-4 h-4 text-gray-400 shrink-0" />
              <span className={`flex-1 text-start truncate ${cart.table?.trim() ? 'text-gray-700' : 'text-gray-400 font-normal'}`}>{cart.table?.trim() ? (ar ? `طاولة ${cart.table}` : `Table ${cart.table}`) : (ar ? 'طاولة' : 'Table')}</span>
            </button>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {orderTypes.map(o => {
              const on = cart.orderType === o.id;
              return (
                <button key={o.id} onClick={() => setOrderType(o.id)} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors ${on ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <o.Icon className="w-5 h-5" />{o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* lines */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-6">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-semibold">{ar ? 'أضف منتجات لبدء الطلب' : 'Add products to start an order'}</p>
            </div>
          ) : lines.map(l => {
            const addons = lineAddons(l);
            return (
              <div key={l.uid} className="flex gap-3 bg-gray-50 rounded-xl p-2.5">
                {/* image — fixed size, qty overlaid */}
                <div className="relative w-28 aspect-[5/4] rounded-lg overflow-hidden shrink-0 self-start">
                  <img src={l.product.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-ink/60 backdrop-blur-sm flex items-center justify-between px-1">
                    <button onClick={() => setQty(l.uid, l.qty - 1)} aria-label="-" className="w-7 h-7 grid place-items-center text-white active:scale-90 transition-transform">{l.qty === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}</button>
                    <span className="text-white text-sm font-bold tabular-nums">{l.qty}</span>
                    <button onClick={() => setQty(l.uid, l.qty + 1)} aria-label="+" className="w-7 h-7 grid place-items-center text-white active:scale-90 transition-transform"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* content + add-ons */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{l.product.name}</h4>
                    <span className="font-display font-bold text-brand-700 text-base shrink-0">{(l.unitPrice * l.qty).toFixed(0)} <span className="text-[10px] text-gray-400 font-semibold">{sar}</span></span>
                  </div>
                  {addons.length > 0 && (
                    <div className="border-t border-dashed border-gray-200 mt-2 pt-2 space-y-1">
                      {addons.map((a, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs gap-2">
                          <span className="text-gray-600 truncate">{a.name}</span>
                          {a.price > 0
                            ? <span className="text-gray-800 font-semibold shrink-0" dir="ltr">+{a.price} {sar}</span>
                            : <span className="text-gray-300 shrink-0">—</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* summary + pay */}
        {lines.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3 shrink-0">
            {/* discount control */}
            {cart.discount ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-semibold text-green-700"><TicketPercent className="w-4 h-4" />{ar ? 'خصم' : 'Discount'} {cart.discount.type === 'PCT' ? `${cart.discount.value}%` : `${cart.discount.value} ${sar}`}</span>
                <button onClick={() => patchCart(c => ({ ...c, discount: null }))} className="text-xs font-semibold text-gray-400 hover:text-red-500">{ar ? 'إزالة' : 'Remove'}</button>
              </div>
            ) : (
              <button onClick={() => { setDiscType('PCT'); setDiscValue(''); setDiscOpen(true); }} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-brand-300 text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-colors"><TicketPercent className="w-4 h-4" />{ar ? 'إضافة خصم' : 'Add discount'}</button>
            )}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>{ar ? 'المجموع' : 'Subtotal'}</span><span className="font-semibold text-gray-700">{gross.toFixed(2)} {sar}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>{ar ? 'الخصم' : 'Discount'}</span><span className="font-semibold" dir="ltr">- {discountAmount.toFixed(2)} {sar}</span></div>}
              <div className="flex justify-between text-gray-500"><span>{ar ? 'شامل ض.ق.م (15%)' : 'incl. VAT (15%)'}</span><span className="font-semibold text-gray-700">{vat.toFixed(2)} {sar}</span></div>
              <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-gray-200"><span className="font-display font-bold text-gray-900">{ar ? 'الإجمالي' : 'Total'}</span><span className="font-display font-bold text-xl text-brand-700">{net.toFixed(2)} {sar}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={clearActive} className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors">{ar ? 'تفريغ' : 'Clear'}</button>
              <button onClick={() => setPay(true)} className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-colors"><Banknote className="w-5 h-5" />{ar ? 'الدفع' : 'Pay'} · {net.toFixed(2)} {sar}</button>
            </div>
          </div>
        )}
      </aside>

      {/* ── modifier sheet (fixed size, two columns) ── */}
      {modProduct && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setModProduct(null)}>
          <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl h-[88vh] sm:h-[600px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <img src={modProduct.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold text-lg text-gray-900 truncate">{modProduct.name}</h2>
                <span className="text-sm text-gray-400 font-semibold">{modProduct.price} {sar}</span>
              </div>
              <button onClick={() => setModProduct(null)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid sm:grid-cols-2 gap-x-5 gap-y-5">
                {modProduct.modifiers!.map(g => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2"><span className="w-1.5 h-4 rounded-full bg-secondary-500" />{g.name}</h3>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${g.required ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>{g.required ? (ar ? 'مطلوب' : 'Required') : (ar ? 'اختياري' : 'Optional')}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {g.options.map(o => {
                        const on = (modSel[g.id] || []).includes(o.id);
                        return (
                          <button key={o.id} onClick={() => toggleMod(g, o.id)} className={`flex items-center justify-between px-4 py-4 rounded-xl border-2 text-sm text-start transition-colors ${on ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <span className={`font-semibold ${on ? 'text-brand-700' : 'text-gray-700'}`}>{o.name}</span>
                            {o.price > 0 && <span className={`text-xs font-semibold ${on ? 'text-brand-600' : 'text-gray-400'}`}>+{o.price}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center gap-3 shrink-0">
              <div className="flex items-center bg-gray-100 rounded-full h-14 px-1.5 shrink-0">
                <button onClick={() => setModQty(Math.max(1, modQty - 1))} className="w-11 h-11 rounded-full grid place-items-center text-gray-700 hover:bg-white transition-colors"><Minus className="w-5 h-5" /></button>
                <span className="w-12 text-center font-bold text-lg">{modQty}</span>
                <button onClick={() => setModQty(modQty + 1)} className="w-11 h-11 rounded-full grid place-items-center text-gray-700 hover:bg-white transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
              <button onClick={confirmMod} className="flex-1 h-14 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-colors">
                <Plus className="w-5 h-5" />{ar ? 'إضافة' : 'Add'} · {(modUnit * modQty).toFixed(0)} {sar}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── discount modal ── */}
      {discOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDiscOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-gray-900">{ar ? 'خصم على الطلب' : 'Order discount'}</h2>
              <button onClick={() => setDiscOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(['PCT', 'AMT'] as const).map(tp => (
                <button key={tp} onClick={() => setDiscType(tp)} className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${discType === tp ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{tp === 'PCT' ? (ar ? 'نسبة %' : 'Percent %') : (ar ? `مبلغ ${sar}` : `Amount ${sar}`)}</button>
              ))}
            </div>
            <input value={discValue} onChange={e => setDiscValue(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" autoFocus placeholder={discType === 'PCT' ? '10' : '20'} dir="ltr" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 text-end mb-4" />
            <button onClick={applyDiscount} className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors">{ar ? 'تطبيق الخصم' : 'Apply discount'}</button>
          </div>
        </div>
      )}

      {/* ── customer modal ── */}
      {infoModal === 'customer' && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInfoModal(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-brand-600" />{ar ? 'بيانات العميل' : 'Customer'}</h2>
              <button onClick={() => setInfoModal(null)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>

            {/* live avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-700 grid place-items-center font-display font-bold text-2xl">
                {inits(cart.customer) || <User className="w-7 h-7 text-brand-300" />}
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute top-3.5 start-3" />
                <input value={cart.customer ?? ''} onChange={e => patchCart(c => ({ ...c, customer: e.target.value }))} autoFocus placeholder={ar ? 'اسم العميل' : 'Customer name'} className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl ps-9 pe-3 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="flex gap-2" dir="ltr">
                <span className="h-11 px-3 grid place-items-center rounded-xl bg-gray-100 text-sm font-bold text-gray-500 shrink-0">🇸🇦 +966</span>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-gray-400 absolute top-3.5 start-3" />
                  <input value={cart.phone ?? ''} onChange={e => patchCart(c => ({ ...c, phone: e.target.value.replace(/[^0-9]/g, '') }))} inputMode="tel" placeholder="5x xxx xxxx" className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl ps-9 pe-3 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
            </div>

            {/* recent customers */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{ar ? 'عملاء متكررون' : 'Recent customers'}</p>
              <div className="space-y-1.5">
                {recentCustomers.map(rc => (
                  <button key={rc.phone} onClick={() => patchCart(c => ({ ...c, customer: rc.name, phone: rc.phone }))} className="w-full flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-start transition-colors">
                    <span className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 grid place-items-center font-bold text-xs shrink-0">{inits(rc.name)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{rc.name}</p>
                      <p className="text-xs text-gray-400" dir="ltr">{rc.phone}</p>
                    </div>
                    <ChevronLeft className={`w-4 h-4 text-gray-300 shrink-0 ${!ar ? 'rotate-180' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => patchCart(c => ({ ...c, customer: undefined, phone: undefined }))} className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors">{ar ? 'مسح' : 'Clear'}</button>
              <button onClick={() => setInfoModal(null)} className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors">{ar ? 'حفظ' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── table picker ── */}
      {infoModal === 'table' && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInfoModal(null)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-5 max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2"><Hash className="w-5 h-5 text-brand-600" />{ar ? 'اختر الطاولة' : 'Select table'}</h2>
              <button onClick={() => setInfoModal(null)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-4">
              {tableAreas.map(area => (
                <div key={area.name}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-4 rounded-full bg-secondary-500" />
                    <h3 className="text-sm font-bold text-gray-700">{area.name}</h3>
                    <span className="text-xs text-gray-400">{area.tables.length} {ar ? 'طاولات' : 'tables'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2" dir="ltr">
                    {area.tables.map(t => {
                      const on = cart.table === t.n;
                      return (
                        <button key={t.n} onClick={() => patchCart(c => ({ ...c, table: on ? undefined : t.n }))} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-colors ${on ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                          <span className={`text-xl font-bold ${on ? 'text-brand-700' : 'text-gray-800'}`}>{t.n}</span>
                          <span className={`text-[10px] flex items-center gap-0.5 ${on ? 'text-brand-500' : 'text-gray-400'}`}><Users className="w-3 h-3" />{t.s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5 shrink-0">
              <button onClick={() => patchCart(c => ({ ...c, table: undefined }))} className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors">{ar ? 'مسح' : 'Clear'}</button>
              <button onClick={() => setInfoModal(null)} className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors">{ar ? 'تم' : 'Done'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── shift manager (fixed, two columns) ── */}
      {shiftModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShiftModal(false)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl h-[88vh] sm:h-[540px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-brand-600" />{ar ? 'الوردية' : 'Shift'}</h2>
              <button onClick={() => setShiftModal(false)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>

            {!shift ? (
              <div className="flex-1 grid sm:grid-cols-2 overflow-hidden">
                <div className="p-6 flex flex-col items-center justify-center text-center border-e border-gray-100 bg-gray-50/60">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mb-4"><Clock className="w-8 h-8" /></div>
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-1">{ar ? 'بدء وردية جديدة' : 'Start a new shift'}</h3>
                  <p className="text-sm text-gray-500">{ar ? 'أدخل النقد الافتتاحي الموجود في الدرج لبدء تسجيل المبيعات.' : 'Enter the opening cash in the drawer to begin recording sales.'}</p>
                </div>
                <div className="p-6 flex flex-col justify-center overflow-y-auto">
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">{ar ? 'النقد الافتتاحي' : 'Opening float'}</label>
                  <div className="relative">
                    <input value={openFloat} onChange={e => setOpenFloat(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" autoFocus placeholder="0.00" dir="ltr" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 text-end" />
                    <span className="absolute top-3.5 start-4 text-sm font-semibold text-gray-400">{sar}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {['0', '200', '500', '1000'].map(v => <button key={v} onClick={() => setOpenFloat(v)} className="flex-1 py-2 rounded-lg bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors" dir="ltr">{v}</button>)}
                  </div>
                  <button onClick={startShift} className="w-full mt-5 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors">{ar ? 'بدء الوردية' : 'Start shift'}</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid sm:grid-cols-2 overflow-hidden">
                <div className="p-5 flex flex-col border-e border-gray-100 overflow-y-auto">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span className="text-sm font-semibold text-green-700">{ar ? 'مفتوحة منذ' : 'Open since'} {new Date(shift.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-xs text-green-600/70 ms-auto">{shift.cashier}</span>
                  </div>
                  <div className="bg-brand-50 rounded-2xl p-5 text-center mt-3">
                    <span className="text-xs text-brand-600/80">{ar ? 'النقد المتوقع بالدرج' : 'Expected cash in drawer'}</span>
                    <div className="font-display font-bold text-3xl text-brand-700 mt-1">{expectedCash.toFixed(2)} <span className="text-base text-brand-400">{sar}</span></div>
                  </div>
                  <button onClick={endShift} className="w-full mt-auto py-3.5 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">{ar ? 'إنهاء الوردية' : 'Close shift'}</button>
                </div>
                <div className="p-5 overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-400 mb-2">{ar ? 'ملخص الوردية' : 'Shift summary'}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: ar ? 'عدد الطلبات' : 'Orders', v: String(shift.count) },
                      { l: ar ? 'إجمالي المبيعات' : 'Total sales', v: shiftTotal.toFixed(2) },
                      { l: ar ? 'نقدي' : 'Cash', v: shift.cash.toFixed(2) },
                      { l: 'مدى', v: shift.mada.toFixed(2) },
                      { l: ar ? 'تحويل' : 'Transfer', v: shift.transfer.toFixed(2) },
                      { l: ar ? 'النقد الافتتاحي' : 'Float', v: shift.float.toFixed(2) },
                    ].map(s => (
                      <div key={s.l} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{s.l}</p>
                        <p className="font-display font-bold text-gray-900">{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── cash drawer (fixed, two columns) ── */}
      {drawerModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setDrawerModal(false); setDrawerAction(null); }}>
          <div className="bg-white w-full max-w-2xl rounded-3xl h-[88vh] sm:h-[540px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2"><Wallet className="w-5 h-5 text-brand-600" />{ar ? 'درج النقود' : 'Cash drawer'}</h2>
              <button onClick={() => { setDrawerModal(false); setDrawerAction(null); }} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 grid sm:grid-cols-2 overflow-hidden">
              {/* left: balance + actions */}
              <div className="p-5 flex flex-col border-e border-gray-100 overflow-y-auto">
                <div className="text-center bg-gray-50 rounded-2xl py-4 px-3">
                  <span className="text-xs text-gray-400">{ar ? 'النقد المتوقع في الدرج' : 'Expected cash in drawer'}</span>
                  <div className="font-display font-bold text-3xl text-gray-900 mt-1">{expectedCash.toFixed(2)} <span className="text-base text-gray-400">{sar}</span></div>
                  <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 mt-2">
                    <span>{ar ? 'افتتاحي' : 'Float'}: {(shift?.float ?? 0).toFixed(0)}</span>
                    <span>{ar ? 'مبيعات نقدية' : 'Cash sales'}: {(shift?.cash ?? 0).toFixed(0)}</span>
                    <span>{ar ? 'إيداع' : 'In'}: {drawerIn.toFixed(0)}</span>
                    <span>{ar ? 'سحب' : 'Out'}: {drawerOut.toFixed(0)}</span>
                  </div>
                </div>

                {drawerAction ? (
                  <div className="bg-gray-50 rounded-2xl p-3 mt-4">
                    <p className="font-semibold text-sm text-gray-800 mb-2">{drawerAction === 'IN' ? (ar ? 'إيداع نقدي' : 'Cash in') : (ar ? 'سحب نقدي' : 'Cash out')}</p>
                    <input value={moveAmount} onChange={e => setMoveAmount(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" autoFocus placeholder={ar ? 'المبلغ' : 'Amount'} dir="ltr" className="w-full h-11 bg-white border border-gray-200 rounded-xl px-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 text-end mb-2" />
                    <input value={moveReason} onChange={e => setMoveReason(e.target.value)} placeholder={ar ? 'السبب (اختياري)' : 'Reason (optional)'} className="w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500 mb-3" />
                    <div className="flex gap-2">
                      <button onClick={() => setDrawerAction(null)} className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-300 transition-colors">{ar ? 'إلغاء' : 'Cancel'}</button>
                      <button onClick={addMove} className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors">{ar ? 'تأكيد' : 'Confirm'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button onClick={() => setDrawerAction('IN')} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600 transition-colors"><ArrowDownLeft className="w-5 h-5" /><span className="text-xs font-semibold">{ar ? 'إيداع' : 'Cash in'}</span></button>
                    <button onClick={() => setDrawerAction('OUT')} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"><ArrowUpRight className="w-5 h-5" /><span className="text-xs font-semibold">{ar ? 'سحب' : 'Cash out'}</span></button>
                    <button onClick={openDrawer} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-colors"><Wallet className="w-5 h-5" /><span className="text-xs font-semibold">{ar ? 'فتح الدرج' : 'Open'}</span></button>
                  </div>
                )}
              </div>

              {/* right: movements */}
              <div className="p-5 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-400 mb-2">{ar ? 'الحركات' : 'Movements'}</p>
                {moves.length === 0 ? (
                  <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-gray-400">
                    <Wallet className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">{ar ? 'لا توجد حركات بعد' : 'No movements yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {moves.map(m => (
                      <div key={m.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                        <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${m.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{m.type === 'IN' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{m.reason}</p>
                          <p className="text-[11px] text-gray-400" dir="ltr">{new Date(m.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`font-display font-bold text-sm shrink-0 ${m.type === 'IN' ? 'text-green-600' : 'text-red-600'}`} dir="ltr">{m.type === 'IN' ? '+' : '−'}{m.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── payment modal (fixed size) ── */}
      {pay && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPay(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl h-[88vh] sm:h-[520px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="font-display font-bold text-xl text-gray-900">{ar ? 'الدفع' : 'Payment'}</h2>
              <button onClick={() => setPay(false)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="text-center mb-5">
                <span className="text-sm text-gray-400">{ar ? 'الإجمالي المستحق' : 'Amount due'}</span>
                <div className="font-display font-bold text-4xl text-brand-700 mt-1">{net.toFixed(2)} <span className="text-lg text-gray-400">{sar}</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {([{ id: 'CASH', label: ar ? 'نقدي' : 'Cash', Icon: Banknote }, { id: 'MADA', label: 'مدى', Icon: CreditCard }, { id: 'TRANSFER', label: ar ? 'تحويل' : 'Transfer', Icon: Smartphone }] as { id: PayMethod; label: string; Icon: React.ComponentType<{ className?: string }> }[]).map(m => {
                  const on = method === m.id;
                  return <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-sm font-semibold transition-colors ${on ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}><m.Icon className="w-6 h-6" />{m.label}</button>;
                })}
              </div>
              {method === 'CASH' && (
                <div>
                  <label className="text-xs font-semibold text-gray-400">{ar ? 'المبلغ المدفوع' : 'Amount tendered'}</label>
                  <input value={tendered} onChange={e => setTendered(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder={net.toFixed(2)} dir="ltr" className="w-full mt-1 h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 font-bold text-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 text-end" />
                  <div className="flex gap-2 mt-3">
                    {cashChips.map(v => <button key={v} onClick={() => setTendered(v.toFixed(2))} className="flex-1 py-2 rounded-lg bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors" dir="ltr">{v.toFixed(0)}</button>)}
                  </div>
                  {tendered && Number(tendered) >= net && <div className="mt-3 flex justify-between text-sm font-semibold text-green-600 bg-green-50 rounded-xl px-4 py-2.5"><span>{ar ? 'الباقي' : 'Change'}</span><span dir="ltr">{(Number(tendered) - net).toFixed(2)} {sar}</span></div>}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 shrink-0">
              <button onClick={confirmPay} className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-colors"><Check className="w-6 h-6" strokeWidth={2.5} />{ar ? 'تأكيد الدفع والطباعة' : 'Confirm & print'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── receipt (ZATCA) ── */}
      {sale && (
        <div className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSale(null)}>
          <div className="w-full max-w-sm flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <div className="pos-receipt bg-white w-full rounded-2xl p-5 max-h-[80vh] overflow-y-auto text-ink" dir="rtl">
              <div className="text-center">
                <img src="logo-mark.png" alt="" className="w-12 h-12 mx-auto mb-1" />
                <h3 className="font-display font-bold text-lg text-brand-800">مطبخ المضياف العربي</h3>
                <p className="text-xs text-gray-500">فاتورة ضريبية مبسّطة</p>
                <p className="text-[11px] text-gray-400 mt-1">الرقم الضريبي: {VAT_NO}</p>
              </div>
              <div className="my-3 border-t border-dashed border-gray-300" />
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between"><span>رقم الفاتورة</span><span className="font-semibold text-gray-700" dir="ltr">{sale.no}</span></div>
                <div className="flex justify-between"><span>التاريخ</span><span className="font-semibold text-gray-700" dir="ltr">{new Date(sale.time).toLocaleString('en-GB', { hour12: false }).replace(',', '')}</span></div>
                {sale.customer && <div className="flex justify-between"><span>العميل</span><span className="font-semibold text-gray-700">{sale.customer}</span></div>}
                {sale.phone && <div className="flex justify-between"><span>الجوال</span><span className="font-semibold text-gray-700" dir="ltr">{sale.phone}</span></div>}
                {sale.table && <div className="flex justify-between"><span>الطاولة</span><span className="font-semibold text-gray-700">{sale.table}</span></div>}
                <div className="flex justify-between"><span>نوع الطلب</span><span className="font-semibold text-gray-700">{orderTypes.find(o => o.id === sale.orderType)?.label}</span></div>
              </div>
              <div className="my-3 border-t border-dashed border-gray-300" />
              <div className="space-y-1.5">
                {sale.lines.map(l => (
                  <div key={l.uid} className="flex justify-between text-sm">
                    <div className="min-w-0"><span className="font-semibold text-gray-800">{l.qty}× {l.product.name}</span>{l.modText && <span className="block text-[11px] text-gray-400 truncate">{l.modText}</span>}</div>
                    <span className="font-semibold text-gray-800 shrink-0 ps-2">{(l.unitPrice * l.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="my-3 border-t border-dashed border-gray-300" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>المجموع</span><span>{sale.gross.toFixed(2)}</span></div>
                {sale.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>الخصم</span><span dir="ltr">- {sale.discountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-gray-500"><span>شامل ض.ق.م (15%)</span><span>{sale.vat.toFixed(2)}</span></div>
                <div className="flex justify-between font-display font-bold text-base text-brand-800 pt-1"><span>الإجمالي</span><span>{sale.net.toFixed(2)} ر.س</span></div>
                <div className="flex justify-between text-gray-500 pt-1"><span>طريقة الدفع</span><span className="font-semibold">{sale.method === 'CASH' ? 'نقدي' : sale.method === 'MADA' ? 'مدى' : 'تحويل'}</span></div>
                {sale.tendered !== undefined && <><div className="flex justify-between text-gray-500"><span>المدفوع</span><span dir="ltr">{sale.tendered.toFixed(2)}</span></div><div className="flex justify-between text-gray-500"><span>الباقي</span><span dir="ltr">{(sale.change ?? 0).toFixed(2)}</span></div></>}
              </div>
              <div className="mt-4 flex flex-col items-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&margin=0&data=${encodeURIComponent(sale.qr)}`} alt="ZATCA QR" className="w-28 h-28" />
                <p className="text-[10px] text-gray-400 mt-1">رمز الاستجابة السريع — هيئة الزكاة والضريبة</p>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">شكراً لزيارتكم 🌟</p>
            </div>
            {/* actions (hidden when printing) */}
            <div className="no-print flex gap-2 w-full">
              <button onClick={() => window.print()} className="flex-1 py-3 rounded-2xl bg-white text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50"><Printer className="w-5 h-5" />{ar ? 'طباعة' : 'Print'}</button>
              <button onClick={() => setSale(null)} className="flex-1 py-3 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-700"><Check className="w-5 h-5" />{ar ? 'طلب جديد' : 'New order'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
