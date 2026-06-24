import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../ui';
import { motion } from 'motion/react';

interface AboutProps {
  onOrderNow?: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const IMG = (n: string) => `concept/${n}.jpg`;

// Artistic, self-rotating story showcase — primary image crossfades with a slow
// Ken-Burns zoom every few seconds, a smaller collage card peeks out for depth.
const STORY_SHOTS = ['16', '15', '12', '13', '10', '08'];

const StoryGallery: React.FC = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % STORY_SHOTS.length), 3200);
    return () => clearInterval(id);
  }, []);
  const sec = (i + 3) % STORY_SHOTS.length;

  return (
    <div className="relative">
      {/* soft brand glows behind the frame */}
      <div className="absolute -top-8 -right-6 w-32 h-32 rounded-full bg-secondary-400/30 blur-3xl" />
      <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-brand-600/10 blur-3xl" />

      {/* primary rotating frame */}
      <div className="relative aspect-[4/5] sm:aspect-square rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl shadow-brand-900/15">
        {STORY_SHOTS.map((n, idx) => (
          <img
            key={n}
            src={IMG(n)}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover ease-out ${idx === i ? 'opacity-100 scale-110 transition-all duration-[3200ms]' : 'opacity-0 scale-100 transition-opacity duration-1000'}`}
          />
        ))}
        <span className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
        {/* gold corner ornament */}
        <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary-400/95 backdrop-blur flex items-center justify-center shadow-lg">
          <span className="w-2 h-2 rotate-45 bg-ink" />
        </span>
        {/* progress dots */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
          {STORY_SHOTS.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === i ? 'w-7 bg-secondary-400' : 'w-1.5 bg-white/60'}`} />
          ))}
        </div>
      </div>

      {/* floating collage accent */}
      <div className="hidden sm:block absolute -bottom-8 -left-8 w-36 h-36 rounded-2xl overflow-hidden border-[6px] border-white shadow-xl rotate-[-5deg]">
        {STORY_SHOTS.map((n, idx) => (
          <img key={n} src={IMG(n)} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === sec ? 'opacity-100' : 'opacity-0'}`} />
        ))}
      </div>
    </div>
  );
};

const About: React.FC<AboutProps> = ({ onOrderNow }) => {
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

  const pillars = [
    {
      tag: ar ? 'رؤيتنا' : 'Our Vision',
      text: ar
        ? 'أن نكون الشريك الأول والموثوق لحلول الإعاشة المتكاملة في المملكة، وبالأخص في مواسم الحج والعمرة، من خلال الابتكار والتميز والانضباط.'
        : 'To be the trusted, leading partner for integrated catering solutions in the Kingdom — especially during Hajj and Umrah seasons — through innovation, excellence and discipline.',
    },
    {
      tag: ar ? 'مهمتنا' : 'Our Mission',
      text: ar
        ? 'توفير وجبات غذائية آمنة، لذيذة، ومتوافقة مع أعلى المعايير الصحية، عبر عمليات تشغيل احترافية ومتكاملة تلبي متطلبات العملاء وتحقق رضا المستفيدين.'
        : 'To provide safe, delicious meals that meet the highest health standards through professional, integrated operations that fulfill customer needs and ensure beneficiary satisfaction.',
    },
    {
      tag: ar ? 'من نحن' : 'Who We Are',
      text: ar
        ? 'شركة إعاشة سعودية وطنية مقرها مكة المكرمة، متخصصة في إدارة وتشغيل خدمات التغذية في مواسم الحج والعمرة والفعاليات الكبرى، إضافة إلى العقود اليومية مع الفنادق والجهات الرسمية.'
        : 'A national Saudi catering company based in Makkah, specializing in managing and operating food services during Hajj, Umrah and major events, alongside daily contracts with hotels and official institutions.',
    },
  ];

  const mini = [
    { b: '350+', t: ar ? 'موظف' : 'Employees', p: ar ? 'طهاة، تعبئة، توصيل، وجودة.' : 'Chefs, packing, delivery & quality.' },
    { b: '40', t: ar ? 'مركبة نقل' : 'Vehicles', p: ar ? 'أسطول مجهز وقابل للزيادة.' : 'Equipped, scalable fleet.' },
    { b: '3', t: ar ? 'فروع مطابخ' : 'Kitchens', p: ar ? 'الشوقية، العوالي، والشرائع.' : 'Shoqiyah, Awali & Shara’i.' },
  ];

  const departments = [
    { title: ar ? 'إدارة الجودة والسلامة الغذائية' : 'Quality & Food Safety', desc: ar ? 'تطبيق أنظمة السلامة ومعايير HACCP لضمان غذاء آمن ونظيف.' : 'Implements HACCP standards and food-safety protocols for safe, clean food.' },
    { title: ar ? 'الإدارة العليا والتشغيل' : 'Executive Management & Operations', desc: ar ? 'وضع الخطط والأهداف الاستراتيجية واتخاذ القرارات ومتابعة سير الأعمال.' : 'Sets strategy and key decisions, overseeing daily operations toward our goals.' },
    { title: ar ? 'الخدمات اللوجستية والتوصيل' : 'Logistics & Delivery', desc: ar ? 'إدارة حركة النقل والتوزيع وتتبع الطلبات بكفاءة وتسليم في الأوقات المحددة.' : 'Manages transport, distribution and order tracking with efficient, on-time delivery.' },
    { title: ar ? 'المشاريع والإعاشة الموسمية' : 'Projects & Seasonal Catering', desc: ar ? 'تخطيط وتنظيم وتنفيذ ومراقبة مشاريع الحج والعمرة والفعاليات الموسمية.' : 'Plans and executes Hajj, Umrah and seasonal event catering end to end.' },
    { title: ar ? 'الموارد البشرية والتدريب' : 'HR & Training', desc: ar ? 'استقطاب الكفاءات وتطوير مهارات الطاقم وتدريبهم وتقييم أدائهم باستمرار.' : 'Talent acquisition plus continuous staff development, training and evaluation.' },
    { title: ar ? 'الابتكار والتطوير الغذائي' : 'Food Innovation & Development', desc: ar ? 'تطوير قوائم الطعام وابتكار وصفات تلائم الأذواق المتنوعة وتطوير منتجات جديدة.' : 'Develops menus and recipes to suit diverse tastes and creates new products.' },
    { title: ar ? 'العلاقات العامة والتوثيق الإعلامي' : 'Public Relations & Media', desc: ar ? 'توثيق الأعمال والتواصل مع الجهات الإعلامية والعملاء وتعزيز الصورة الإيجابية.' : 'Handles documentation, media relations and client outreach.' },
    { title: ar ? 'إدارة التسويق' : 'Marketing', desc: ar ? 'بناء الصورة الذهنية وإدارة الحملات وتحليل السوق وصناعة المحتوى الرقمي.' : 'Builds the brand, runs campaigns, analyzes the market and creates digital content.' },
  ];

  const badges = [
    { b: 'HACCP', s: ar ? 'تطبيق صارم لنظام تحليل المخاطر ونقاط التحكم الحرجة في جميع مراحل إعداد وتجهيز الوجبات، وفق المعايير الدولية لسلامة الأغذية.' : 'Strict implementation of the Hazard Analysis & Critical Control Points system across every stage of meal prep, per international food-safety standards.' },
    { b: 'SFDA', s: ar ? 'منشأة مرخّصة ومعتمدة من الهيئة العامة للغذاء والدواء، بما يضمن التزامنا الكامل بالاشتراطات الصحية والتنظيمية في المملكة.' : 'A facility licensed and approved by the Saudi Food & Drug Authority, ensuring full compliance with the Kingdom’s health and regulatory requirements.' },
  ];

  return (
    <div className="overflow-hidden">

      {/* ===== PAGE HEADER (compact, light) ===== */}
      <section className="bg-gradient-to-b from-[#f7f3ec] to-[#f4f1ec] border-b border-[#eadfce]">
        <motion.div {...fadeUp} className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <span className="inline-flex items-center gap-3 text-brand-600 font-bold text-sm">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-500" />
            {ar ? 'من نحن' : 'About'}
          </span>
          <h1 className="mt-3 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'مطبخ المضياف العربي من قلب مكة' : 'Al-Mudhayaf Al-Arabi — from the heart of Makkah'}</h1>
          <p className="mt-3 text-gray-600 text-base md:text-lg max-w-2xl leading-relaxed">{ar
            ? 'شركة إعاشة سعودية وطنية تخدم ضيوف الرحمن بأعلى معايير الجودة والضيافة — حيث الجودة ليست خياراً، بل أساس.'
            : 'A national Saudi catering company serving the Guests of Allah with the highest standards of quality and hospitality — where quality is not an option, but the foundation.'}</p>
        </motion.div>
      </section>

      {/* ===== STORY (light) ===== */}
      <section className="bg-[#fbf7ef] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div {...fadeUp} className="px-2 sm:px-0">
            <StoryGallery />
          </motion.div>
          <motion.div {...fadeUp}>
            <Kicker>{ar ? 'قصتنا' : 'Our story'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'وُلدنا في قلب مكة' : 'Born in the Heart of Makkah'}</h2>
            <div className="mt-6 space-y-5 text-gray-600 leading-relaxed">
              <p>{ar
                ? 'في قلب مكة المكرمة، وُلد مطبخ المضياف العربي من رحم الشغف والالتزام بخدمة ضيوف الرحمن بأعلى معايير الجودة والضيافة.'
                : 'In the heart of Makkah, Al-Mudhayaf Al-Arabi Kitchen was born from a deep passion and commitment to serving the Guests of Allah with the highest standards of hospitality and quality.'}</p>
              <p>{ar
                ? 'بدأنا مسيرتنا بخطوات ثابتة نحو هدف واضح: أن نكون الخيار الأول في مجال الإعاشة، مستمدين قوتنا من إرث الضيافة العربية الأصيل، ومستلهمين من قدسية المكان وخدمة الحجيج.'
                : 'We embarked on this journey with a clear vision: to become the leading provider of catering services, drawing strength from the legacy of authentic Arab hospitality and inspired by the sanctity of the place and the honor of serving pilgrims.'}</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {[
                ar ? 'شركة إعاشة سعودية' : 'Saudi catering company',
                ar ? 'حج · عمرة · فعاليات' : 'Hajj · Umrah · Events',
                ar ? 'مقرها مكة المكرمة' : 'Based in Makkah',
              ].map((t, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-[#f3e5ce] border border-secondary-500/20 text-brand-800 text-sm font-bold">{t}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== VISION / MISSION / WHO WE ARE (light) ===== */}
      <section className="bg-[#f5ead9] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="mb-12">
            <Kicker>{ar ? 'رؤيتنا ومهمتنا' : 'Our vision & mission'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800">{ar ? 'مع المضياف العربي، الجودة أساس لا خيار' : 'With us, quality is the foundation — not an option'}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {pillars.map((p, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="relative overflow-hidden rounded-2xl bg-white border border-[#eee1d0] p-8 shadow-sm">
                <Num className="absolute top-4 end-6 text-5xl font-display font-black text-brand-600/10">{`0${i + 1}`}</Num>
                <h3 className="mt-8 text-2xl font-display font-bold text-brand-800">{p.tag}</h3>
                <span className="block mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r from-brand-600 to-secondary-500" />
                <p className="mt-4 text-gray-600 leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MEGA STAT BAND (dark) ===== */}
      <section className="bg-[#fffaf2] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-5">
          <motion.div {...fadeUp} className="lg:col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1210] to-[#2d1814] text-white p-8 md:p-12">
            <span className="absolute -start-40 -bottom-40 w-[40rem] h-[40rem] rounded-full border border-secondary-400/20" />
            <Eyebrow>{ar ? 'إحصائياتنا من 1444هـ إلى 1446هـ' : 'Our achievements, 1444H – 1446H'}</Eyebrow>
            <Num className="block mt-6 text-6xl md:text-8xl font-display font-black text-secondary-400 leading-none">1,020,000+</Num>
            <h3 className="mt-4 text-2xl md:text-4xl font-display font-bold">{ar ? 'وجبة ساخنة' : 'hot meals'}</h3>
            <p className="mt-3 text-white/75 max-w-lg leading-relaxed">{ar ? 'تم إعدادها وتوزيعها لجهات حكومية وجمعيات ومؤسسات خيرية وشركات رائدة في مكة المكرمة.' : 'Prepared and distributed for government bodies, charities and leading companies across Makkah.'}</p>
          </motion.div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-5">
            {mini.map((m, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="rounded-2xl bg-white border border-[#eadfce] p-5 shadow-sm">
                <Num className="block text-4xl md:text-5xl font-display font-black text-brand-600 leading-none">{m.b}</Num>
                <span className="block mt-3 font-bold text-brand-800">{m.t}</span>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.p}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR TEAM (light) ===== */}
      <section className="bg-[#f7f1e8] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl shadow-brand-900/10 aspect-[4/3]">
            <img src={IMG('18')} alt={ar ? 'فريقنا' : 'Our team'} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 start-4 rounded-2xl bg-[#14110e]/85 backdrop-blur border border-secondary-500/25 px-5 py-3">
              <Num className="text-secondary-400 font-display font-black text-2xl">350+</Num>
              <span className="block text-white/80 text-xs font-bold">{ar ? 'موظف بروح الفريق الواحد' : 'staff, united as one team'}</span>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <Kicker>{ar ? 'فريقنا' : 'Our team'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'كوادر مؤهلة بشغف' : 'Qualified, passionate people'}</h2>
            <p className="mt-6 text-gray-600 leading-relaxed">{ar
              ? 'نفتخر بفريق من الكوادر المؤهلة، بدءاً من الطهاة المحترفين، مروراً بفرق التعبئة والتوصيل، وصولاً إلى فرق إدارة الجودة والسلامة الغذائية — أكثر من 350 موظفاً يعملون بروح الفريق الواحد وتحت هدف مشترك، إضافة إلى أسطول نقل من 40 سيارة مجهزة وقابلة للزيادة.'
              : 'We take pride in a team of qualified professionals — from expert chefs to packaging and delivery crews and quality and food-safety teams — over 350 dedicated employees working in unity under one shared mission, plus a fleet of 40 equipped, scalable vehicles.'}</p>
            <blockquote className="mt-7 border-s-4 border-secondary-500 ps-5 py-1">
              <p className="text-xl md:text-2xl font-display font-bold text-brand-800 leading-snug">{ar ? '«إكرام ضيف الرحمن هو شرف لا يعلوه شرف».' : '“Serving the Guests of Allah is the highest of honors.”'}</p>
            </blockquote>
            {onOrderNow && (
              <Button variant="gold" size="lg" className="mt-8" onClick={onOrderNow}>{ar ? 'طلب عرض سعر' : 'Request a Quote'}</Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ===== ORG DEPARTMENTS (light) ===== */}
      <section className="bg-[#fffaf2] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="mb-12">
            <Kicker>{ar ? 'الهيكل التنظيمي' : 'Organizational structure'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800">{ar ? 'إدارات متكاملة تعمل بتناغم' : 'Integrated departments working in harmony'}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {departments.map((d, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: (i % 4) * 0.06 }} className="relative overflow-hidden rounded-2xl bg-white border border-[#eee1d0] p-6 shadow-sm">
                <Num className="absolute top-3 end-5 text-5xl font-display font-black text-brand-600/10">{`0${i + 1}`}</Num>
                <h3 className="mt-8 font-bold text-brand-800 leading-snug">{d.title}</h3>
                <span className="block mt-3 h-1.5 w-16 rounded-full bg-gradient-to-r from-brand-600 to-secondary-500" />
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CERTIFICATIONS (dark) ===== */}
      <section className="bg-[#18120e] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div {...fadeUp}>
            <Eyebrow>{ar ? 'اعتماداتنا وشهاداتنا' : 'Our certifications'}</Eyebrow>
            <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight">{ar ? 'أمان غذائي كجزء من الهوية' : 'Food safety as part of our identity'}</h2>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">{ar ? 'نلتزم بأعلى المعايير العالمية في سلامة الأغذية والجودة التشغيلية في كل مرحلة.' : 'We adhere to the highest international standards in food safety and operational quality at every stage.'}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {badges.map((b, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/10 p-6">
                <span className="absolute -start-8 -bottom-8 w-28 h-28 rounded-full bg-secondary-500/10" />
                <Num className="block text-2xl md:text-3xl font-display font-black text-secondary-400">{b.b}</Num>
                <span className="block mt-3 text-sm text-white/70 leading-relaxed">{b.s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLOSING CTA (dark) ===== */}
      {onOrderNow && (
        <section className="bg-[#0f0e0d] text-white py-16 md:py-24 relative overflow-hidden">
          <span className="absolute -top-40 -end-24 w-[42rem] h-[42rem] rounded-full bg-brand-600/20 blur-3xl" />
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 md:p-14 text-center max-w-3xl mx-auto">
              <Eyebrow>{ar ? 'في الختام' : 'In closing'}</Eyebrow>
              <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight">{ar ? 'لنصنع نجاح مشروعك القادم' : 'Let’s make your next project a success'}</h2>
              <p className="mt-4 text-white/75 text-lg leading-relaxed">{ar
                ? 'لا نُقدّم وجبات فحسب، بل تجربة ضيافة متكاملة بروح أصيلة ومعايير عالمية. نتطلع لأن نكون الخيار الأول في مشاريعكم القادمة.'
                : 'We don’t just serve meals — we deliver a complete hospitality experience rooted in authenticity and driven by global standards. We look forward to being your top choice.'}</p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button variant="gold" size="lg" onClick={onOrderNow}>{ar ? 'طلب عرض سعر' : 'Request a Quote'}</Button>
                <a href="tel:0570165050">
                  <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur">{ar ? 'اتصل بنا' : 'Call us'}</Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
