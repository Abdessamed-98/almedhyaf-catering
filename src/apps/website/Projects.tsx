import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../ui';
import { WebsitePage } from '../../types';
import { ArrowLeft, ArrowRight, X, Images, ChevronLeft, ChevronRight, CheckCircle2, MapPin, CalendarDays, Tag, ShieldCheck } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

// A reminder chip for the client that tab names/categories are managed from the CMS.
const ADMIN_NOTE = 'يتم تعديل اسماء التبويبات من لوحة التحكم';
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const projSlug = () => { const m = window.location.hash.match(/^#website\/projects\/(.+)$/); return m ? decodeURIComponent(m[1]) : null; };

interface Project {
  cat: string; catEn: string;
  tag: string; tagEn: string;
  title: string; titleEn: string;
  excerpt: string; excerptEn: string;
  img: string;
  stats: { n: string; l: string; lEn: string }[];
  body: string[]; bodyEn: string[];
  gallery: string[];
}

// NOTE: placeholder figures, copy & photos — swap with the client's real project content.
const PROJECTS: Project[] = [
  {
    cat: 'الحج والعمرة', catEn: 'Hajj & Umrah', tag: 'موسم 1447هـ', tagEn: 'Season 1447H',
    title: 'مشروع حج ١٤٤٧هـ', titleEn: 'Hajj 1447 Project',
    excerpt: 'إعاشة متكاملة لضيوف الرحمن في المشاعر المقدسة على مدار الموسم.',
    excerptEn: 'End-to-end catering for the Guests of Allah across the holy sites.',
    img: 'services/hajj-umrah.jpg',
    stats: [{ n: '250,000+', l: 'وجبة', lEn: 'meals' }, { n: '14', l: 'يوم تشغيل', lEn: 'operating days' }, { n: '12', l: 'موقع توزيع', lEn: 'sites' }],
    body: [
      'نفّذنا في موسم حج ١٤٤٧هـ مشروع إعاشة متكامل لضيوف الرحمن في المشاعر المقدسة، شمل تخطيط القوائم والتحضير والتوزيع الميداني المنضبط على مدار أيام التشغيل.',
      'اعتمد المشروع على بنية لوجستية موزّعة جغرافياً، ونقاط تحميل واضحة، وفِرق متخصصة في التعامل مع الذروة لضمان وصول كل وجبة في وقتها.',
      'طُبّقت معايير السلامة الغذائية في كل مرحلة، مع توثيق درجات الحرارة ومتابعة الجودة لحظة بلحظة.',
    ],
    bodyEn: [
      'For Hajj 1447H we delivered an end-to-end catering project for the Guests of Allah across the holy sites — menu planning, preparation and disciplined field distribution throughout the operating days.',
      'It relied on geographically distributed logistics, clear loading points and teams specialized in peak operations to get every meal there on time.',
      'Food-safety standards were applied at every stage, with temperature logging and moment-to-moment quality monitoring.',
    ],
    gallery: ['services/hajj-umrah.jpg', 'banners/haram.jpg', 'concept/03.jpg', 'concept/05.jpg', 'concept/07.jpg', 'services/banquets.jpg'],
  },
  {
    cat: 'الفنادق', catEn: 'Hotels', tag: 'عقد ٢٠٢٤', tagEn: 'Contract 2024',
    title: 'عقد إعاشة الفنادق ٢٠٢٤', titleEn: 'Hotels catering contract 2024',
    excerpt: 'عقد سنوي لإعاشة مجموعة فنادق في مكة بوجبات يومية وفق جداول دقيقة.',
    excerptEn: 'An annual contract catering a group of Makkah hotels with daily meals on precise schedules.',
    img: 'services/hotels.jpg',
    stats: [{ n: '18', l: 'فندق', lEn: 'hotels' }, { n: '6,000+', l: 'وجبة/يوم', lEn: 'meals/day' }, { n: '365', l: 'يوم خدمة', lEn: 'service days' }],
    body: [
      'نخدم عدداً من فنادق مكة بعقود إعاشة سنوية تشمل وجبات يومية بجداول دقيقة تتوافق مع حركة النزلاء.',
      'تتيح مرونتنا التشغيلية التوسّع في مواسم الذروة دون التأثير على الجودة أو مواعيد التقديم.',
    ],
    bodyEn: [
      'We serve a number of Makkah hotels under annual catering contracts that include daily meals on precise schedules aligned to guest flow.',
      'Our operational flexibility lets us scale at peak seasons without affecting quality or serving times.',
    ],
    gallery: ['services/hotels.jpg', 'services/buffets.jpg', 'concept/09.jpg', 'concept/11.jpg', 'concept/13.jpg', 'services/banquets.jpg'],
  },
  {
    cat: 'الشركات', catEn: 'Companies', tag: 'موسم ٢٠٢٤', tagEn: 'Season 2024',
    title: 'إسناد إعاشة الشركات ٢٠٢٤', titleEn: 'Corporate catering 2024',
    excerpt: 'إسناد وجبات لعدد من الشركات والمؤسسات في مشاريعها الميدانية خلال ٢٠٢٤.',
    excerptEn: 'Meal support for a set of companies in their field projects during 2024.',
    img: 'services/events.jpg',
    stats: [{ n: '40+', l: 'جهة', lEn: 'entities' }, { n: '320,000+', l: 'وجبة', lEn: 'meals' }, { n: '5', l: 'محاور خدمة', lEn: 'service lines' }],
    body: [
      'نوفّر إسناداً غذائياً للشركات والمؤسسات في مشاريعها الميدانية ومواسم التشغيل، بوجبات تناسب طبيعة العمل وعدد المستفيدين.',
      'نلتزم بالمواعيد والجودة، ونقدّم تقارير متابعة تعزّز الثقة وتدعم العقود المتكررة.',
    ],
    bodyEn: [
      'We provide meal support for companies and institutions across field projects and operating seasons, with menus matched to the work and headcount.',
      'We commit to timing and quality, with follow-up reporting that builds trust and supports repeat contracts.',
    ],
    gallery: ['services/events.jpg', 'concept/12.jpg', 'concept/14.jpg', 'concept/16.jpg', 'services/buffets.jpg', 'concept/08.jpg'],
  },
  {
    cat: 'العمل الخيري', catEn: 'Charity', tag: 'رمضان ١٤٤٦هـ', tagEn: 'Ramadan 1446H',
    title: 'إفطار رمضان ١٤٤٦هـ', titleEn: 'Ramadan 1446H Iftar',
    excerpt: 'برنامج إفطار للصائمين خلال رمضان ١٤٤٦هـ بالشراكة مع الجمعيات الخيرية.',
    excerptEn: 'A Ramadan 1446H iftar program for fasting people in partnership with charities.',
    img: 'services/iftar.jpg',
    stats: [{ n: '150,000+', l: 'وجبة إفطار', lEn: 'iftar meals' }, { n: '9', l: 'مواقع', lEn: 'sites' }, { n: '30', l: 'يوماً', lEn: 'days' }],
    body: [
      'في رمضان ننفّذ برامج إفطار للصائمين بالتعاون مع الجمعيات الخيرية، تغطّي مواقع متعددة في مكة والمشاعر.',
      'نراعي سلامة الغذاء وسرعة التوزيع لضمان وصول الإفطار قبل المغرب.',
    ],
    bodyEn: [
      'In Ramadan we run iftar programs for fasting people in cooperation with charities, covering multiple sites across Makkah and the holy sites.',
      'We prioritize food safety and rapid distribution so iftar arrives before sunset.',
    ],
    gallery: ['services/iftar.jpg', 'concept/04.jpg', 'concept/06.jpg', 'concept/15.jpg', 'banners/haram.jpg', 'services/banquets.jpg'],
  },
  {
    cat: 'العمل الخيري', catEn: 'Charity', tag: '١٤٤٦هـ', tagEn: '1446H',
    title: 'برنامج الجمعيات الخيرية ١٤٤٦هـ', titleEn: 'Charity associations program 1446H',
    excerpt: 'تعاون مع الجمعيات الخيرية لخدمة المستفيدين في مكة والمشاعر خلال ١٤٤٦هـ.',
    excerptEn: 'Cooperation with charity associations to serve beneficiaries across Makkah during 1446H.',
    img: 'services/buffets.jpg',
    stats: [{ n: '12', l: 'جمعية', lEn: 'associations' }, { n: '80,000+', l: 'مستفيد', lEn: 'beneficiaries' }, { n: '4', l: 'مواسم', lEn: 'seasons' }],
    body: [
      'نتعاون مع عدد من الجمعيات الخيرية لخدمة المستفيدين عبر برامج موسمية ومستمرة في مكة والمشاعر المقدسة.',
      'نسهم بخبرتنا التشغيلية لرفع كفاءة التوزيع وتوسيع الأثر المجتمعي.',
    ],
    bodyEn: [
      'We partner with several charities to serve beneficiaries through seasonal and ongoing programs across Makkah and the holy sites.',
      'We bring our operational expertise to improve distribution efficiency and widen community impact.',
    ],
    gallery: ['services/buffets.jpg', 'concept/10.jpg', 'concept/17.jpg', 'concept/02.jpg', 'services/iftar.jpg', 'concept/18.jpg'],
  },
  {
    cat: 'الحج والعمرة', catEn: 'Hajj & Umrah', tag: 'موسم 1446هـ', tagEn: 'Season 1446H',
    title: 'مشروع حج ١٤٤٦هـ', titleEn: 'Hajj 1446 Project',
    excerpt: 'إعاشة دعم وإسناد لضيوف الرحمن خلال موسم حج ١٤٤٦هـ.',
    excerptEn: 'Support catering for the Guests of Allah during Hajj 1446H.',
    img: 'banners/haram.jpg',
    stats: [{ n: '200,000+', l: 'وجبة', lEn: 'meals' }, { n: '12', l: 'يوم تشغيل', lEn: 'operating days' }, { n: '10', l: 'موقع توزيع', lEn: 'sites' }],
    body: [
      'نفّذنا في موسم حج ١٤٤٦هـ عمليات إعاشة دعم وإسناد لضيوف الرحمن، بتنسيق ميداني واسع وفِرق متخصصة في التعامل مع الذروة.',
      'تواصل التزامنا بمعايير السلامة والجودة في كل مرحلة من مراحل التشغيل والتوزيع.',
    ],
    bodyEn: [
      'For Hajj 1446H we ran support catering operations for the Guests of Allah, with wide field coordination and teams specialized in peak operations.',
      'Our commitment to safety and quality continued at every operating and distribution stage.',
    ],
    gallery: ['banners/haram.jpg', 'services/hajj-umrah.jpg', 'concept/01.jpg', 'concept/03.jpg', 'concept/05.jpg', 'services/banquets.jpg'],
  },
  {
    cat: 'الفنادق', catEn: 'Hotels', tag: 'عقد ٢٠٢٣', tagEn: 'Contract 2023',
    title: 'عقد إعاشة فندق ٢٠٢٣', titleEn: 'Single-hotel catering 2023',
    excerpt: 'عقد إعاشة لفندق في مكة بثلاث وجبات يومية للنزلاء والطاقم على مدار العام.',
    excerptEn: 'A catering contract for a Makkah hotel — three daily meals for guests and staff, year-round.',
    img: 'services/hotels.jpg',
    stats: [{ n: '1', l: 'فندق', lEn: 'hotel' }, { n: '1,200+', l: 'وجبة/يوم', lEn: 'meals/day' }, { n: '365', l: 'يوم خدمة', lEn: 'service days' }],
    body: [
      'عقد إعاشة سنوي لفندق في مكة شمل ثلاث وجبات يومية للنزلاء والطاقم وفق جداول دقيقة.',
      'حافظنا على ثبات الجودة وانتظام التسليم طوال مدة العقد.',
    ],
    bodyEn: [
      'An annual catering contract for a Makkah hotel including three daily meals for guests and staff on precise schedules.',
      'We maintained consistent quality and reliable delivery throughout the contract.',
    ],
    gallery: ['services/hotels.jpg', 'concept/11.jpg', 'concept/13.jpg', 'services/buffets.jpg', 'concept/09.jpg', 'services/banquets.jpg'],
  },
  {
    cat: 'الشركات', catEn: 'Companies', tag: 'فعالية ٢٠٢٤', tagEn: 'Event 2024',
    title: 'إعاشة مؤتمر شركة ٢٠٢٤', titleEn: 'Corporate event catering 2024',
    excerpt: 'تقديم بوفيهات ووجبات لمؤتمر مؤسسي على مدى ثلاثة أيام بحضور كثيف.',
    excerptEn: 'Buffets and meals for a corporate conference over three high-attendance days.',
    img: 'services/events.jpg',
    stats: [{ n: '5,000+', l: 'وجبة', lEn: 'meals' }, { n: '3', l: 'أيام', lEn: 'days' }, { n: '1', l: 'موقع', lEn: 'venue' }],
    body: [
      'نفّذنا إعاشة فعالية مؤسسية شملت بوفيهات ووجبات على مدى ثلاثة أيام بحضور كثيف.',
      'أدرنا الجدول الزمني والتقديم بسلاسة لضمان تجربة ضيافة متكاملة للحضور.',
    ],
    bodyEn: [
      'We catered a corporate event with buffets and meals over three days with high attendance.',
      'We managed timing and service smoothly for a complete hospitality experience.',
    ],
    gallery: ['services/events.jpg', 'concept/14.jpg', 'concept/16.jpg', 'concept/12.jpg', 'services/buffets.jpg', 'concept/08.jpg'],
  },
];

const overall = (ar: boolean) => [
  { n: '1,020,000+', l: ar ? 'وجبة منفّذة' : 'meals delivered' },
  { n: '4', l: ar ? 'مواسم كبرى' : 'major seasons' },
  { n: '40+', l: ar ? 'جهة وشريك' : 'partners' },
];

const Projects: React.FC<{ onNavigate?: (p: WebsitePage) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const [sel, setSel] = useState<string | null>(() => projSlug());
  useEffect(() => {
    const apply = () => { setSel(projSlug()); setLbIndex(null); };
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);
  const selected = sel ? (PROJECTS.find(p => slugify(p.titleEn) === sel) ?? null) : null;

  const cats = ['all', ...Array.from(new Set(PROJECTS.map(p => p.catEn))), ADMIN_NOTE];
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.catEn === filter);
  const catLabel = (c: string) => c === 'all' ? (ar ? 'الكل' : 'All') : c === ADMIN_NOTE ? ADMIN_NOTE : (ar ? PROJECTS.find(p => p.catEn === c)!.cat : c);

  // ── project detail ──
  if (selected) {
    const highlights = ar
      ? ['تخطيط قوائم مناسبة لنوع المشروع وعدد المستفيدين', 'تحضير وفق معايير السلامة الغذائية (HACCP)', 'تعبئة وتحميل وتوزيع ميداني منضبط', 'متابعة جودة وتقارير مستمرة طوال التنفيذ']
      : ['Menus planned to project type & headcount', 'Prepared to HACCP food-safety standards', 'Disciplined packing, loading & field distribution', 'Continuous quality monitoring & reporting'];
    const facts = [
      { Icon: MapPin, label: ar ? 'الموقع' : 'Location', value: ar ? 'مكة المكرمة' : 'Makkah' },
      { Icon: Tag, label: ar ? 'القطاع' : 'Sector', value: ar ? selected.cat : selected.catEn },
      { Icon: CalendarDays, label: ar ? 'الفترة' : 'Period', value: ar ? selected.tag : selected.tagEn },
      { Icon: ShieldCheck, label: ar ? 'الجودة' : 'Quality', value: 'HACCP' },
      { Icon: CheckCircle2, label: ar ? 'الحالة' : 'Status', value: ar ? 'منجز' : 'Completed' },
    ];
    return (
      <div className="bg-parchment text-ink">
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <button onClick={() => { window.location.hash = '#website/projects'; }} className="inline-flex items-center gap-2 text-brand-700 font-bold hover:text-brand-800">
            {ar ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            {ar ? 'العودة للمشاريع' : 'Back to Projects'}
          </button>
        </div>

        {/* hero */}
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <motion.div {...fadeUp} className="relative rounded-3xl overflow-hidden border border-[#eee1d0] shadow-xl shadow-brand-900/10">
            <img src={selected.img} alt={ar ? selected.title : selected.titleEn} className="w-full aspect-[16/9] object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 px-6 pt-6 pb-14 md:px-12 md:pt-12 md:pb-20">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-secondary-500 text-ink text-xs font-black">{ar ? selected.cat : selected.catEn}</span>
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold">{ar ? selected.tag : selected.tagEn}</span>
              </div>
              <h1 className="font-display font-black text-3xl md:text-5xl text-white leading-tight drop-shadow-lg">{ar ? selected.title : selected.titleEn}</h1>
              <p className="mt-3 max-w-2xl text-white/85 text-sm md:text-base leading-relaxed drop-shadow hidden sm:block">{ar ? selected.excerpt : selected.excerptEn}</p>
            </div>
          </motion.div>
        </div>

        {/* stats band — narrower than the hero so it floats inset over it */}
        <div className="max-w-3xl mx-auto px-6 -mt-7 md:-mt-10 relative z-10">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {selected.stats.map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="rounded-2xl bg-white border border-[#eee1d0] shadow-sm p-4 md:p-5 text-center">
                <div className="font-display font-black text-xl md:text-3xl text-brand-700">{s.n}</div>
                <div className="text-[11px] md:text-sm text-gray-500 mt-1">{ar ? s.l : s.lEn}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* about — overview + highlights + details sidebar */}
        <section className="max-w-5xl mx-auto px-6 py-12 md:py-16 grid lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12 items-start">
          <div>
            <span className="text-brand-600 font-black text-xs tracking-wide">{ar ? 'عن المشروع' : 'About the project'}</span>
            <h2 className="mt-2 font-display font-black text-2xl md:text-3xl text-brand-800 leading-tight">{ar ? 'نظرة عامة' : 'Overview'}</h2>
            <div className="mt-5 space-y-4 text-gray-700 leading-loose text-base md:text-lg">
              {(ar ? selected.body : selected.bodyEn).map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <h3 className="mt-9 font-display font-bold text-xl text-brand-800">{ar ? 'أبرز ما قدّمناه' : 'What we delivered'}</h3>
            <ul className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-1" />
                  <span className="text-gray-700 leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl bg-white border border-[#eee1d0] shadow-sm p-6">
              <h3 className="font-display font-bold text-lg text-brand-800 mb-4">{ar ? 'تفاصيل المشروع' : 'Project details'}</h3>
              <dl className="space-y-3.5 text-sm">
                {facts.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500 inline-flex items-center gap-2"><f.Icon className="w-4 h-4 text-brand-500" />{f.label}</dt>
                    <dd className="font-bold text-brand-800 text-end" dir="auto">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="h-px bg-[#eee1d0] my-5" />
              <button onClick={() => onNavigate?.('CONTACT')} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-full transition-colors">{ar ? 'اطلب مشروعاً مماثلاً' : 'Request a similar project'}</button>
            </div>
          </aside>
        </section>

        {/* gallery */}
        <section className="max-w-5xl mx-auto px-6 pb-12">
          <h3 className="font-display font-black text-2xl text-brand-800 flex items-center gap-2 mb-5"><Images className="w-6 h-6 text-brand-600" />{ar ? 'من أرض المشروع' : 'From the project'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 auto-rows-[120px] sm:auto-rows-[160px] gap-3">
            {selected.gallery.map((g, i) => (
              <button key={i} onClick={() => setLbIndex(i)} className={`group relative overflow-hidden rounded-2xl border border-[#eee1d0] ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                <img src={g} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors grid place-items-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 text-brand-700 grid place-items-center"><Images className="w-5 h-5" /></span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="rounded-3xl bg-brand-600 text-white p-7 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-start">
            <div>
              <h3 className="font-display font-black text-2xl md:text-3xl">{ar ? 'مشروع مشابه في ذهنك؟' : 'A similar project in mind?'}</h3>
              <p className="mt-2 text-white/80">{ar ? 'احصل على عرض سعر مخصّص لمشروعك القادم.' : 'Get a tailored quote for your next project.'}</p>
            </div>
            <Button variant="gold" size="lg" onClick={() => onNavigate?.('CONTACT')} className="shrink-0">{ar ? 'اطلب عرض سعر' : 'Request a quote'}</Button>
          </div>
        </section>

        {/* lightbox viewer */}
        {lbIndex !== null && (
          <div className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur flex items-center justify-center p-4" onClick={() => setLbIndex(null)}>
            <button onClick={() => setLbIndex(null)} aria-label={ar ? 'إغلاق' : 'Close'} className="absolute top-5 end-5 text-white/80 hover:text-white"><X className="w-8 h-8" /></button>
            <button onClick={e => { e.stopPropagation(); setLbIndex((lbIndex - 1 + selected.gallery.length) % selected.gallery.length); }} aria-label={ar ? 'السابق' : 'Previous'} className="absolute start-3 md:start-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center"><ChevronRight className="w-7 h-7" /></button>
            <button onClick={e => { e.stopPropagation(); setLbIndex((lbIndex + 1) % selected.gallery.length); }} aria-label={ar ? 'التالي' : 'Next'} className="absolute end-3 md:end-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center"><ChevronLeft className="w-7 h-7" /></button>
            <img src={selected.gallery[lbIndex]} alt="" className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
            <span className="absolute bottom-5 inset-x-0 text-center text-white/80 text-sm font-bold" dir="ltr">{lbIndex + 1} / {selected.gallery.length}</span>
          </div>
        )}
      </div>
    );
  }

  // ── listing ──
  return (
    <div className="bg-parchment text-ink">
      <section className="bg-parchment border-b border-[#eee1d0]">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8 md:pt-16 md:pb-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-3 text-brand-600 font-black text-xs md:text-sm tracking-wide"><span className="h-px w-10 bg-secondary-500/60" />{ar ? 'سجل الإنجاز' : 'Track record'}</span>
            <h1 className="mt-3 font-display font-black text-3xl md:text-4xl text-brand-800 leading-tight">{ar ? 'مشاريعنا' : 'Our Projects'}</h1>
            <p className="mt-3 max-w-2xl text-gray-600 leading-relaxed">{ar ? 'محطات من مسيرتنا في إعاشة ضيوف الرحمن، والفنادق، والشركات، وبرامج الخير — أرقام تعكس الثقة والانضباط.' : 'Milestones from catering the Guests of Allah, hotels, companies and charity programs — numbers that reflect trust and discipline.'}</p>
          </motion.div>
          <div className="mt-7 grid grid-cols-3 gap-3 max-w-xl">
            {overall(ar).map((s, i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#eee1d0] p-3.5 text-center">
                <div className="font-display font-black text-xl md:text-2xl text-brand-700">{s.n}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* category filter */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === c ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-white text-brand-700 border border-[#eee1d0] hover:border-secondary-500/50'}`}>{catLabel(c)}</button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-semibold">{filter === ADMIN_NOTE ? '🙂 ' + ADMIN_NOTE : (ar ? 'لا توجد مشاريع في هذا التصنيف' : 'No projects in this category')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {list.map((p, i) => (
              <motion.button key={i} {...fadeUp} onClick={() => { window.location.hash = '#website/projects/' + slugify(p.titleEn); }} className="group text-start rounded-2xl overflow-hidden bg-white border border-[#eee1d0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
                <div className="relative h-52 overflow-hidden">
                  <img src={p.img} alt={ar ? p.title : p.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute top-3 start-3 px-3 py-1 rounded-full bg-white/90 text-brand-700 text-[11px] font-bold">{ar ? p.cat : p.catEn}</span>
                  <h3 className="absolute bottom-3 start-4 end-4 font-display font-black text-2xl text-white drop-shadow">{ar ? p.title : p.titleEn}</h3>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{ar ? p.excerpt : p.excerptEn}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.stats.slice(0, 2).map((s, j) => (
                      <span key={j} className="inline-flex items-baseline gap-1.5 rounded-full bg-brand-50 text-brand-700 px-3 py-1"><b className="font-display font-black">{s.n}</b><span className="text-xs text-gray-500">{ar ? s.l : s.lEn}</span></span>
                    ))}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                    {ar ? 'عرض المشروع' : 'View project'} {ar ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Projects;
