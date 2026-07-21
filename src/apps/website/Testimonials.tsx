import React, { useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Star, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';

interface Review {
  name: string; nameEn: string;
  role: string; roleEn: string;
  event: string; eventEn: string;
  rating: number;
  quote: string; quoteEn: string;
}

// NOTE: placeholder reviews — the client will replace with real testimonials.
const REVIEWS: Review[] = [
  { name: 'محمد العتيبي', nameEn: 'Mohammed Al-Otaibi', role: 'مدير فعاليات', roleEn: 'Events Manager', event: 'حج ١٤٤٧هـ', eventEn: 'Hajj 1447', rating: 5, quote: 'خدمة راقية ووجبات تليق بضيوف الرحمن، والتزام مذهل بالمواعيد رغم ضخامة الأعداد.', quoteEn: 'Refined service and meals worthy of the Guests of Allah, with remarkable punctuality despite the huge numbers.' },
  { name: 'سارة القحطاني', nameEn: 'Sara Al-Qahtani', role: 'منسقة مؤتمرات', roleEn: 'Conference Coordinator', event: 'مؤتمر شركة', eventEn: 'Corporate conference', rating: 5, quote: 'تنظيم احترافي وذوق عالٍ في التقديم، وتلقّينا إشادات كثيرة من ضيوفنا على مستوى الضيافة.', quoteEn: 'Professional organization and great taste in presentation — our guests praised the hospitality repeatedly.' },
  { name: 'عبدالله الزهراني', nameEn: 'Abdullah Al-Zahrani', role: 'مدير تشغيل فندق', roleEn: 'Hotel Operations Manager', event: 'إعاشة فندق', eventEn: 'Hotel catering', rating: 5, quote: 'جودة ثابتة يوماً بعد يوم، وفريق متعاون يفهم متطلبات التشغيل الفندقي ويتجاوب بسرعة.', quoteEn: 'Consistent quality day after day, and a cooperative team that understands hotel operations and responds fast.' },
  { name: 'نورة الحربي', nameEn: 'Noura Al-Harbi', role: 'رئيسة لجنة', roleEn: 'Committee Chair', event: 'جمعية خيرية', eventEn: 'Charity association', rating: 5, quote: 'أكرموا مستفيدينا بوجبات نظيفة وشهية قُدّمت باحترام، شراكة نعتزّ بها كل رمضان.', quoteEn: 'They honored our beneficiaries with clean, delicious meals served respectfully — a partnership we cherish every Ramadan.' },
  { name: 'فيصل الشمري', nameEn: 'Faisal Al-Shammari', role: 'مدير مشاريع', roleEn: 'Projects Manager', event: 'إعاشة شركات', eventEn: 'Corporate catering', rating: 4, quote: 'مرونة عالية في تعديل الكميات والقوائم، وتعامل راقٍ مع كل ملاحظاتنا التشغيلية.', quoteEn: 'High flexibility in adjusting quantities and menus, and a gracious response to every operational note.' },
  { name: 'هند المالكي', nameEn: 'Hind Al-Malki', role: 'منظمة مناسبات', roleEn: 'Event Planner', event: 'حفل زفاف', eventEn: 'Wedding', rating: 5, quote: 'بوفيه فاخر وتنسيق جميل، كان نجم الحفل بصدق. شكراً للمضياف العربي على ليلة لا تُنسى.', quoteEn: 'A lavish buffet and beautiful styling — honestly the star of the night. Thank you Al-Medhyaf for an unforgettable evening.' },
];

const EVENT_TYPES = ['حج وعمرة', 'فندق', 'شركة', 'مؤتمر', 'مناسبة خاصة', 'جمعية خيرية'];
const EVENT_TYPES_EN = ['Hajj & Umrah', 'Hotel', 'Company', 'Conference', 'Private event', 'Charity'];

const initials = (s: string) => s.trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('');

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <div className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-4 h-4 ${i <= value ? 'fill-secondary-400 text-secondary-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);
  // Advance by a full page (the visible row of cards) so each click swaps the whole set.
  const pageWidth = () => {
    const el = scroller.current;
    if (!el) return 0;
    const card = el.firstElementChild as HTMLElement | null;
    const gap = 20; // gap-5 = 1.25rem
    const cardW = card ? card.offsetWidth : el.clientWidth;
    const perView = Math.max(1, Math.round(el.clientWidth / (cardW + gap)));
    return perView * (cardW + gap);
  };
  // In RTL, scrollLeft runs negative toward the end, so the signs flip.
  const prev = () => scroller.current?.scrollBy({ left: ar ? pageWidth() : -pageWidth(), behavior: 'smooth' });
  const next = () => scroller.current?.scrollBy({ left: ar ? -pageWidth() : pageWidth(), behavior: 'smooth' });

  return (
    <section className="bg-parchment py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-brand-600 font-black text-xs md:text-sm tracking-wide">{ar ? 'آراء عملائنا' : 'Client reviews'}</span>
          <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800">{ar ? 'ماذا يقول عملاؤنا' : 'What our clients say'}</h2>
        </div>
      </div>

      {/* horizontal scroll strip */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
        <div ref={scroller} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
          {REVIEWS.map((r, i) => (
            <div key={i} className="snap-start shrink-0 basis-[85%] sm:basis-[calc((100%_-_1.25rem)/2)] lg:basis-[calc((100%_-_2.5rem)/3)] bg-white rounded-2xl border border-[#eee1d0] shadow-sm p-6 flex flex-col">
              <Stars value={r.rating} />
              <blockquote className="mt-3 text-gray-700 leading-relaxed flex-1">{ar ? r.quote : r.quoteEn}</blockquote>
              <div className="mt-5 pt-4 border-t border-[#f0e7d8] flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-brand-700 text-white text-sm font-bold grid place-items-center shrink-0">{initials(ar ? r.name : r.nameEn)}</span>
                <div className="min-w-0">
                  <div className="font-bold text-brand-800 truncate">{ar ? r.name : r.nameEn}</div>
                  <div className="text-xs text-gray-500 truncate">{(ar ? r.role : r.roleEn)} · {ar ? r.event : r.eventEn}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* arrows — desktop only (mobile swipes) */}
        <button onClick={prev} aria-label={ar ? 'السابق' : 'Previous'} className="hidden md:grid place-items-center absolute top-1/2 -translate-y-1/2 start-0 -translate-x-1/2 rtl:translate-x-1/2 w-11 h-11 rounded-full bg-white border border-[#eee1d0] shadow-md text-brand-700 hover:bg-brand-50 transition-colors z-10">
          {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <button onClick={next} aria-label={ar ? 'التالي' : 'Next'} className="hidden md:grid place-items-center absolute top-1/2 -translate-y-1/2 end-0 translate-x-1/2 rtl:-translate-x-1/2 w-11 h-11 rounded-full bg-white border border-[#eee1d0] shadow-md text-brand-700 hover:bg-brand-50 transition-colors z-10">
          {ar ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        </div>

        <div className="text-center mt-10">
          <button onClick={() => { setShowForm(true); setSubmitted(false); setFormRating(0); }} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-full transition-colors">
            <Plus className="w-5 h-5" />{ar ? 'أضف تقييمك' : 'Add your review'}
          </button>
        </div>
      </div>

      {/* add-review modal (UI only) */}
      {showForm && (
        <div className="fixed inset-0 z-[1100] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} aria-label={ar ? 'إغلاق' : 'Close'} className="absolute top-4 end-4 w-9 h-9 rounded-full bg-gray-100 grid place-items-center text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="mx-auto w-14 h-14 rounded-full bg-secondary-500/20 grid place-items-center mb-4"><Star className="w-7 h-7 fill-secondary-400 text-secondary-400" /></div>
                <h3 className="font-display font-black text-2xl text-brand-800">{ar ? 'شكراً لتقييمك!' : 'Thank you!'}</h3>
                <p className="mt-2 text-gray-600">{ar ? 'وصلنا رأيك، وسيظهر بعد المراجعة.' : 'We received your review; it will appear after moderation.'}</p>
                <button onClick={() => setShowForm(false)} className="mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-full transition-colors">{ar ? 'تم' : 'Done'}</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <h3 className="font-display font-black text-2xl text-brand-800">{ar ? 'شاركنا رأيك' : 'Share your review'}</h3>
                <p className="mt-1 text-sm text-gray-500">{ar ? 'تقييمك يساعد غيرك على الاطمئنان لخدماتنا.' : 'Your review helps others trust our service.'}</p>

                <div className="mt-5">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{ar ? 'تقييمك' : 'Your rating'}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button type="button" key={i} onClick={() => setFormRating(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} aria-label={`${i}`}>
                        <Star className={`w-8 h-8 transition-colors ${i <= (hoverRating || formRating) ? 'fill-secondary-400 text-secondary-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <input required placeholder={ar ? 'الاسم' : 'Name'} className="w-full bg-white border border-[#e7dcc9] rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition" />
                  <select className="w-full bg-white border border-[#e7dcc9] rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition">
                    {(ar ? EVENT_TYPES : EVENT_TYPES_EN).map((e, i) => <option key={i}>{e}</option>)}
                  </select>
                </div>

                <textarea required rows={4} placeholder={ar ? 'اكتب تجربتك معنا...' : 'Tell us about your experience...'} className="mt-4 w-full bg-white border border-[#e7dcc9] rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition resize-none" />

                <button type="submit" className="mt-5 w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-full transition-colors">{ar ? 'أرسل التقييم' : 'Submit review'}</button>
                <p className="mt-3 text-center text-xs text-gray-400">{ar ? 'تُراجَع التقييمات قبل نشرها.' : 'Reviews are moderated before publishing.'}</p>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
