import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CalendarDays, ArrowLeft, ArrowRight, Clock } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

interface Article {
  cat: string; catEn: string;
  title: string; titleEn: string;
  excerpt: string; excerptEn: string;
  body: string[]; bodyEn: string[];
  img: string; date: string; read: number;
}

// NOTE: placeholder articles — the client will supply the real blog content.
const ARTICLES: Article[] = [
  {
    cat: 'السلامة الغذائية', catEn: 'Food safety',
    title: 'كيف نضمن سلامة الغذاء في مواسم الذروة', titleEn: 'Ensuring food safety at peak season',
    excerpt: 'من سلسلة التبريد إلى نقاط التحكم الحرجة — نظرة على ما يحدث خلف الكواليس لإبقاء كل وجبة آمنة.',
    excerptEn: 'From the cold chain to critical control points — a look behind the scenes at keeping every meal safe.',
    body: [
      'في مواسم الحج ورمضان يتضاعف حجم الإنتاج آلاف المرات، ومعه تتضاعف المسؤولية تجاه سلامة كل وجبة تصل إلى ضيوف الرحمن.',
      'نعتمد نظام HACCP لتحديد نقاط التحكم الحرجة في كل مرحلة: الاستلام، التخزين، التحضير، التبريد، والنقل — مع توثيق درجات الحرارة في كل خطوة.',
      'الفِرق الميدانية مدرّبة على بروتوكولات صارمة، وأي انحراف بسيط يوقف الخط فوراً حتى تتم المعالجة.',
    ],
    bodyEn: [
      'During Hajj and Ramadan, production multiplies thousands of times — and so does the responsibility for every meal.',
      'We rely on HACCP to define critical control points at each stage: receiving, storage, prep, chilling and transport — with temperatures logged at every step.',
      'Field teams are trained on strict protocols; any deviation halts the line immediately until resolved.',
    ],
    img: 'concept/01.jpg', date: '2025-05-12', read: 4,
  },
  {
    cat: 'الحج والعمرة', catEn: 'Hajj & Umrah',
    title: 'لوجستيات الإعاشة في المشاعر المقدسة', titleEn: 'Catering logistics across the holy sites',
    excerpt: 'كيف نوصل عشرات آلاف الوجبات في نوافذ زمنية ضيّقة وزحام غير مسبوق.',
    excerptEn: 'How we deliver tens of thousands of meals within tight windows and unmatched crowds.',
    body: [
      'التوزيع في المشاعر تحدٍّ لوجستي فريد: مسارات مزدحمة، نوافذ زمنية قصيرة، وأعداد هائلة من المستفيدين.',
      'نخطّط مسبقاً لنقاط تحميل واضحة وفِرق توزيع موزّعة جغرافياً لتقليل التأخير في الذروة.',
    ],
    bodyEn: [
      'Distribution across the holy sites is a unique logistics challenge: crowded routes, short windows and huge volumes.',
      'We pre-plan clear loading points and geographically distributed teams to minimize peak-time delays.',
    ],
    img: 'services/hajj-umrah.jpg', date: '2025-04-28', read: 5,
  },
  {
    cat: 'الإعاشة', catEn: 'Catering',
    title: 'تخطيط القوائم لكبرى الولائم', titleEn: 'Menu planning for grand banquets',
    excerpt: 'موازنة الذوق، التكلفة، والكمية لإخراج وليمة تليق بالمناسبة.',
    excerptEn: 'Balancing taste, cost and volume to deliver a banquet worthy of the occasion.',
    body: [
      'تبدأ كل وليمة بفهم المناسبة وعدد الضيوف وتفضيلاتهم، ثم نبني قائمة متوازنة تجمع الأصالة والتنوّع.',
      'نراعي قابلية التحضير بكميات كبيرة دون التأثير على الجودة أو زمن التقديم.',
    ],
    bodyEn: [
      'Every banquet starts with the occasion, guest count and preferences, then a balanced menu of authenticity and variety.',
      'We account for large-batch feasibility without compromising quality or serving time.',
    ],
    img: 'services/banquets.jpg', date: '2025-04-10', read: 3,
  },
  {
    cat: 'التموين', catEn: 'Supply chain',
    title: 'إدارة سلاسل التموين والتبريد', titleEn: 'Managing supply & cold chains',
    excerpt: 'من المورّد إلى الطبق — كيف نحافظ على الجودة عبر كل حلقة في السلسلة.',
    excerptEn: 'From supplier to plate — keeping quality across every link in the chain.',
    body: [
      'الجودة تبدأ من اختيار المورّدين الموثوقين ومتابعة معايير الاستلام بدقّة.',
      'نحافظ على سلسلة تبريد غير منقطعة من المستودع حتى نقطة التوزيع لضمان الطزاجة.',
    ],
    bodyEn: [
      'Quality starts with trusted suppliers and rigorous receiving standards.',
      'We maintain an unbroken cold chain from warehouse to distribution to guarantee freshness.',
    ],
    img: 'services/buffets.jpg', date: '2025-03-22', read: 4,
  },
  {
    cat: 'السلامة الغذائية', catEn: 'Food safety',
    title: 'معايير HACCP داخل مطابخنا', titleEn: 'HACCP standards inside our kitchens',
    excerpt: 'نظرة عملية على تطبيق تحليل المخاطر ونقاط التحكم الحرجة يومياً.',
    excerptEn: 'A practical look at applying hazard analysis & critical control points daily.',
    body: [
      'HACCP ليس شهادة تُعلّق على الجدار، بل ممارسة يومية في كل ركن من المطبخ.',
      'نوثّق، نراجع، ونحسّن باستمرار لضمان أعلى درجات الأمان الغذائي.',
    ],
    bodyEn: [
      'HACCP is not a certificate on the wall — it is a daily practice in every corner of the kitchen.',
      'We document, review and continuously improve to ensure the highest food safety.',
    ],
    img: 'services/events.jpg', date: '2025-03-05', read: 3,
  },
  {
    cat: 'الحج والعمرة', catEn: 'Hajj & Umrah',
    title: 'خدمة ضيوف الرحمن: دروس من موسم الحج', titleEn: 'Serving the Guests of Allah: lessons from Hajj',
    excerpt: 'ما تعلّمناه من تشغيل عالي الضغط، وكيف نطبّقه في كل موسم.',
    excerptEn: 'What we learned from high-pressure operations and how we apply it each season.',
    body: [
      'كل موسم حج يضيف لنا خبرة في التعامل مع الذروة والطوارئ.',
      'نحوّل هذه الدروس إلى إجراءات قابلة للتكرار ترفع جاهزيتنا عاماً بعد عام.',
    ],
    bodyEn: [
      'Every Hajj season adds experience in handling peaks and emergencies.',
      'We turn these lessons into repeatable procedures that raise our readiness year after year.',
    ],
    img: 'services/iftar.jpg', date: '2025-02-18', read: 5,
  },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const blogSlug = () => { const m = window.location.hash.match(/^#website\/blog\/(.+)$/); return m ? decodeURIComponent(m[1]) : null; };

const Blog: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [sel, setSel] = useState<string | null>(() => blogSlug());
  useEffect(() => {
    const apply = () => setSel(blogSlug());
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);
  const selected = sel ? (ARTICLES.find(a => slugify(a.titleEn) === sel) ?? null) : null;

  const cats = ['all', ...Array.from(new Set(ARTICLES.map(a => a.catEn)))];
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? ARTICLES : ARTICLES.filter(a => a.catEn === filter);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(ar ? 'ar-SA-u-nu-latn' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const catLabel = (c: string) => c === 'all' ? (ar ? 'الكل' : 'All') : (ar ? ARTICLES.find(a => a.catEn === c)!.cat : c);

  // ── article detail ──
  if (selected) {
    return (
      <div className="bg-parchment text-ink">
        <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <button onClick={() => { window.location.hash = '#website/blog'; }} className="inline-flex items-center gap-2 text-brand-700 font-bold hover:text-brand-800 mb-8">
            {ar ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            {ar ? 'العودة للمدونة' : 'Back to Blog'}
          </button>
          <span className="text-brand-600 font-black text-xs tracking-wide">{ar ? selected.cat : selected.catEn}</span>
          <h1 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? selected.title : selected.titleEn}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />{fmtDate(selected.date)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" />{selected.read} {ar ? 'دقائق قراءة' : 'min read'}</span>
          </div>
          <img src={selected.img} alt={ar ? selected.title : selected.titleEn} className="mt-8 w-full aspect-[16/9] object-cover rounded-2xl border border-[#eee1d0]" />
          <div className="mt-8 space-y-5 text-gray-700 leading-loose text-lg">
            {(ar ? selected.body : selected.bodyEn).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </article>
      </div>
    );
  }

  // ── listing ──
  return (
    <div className="bg-parchment text-ink">
      <section className="bg-parchment text-ink border-b border-[#eee1d0]">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8 md:pt-16 md:pb-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-3 text-brand-600 font-black text-xs md:text-sm tracking-wide"><span className="h-px w-10 bg-secondary-500/60" />{ar ? 'مدونة المضياف' : 'Al-Mudhayaf Blog'}</span>
            <h1 className="mt-3 font-display font-black text-3xl md:text-4xl text-brand-800 leading-tight">{ar ? 'المدونة' : 'Blog'}</h1>
            <p className="mt-3 max-w-2xl text-gray-600 leading-relaxed">{ar ? 'مقالات ورؤى حول الإعاشة، والحج والعمرة، والتموين، وسلامة الغذاء — من فريق المضياف العربي.' : 'Articles and insights on catering, Hajj & Umrah, supply and food safety — from the Al-Mudhayaf team.'}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* category filter */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === c ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-white text-brand-700 border border-[#eee1d0] hover:border-secondary-500/50'}`}>{catLabel(c)}</button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {list.map((a, i) => (
            <motion.button key={i} {...fadeUp} onClick={() => { window.location.hash = '#website/blog/' + slugify(a.titleEn); }} className="group text-start rounded-2xl overflow-hidden bg-white border border-[#eee1d0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={a.img} alt={ar ? a.title : a.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 start-3 px-3 py-1 rounded-full bg-white/90 text-brand-700 text-[11px] font-bold">{ar ? a.cat : a.catEn}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{fmtDate(a.date)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{a.read} {ar ? 'د' : 'min'}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-brand-800 leading-snug group-hover:text-brand-600 transition-colors">{ar ? a.title : a.titleEn}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">{ar ? a.excerpt : a.excerptEn}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  {ar ? 'اقرأ المزيد' : 'Read more'} {ar ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
