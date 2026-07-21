import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, ArrowRight, Images, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WebsitePage } from '../../types';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export interface Partner {
  id: string;
  name: string; nameEn: string;
  sector: string; sectorEn: string;
  tagline: string; taglineEn: string;
  overview: string[]; overviewEn: string[];
  img: string;
}

// NOTE: briefs are placeholder content the client will refine per partner.
export const PARTNERS: Partner[] = [
  {
    id: 'al_bait_guests', name: 'ضيوف البيت', nameEn: 'Bayt Guests', sector: 'الحج والعمرة', sectorEn: 'Hajj & Umrah',
    tagline: 'إعاشة ضيوف الرحمن داخل المشاعر المقدسة', taglineEn: 'Catering the Guests of Allah across the holy sites',
    overview: ['تشاركنا مع «ضيوف البيت» في تنفيذ برامج إعاشة موسمية كبرى لضيوف الرحمن، شملت تحضير وتوزيع آلاف الوجبات يومياً وفق جداول دقيقة تتوافق مع حركة الحجاج داخل المشاعر.', 'اعتمدت الشراكة على تنسيق ميداني محكم وفِرق متخصصة، بما يضمن وصول الوجبة في وقتها وبالجودة المطلوبة طوال الموسم.'],
    overviewEn: ['We partnered with Bayt Guests on major seasonal catering programs for the Guests of Allah — preparing and distributing thousands of meals daily on schedules tuned to pilgrim movement across the holy sites.', 'The partnership relied on tight field coordination and specialized teams, ensuring every meal arrived on time and to standard throughout the season.'],
    img: 'clients/al_bait_guests_transparent.png',
  },
  {
    id: 'mashariq', name: 'مشارق', nameEn: 'Mashariq', sector: 'النقل والإسناد', sectorEn: 'Transport & Support',
    tagline: 'وجبات مشاريع النقل والإسناد في المشاعر', taglineEn: 'Meals for transport & support projects across the sites',
    overview: ['زوّدنا مشاريع «مشارق» التشغيلية بوجبات منتظمة لفِرق النقل والإسناد، مع مرونة في الكميات تتناسب مع ذروة المواسم.', 'حرصنا على تنوّع القوائم وثباتها في الجودة مهما تغيّرت أحجام التشغيل.'],
    overviewEn: ['We supplied Mashariq’s operations with regular meals for transport and support crews, with quantity flexibility matched to seasonal peaks.', 'We kept menus varied and quality consistent regardless of operating volume.'],
    img: 'clients/mashariq_transparent.png',
  },
  {
    id: 'holy_makkah_municipality', name: 'أمانة العاصمة المقدسة', nameEn: 'Makkah Municipality', sector: 'القطاع الحكومي', sectorEn: 'Government',
    tagline: 'تعاون تشغيلي ضمن المعايير البلدية', taglineEn: 'Operational cooperation within municipal standards',
    overview: ['عملنا ضمن اشتراطات أمانة العاصمة المقدسة لخدمة المواسم والفعاليات، بالتزام كامل بمعايير الصحة والسلامة المعتمدة.', 'وفّرت الشراكة نموذجاً تشغيلياً منضبطاً يجمع بين الجودة والامتثال للأنظمة.'],
    overviewEn: ['We operated within Makkah Municipality requirements to serve seasons and events, in full compliance with approved health and safety standards.', 'The partnership delivered a disciplined operating model that pairs quality with regulatory compliance.'],
    img: 'clients/holy_makkah_municipality_transparent.png',
  },
  {
    id: 'al_birr_al_khayriya', name: 'جمعية البر الخيرية', nameEn: 'Al-Birr Charity', sector: 'العمل الخيري', sectorEn: 'Charity',
    tagline: 'برامج إفطار ووجبات خيرية للمستفيدين', taglineEn: 'Iftar & charity meal programs for beneficiaries',
    overview: ['نفّذنا مع جمعية البر برامج إفطار ووجبات خيرية للمستفيدين في مكة، مع عناية خاصة بكرامة المستفيد وجودة ما يُقدَّم.', 'امتدّت الشراكة عبر مواسم متعددة بحجم خدمة متنامٍ.'],
    overviewEn: ['With Al-Birr we ran iftar and charity meal programs for beneficiaries in Makkah, with special care for beneficiary dignity and the quality served.', 'The partnership spanned multiple seasons with a growing scope of service.'],
    img: 'clients/al_birr_al_khayriya_transparent.png',
  },
  {
    id: 'huda_association', name: 'جمعية هدى', nameEn: 'Huda Association', sector: 'العمل الخيري', sectorEn: 'Charity',
    tagline: 'وجبات موسمية بالشراكة لخدمة المستفيدين', taglineEn: 'Seasonal meals in partnership for beneficiaries',
    overview: ['قدّمنا لجمعية هدى وجبات موسمية ضمن مبادراتها لخدمة المستفيدين، بتخطيط قوائم يراعي التنوّع والقيمة الغذائية.', 'اعتمدت الجمعية على انضباطنا في المواعيد والكميات.'],
    overviewEn: ['We provided Huda Association with seasonal meals across its beneficiary initiatives, with menu planning balancing variety and nutrition.', 'The association relied on our discipline in timing and quantities.'],
    img: 'clients/huda_association_transparent.png',
  },
  {
    id: 'al_ihsan_association', name: 'جمعية الإحسان', nameEn: 'Al-Ihsan Association', sector: 'العمل الخيري', sectorEn: 'Charity',
    tagline: 'إعاشة برامج خيرية ومبادرات مجتمعية', taglineEn: 'Catering for charity programs & community initiatives',
    overview: ['دعمنا برامج جمعية الإحسان الخيرية والمبادرات المجتمعية بوجبات تُحضَّر وتُوزَّع وفق أعلى معايير السلامة.', 'كانت الشراكة نموذجاً للتكامل بين الجهة الخيرية والمشغّل المحترف.'],
    overviewEn: ['We supported Al-Ihsan’s charity programs and community initiatives with meals prepared and distributed to the highest safety standards.', 'The partnership modeled strong integration between a charity and a professional operator.'],
    img: 'clients/al_ihsan_association_transparent.png',
  },
  {
    id: 'saeed_hamad_al_bishi', name: 'سعيد حمد البيشي', nameEn: 'Saeed H. Al-Bishi', sector: 'القطاع الخاص', sectorEn: 'Private sector',
    tagline: 'إسناد وجبات لمشاريع القطاع الخاص', taglineEn: 'Meal support for private-sector projects',
    overview: ['أسندنا لمشاريع المجموعة وجبات منتظمة لفِرق العمل، بمرونة تشغيلية تواكب جداولهم.', 'ركّزت الشراكة على الموثوقية وثبات الجودة على المدى الطويل.'],
    overviewEn: ['We supplied the group’s projects with regular crew meals, with operational flexibility that tracked their schedules.', 'The partnership focused on reliability and long-term quality consistency.'],
    img: 'clients/saeed_hamad_al_bishi_transparent.png',
  },
  {
    id: 'stc', name: 'STC', nameEn: 'STC', sector: 'الشركات', sectorEn: 'Corporate',
    tagline: 'خدمات إعاشة لفعاليات ومناسبات الشركة', taglineEn: 'Catering for corporate events & occasions',
    overview: ['قدّمنا خدمات إعاشة لفعاليات ومناسبات الشركة بقوائم تليق بحجم الحدث وطابعه.', 'جمعت الشراكة بين الذوق في التقديم والانضباط في التنفيذ.'],
    overviewEn: ['We provided catering for the company’s events and occasions with menus fit for each event’s scale and character.', 'The partnership combined refined presentation with disciplined execution.'],
    img: 'clients/stc_transparent.png',
  },
  {
    id: 'fleet_zad_trading', name: 'أسطول زاد التجارية', nameEn: 'Fleet Zad Trading', sector: 'التوريد والإسناد', sectorEn: 'Supply & Support',
    tagline: 'شراكة في التوريد والإسناد التشغيلي', taglineEn: 'Partnership in supply & operational support',
    overview: ['تعاونّا مع «أسطول زاد» في التوريد والإسناد التشغيلي، بما يضمن انسيابية سلسلة الإمداد ودعم العمليات في مواقعها.', 'وفّرت الشراكة مرونة لوجستية رفعت كفاءة التشغيل.'],
    overviewEn: ['We collaborated with Fleet Zad on supply and operational support, keeping the supply chain smooth and operations backed on-site.', 'The partnership provided logistical flexibility that lifted operating efficiency.'],
    img: 'clients/fleet_zad_trading_transparent.png',
  },
];

