import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { WebsitePage } from '../../types';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, ease: 'easeOut' },
};

// NOTE: placeholder Q&A — the client will provide the final FAQ content.
const FAQS = [
  {
    q: 'هل تقدّمون خدمات الإعاشة لمشاريع الحج والعمرة؟', qEn: 'Do you cater for Hajj & Umrah projects?',
    a: 'نعم، لدينا خبرة واسعة في إعاشة ضيوف الرحمن داخل المشاعر المقدسة، وننفّذ مشاريع موسمية كبرى بتنسيق ميداني دقيق.',
    aEn: 'Yes. We have extensive experience catering the Guests of Allah across the holy sites and run large seasonal projects with precise field coordination.',
  },
  {
    q: 'ما الحد الأدنى لعدد الوجبات؟', qEn: 'Is there a minimum number of meals?',
    a: 'يعتمد الحد الأدنى على نوع المشروع والمناسبة. تواصل معنا بتفاصيل مشروعك وسنزوّدك بأنسب الخيارات.',
    aEn: 'The minimum depends on the project type and occasion. Share your project details and we’ll advise on the best options.',
  },
  {
    q: 'كيف أطلب عرض سعر؟', qEn: 'How do I request a quote?',
    a: 'عبّئ نموذج «اطلب عرض سعر» في صفحة التواصل أو أسفل الصفحة الرئيسية، وسيتواصل معك فريقنا بعرض مخصّص.',
    aEn: 'Fill in the “Request a quote” form on the Contact page or at the bottom of the home page, and our team will reply with a tailored proposal.',
  },
  {
    q: 'هل توفّرون خدمة التوصيل؟', qEn: 'Do you offer delivery?',
    a: 'نعم، لدينا أسطول مجهّز وشبكة توزيع تغطّي مكة المكرمة والمشاعر ومواقع الفعاليات.',
    aEn: 'Yes — we have an equipped fleet and a distribution network covering Makkah, the holy sites and event locations.',
  },
  {
    q: 'هل القوائم قابلة للتخصيص؟', qEn: 'Are the menus customizable?',
    a: 'بالتأكيد. نصمّم القوائم حسب نوع المناسبة وعدد الضيوف وتفضيلاتكم الغذائية.',
    aEn: 'Absolutely. We design menus around your occasion, guest count and dietary preferences.',
  },
  {
    q: 'ما معايير السلامة الغذائية لديكم؟', qEn: 'What are your food-safety standards?',
    a: 'نطبّق نظام HACCP ومعايير الهيئة العامة للغذاء والدواء في كل مرحلة، مع توثيق ومتابعة مستمرة للجودة.',
    aEn: 'We apply HACCP and SFDA standards at every stage, with continuous documentation and quality monitoring.',
  },
  {
    q: 'ما المناطق التي تغطّونها؟', qEn: 'Which areas do you cover?',
    a: 'نخدم مكة المكرمة والمشاعر المقدسة، بالإضافة إلى الفنادق والفعاليات داخل نطاق التشغيل.',
    aEn: 'We serve Makkah and the holy sites, as well as hotels and events within our operating range.',
  },
  {
    q: 'كيف يتم التعاقد والدفع؟', qEn: 'How do contracting and payment work?',
    a: 'بعد الاتفاق على نطاق المشروع نوقّع عقداً واضحاً يحدّد الخدمات والمواعيد وآلية الدفع المناسبة لكم.',
    aEn: 'After agreeing on the scope, we sign a clear contract defining the services, schedule and a payment method that suits you.',
  },
];

const FAQ: React.FC<{ onNavigate?: (p: WebsitePage) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="bg-parchment text-ink">
      <section className="bg-parchment border-b border-[#eee1d0]">
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-8 md:pt-16 md:pb-10">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-3 text-brand-600 font-black text-xs md:text-sm tracking-wide"><span className="h-px w-10 bg-secondary-500/60" />{ar ? 'مركز المساعدة' : 'Help center'}</span>
            <h1 className="mt-3 font-display font-black text-3xl md:text-4xl text-brand-800 leading-tight">{ar ? 'الأسئلة الشائعة' : 'Frequently asked questions'}</h1>
            <p className="mt-3 text-gray-600 leading-relaxed">{ar ? 'إجابات سريعة عن أكثر ما يسأل عنه عملاؤنا حول خدمات الإعاشة والضيافة.' : 'Quick answers to what our clients most often ask about our catering services.'}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const on = open === i;
            return (
              <div key={i} className="bg-white border border-[#eee1d0] rounded-2xl overflow-hidden">
                <button onClick={() => setOpen(on ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-start">
                  <span className="font-bold text-brand-800">{ar ? f.q : f.qEn}</span>
                  <ChevronDown className={`w-5 h-5 text-brand-600 shrink-0 transition-transform ${on ? 'rotate-180' : ''}`} />
                </button>
                {on && <div className="px-5 pb-5 -mt-1 text-gray-600 leading-relaxed">{ar ? f.a : f.aEn}</div>}
              </div>
            );
          })}
        </div>

        {/* still need help */}
        <div className="mt-10 rounded-2xl bg-white border border-[#eee1d0] shadow-sm p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-start">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shrink-0"><HelpCircle className="w-6 h-6" /></span>
            <div>
              <h3 className="font-display font-bold text-lg text-brand-800">{ar ? 'لم تجد إجابتك؟' : 'Didn’t find your answer?'}</h3>
              <p className="text-sm text-gray-500">{ar ? 'فريقنا جاهز للرد على استفساراتك.' : 'Our team is ready to help.'}</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.('CONTACT')} className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-full transition-colors">{ar ? 'تواصل معنا' : 'Contact us'}</button>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
