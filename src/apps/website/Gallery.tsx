import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../ui';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// image source helpers (folders have varied aspect ratios → Pinterest masonry)
const C = (n: string) => `concept/${n}.jpg`;   // tall 9:16
const D = (n: string) => `dishes/${n}.jpg`;    // mixed landscape / portrait / square
const S = (n: string) => `services/${n}.jpg`;  // mostly square
const B = (n: string) => `branches/${n}.jpg`;  // square

const banquets = [C('01'), D('main-1'), C('02'), D('grill-1'), S('banquets'), D('main-2'), C('15'), D('sweet-1'), C('03'), D('main-5'), D('main-4'), C('04')];
const events = [C('05'), S('events'), C('06'), S('hotels'), C('07'), S('hajj-umrah'), C('08')];
const buffets = [S('buffets'), D('mezze-1'), D('samosa-1'), D('drink-1'), D('dolma-1'), D('juice-1'), D('mezze-2'), D('laban-1'), D('tea-1'), D('kunafa-1')];
const kitchens = [C('13'), B('awali'), C('14'), B('sharai'), C('16'), B('shoqiyah'), C('17'), C('18')];

const all = [
  C('01'), D('main-1'), S('buffets'), D('grill-3'),
  C('05'), D('main-2'), B('awali'), D('kunafa-1'),
  C('11'), S('events'), D('grill-1'), C('07'),
  D('mezze-1'), C('02'), D('sweet-1'), S('hotels'),
  C('13'), D('drink-1'), C('16'), D('main-5'),
  S('hajj-umrah'), C('03'), D('laban-1'), D('samosa-1'),
  C('08'), B('sharai'), D('main-6'), C('17'),
  D('tea-1'), S('iftar'), C('04'), D('dolma-1'),
  C('14'), D('juice-1'), B('shoqiyah'), C('06'),
  D('main-4'), C('09'), S('banquets'), C('12'),
  D('mezze-2'), C('10'), D('grill-2'), C('18'), D('sweet-2'), C('15'),
];

const CATS = [
  { key: 'all', ar: 'الكل', en: 'All', imgs: all },
  { key: 'banquets', ar: 'الولائم', en: 'Banquets', imgs: banquets },
  { key: 'events', ar: 'المؤتمرات والفعاليات', en: 'Conferences & Events', imgs: events },
  { key: 'buffets', ar: 'البوفيهات', en: 'Buffets', imgs: buffets },
  { key: 'kitchens', ar: 'المطابخ والفريق', en: 'Kitchens & Team', imgs: kitchens },
];

const Gallery: React.FC<{ onOrderNow?: () => void }> = ({ onOrderNow }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [cat, setCat] = useState(0);
  const imgs = CATS[cat].imgs;
  const [lb, setLb] = useState<number | null>(null);

  const close = useCallback(() => setLb(null), []);
  const step = useCallback((d: number) => setLb(p => (p === null ? null : (p + d + imgs.length) % imgs.length)), [imgs.length]);

  useEffect(() => {
    if (lb === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(ar ? 1 : -1);
      else if (e.key === 'ArrowRight') step(ar ? -1 : 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lb, step, close, ar]);

  return (
    <div className="bg-[#fbf7ef] min-h-screen">
      {/* compact header + filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <span className="text-brand-600 font-black text-xs md:text-sm tracking-wide">{ar ? 'معرض الصور' : 'Gallery'}</span>
        <h1 className="mt-1 font-display font-black text-2xl md:text-4xl text-brand-800 leading-tight">{ar ? 'معرض أعمالنا في الميدان' : 'Our work in the field'}</h1>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATS.map((c, i) => (
            <button
              key={c.key}
              onClick={() => { setCat(i); setLb(null); }}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${cat === i ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-white text-brand-700 border border-[#eee1d0] hover:border-secondary-500/50'}`}
            >
              {ar ? c.ar : c.en}
            </button>
          ))}
        </div>
      </div>

      {/* masonry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
          {imgs.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setLb(i)}
              className="group relative mb-3 md:mb-4 block w-full overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-shadow break-inside-avoid"
            >
              <img src={src} alt="" loading="lazy" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* slim CTA */}
      <section className="bg-[#221713] text-white py-12 relative overflow-hidden">
        <span className="absolute -end-32 -top-32 w-[26rem] h-[26rem] rounded-full bg-secondary-500/10" />
        <div className="max-w-7xl mx-auto px-6 relative flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-start">
          <div>
            <h2 className="font-display font-black text-2xl md:text-3xl">{ar ? 'أعجبك ما رأيت؟' : 'Like what you see?'}</h2>
            <p className="mt-1 text-white/75">{ar ? 'دعنا نضيف مناسبتك القادمة إلى معرض أعمالنا.' : 'Let us add your next event to our gallery.'}</p>
          </div>
          {onOrderNow && <Button variant="gold" size="lg" onClick={onOrderNow} className="shrink-0">{ar ? 'اطلب الآن' : 'Order Now'}</Button>}
        </div>
      </section>

      {/* lightbox */}
      {lb !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4" onClick={close}>
          <button onClick={close} className="absolute top-5 end-5 text-white/80 hover:text-white" aria-label={ar ? 'إغلاق' : 'Close'}><X className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); step(ar ? 1 : -1); }} className="absolute start-4 text-white/80 hover:text-white p-2" aria-label="prev"><ChevronLeft className="w-9 h-9" /></button>
          <img src={imgs[lb]} alt="" className="max-h-[85vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); step(ar ? -1 : 1); }} className="absolute end-4 text-white/80 hover:text-white p-2" aria-label="next"><ChevronRight className="w-9 h-9" /></button>
          <span className="absolute bottom-5 inset-x-0 text-center text-white/60 text-sm" dir="ltr">{lb + 1} / {imgs.length}</span>
        </div>
      )}
    </div>
  );
};

export default Gallery;