const GALLERY = ['concept/03.jpg', 'concept/07.jpg', 'concept/10.jpg', 'concept/12.jpg', 'concept/15.jpg', 'concept/02.jpg'];

// Hero photo keyed to the partner's sector, so each page feels distinct.
const SECTOR_IMG: Record<string, string> = {
  'Hajj & Umrah': 'services/hajj-umrah.jpg',
  'Transport & Support': 'services/events.jpg',
  'Government': 'services/banquets.jpg',
  'Charity': 'services/iftar.jpg',
  'Private sector': 'services/buffets.jpg',
  'Corporate': 'services/events.jpg',
  'Supply & Support': 'services/hotels.jpg',
};

const partnerSlug = () => { const m = window.location.hash.match(/^#website\/partners\/(.+)$/); return m ? decodeURIComponent(m[1]) : null; };

const Partners: React.FC<{ onNavigate?: (p: WebsitePage) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const [sel, setSel] = useState<string | null>(() => partnerSlug());
  useEffect(() => {
    const apply = () => { setSel(partnerSlug()); setLbIndex(null); };
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);
  const selected = sel ? (PARTNERS.find(p => p.id === sel) ?? null) : null;
  const Back = ar ? ArrowRight : ArrowLeft;

  // ── partner detail ──
  if (selected) {
    const heroImg = SECTOR_IMG[selected.sectorEn] || 'concept/08.jpg';
    return (
      <div className="bg-parchment text-ink">
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <button onClick={() => { window.location.hash = '#website/partners'; }} className="inline-flex items-center gap-2 text-brand-700 font-bold hover:text-brand-800">
            <Back className="w-5 h-5" />{ar ? 'كل الشركاء' : 'All partners'}
          </button>
        </div>

        {/* hero — image-led, logo + name anchored in the corner */}
        <section className="max-w-7xl mx-auto px-6 mt-5">
          <div className="relative overflow-hidden rounded-3xl aspect-[16/11] sm:aspect-[16/8] md:aspect-[21/8]">
            <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-900/40 to-brand-900/5" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-10 flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
              <div className="bg-white rounded-2xl shadow-xl px-5 py-4 md:px-7 md:py-5 w-fit shrink-0">
                <img src={selected.img} alt={ar ? selected.name : selected.nameEn} className="partner-logo h-11 md:h-16 w-auto object-contain" />
              </div>
              <h1 className="font-display font-black text-3xl md:text-5xl text-white leading-tight pb-1">{ar ? selected.name : selected.nameEn}</h1>
            </div>
          </div>
        </section>

        {/* description — editorial: label rail + lead + rich body */}
        <section className="max-w-5xl mx-auto px-6 py-14 md:py-20">
          <div className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-14">
            <div className="md:sticky md:top-24 self-start">
              <span className="block h-px w-12 bg-secondary-500 mb-3" />
              <span className="text-brand-600 font-black text-sm tracking-wide">{ar ? 'عن الشراكة' : 'About the partnership'}</span>
            </div>
            <div>
              <p className="font-display font-bold text-xl md:text-2xl text-brand-900 leading-snug">{ar ? selected.tagline : selected.taglineEn}</p>
              <div className="mt-6 space-y-4 text-gray-700 leading-loose text-base md:text-lg">
                {(ar ? selected.overview : selected.overviewEn).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        </section>

        {/* gallery */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <h3 className="font-display font-bold text-xl text-brand-800 mb-4">{ar ? 'من الميدان' : 'From the field'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 auto-rows-[120px] sm:auto-rows-[160px] gap-3">
            {GALLERY.map((src, i) => (
              <button key={i} onClick={() => setLbIndex(i)} className={`group relative overflow-hidden rounded-2xl border border-[#eee1d0] ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                <img src={src} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors grid place-items-center">
                  <Images className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* lightbox */}
        {lbIndex !== null && (
          <div className="fixed inset-0 z-[1100] bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLbIndex(null)}>
            <button onClick={() => setLbIndex(null)} className="absolute top-5 end-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white"><X className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); setLbIndex((lbIndex - 1 + GALLERY.length) % GALLERY.length); }} className="absolute start-3 md:start-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white"><ChevronRight className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); setLbIndex((lbIndex + 1) % GALLERY.length); }} className="absolute end-3 md:end-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white"><ChevronLeft className="w-6 h-6" /></button>
            <img src={GALLERY[lbIndex]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
            <span className="absolute bottom-5 inset-x-0 text-center text-white/70 text-sm">{lbIndex + 1} / {GALLERY.length}</span>
          </div>
        )}
      </div>
    );
  }

  // ── partners listing ──
  return (
    <div className="bg-parchment text-ink min-h-[60vh]">
      <section className="bg-parchment border-b border-[#eee1d0]">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 md:pt-16 md:pb-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-3 text-brand-600 font-black text-xs md:text-sm tracking-wide"><span className="h-px w-10 bg-secondary-500/60" />{ar ? 'عملاؤنا وشركاء النجاح' : 'Our clients & partners'}</span>
            <h1 className="mt-3 font-display font-black text-3xl md:text-4xl text-brand-800 leading-tight">{ar ? 'شركاؤنا' : 'Our partners'}</h1>
            <p className="mt-3 text-gray-600 leading-relaxed max-w-2xl">{ar ? 'جهات رائدة وثقت بنا لإعاشة مشاريعها. اضغط على أي شريك لعرض المشروع المنفّذ معه.' : 'Leading entities that trusted us with their catering. Tap any partner to see the project executed with them.'}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {PARTNERS.map((p, i) => (
            <motion.button key={p.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.04 }} onClick={() => { window.location.hash = '#website/partners/' + p.id; }} className="group text-start rounded-2xl bg-white border border-[#eee1d0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all p-5">
              <div className="h-20 flex items-center justify-center">
                <img src={p.img} alt={ar ? p.name : p.nameEn} className="partner-logo max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="mt-4 pt-4 border-t border-[#f0e7d8]">
                <span className="text-[11px] font-bold text-brand-500">{ar ? p.sector : p.sectorEn}</span>
                <h3 className="mt-0.5 font-display font-bold text-brand-800">{ar ? p.name : p.nameEn}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{ar ? p.tagline : p.taglineEn}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Partners;
