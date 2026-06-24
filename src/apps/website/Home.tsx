import React, { useState, useEffect, useCallback } from 'react';
import { WebsitePage } from '../../types';
import { X, ChevronLeft, ChevronRight, Download, ArrowLeft, MapPin, ClipboardList, ShieldCheck, Package, Truck, FileCheck, BadgeCheck, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../ui';
import { motion } from 'motion/react';
import PhotoStrip from './PhotoStrip';
import LogoMarquee from './LogoMarquee';
import ServiceTicker from './ServiceTicker';

interface HomeProps {
  onNavigate: (page: WebsitePage) => void;
  onOrderNow: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const IMG = (n: string) => `concept/${n}.jpg`;

const Home: React.FC<HomeProps> = ({ onNavigate, onOrderNow }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const quote = () => onNavigate('CONTACT');

  // ── Gallery lightbox ──
  const gallery = ['11', '12', '13', '14', '15', '16', '17', '18'].map(IMG);
  const [lb, setLb] = useState<number | null>(null);
  const close = useCallback(() => { setLb(null); document.body.style.overflow = 'unset'; }, []);
  const openImg = (i: number) => { setLb(i); document.body.style.overflow = 'hidden'; };
  const step = useCallback((d: number) => setLb((p) => (p === null ? null : (p + d + gallery.length) % gallery.length)), [gallery.length]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lb === null) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(ar ? -1 : 1);
      if (e.key === 'ArrowLeft') step(ar ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lb, ar, close, step]);

  const Eyebrow: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children }) => (
    <span className="inline-flex items-center gap-3 text-secondary-500 font-bold text-sm md:text-base">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-500" />
      {children}
    </span>
  );
  const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-brand-600 font-black text-xs md:text-sm tracking-wide">{children}</span>
  );
  const Num: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <span dir="ltr" className={className}>{children}</span>
  );

  const heroStats = [
    { n: '1,020,000+', l: ar ? 'وجبة ساخنة تم إعدادها وتوزيعها' : 'hot meals prepared & distributed' },
    { n: '350+', l: ar ? 'فريق متخصص في التشغيل والجودة' : 'specialists in ops & quality' },
    { n: '40', l: ar ? 'سيارة نقل مجهزة وقابلة للتوسع' : 'equipped, scalable vehicles' },
  ];
  const tags = ar
    ? ['تشغيل مواقع إعاشة', 'وجبات للحجاج', 'ولائم فاخرة', 'بوفيهات راقية', 'إفطار صائم', 'دعم الفعاليات', 'توزيع ميداني']
    : ['Catering sites', 'Pilgrim meals', 'Banquets', 'Premium buffets', 'Ramadan Iftar', 'Event support', 'Field delivery'];

  const trust = [
    { b: ar ? 'تشغيل موسمي' : 'Seasonal ops', s: ar ? 'مناسب للحج والعمرة ومشاريع الكثافة العالية.' : 'Built for Hajj, Umrah & high-density projects.' },
    { b: ar ? 'سلامة غذائية' : 'Food safety', s: ar ? 'التزام واضح بالجودة والنظافة في كل مرحلة.' : 'Clear commitment to quality & hygiene throughout.' },
    { b: ar ? 'توزيع دقيق' : 'Precise logistics', s: ar ? 'لوجستيات كميزة تنافسية لا كخدمة جانبية.' : 'Logistics as a competitive edge, not an afterthought.' },
  ];

  const services = [
    { n: '01', t: ar ? 'الحج والعمرة' : 'Hajj & Umrah', d: ar ? 'وجبات ساخنة وجافة لضيوف الرحمن وفق جداول ميدانية دقيقة للمخيمات والفنادق ونقاط التحميل.' : 'Hot & dry meals for pilgrims on precise field schedules for camps, hotels & loading points.', img: 'services/hajj-umrah.jpg' },
    { n: '02', t: ar ? 'الفنادق' : 'Hotels', d: ar ? 'عقود تغذية يومية مع قوائم مخصصة وتوصيل منظم يراعي أوقات التشغيل وحجم الطلبات.' : 'Daily contracts with custom menus and organized, time-aware delivery.', img: 'services/hotels.jpg' },
    { n: '03', t: ar ? 'الولائم' : 'Banquets', d: ar ? 'ولائم فاخرة للمناسبات الكبرى والضيافات الرسمية بأطباق رئيسية مميزة وتقديم يليق بالمقام.' : 'Lavish banquets for major occasions & official hospitality — signature mains, elegant presentation.', img: 'services/banquets.jpg' },
    { n: '04', t: ar ? 'المؤتمرات والفعاليات' : 'Conferences & Events', d: ar ? 'بوفيهات، وجبات فردية، وركن مشروبات بخدمة مرنة وحضور راقٍ.' : 'Buffets, boxed meals & beverage stations with flexible, elegant service.', img: 'services/events.jpg' },
    { n: '05', t: ar ? 'إفطار صائم' : 'Ramadan Iftar', d: ar ? 'برامج رمضانية للمساجد والجمعيات والجهات الحكومية والخاصة.' : 'Ramadan programs for mosques, charities & sectors.', img: 'services/iftar.jpg' },
    { n: '06', t: ar ? 'البوفيهات الخاصة' : 'Private Buffets', d: ar ? 'تشكيلات شرقية وغربية للمناسبات والحفلات مع تقديم احترافي.' : 'Eastern & Western spreads for events with professional service.', img: 'services/buffets.jpg' },
  ];

  const steps = [
    { n: '1', t: ar ? 'تخطيط القائمة والكميات' : 'Menu & volume planning', d: ar ? 'قوائم مناسبة لنوع المشروع وعدد المستفيدين والمواعيد.' : 'Menus matched to project, headcount & timing.', Icon: ClipboardList },
    { n: '2', t: ar ? 'تحضير وفق معايير السلامة' : 'Prep to safety standards', d: ar ? 'تحكم في النظافة والجودة داخل المطابخ قبل التعبئة.' : 'Hygiene & quality control before packing.', Icon: ShieldCheck },
    { n: '3', t: ar ? 'تعبئة وتحميل منضبط' : 'Controlled pack & load', d: ar ? 'نقاط تحميل واضحة وآليات تسليم تقلل التأخير في الذروة.' : 'Clear loading points minimizing peak delays.', Icon: Package },
    { n: '4', t: ar ? 'توزيع ميداني' : 'Field distribution', d: ar ? 'فرق ومسارات تغطي مكة والمشاعر ومواقع الفعاليات.' : 'Teams & routes across Makkah, sites & events.', Icon: Truck },
    { n: '5', t: ar ? 'توثيق ومتابعة الجودة' : 'Reporting & QA', d: ar ? 'متابعة مستمرة تعزز الثقة وتدعم المشاريع المتكررة.' : 'Continuous follow-up that builds repeat trust.', Icon: FileCheck },
  ];

  const opsFacts = [
    { Icon: BadgeCheck, t: ar ? 'موثوق ومعتمد' : 'Trusted & certified', s: ar ? 'من جهات حكومية وخاصة' : 'By government & private bodies' },
    { Icon: Users, t: ar ? 'فريق متخصص' : 'Specialized team', s: ar ? 'أكثر من 350 موظف' : 'Over 350 staff' },
    { Icon: Truck, t: ar ? 'أسطول مجهز' : 'Equipped fleet', s: ar ? 'أكثر من 40 مركبة نقل' : 'Over 40 transport vehicles' },
    { Icon: MapPin, t: ar ? 'تغطية شاملة' : 'Full coverage', s: ar ? 'مكة، المشاعر، والفعاليات' : 'Makkah, holy sites & events' },
  ];

  const stripImages = ['03', '05', '07', '08', '09', '11', '12', '13', '14', '15', '16', '17'].map(IMG);

  const menuPreview = [
    { t: ar ? 'المندي' : 'Mandi', s: ar ? 'لحم أو دجاج مدخّن' : 'Smoked lamb or chicken', img: 'dishes/main-4.jpg', tag: ar ? 'الأكثر طلباً' : 'Popular' },
    { t: ar ? 'الكبسة' : 'Kabsa', s: ar ? 'أرز بالبهارات السعودية' : 'Saudi-spiced rice', img: 'dishes/main-1.jpg', tag: ar ? 'الأكثر طلباً' : 'Popular' },
    { t: ar ? 'المفطّح' : 'Mufattah', s: ar ? 'طبق الولائم الكبرى' : 'The grand centerpiece', img: 'services/banquets.jpg', tag: ar ? 'مميّز' : 'Signature' },
    { t: ar ? 'مشاوي مشكّلة' : 'Mixed Grill', s: ar ? 'تشكيلة على الفحم' : 'Charcoal selection', img: 'dishes/grill-2.jpg', tag: ar ? 'من المشاوي' : 'Grill' },
  ];

  const clientLogos = [
    'al_bait_guests', 'mashariq', 'holy_makkah_municipality', 'al_birr_al_khayriya',
    'huda_association', 'al_ihsan_association', 'saeed_hamad_al_bishi', 'stc', 'fleet_zad_trading',
  ].map(name => `clients/${name}_transparent.png`);

  const mini = [
    { b: '350+', t: ar ? 'موظف' : 'Employees', p: ar ? 'طهاة، تعبئة، توصيل، وجودة.' : 'Chefs, packing, delivery & quality.' },
    { b: '40', t: ar ? 'سيارة نقل' : 'Vehicles', p: ar ? 'أسطول مجهز وقابل للزيادة.' : 'Equipped, scalable fleet.' },
    { b: '3', t: ar ? 'فروع' : 'Kitchens', p: ar ? 'الشوقية، العوالي، والشرائع.' : 'Shoqiyah, Awali & Shara’i.' },
    { b: '5', t: ar ? 'محاور خدمة' : 'Service lines', p: ar ? 'إعاشة، فنادق، فعاليات، إفطار، بوفيهات.' : 'Catering, hotels, events, Iftar, buffets.' },
  ];
  const seasons = [
    { b: ar ? 'رمضان 1444هـ' : 'Ramadan 1444H', s: ar ? '270,000 + 150,000 وجبة' : '270,000 + 150,000 meals' },
    { b: ar ? 'حج 1444هـ' : 'Hajj 1444H', s: ar ? '30,000 + 125,000 وجبة' : '30,000 + 125,000 meals' },
    { b: ar ? 'رمضان 1446هـ' : 'Ramadan 1446H', s: ar ? '45,000 + 150,000 وجبة' : '45,000 + 150,000 meals' },
    { b: ar ? 'حج 1446هـ' : 'Hajj 1446H', s: ar ? '100,000 وجبة دعم وإسناد' : '100,000 support meals' },
  ];

  const branches = [
    { t: ar ? 'فرع الشرائع' : 'Al-Shara’i Branch', l: 'Al-Shara’i', img: 'branches/sharai.jpg', d: ar ? 'مكة المكرمة' : 'Makkah' },
    { t: ar ? 'فرع العوالي' : 'Al-Awali Branch', l: 'Al-Awali', img: 'branches/awali.jpg', d: ar ? 'مكة المكرمة' : 'Makkah' },
    { t: ar ? 'فرع الشوقية' : 'Al-Shoqiyah Branch', l: 'Al-Shoqiyah', img: 'branches/shoqiyah.jpg', d: ar ? 'مكة المكرمة' : 'Makkah' },
  ];

  const why = [
    { t: ar ? 'خبرة في المشاعر المقدسة' : 'Holy-Sites expertise', d: ar ? 'تشغيل متخصص في مواسم الضغط العالي وخدمة ضيوف الرحمن.' : 'Specialized ops in high-pressure seasons.' },
    { t: ar ? 'بنية لوجستية قوية' : 'Strong logistics', d: ar ? 'نقاط توزيع وتوصيل تغطي فنادق مكة ومناطق التشغيل.' : 'Distribution covering Makkah hotels & sites.' },
    { t: ar ? 'التزام HACCP' : 'HACCP compliance', d: ar ? 'تطبيق صارم لأنظمة السلامة والجودة في الأغذية.' : 'Strict food-safety & quality systems.' },
    { t: ar ? 'مرونة في المشاريع الكبرى' : 'Flexibility at scale', d: ar ? 'قدرة على التوسع والتعامل مع المشاريع الطارئة.' : 'Scale & handle emergency projects.' },
    { t: ar ? 'شراكات موثوقة' : 'Trusted partnerships', d: ar ? 'علاقات مع جهات عامة وخاصة وشركاء نجاح.' : 'Public & private partners across Makkah.' },
  ];

  const projects = [
    { s: ar ? 'رمضان 1444هـ' : 'Ramadan 1444H', metric: '', d: ar ? 'وجبات ساخنة بالتعاون مع جمعيات خيرية في مكة.' : 'Hot meals with charities across Makkah.' },
    { s: ar ? 'حج 1444هـ' : 'Hajj 1444H', metric: '', d: ar ? 'إسناد شركات ومؤسسات بخدمات وجبات موسمية.' : 'Seasonal meal support for companies.' },
    { s: ar ? 'رمضان 1446هـ' : 'Ramadan 1446H', metric: '', d: ar ? 'توسّع في برامج الإفطار وخدمة الجهات.' : 'Expanded Iftar programs & entities.' },
    { s: ar ? 'حج 1446هـ' : 'Hajj 1446H', metric: '100,000+', d: ar ? 'وجبة دعم وإسناد لضيوف البيت.' : 'support meals for Duyouf Al-Bayt.' },
  ];

  const badges = [
    { b: 'HACCP', s: ar ? 'التزام بأنظمة تحليل المخاطر ونقاط التحكم الحرجة.' : 'Hazard analysis & critical control points.' },
    { b: 'SFDA', s: ar ? 'توافق مع متطلبات السلامة والغذاء والجهات المختصة.' : 'Compliant with food & drug authority.' },
    { b: '1446H', s: ar ? 'تأهيل إعاشة للحج والعمرة ضمن مواسم التشغيل.' : 'Hajj & Umrah catering qualification.' },
    { b: '24/7', s: ar ? 'مرونة تشغيلية للمشاريع الموسمية والطارئة.' : 'Operational flexibility, seasonal & urgent.' },
  ];

  const DARK = 'bg-[#14110e]';

  return (
    <div className="overflow-hidden">

      {/* ===== HERO (light, full banner image + text over the empty right zone) ===== */}
      <section className="relative overflow-hidden bg-[#f4f1ec] text-ink">
        {/* desktop banner — full width; the transparent nav overlays its top */}
        <img
          src="banners/hero.jpg"
          alt={ar ? 'مبنى وأسطول وفريق المضياف العربي' : 'Al-Mudhayaf Al-Arabi building, fleet & team'}
          className="hidden lg:block w-full h-[calc(100vh-2.25rem)] object-cover object-center"
        />
        {/* mobile banner — 1:1 crop with a white top gradient so the transparent nav reads */}
        <div className="lg:hidden relative">
          <img
            src="banners/hero-mobile.jpg"
            alt={ar ? 'مبنى وأسطول وفريق المضياف العربي' : 'Al-Mudhayaf Al-Arabi building, fleet & team'}
            className="w-full aspect-square object-cover object-center block"
          />
          <span className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none" />
        </div>
        {/* desktop: soft light wash over the right (text) zone for legibility */}
        <span className="hidden lg:block absolute inset-0 bg-gradient-to-l from-[#f4f1ec]/70 via-[#f4f1ec]/10 to-transparent pointer-events-none" />

        {/* text — overlaid on the image's empty right zone (desktop), stacked below on mobile */}
        <div className="lg:absolute lg:inset-0 lg:z-[2]">
          <div className="max-w-7xl mx-auto px-6 lg:max-w-none lg:px-[4vw] h-full flex items-center">
            <motion.div {...fadeUp} className="w-full lg:w-[42%] py-10 lg:py-0">
              <span className="inline-flex items-center gap-3 text-brand-600 font-bold text-sm md:text-base">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-500" />
                {ar ? 'مطابخ وإعاشة من مكة المكرمة' : 'Kitchens & catering from Makkah'}
              </span>
              <h1 className="mt-4 font-display font-black leading-[1.15] text-2xl lg:text-3xl xl:text-4xl text-brand-800">
                {ar ? 'إعاشة وضيافة تتحرك بدقّة الكرم العربي' : 'Catering & hospitality, delivered with the precision of Arab generosity'}
              </h1>
              <p className="mt-5 text-sm lg:text-base xl:text-lg text-gray-700 leading-relaxed">
                {ar
                  ? 'من إعاشة ضيوف الرحمن وعقود الفنادق، إلى الولائم والمؤتمرات والمناسبات الخاصة — نجمع بين الكرم العربي والانضباط التشغيلي.'
                  : 'From catering the Guests of Allah and hotel contracts to banquets, conferences and private occasions — Arab generosity with operational discipline.'}
              </p>
              <div className="mt-7 flex flex-col sm:flex-row flex-wrap gap-3">
                <Button variant="gold" size="lg" onClick={quote} className="w-full sm:w-auto justify-center">{ar ? 'اطلب عرض سعر' : 'Request a Quote'}</Button>
                <Button variant="outline" size="lg" onClick={() => onNavigate('MENU')} className="w-full sm:w-auto justify-center">{ar ? 'استعرض الخدمات' : 'Browse services'}</Button>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {heroStats.map((s, i) => (
                  <div key={i} className="rounded-2xl bg-white/95 border border-[#eee1d0] shadow-sm p-4 flex items-center justify-between gap-3 sm:block">
                    <Num className="text-2xl xl:text-3xl font-display font-bold text-brand-600 whitespace-nowrap">{s.n}</Num>
                    <span className="text-xs text-gray-600 leading-snug text-end sm:block sm:mt-1.5 sm:text-start">{s.l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SERVICE TICKER (red, rotating) ===== */}
      <div className="bg-brand-600 text-white py-3.5 border-y border-brand-700/40">
        <ServiceTicker items={tags} />
      </div>

      {/* ===== TRUST (dark gradient + Haram bg) ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#19120e] to-[#211711] text-white border-y border-white/10">
        {/* Masjid al-Haram backdrop */}
        <img src="banners/haram.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <span className="absolute inset-0 bg-gradient-to-l from-[#140f0c] from-5% via-[#140f0c]/45 via-45% to-transparent" />
        <span className="absolute inset-0 bg-gradient-to-t from-[#211711]/90 via-transparent to-[#19120e]/40" />
        <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div {...fadeUp}>
            <Eyebrow>{ar ? 'من مكة إلى المشاعر' : 'From Makkah to the holy sites'}</Eyebrow>
            <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">{ar ? 'حضور يبني الثقة قبل أول تواصل' : 'A presence that earns trust before the first call'}</h2>
            <p className="mt-4 text-white/75 text-lg max-w-xl leading-relaxed">{ar ? 'لسنا مجرد «مزود خدمة»، بل بنية تشغيل قائمة: قدرة ميدانية، سجل إنجازات، شهادات جودة، وفريق يعرف ضغط المواسم.' : 'Not just a vendor — a working operation: field capacity, a track record, certifications, and a team that knows seasonal pressure.'}</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-4">
            {trust.map((c, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="relative rounded-2xl bg-black/30 border border-white/15 p-6 overflow-hidden backdrop-blur-md">
                <span className="absolute end-5 top-5 w-3 h-3 rounded-full bg-secondary-400 ring-8 ring-secondary-400/10" />
                <b className="block text-xl mt-8">{c.b}</b>
                <span className="block mt-2 text-sm text-white/70 leading-relaxed">{c.s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES (light) ===== */}
      <section className="bg-[#fbf7ef] text-ink pt-16 md:pt-24 pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Kicker>{ar ? 'الخدمات الأساسية' : 'Core services'}</Kicker>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'حلول إعاشة للمواسم والفنادق والفعاليات' : 'Catering solutions for seasons, hotels & events'}</h2>
            </div>
            <p className="md:max-w-sm text-gray-600 leading-relaxed">{ar ? 'خدمات إعاشة متكاملة تغطّي كل مناسبة وموسم، من الحج والعمرة إلى الفنادق والفعاليات.' : 'Complete catering for every occasion and season — from Hajj & Umrah to hotels and events.'}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className="relative overflow-hidden rounded-2xl bg-white border border-[#eee1d0] shadow-sm flex flex-col"
              >
                <div className="relative overflow-hidden h-48">
                  <img src={s.img} alt={s.t} className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <Num className="absolute bottom-2 end-4 font-display font-black text-white/85 text-5xl">{s.n}</Num>
                </div>
                <div className="p-7 flex-1">
                  <h3 className="font-display font-bold text-brand-800 text-xl">{s.t}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed text-sm">{s.d}</p>
                  <span className="block mt-5 h-1.5 w-16 rounded-full bg-gradient-to-r from-brand-600 to-secondary-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MENU TEASER (light) — preview of the banquet menu page ===== */}
      <section className="bg-[#fffaf2] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <Kicker>{ar ? 'قائمة الولائم' : 'The Banquet Menu'}</Kicker>
              <h2 className="mt-2 font-display font-black text-3xl md:text-4xl text-brand-800 leading-tight">{ar ? 'أطباق الكرم العربي على مائدتك' : 'Arab generosity, on your table'}</h2>
              <p className="mt-3 text-gray-600 leading-relaxed max-w-xl">{ar ? 'من المندي والكبسة والمفطّح إلى المشاوي والحلويات الشرقية — تشكيلة واسعة تُحضَّر طازجة.' : 'From Mandi, Kabsa and Mufattah to grills and Eastern sweets — a wide, freshly prepared selection.'}</p>
            </div>
            <button onClick={() => onNavigate('DISHES')} className="shrink-0 inline-flex items-center gap-2 text-brand-700 font-bold hover:gap-3 transition-all">
              {ar ? 'استعرض القائمة الكاملة' : 'View the full menu'} <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {menuPreview.map((m, i) => (
              <motion.button
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                onClick={() => onNavigate('DISHES')}
                className="group relative overflow-hidden rounded-2xl border border-[#eadfce] shadow-sm aspect-[4/5] text-start"
              >
                <img src={m.img} alt={m.t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/15 to-transparent" />
                <span className="absolute top-3 end-3 text-[11px] font-bold text-ink bg-secondary-400 rounded-full px-2.5 py-1 shadow">{m.tag}</span>
                <span className="absolute bottom-4 start-4 end-4">
                  <strong className="block font-display font-bold text-lg md:text-xl text-white drop-shadow">{m.t}</strong>
                  <span className="block mt-0.5 text-white/80 text-xs">{m.s}</span>
                </span>
              </motion.button>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-9 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <Button variant="gold" size="lg" onClick={() => onNavigate('DISHES')} className="w-full sm:w-auto justify-center">{ar ? 'استعرض القائمة' : 'View the menu'}</Button>
            <Button variant="outline" size="lg" onClick={onOrderNow} className="w-full sm:w-auto justify-center">{ar ? 'اطلب الآن' : 'Order now'}</Button>
          </motion.div>
        </div>
      </section>

      {/* ===== OPERATIONS (light) ===== */}
      <section className="bg-gradient-to-b from-[#fbf7ef] to-[#f5ead9] text-ink pt-8 md:pt-12 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* centered header */}
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="hidden sm:block h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
              <span className="w-2 h-2 rotate-45 bg-secondary-500" />
              <span className="px-5 py-2 rounded-full bg-secondary-50 border border-secondary-500/30 text-brand-700 font-bold text-sm">{ar ? 'منظومة تشغيل متكاملة' : 'An integrated operating system'}</span>
              <span className="w-2 h-2 rotate-45 bg-secondary-500" />
              <span className="hidden sm:block h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
            </div>
            <h2 className="font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'كيف تتحرك الوجبة من القائمة إلى الميدان' : 'How a meal moves from menu to the field'}</h2>
            <div className="flex items-center justify-center gap-2 my-5">
              <span className="h-px w-10 bg-secondary-400/60" />
              <span className="w-1.5 h-1.5 rotate-45 bg-secondary-500" />
              <span className="h-px w-10 bg-secondary-400/60" />
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">{ar ? 'خط تشغيل يختصر رحلة الطلب من اعتماد القائمة إلى التسليم الميداني والتوثيق.' : 'An operating line from menu approval to field delivery and reporting.'}</p>
          </motion.div>

          {/* horizontal step cards + connectors */}
          <div className="flex items-stretch overflow-x-auto no-scrollbar lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0">
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <motion.div
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                  className="shrink-0 w-60 lg:w-auto lg:flex-1 relative rounded-2xl bg-white border border-[#eee1d0] shadow-sm pt-9 px-6 pb-7 text-center mt-4"
                >
                  {/* number badge overlapping top */}
                  <span className="absolute -top-4 start-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white text-sm font-black flex items-center justify-center shadow-lg ring-4 ring-[#f5ead9]" dir="ltr">{`0${s.n}`}</span>
                  {/* icon disc */}
                  <div className="relative mx-auto w-20 h-20 mb-5">
                    <span className="absolute end-1 bottom-0 w-12 h-12 rounded-full bg-secondary-400/25" />
                    <span className="relative w-20 h-20 rounded-full bg-secondary-50 border border-secondary-500/20 flex items-center justify-center text-brand-600">
                      <s.Icon className="w-9 h-9" strokeWidth={1.6} />
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-brand-700">{s.t}</h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{s.d}</p>
                </motion.div>

                {/* connector */}
                {i < steps.length - 1 && (
                  <div className="shrink-0 w-10 lg:w-12 self-start mt-[5.25rem] relative flex items-center justify-center">
                    <span className="absolute inset-x-1 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-secondary-400/70" />
                    <span className="relative z-10 w-8 h-8 rounded-full bg-secondary-500 text-white flex items-center justify-center shadow-md">
                      <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* stats bar */}
          <motion.div {...fadeUp} className="mt-12 rounded-2xl bg-white border border-[#eee1d0] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-[#eee1d0]">
            {opsFacts.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-7 py-6">
                <div>
                  <b className="block text-brand-800 text-lg">{f.t}</b>
                  <span className="block mt-1 text-sm text-gray-500 leading-relaxed">{f.s}</span>
                </div>
                <span className="w-12 h-12 rounded-full bg-secondary-50 flex items-center justify-center text-secondary-500 shrink-0">
                  <f.Icon className="w-6 h-6" strokeWidth={1.8} />
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PHOTO STRIP (full-width, drag + auto-scroll, 9:16) ===== */}
      <section className="bg-[#f5ead9] py-6 overflow-hidden" aria-label={ar ? 'معرض الصور' : 'Photo gallery'}>
        <PhotoStrip images={stripImages} />
      </section>

      {/* ===== ACHIEVEMENTS (light) ===== */}
      <section className="bg-[#fffaf2] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div><Kicker>{ar ? 'إحصائيات تبني الثقة' : 'Numbers that build trust'}</Kicker><h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800">{ar ? 'حصيلة عملٍ ملموسة' : 'A track record you can measure'}</h2></div>
            <p className="md:max-w-sm text-gray-600 leading-relaxed">{ar ? 'أرقام حقيقية من مشاريعنا في مكة المكرمة والمشاعر المقدسة.' : 'Real figures from our projects across Makkah and the holy sites.'}</p>
          </motion.div>
          <div className="grid lg:grid-cols-5 gap-5">
            <motion.div {...fadeUp} className="lg:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1210] to-[#2d1814] text-white p-8 md:p-12">
              <span className="absolute -start-40 -bottom-40 w-[40rem] h-[40rem] rounded-full border border-secondary-400/20" />
              <Eyebrow>{ar ? 'منذ 1444هـ إلى 1446هـ' : 'From 1444H to 1446H'}</Eyebrow>
              <Num className="block mt-6 text-6xl md:text-8xl font-display font-black text-secondary-400 leading-none">1,020,000+</Num>
              <h3 className="mt-4 text-2xl md:text-4xl font-display font-bold">{ar ? 'وجبة ساخنة' : 'hot meals'}</h3>
              <p className="mt-3 text-white/75 max-w-lg leading-relaxed">{ar ? 'لجهات حكومية وجمعيات ومؤسسات خيرية وشركات رائدة في مكة المكرمة.' : 'For government bodies, charities and leading companies across Makkah.'}</p>
            </motion.div>
            <div className="lg:col-span-2 grid grid-cols-2 gap-5">
              {mini.map((m, i) => (
                <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="rounded-2xl bg-white border border-[#eadfce] p-5 shadow-sm">
                  <Num className="block text-4xl md:text-5xl font-display font-black text-brand-600 leading-none">{m.b}</Num>
                  <span className="block mt-3 font-bold text-brand-800">{m.t}</span>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.p}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {seasons.map((s, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="rounded-2xl bg-[#f3e5ce] border border-secondary-500/20 p-5">
                <b className="text-brand-800 text-lg">{s.b}</b>
                <span className="block mt-1.5 text-sm text-gray-600">{s.s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRANCHES (light) ===== */}
      <section className="bg-[#f7f1e8] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <Kicker>{ar ? 'فروع داخل مكة' : 'Branches inside Makkah'}</Kicker>
              <h2 className="mt-2 font-display font-black text-3xl md:text-4xl text-brand-800 leading-tight max-w-xl">{ar ? 'حضور قريب من العميل ومناطق التشغيل' : 'Close to clients and to operating zones'}</h2>
            </div>
            <button onClick={() => onNavigate('BRANCHES')} className="shrink-0 inline-flex items-center gap-2 text-brand-700 font-bold hover:gap-3 transition-all">
              {ar ? 'استكشف مطابخنا على الخريطة' : 'Explore our kitchens on the map'} <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b, i) => (
              <motion.button
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                onClick={() => onNavigate('BRANCHES')}
                className="group text-start rounded-2xl overflow-hidden bg-white border border-[#eadfce] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={b.img} alt={b.t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 start-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-brand-700 text-xs font-bold shadow-sm">
                    <MapPin className="w-3.5 h-3.5" /> {b.d}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-6 py-5">
                  <div>
                    <strong className="block text-lg md:text-xl text-brand-800 leading-tight">{b.t}</strong>
                    <span className="block mt-0.5 text-sm text-gray-500" dir="ltr">{b.l}</span>
                  </div>
                  <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY (light) — with delivery banner on top ===== */}
      <section className="bg-[#fffaf2] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* delivery banner */}
          <motion.a
            href="tel:920011618"
            {...fadeUp}
            className="group block mb-16 rounded-2xl overflow-hidden shadow-xl shadow-brand-900/10 ring-1 ring-[#eadfce] hover:shadow-2xl transition-shadow"
            aria-label={ar ? 'خدمة التوصيل السريع — اتصل الآن' : 'Fast delivery service — call now'}
          >
            <img
              src="banners/delivery.jpg"
              alt={ar ? 'خدمة التوصيل السريع' : 'Fast delivery service'}
              className="w-full h-auto group-hover:scale-[1.01] transition-transform duration-500"
            />
          </motion.a>

          <motion.div {...fadeUp} className="mb-12">
            <Kicker>{ar ? 'لماذا المضياف العربي؟' : 'Why Al-Mudhayaf Al-Arabi?'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800">{ar ? 'أسباب تجعلنا الخيار الأنسب' : 'Why we’re the right choice'}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {why.map((w, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-secondary-50 border border-[#eadfce] p-6 shadow-sm">
                <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-black text-sm flex items-center justify-center mb-5" dir="ltr">{i + 1}</span>
                <h3 className="font-bold text-brand-800 leading-snug">{w.t}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{w.d}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp} className="mt-6 grid md:grid-cols-2 gap-6 items-center rounded-2xl bg-[#221713] text-white p-8 md:p-12 relative overflow-hidden">
            <span className="absolute -end-40 -top-40 w-[30rem] h-[30rem] rounded-full bg-secondary-500/10" />
            <h3 className="font-display font-bold text-2xl md:text-4xl leading-tight relative">{ar ? 'لا نبيع «وجبة» فقط، بل راحة تشغيل كاملة.' : 'We don’t sell a “meal” — we sell complete operational peace of mind.'}</h3>
            <p className="text-white/75 leading-relaxed relative">{ar ? 'خبرة ميدانية، أسطول مجهّز، وفريق متخصص يضمن وصول إعاشتك في وقتها وبالجودة التي تستحقها.' : 'Field expertise, an equipped fleet and a specialized team — your catering arrives on time and at the quality you deserve.'}</p>
          </motion.div>
        </div>
      </section>

      {/* ===== PROJECTS (light) ===== */}
      <section className="bg-[#f5ead9] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <motion.div {...fadeUp}>
            <Kicker>{ar ? 'خبرات موسمية' : 'Seasonal experience'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-4xl text-brand-800 leading-tight">{ar ? 'محطات من مسيرتنا في خدمة ضيوف الرحمن' : 'Milestones from our journey serving the Guests of Allah'}</h2>

            {/* vertical timeline */}
            <div className="relative mt-10 ps-9">
              {/* the line */}
              <span className="absolute top-1 bottom-1 start-[7px] w-0.5 bg-gradient-to-b from-secondary-500 via-secondary-400/60 to-secondary-400/0" />
              <div className="space-y-8">
                {projects.map((p, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="relative">
                    {/* node */}
                    <span className="absolute -start-9 top-1 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-[#f5ead9] shadow-md" />
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-block px-3.5 py-1 rounded-full bg-brand-600 text-white text-xs md:text-sm font-black">{p.s}</span>
                      {p.metric && (
                        <span className="font-display font-black text-brand-700 text-2xl md:text-3xl leading-none" dir="ltr">{p.metric}</span>
                      )}
                    </div>
                    <p className="mt-2.5 text-gray-600 leading-relaxed text-sm md:text-base">{p.d}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          {/* layered arch (mihrab) photo composition */}
          <motion.div {...fadeUp} className="relative pt-4 pb-10 ps-2 pe-2 lg:pe-6">
            {/* dotted gold ornament */}
            <span
              className="absolute top-0 end-0 w-28 h-28 opacity-60 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#F8C15D 1.6px, transparent 1.6px)', backgroundSize: '13px 13px' }}
            />
            {/* soft brand glow */}
            <span className="absolute -bottom-3 start-6 w-48 h-48 rounded-full bg-brand-600/5 pointer-events-none" />

            {/* main arch-topped image */}
            <div className="relative w-[80%] ms-auto arch-top overflow-hidden border-[6px] border-white shadow-2xl shadow-brand-900/20 aspect-[3/4]">
              <img src={IMG('07')} alt="" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-brand-900/20 to-transparent" />
            </div>

            {/* overlapping tilted framed photo */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="absolute bottom-3 start-0 w-[42%] rounded-[1.25rem] overflow-hidden border-[6px] border-white shadow-xl shadow-brand-900/20 aspect-[4/5] -rotate-3"
            >
              <img src={IMG('08')} alt="" className="w-full h-full object-cover" />
            </motion.div>

            {/* small gold-framed accent */}
            <div className="absolute top-9 start-1 w-[26%] rounded-xl overflow-hidden border-4 border-secondary-500 shadow-lg aspect-square rotate-3 hidden sm:block">
              <img src={IMG('09')} alt="" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CLIENTS (light) — moving logos ===== */}
      <section className="relative bg-[#fbf6ec] text-ink py-10 md:py-14 overflow-hidden">
        {/* settled drifting background orbs */}
        <motion.span aria-hidden className="pointer-events-none absolute -top-10 start-[12%] w-72 h-72 rounded-full bg-secondary-500/15 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -14, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.span aria-hidden className="pointer-events-none absolute -bottom-12 end-[14%] w-80 h-80 rounded-full bg-brand-600/10 blur-3xl"
          animate={{ x: [0, -26, 0], y: [0, 16, 0] }} transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }} />

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-4">
            <Kicker>{ar ? 'عملاؤنا وشركاء النجاح' : 'Our clients & partners'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800">{ar ? 'ثقة جهات رائدة' : 'Trusted by leading entities'}</h2>
          </motion.div>
        </div>
        {/* marquee */}
        <div className="relative">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 z-10 bg-gradient-to-r from-[#fbf6ec] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 z-10 bg-gradient-to-l from-[#fbf6ec] to-transparent" />
          <LogoMarquee logos={clientLogos} />
        </div>
      </section>

      {/* ===== GALLERY (dark) ===== */}
      <section className={`${DARK} text-white py-16 md:py-24`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div><Eyebrow>{ar ? 'صور من الأرشيف' : 'From the archive'}</Eyebrow><h2 className="mt-3 font-display font-black text-3xl md:text-5xl">{ar ? 'صور من الميدان' : 'Photos from the field'}</h2></div>
            <p className="md:max-w-sm text-white/65 leading-relaxed">{ar ? 'الخدمة، المطابخ، الوجبات، والفريق' : 'Service, kitchens, meals and team'}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {gallery.map((src, i) => (
              <button key={i} onClick={() => openImg(i)} className="group relative overflow-hidden rounded-2xl border border-white/10 aspect-[3/4]">
                <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUALITY (dark) ===== */}
      <section className="bg-[#18120e] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div {...fadeUp}>
            <Eyebrow>{ar ? 'الجودة والسلامة' : 'Quality & safety'}</Eyebrow>
            <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight">{ar ? 'أمان غذائي كجزء من الهوية' : 'Food safety as part of our identity'}</h2>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">{ar ? 'نلتزم بأعلى معايير السلامة والجودة الغذائية في كل مرحلة، من التحضير إلى التسليم.' : 'We uphold the highest food-safety and quality standards at every step — from prep to delivery.'}</p>
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((b, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/10 p-6">
                <span className="absolute -start-8 -bottom-8 w-28 h-28 rounded-full bg-secondary-500/10" />
                <Num className="block text-2xl md:text-3xl font-display font-black text-secondary-400">{b.b}</Num>
                <span className="block mt-3 text-sm text-white/70 leading-relaxed">{b.s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA (dark) ===== */}
      <section className="bg-[#0f0e0d] text-white py-16 md:py-24 relative overflow-hidden">
        <span className="absolute -top-40 -end-24 w-[42rem] h-[42rem] rounded-full bg-brand-600/20 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 md:p-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <Eyebrow>{ar ? 'جاهزون للتعاون؟' : 'Ready to work together?'}</Eyebrow>
              <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight">{ar ? 'لنبحث احتياج الإعاشة القادم' : 'Let’s scope your next catering need'}</h2>
              <p className="mt-4 text-white/75 text-lg leading-relaxed max-w-xl">{ar ? 'أخبرنا بالمشروع، عدد الوجبات، موقع التوزيع، ونطاق الخدمة — ونعدّ لك عرضاً متكاملاً.' : 'Tell us the project, meal counts, distribution site and scope — we’ll build a complete proposal.'}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="gold" size="lg" onClick={quote}>{ar ? 'طلب عرض سعر' : 'Request a Quote'}</Button>
                <a href="profile.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
                  <Download className="w-5 h-5" /> {ar ? 'تحميل الملف التعريفي' : 'Download profile'}
                </a>
              </div>
            </div>
            <div className="rounded-2xl bg-[#fffaf2] text-ink p-8 shadow-2xl">
              <strong className="text-2xl font-display font-bold text-brand-800 block">{ar ? 'المضياف العربي' : 'Al-Mudhayaf Al-Arabi'}</strong>
              <div className="h-px bg-[#eadfce] my-6" />
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center"><span className="text-gray-500">{ar ? 'الموقع' : 'Location'}</span><b className="text-brand-700">{ar ? 'مكة المكرمة' : 'Makkah'}</b></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">{ar ? 'الخدمة' : 'Service'}</span><b className="text-brand-700" dir="ltr">Catering</b></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">{ar ? 'الهاتف' : 'Phone'}</span><b className="text-brand-700" dir="ltr">0570165050</b></div>
              </div>
              <div className="h-px bg-[#eadfce] my-6" />
              <button onClick={quote} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-full transition-colors">{ar ? 'تواصل معنا' : 'Contact us'}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LIGHTBOX ===== */}
      {lb !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4" onClick={close}>
          <button onClick={close} className="absolute top-5 end-5 text-white/80 hover:text-white" aria-label={ar ? 'إغلاق' : 'Close'}><X className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); step(ar ? 1 : -1); }} className="absolute start-4 text-white/80 hover:text-white p-2" aria-label="prev"><ChevronLeft className="w-9 h-9" /></button>
          <img src={gallery[lb]} alt="" className="max-h-[85vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); step(ar ? -1 : 1); }} className="absolute end-4 text-white/80 hover:text-white p-2" aria-label="next"><ChevronRight className="w-9 h-9" /></button>
        </div>
      )}
    </div>
  );
};

export default Home;
