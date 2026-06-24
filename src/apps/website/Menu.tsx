import React from 'react';
import { ClipboardList, ShieldCheck, Package, Truck, FileCheck, ChevronLeft, BadgeCheck, Users, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../ui';
import { motion } from 'motion/react';

interface MenuProps {
  onOrderNow: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const Menu: React.FC<MenuProps> = ({ onOrderNow }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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

  // The five core catering services, sourced from the company profile.
  const services = [
    {
      n: '01',
      title: ar ? 'إعاشة الحج والعمرة' : 'Hajj & Umrah Catering',
      desc: ar
        ? 'وجبات ساخنة وجافة لضيوف الرحمن وفق ضوابط صارمة وأعلى معايير السلامة الغذائية، داخل المشاعر المقدسة وفنادق مكة المكرمة.'
        : 'Hot and dry meals for the Guests of Allah under strict protocols and the highest food-safety standards, across the Holy Sites and Makkah hotels.',
      points: [
        ar ? 'إعداد وجبات يومية: فطور، غداء، عشاء' : 'Daily meals: breakfast, lunch & dinner',
        ar ? 'توزيع ميداني للمخيمات والفنادق وفق جدول دقيق' : 'On-site delivery to camps & hotels on precise schedules',
        ar ? 'نقاط تحميل معتمدة وآليات تسليم منضبطة' : 'Certified loading points & controlled delivery',
        ar ? 'تشغيل مواقع إعاشة في مشعري منى وعرفات' : 'Catering sites operated in Mina & Arafat',
      ],
      img: 'services/hajj-umrah.jpg',
    },
    {
      n: '02',
      title: ar ? 'إعاشة الفنادق' : 'Hotel Catering',
      desc: ar
        ? 'عقود تغذية يومية مع فنادق مكة المكرمة تشمل قوائم طعام مخصصة وجداول دقيقة للتوصيل في أوقاتها.'
        : 'Daily meal contracts with Makkah hotels, including custom menus and precise, on-time delivery schedules.',
      points: [
        ar ? 'عقود إعاشة يومية مع فنادق مكة' : 'Daily meal contracts with Makkah hotels',
        ar ? 'قوائم طعام مخصصة حسب احتياج كل فندق' : 'Custom menus tailored to each hotel',
        ar ? 'جداول دقيقة وتوصيل في الأوقات المحددة' : 'Precise schedules with on-time delivery',
      ],
      img: 'services/hotels.jpg',
    },
    {
      n: '03',
      title: ar ? 'الولائم' : 'Banquets',
      desc: ar
        ? 'تجهيز وتنفيذ ولائم متكاملة للمناسبات الكبرى والاجتماعات الرسمية، بأطباق رئيسية فاخرة وتقديم احترافي يليق بالمقام.'
        : 'Complete banquets for major occasions and official gatherings — premium main dishes with professional, fitting presentation.',
      points: [
        ar ? 'ولائم كاملة للمناسبات والاجتماعات الرسمية' : 'Full banquets for occasions & official gatherings',
        ar ? 'أطباق رئيسية فاخرة: مندي، كبسة، ومشويات' : 'Premium mains: Mandi, Kabsa & grills',
        ar ? 'تنسيق وتقديم وإشراف ميداني احترافي' : 'Professional setup, service & on-site supervision',
      ],
      img: 'services/banquets.jpg',
    },
    {
      n: '04',
      title: ar ? 'المؤتمرات والفعاليات' : 'Conferences & Events',
      desc: ar
        ? 'بوفيهات مفتوحة، وجبات فردية معبأة، وركن مشروبات احترافي بأسلوب راقٍ وخدمة مرنة تليق بكل مناسبة.'
        : 'Elegant open buffets, individual boxed meals, and professional beverage stations with flexible service for every occasion.',
      points: [
        ar ? 'بوفيهات مفتوحة بأسلوب راقٍ' : 'Elegant open buffets',
        ar ? 'وجبات فردية معبأة بعناية' : 'Carefully packed boxed meals',
        ar ? 'ركن مشروبات احترافي' : 'Professional beverage stations',
      ],
      img: 'services/events.jpg',
    },
    {
      n: '05',
      title: ar ? 'برامج إفطار صائم' : 'Ramadan Iftar Programs',
      desc: ar
        ? 'برامج رمضانية موجهة للمساجد والجمعيات والقطاعين الحكومي والخاص وضيوف الرحمن، تُنفّذ داخل مكة المكرمة.'
        : 'Seasonal programs serving mosques, charities, and both government and private sectors, executed across Makkah.',
      points: [
        ar ? 'برامج للمساجد والجمعيات الخيرية' : 'Programs for mosques & charitable associations',
        ar ? 'دعم القطاعين الحكومي والخاص' : 'Support for government & private sectors',
        ar ? 'تنفيذ موسمي بطاقة استيعابية كبيرة' : 'Large-scale seasonal execution',
      ],
      img: 'services/iftar.jpg',
    },
    {
      n: '06',
      title: ar ? 'البوفيهات الخاصة' : 'Private Buffets',
      desc: ar
        ? 'تحضير وتقديم بوفيهات مميزة للمناسبات والحفلات الخاصة، تشمل تشكيلة واسعة من الأطباق الشرقية والغربية.'
        : 'Premium buffets prepared and served for private events, featuring a wide selection of Eastern and Western cuisines.',
      points: [
        ar ? 'بوفيهات راقية للمناسبات والحفلات الخاصة' : 'Premium buffets for private events & celebrations',
        ar ? 'تشكيلة واسعة من الأطباق الشرقية والغربية' : 'A wide selection of Eastern & Western cuisines',
        ar ? 'خدمة وإشراف ميداني احترافي' : 'Professional on-site service & supervision',
      ],
      img: 'services/buffets.jpg',
    },
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

  const why = [
    { t: ar ? 'خبرة في المشاعر المقدسة' : 'Holy-Sites expertise', d: ar ? 'تشغيل متخصص في مواسم الضغط العالي وخدمة ضيوف الرحمن.' : 'Specialized ops in high-pressure seasons.' },
    { t: ar ? 'بنية لوجستية قوية' : 'Strong logistics', d: ar ? 'نقاط توزيع وتوصيل تغطي فنادق مكة ومناطق التشغيل.' : 'Distribution covering Makkah hotels & sites.' },
    { t: ar ? 'التزام HACCP' : 'HACCP compliance', d: ar ? 'تطبيق صارم لأنظمة السلامة والجودة في الأغذية.' : 'Strict food-safety & quality systems.' },
    { t: ar ? 'مرونة في المشاريع الكبرى' : 'Flexibility at scale', d: ar ? 'قدرة على التوسع والتعامل مع المشاريع الطارئة.' : 'Scale & handle emergency projects.' },
    { t: ar ? 'شراكات موثوقة' : 'Trusted partnerships', d: ar ? 'علاقات مع جهات عامة وخاصة وشركاء نجاح.' : 'Public & private partners across Makkah.' },
  ];

  return (
    <div className="overflow-hidden">

      {/* ===== SERVICE 01 (light) ===== */}
      <section className="bg-[#fbf7ef] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="mb-10">
            <Kicker>{ar ? 'الخدمات الأساسية' : 'Core services'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'ستة محاور خدمة، منظومة تشغيل واحدة' : 'Six service lines, one operating system'}</h2>
          </motion.div>

          {/* alternating image/text rows */}
          <div className="space-y-6">
            {services.map((s, i) => {
              const reversed = i % 2 === 1;
              return (
                <motion.div
                  key={s.n}
                  {...fadeUp}
                  className="grid lg:grid-cols-2 items-stretch rounded-2xl bg-white border border-[#eee1d0] shadow-sm overflow-hidden"
                >
                  <div className={`relative min-h-[16rem] lg:min-h-[20rem] ${reversed ? 'lg:order-2' : ''}`}>
                    <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <div className={`relative p-7 md:p-10 ${reversed ? 'lg:order-1' : ''}`}>
                    <Num className="absolute top-5 end-7 text-5xl md:text-6xl font-display font-black text-brand-600/10">{s.n}</Num>
                    <Kicker>{ar ? `الخدمة ${s.n}` : `Service ${s.n}`}</Kicker>
                    <h3 className="mt-2 text-2xl md:text-3xl font-display font-bold text-brand-800">{s.title}</h3>
                    <p className="mt-3 text-gray-600 leading-relaxed">{s.desc}</p>
                    <span className="block mt-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-brand-600 to-secondary-500" />
                    <ul className="mt-6 space-y-3">
                      {s.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-3 text-gray-800">
                          <span className="mt-2 w-2 h-2 rotate-45 bg-secondary-500 shrink-0" />
                          <span className="font-medium leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW WE WORK (light) — same as Home operations ===== */}
      <section className="bg-gradient-to-b from-[#fbf7ef] to-[#f5ead9] text-ink py-16 md:py-24">
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
                  <span className="absolute -top-4 start-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white text-sm font-black flex items-center justify-center shadow-lg ring-4 ring-[#f5ead9]" dir="ltr">{`0${s.n}`}</span>
                  <div className="relative mx-auto w-20 h-20 mb-5">
                    <span className="absolute end-1 bottom-0 w-12 h-12 rounded-full bg-secondary-400/25" />
                    <span className="relative w-20 h-20 rounded-full bg-secondary-50 border border-secondary-500/20 flex items-center justify-center text-brand-600">
                      <s.Icon className="w-9 h-9" strokeWidth={1.6} />
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-brand-700">{s.t}</h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{s.d}</p>
                </motion.div>

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

      {/* ===== WHY (light) — same as Home ===== */}
      <section className="bg-[#fffaf2] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
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

      {/* ===== CTA (dark) ===== */}
      <section className="bg-[#0f0e0d] text-white py-16 md:py-24 relative overflow-hidden">
        <span className="absolute -top-40 -end-24 w-[42rem] h-[42rem] rounded-full bg-brand-600/20 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 md:p-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <Eyebrow>{ar ? 'جاهزون للتعاون؟' : 'Ready to work together?'}</Eyebrow>
              <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight">{ar ? 'اطلب عرض سعر لخدمتك القادمة' : 'Request a quote for your next service'}</h2>
              <p className="mt-4 text-white/75 text-lg leading-relaxed max-w-xl">{ar ? 'أخبرنا بتفاصيل مشروعك أو فعاليتك، عدد الوجبات، وموقع التوزيع — ويتواصل فريقنا بحلّ إعاشة متكامل يليق بضيوفك.' : 'Tell us about your project or event, meal counts and distribution site — our team will reach out with a complete catering solution worthy of your guests.'}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="gold" size="lg" onClick={onOrderNow}>{ar ? 'طلب عرض سعر' : 'Request a Quote'}</Button>
                <a href="profile.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
                  {ar ? 'تحميل الملف التعريفي' : 'Download profile'}
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
              <button onClick={onOrderNow} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-full transition-colors">{ar ? 'طلب عرض سعر' : 'Request a Quote'}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;
