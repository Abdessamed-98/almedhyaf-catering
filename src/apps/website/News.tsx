import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../ui';
import { motion } from 'motion/react';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string[]; // Array of paragraphs for better formatting
  image: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const IMG = (n: string) => `concept/${n}.jpg`;

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-3 text-secondary-500 font-bold text-sm md:text-base">
    <span className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-500" />
    {children}
  </span>
);
const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-brand-600 font-black text-xs md:text-sm tracking-wide">{children}</span>
);

const News: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);

  // Scroll to top when switching views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedNewsId]);

  const news: NewsItem[] = [
    {
      id: 1,
      title: language === 'ar' ? 'أكثر من 1,020,000 وجبة ساخنة عبر مواسم الحج والخير' : 'Over 1,020,000 Hot Meals Served Across the Seasons',
      date: language === 'ar' ? '15 يونيو 2025' : 'June 15, 2025',
      excerpt: language === 'ar' ? 'بفضل الله، تجاوز إجمالي ما أعددناه ووزعناه أكثر من مليون وجبة ساخنة منذ 1444هـ...' : 'By the grace of Allah, our total prepared and distributed meals have surpassed one million hot meals since 1444H...',
      content: language === 'ar' ? [
        'تفخر شركة مطبخ المضياف العربي للإعاشة بإعلان إنجاز نوعي في مسيرتها، حيث تمكنّا بفضل الله من إعداد وتوزيع أكثر من 1,020,000 وجبة ساخنة منذ عام 1444هـ وحتى عام 1446هـ، لصالح جهات حكومية وجمعيات ومؤسسات خيرية وشركات رائدة في مكة المكرمة.',
        'شملت هذه الأرقام برامج إفطار الصائم في رمضان، وإعاشة ضيوف الرحمن في مشاعر منى وعرفات خلال مواسم الحج، إلى جانب العقود اليومية مع الفنادق والجهات الرسمية.',
        'وقد جاء هذا الإنجاز ثمرة بنية تشغيلية قوية وفريق متمرس يضم أكثر من 350 موظفاً، وأسطول نقل مجهز بأحدث المواصفات الفنية والصحية.',
        'نتطلع في المضياف العربي إلى مواصلة خدمة ضيوف الرحمن بأعلى معايير الجودة والسلامة الغذائية، إيماناً منا بأن "إكرام ضيف الرحمن هو شرف لا يعلوه شرف".'
      ] : [
        'Al-Mudhayaf Al-Arabi Kitchen is proud to announce a major milestone: by the grace of Allah, we have prepared and distributed over 1,020,000 hot meals between 1444H and 1446H, serving government entities, charitable associations and leading companies across Makkah.',
        'These figures span Ramadan Iftar programs, catering for the Guests of Allah at the holy sites of Mina and Arafat during Hajj seasons, alongside our daily contracts with hotels and official institutions.',
        'This achievement is the fruit of a strong operational infrastructure and an experienced team of over 350 employees, backed by a transport fleet equipped to the latest technical and health standards.',
        'We look forward to continuing to serve the Guests of Allah with the highest standards of quality and food safety, in the firm belief that "Serving the Guests of Allah is the highest of honors."'
      ],
      image: IMG('07')
    },
    {
      id: 2,
      title: language === 'ar' ? 'افتتاح مطبخ الشرائع الجديد لخدمة المشاعر' : "New Al-Shara'i Kitchen Opens to Serve the Holy Sites",
      date: language === 'ar' ? '01 مايو 2025' : 'May 01, 2025',
      excerpt: language === 'ar' ? 'دخول مرفق إنتاج جديد في حي الشرائع لتعزيز طاقتنا التشغيلية في مواسم الحج والعمرة...' : 'A new production facility in the Al-Shara\'i district boosts our operational capacity for Hajj and Umrah seasons...',
      content: language === 'ar' ? [
        'ضمن خطة التوسع التشغيلي، يسر مطبخ المضياف العربي الإعلان عن افتتاح مطبخه الجديد في حي الشرائع بمكة المكرمة، ليصبح ثالث مرافق الإنتاج التابعة للشركة إلى جانب مطبخي الشوقية والعوالي.',
        'صُمم المطبخ الجديد وفق أحدث معايير السلامة الغذائية، ويمتلك طاقة إنتاجية عالية لتجهيز الوجبات الساخنة والجافة لضيوف الرحمن خلال مواسم الذروة في الحج والعمرة.',
        'يعزز هذا التوسع بنيتنا اللوجستية ونقاط التوزيع التي تغطي فنادق مكة والمشاعر المقدسة، بما يمنحنا مرونة أكبر في تنفيذ المشاريع الكبرى والطارئة.',
        'يأتي افتتاح مطبخ الشرائع تأكيداً على التزامنا بأن نكون الشريك الأول والموثوق لحلول الإعاشة المتكاملة في المملكة.'
      ] : [
        'As part of our operational expansion plan, Al-Mudhayaf Al-Arabi Kitchen is pleased to announce the opening of its new kitchen in the Al-Shara\'i district of Makkah — becoming the company\'s third production facility alongside the Al-Shoqiyah and Al-Awali kitchens.',
        'The new kitchen is designed to the latest food-safety standards and holds high production capacity to prepare hot and dry meals for the Guests of Allah during peak Hajj and Umrah seasons.',
        'This expansion strengthens our logistics infrastructure and distribution points covering Makkah hotels and the holy sites, giving us greater flexibility to execute large-scale and emergency projects.',
        'The opening of the Al-Shara\'i kitchen reaffirms our commitment to being the trusted and leading partner for integrated catering solutions in the Kingdom.'
      ],
      image: IMG('13')
    },
    {
      id: 3,
      title: language === 'ar' ? 'تجديد اعتماد شهادة HACCP للسلامة الغذائية' : 'HACCP Food-Safety Certification Renewed',
      date: language === 'ar' ? '20 مارس 2025' : 'March 20, 2025',
      excerpt: language === 'ar' ? 'نجاح الشركة في تجديد اعتماد نظام تحليل المخاطر ونقاط التحكم الحرجة...' : 'The company successfully renews its Hazard Analysis & Critical Control Points certification...',
      content: language === 'ar' ? [
        'حصل مطبخ المضياف العربي على تجديد اعتماد شهادة HACCP (تحليل المخاطر ونقاط التحكم الحرجة) وفق إجراءات QSP والمعايير الدولية للسلامة الغذائية، بعد اجتياز عملية تدقيق شاملة لمرافقه وعملياته.',
        'تُعنى إدارة الجودة والسلامة الغذائية لدينا بتطبيق صارم لأنظمة السلامة في مختلف مراحل الإعداد والتعبئة والتوزيع، لضمان غذاء آمن ونظيف يلبي أعلى المعايير الصحية.',
        'يأتي هذا التجديد ليؤكد أن الجودة والنزاهة والكفاءة أولويات لا تُساوم لدى المضياف العربي، وأن السلامة الغذائية ركيزة أساسية في كل ما نقدمه.',
        'مع المضياف العربي، الجودة ليست خياراً... بل أساس.'
      ] : [
        'Al-Mudhayaf Al-Arabi Kitchen has renewed its HACCP (Hazard Analysis & Critical Control Points) certification in line with QSP procedures and international food-safety standards, following a comprehensive audit of its facilities and operations.',
        'Our Quality & Food Safety Department enforces strict safety systems across every stage of preparation, packaging and distribution, ensuring safe and clean food that meets the highest health standards.',
        'This renewal reaffirms that quality, integrity and efficiency are non-negotiable priorities at Al-Mudhayaf Al-Arabi, and that food safety is a cornerstone of everything we deliver.',
        'With Al-Mudhayaf Al-Arabi, quality is not an option… it\'s the foundation.'
      ],
      image: IMG('16')
    },
    {
      id: 4,
      title: language === 'ar' ? 'برنامج إفطار صائم رمضان بالتعاون مع جمعية البر' : "Ramadan Iftar Program with Al-Birr Charity",
      date: language === 'ar' ? '10 مارس 2025' : 'March 10, 2025',
      excerpt: language === 'ar' ? 'إطلاق برنامج موسمي لإفطار الصائمين بالتعاون مع جمعية البر الخيرية بالشرائع...' : 'Launching a seasonal Iftar program in partnership with Al-Birr Charity in Al-Shara\'i...',
      content: language === 'ar' ? [
        'نفّذ مطبخ المضياف العربي برنامج إفطار صائم خلال شهر رمضان المبارك بالتعاون مع جمعية البر الخيرية بالشرائع، استمراراً لشراكة ممتدة قدّمنا خلالها مئات الآلاف من الوجبات الساخنة في مواسم سابقة.',
        'استهدف البرنامج المساجد والجمعيات والقطاعات الحكومية والخاصة وضيوف الرحمن، عبر تجهيز وتوزيع وجبات ساخنة وفق جداول دقيقة تضمن وصولها طازجة وفي وقتها.',
        'وعلى مدى المواسم الماضية، تعاونّا مع عدد من الجمعيات الخيرية مثل جمعية الإحسان والتكافل وجمعية أجياد الخيرية، إلى جانب دعمنا لمشاريع كبرى لشركات رائدة في خدمة الحجيج.',
        'يجسّد هذا البرنامج رسالتنا في خدمة ضيوف الرحمن وإكرامهم، ويعكس دورنا كشريك مجتمعي موثوق في مكة المكرمة.'
      ] : [
        'Al-Mudhayaf Al-Arabi Kitchen carried out a Ramadan Iftar program during the holy month in partnership with Al-Birr Charity in Al-Shara\'i, continuing a long-standing partnership through which we have served hundreds of thousands of hot meals in previous seasons.',
        'The program targeted mosques, charities, government and private sectors, and the Guests of Allah, preparing and distributing hot meals on precise schedules that ensure they arrive fresh and on time.',
        'Over recent seasons we have collaborated with several charitable associations such as the Ihsan & Takafol Association and Ajiad Charity, in addition to supporting major projects for leading companies serving pilgrims.',
        'This program embodies our mission of serving and honoring the Guests of Allah, reflecting our role as a trusted community partner in Makkah.'
      ],
      image: IMG('09')
    }
  ];

  // Helper to get the selected item
  const selectedItem = news.find(item => item.id === selectedNewsId);

  // VIEW: Single News Details — clean reading layout
  if (selectedNewsId && selectedItem) {
    const shareUrl = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
    const shareLinks = [
      { label: 'Twitter', Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${shareUrl}` },
      { label: 'Facebook', Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
      { label: 'LinkedIn', Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
    ];

    return (
      <div className="overflow-hidden">
        {/* ===== ARTICLE HERO (dark) ===== */}
        <section className="relative bg-[#14110e] text-white">
          <div className="absolute -top-24 end-[10%] w-[32rem] h-[32rem] bg-secondary-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -start-40 w-[36rem] h-[36rem] bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-5xl mx-auto px-6 py-14 md:py-20 relative">
            <motion.div {...fadeUp}>
              <button
                onClick={() => setSelectedNewsId(null)}
                className="inline-flex items-center gap-2 text-secondary-400 font-bold mb-7 hover:text-secondary-300 transition-colors"
              >
                {ar ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                {ar ? 'العودة للأخبار' : 'Back to News'}
              </button>
              <Eyebrow>
                <span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4" /> <span dir="ltr">{selectedItem.date}</span></span>
              </Eyebrow>
              <h1 className="mt-5 font-display font-black leading-[1.1] text-4xl sm:text-5xl md:text-6xl max-w-4xl">
                {selectedItem.title}
              </h1>
              <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl">{selectedItem.excerpt}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="mt-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 aspect-[16/7]"
            >
              <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </section>

        {/* ===== BODY (light) ===== */}
        <section className="bg-[#fbf7ef] text-ink py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-6">
            <article className="max-w-3xl mx-auto">
              <span className="block h-1.5 w-20 rounded-full bg-gradient-to-r from-brand-600 to-secondary-500 mb-8" />
              <div className="text-gray-700 leading-loose text-lg">
                {selectedItem.content.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`mb-7 ${idx === 0 ? 'first-letter:text-6xl first-letter:font-display first-letter:font-black first-letter:text-brand-700 first-letter:float-start first-letter:me-3 first-letter:leading-[0.85]' : ''}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Share */}
              <div className="mt-12 pt-8 border-t border-[#eee1d0]">
                <p className="text-brand-800 font-display font-black text-xl mb-4">
                  {ar ? 'شارك هذا الخبر' : 'Share this story'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {shareLinks.map(({ label, Icon, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Share on ${label}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white border border-[#eee1d0] px-5 py-2.5 text-sm font-bold text-gray-700 hover:border-brand-600 hover:text-brand-700 hover:shadow-md transition-all"
                    >
                      <Icon className="w-4 h-4" /> <span dir="ltr">{label}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-12 text-center">
                <Button variant="outline" size="lg" onClick={() => setSelectedNewsId(null)}>
                  {ar ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {ar ? 'العودة للأخبار' : 'Back to News'}
                </Button>
              </div>
            </article>
          </div>
        </section>
      </div>
    );
  }

  // VIEW: News List — editorial layout
  const [featured, ...rest] = news;

  return (
    <div className="overflow-hidden">

      {/* ===== PAGE HEADER (compact, light) ===== */}
      <section className="bg-gradient-to-b from-[#f7f3ec] to-[#f4f1ec] border-b border-[#eadfce]">
        <motion.div {...fadeUp} className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <span className="inline-flex items-center gap-3 text-brand-600 font-bold text-sm">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-500" />
            {ar ? 'غرفة الأخبار' : 'Newsroom'}
          </span>
          <h1 className="mt-3 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'الأخبار' : 'News'}</h1>
          <p className="mt-3 text-gray-600 text-base md:text-lg max-w-2xl leading-relaxed">
            {ar
              ? 'إنجازاتنا، توسعاتنا، وشهاداتنا — قصص من الميدان توثّق مسيرة خدمة ضيوف الرحمن في مكة المكرمة.'
              : 'Our milestones, expansions and certifications — stories from the field documenting our service to the Guests of Allah in Makkah.'}
          </p>
        </motion.div>
      </section>

      {/* ===== FEATURED (light) ===== */}
      {featured && (
        <section className="bg-[#fbf7ef] text-ink py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div {...fadeUp} className="mb-10">
              <Kicker>{ar ? 'المقال الرئيسي' : 'Featured story'}</Kicker>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'أبرز أخبارنا' : 'Our latest highlights'}</h2>
            </motion.div>
            <motion.button
              {...fadeUp}
              onClick={() => setSelectedNewsId(featured.id)}
              className="group block w-full text-start rounded-2xl bg-white border border-[#eee1d0] shadow-sm overflow-hidden"
            >
              <div className="grid lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto min-h-[300px] overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 start-4 px-3 py-1.5 rounded-full bg-secondary-500 text-ink text-xs font-black">{ar ? 'المقال الرئيسي' : 'Featured'}</span>
                </div>
                <div className="p-7 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-brand-600 text-xs font-black mb-4">
                    <Calendar className="w-4 h-4" /> <span dir="ltr">{featured.date}</span>
                  </div>
                  <h3 className="font-display font-black text-2xl md:text-4xl text-brand-800 leading-tight mb-4 group-hover:text-brand-600 transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-brand-700 font-bold group-hover:gap-3 transition-all">
                    {ar ? 'اقرأ المزيد' : 'Read more'}
                    {ar ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </span>
                  <span className="block mt-6 h-1.5 w-20 rounded-full bg-gradient-to-r from-brand-600 to-secondary-500" />
                </div>
              </div>
            </motion.button>
          </div>
        </section>
      )}

      {/* ===== ARTICLE GRID (light) ===== */}
      <section className="bg-[#f5ead9] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Kicker>{ar ? 'المزيد من الأخبار' : 'More stories'}</Kicker>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'من أرشيف غرفة الأخبار' : 'From the newsroom archive'}</h2>
            </div>
            <p className="md:max-w-sm text-gray-600 leading-relaxed">{ar ? 'توسعات، شهادات جودة، وبرامج موسمية توثّق أثرنا في الميدان.' : 'Expansions, certifications and seasonal programs documenting our field impact.'}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rest.map((item, i) => (
              <motion.button
                key={item.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                onClick={() => setSelectedNewsId(item.id)}
                className="group text-start rounded-2xl bg-white border border-[#eee1d0] shadow-sm overflow-hidden h-full flex flex-col"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <span className="absolute top-4 end-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14110e]/70 border border-white/15 text-white text-xs font-bold backdrop-blur">
                    <Calendar className="w-3.5 h-3.5" /> <span dir="ltr">{item.date}</span>
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-xl text-brand-800 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed flex-1">{item.excerpt}</p>
                  <span className="self-start inline-flex items-center gap-2 text-brand-700 font-bold transition-all group-hover:gap-3">
                    {ar ? 'اقرأ المزيد' : 'Read more'}
                    {ar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
