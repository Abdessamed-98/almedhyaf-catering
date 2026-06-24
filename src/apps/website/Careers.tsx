import React, { useState } from 'react';
import { Briefcase, Upload, CheckCircle, FileText, HeartHandshake, TrendingUp, GraduationCap, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button, Field, Input, Select } from '../../ui';
import { motion } from 'motion/react';

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

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

const Careers: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [sent, setSent] = useState(false);
  const [fileName, setFileName] = useState('');

  const benefits = [
    {
      icon: HeartHandshake,
      title: ar ? 'رسالة نعتز بها' : 'A Mission We Honor',
      desc: ar ? 'نعمل بروح الفريق الواحد تحت شعار: إكرام ضيف الرحمن هو شرف لا يعلوه شرف.' : 'We work as one team under our motto: serving the Guests of Allah is the highest of honors.',
    },
    {
      icon: TrendingUp,
      title: ar ? 'فرص للنمو' : 'Room to Grow',
      desc: ar ? 'مسارات وظيفية واضحة وترقيات تكافئ الموهبة والإخلاص في بيئة إعاشة محترفة.' : 'Clear career paths and promotions that reward talent and dedication in a professional catering environment.',
    },
    {
      icon: GraduationCap,
      title: ar ? 'تدريب وسلامة غذائية' : 'Training & Food Safety',
      desc: ar ? 'برامج تطوير مستمرة وتدريب على معايير HACCP والسلامة الغذائية على يد خبراء.' : 'Continuous development programs and training on HACCP and food-safety standards led by experts.',
    },
    {
      icon: Sparkles,
      title: ar ? 'مزايا تنافسية' : 'Competitive Rewards',
      desc: ar ? 'رواتب مجزية وحوافز وبدلات تليق بجهدك وعطائك في مواسم الخير.' : 'Rewarding salaries, incentives and allowances worthy of your effort across the seasons.',
    },
  ];

  const positions = ar
    ? ['مدير فرع / مطبخ', 'طاهٍ', 'مسؤول سلامة غذائية', 'سائق توصيل', 'طاقم التعبئة والتغليف']
    : ['Branch / Kitchen Manager', 'Chef', 'Food Safety Officer', 'Delivery Driver', 'Packaging Crew'];

  return (
    <div className="overflow-hidden">

      {/* ===== BENEFITS (light) ===== */}
      <section id="benefits" className="bg-[#fbf7ef] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Kicker>{ar ? 'لماذا نحن' : 'Why us'}</Kicker>
              <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'لماذا تعمل معنا' : 'Why work with us'}</h2>
            </div>
            <p className="md:max-w-sm text-gray-600 leading-relaxed">{ar ? 'بيئة عمل احترافية تكافئ المواهب وتستثمر في تطوير فريقها.' : 'A professional environment that rewards talent and invests in its team.'}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className="relative overflow-hidden rounded-2xl bg-white border border-[#eee1d0] p-7 shadow-sm h-full"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center mb-5 shadow-lg">
                  <b.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-display font-bold text-brand-800 mb-2">{b.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{b.desc}</p>
                <span className="block mt-5 h-1.5 w-16 rounded-full bg-gradient-to-r from-brand-600 to-secondary-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POSITIONS (dark accent) ===== */}
      <section className="bg-[#221713] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div {...fadeUp}>
            <Eyebrow>{ar ? 'الوظائف المتاحة' : 'Open positions'}</Eyebrow>
            <h2 className="mt-3 font-display font-black text-3xl md:text-5xl leading-tight">{ar ? 'فرص للانضمام إلى فريقنا' : 'Roles to join our team'}</h2>
            <p className="mt-4 text-white/70 text-lg leading-relaxed max-w-xl">{ar ? 'نبحث باستمرار عن كوادر مؤهلة في مختلف مراحل الإعداد والتعبئة والتوصيل والجودة.' : 'We continuously seek qualified talent across preparation, packaging, delivery and quality.'}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {positions.map((p, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/10 p-6"
              >
                <span className="absolute -start-8 -bottom-8 w-24 h-24 rounded-full bg-secondary-500/10" />
                <Num className="block text-sm font-black text-secondary-400">{`0${i + 1}`}</Num>
                <b className="block mt-2 text-lg leading-snug">{p}</b>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== APPLICATION FORM (light) ===== */}
      <section id="apply" className="bg-[#f7f1e8] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp}>
            <div className="rounded-2xl bg-white border border-[#eee1d0] shadow-sm overflow-hidden grid lg:grid-cols-5">
              {/* Side panel (dark) */}
              <div className="lg:col-span-2 relative overflow-hidden bg-[#14110e] text-white p-8 md:p-12">
                <span className="absolute -end-24 -top-24 w-72 h-72 rounded-full bg-secondary-500/15 blur-3xl" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-6">
                    <Briefcase className="w-7 h-7 text-secondary-400" />
                  </div>
                  <Eyebrow>{ar ? 'التوظيف' : 'Recruitment'}</Eyebrow>
                  <h2 className="mt-3 font-display font-black text-2xl md:text-4xl leading-tight">
                    {ar ? 'نموذج التوظيف السريع' : 'Quick Application Form'}
                  </h2>
                  <p className="mt-4 text-white/75 leading-relaxed">
                    {ar
                      ? 'املأ بياناتك وأرفق سيرتك الذاتية، وسيتواصل معك فريق التوظيف لدينا في أقرب وقت.'
                      : 'Fill in your details and attach your CV — our recruitment team will reach out to you soon.'}
                  </p>
                  <p className="mt-8 font-display text-lg md:text-xl leading-relaxed text-white/90">
                    {ar ? '«إكرام ضيف الرحمن شرف لا يعلوه شرف.»' : '“Serving the Guests of Allah is the highest of honors.”'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-3 p-7 md:p-12">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-12 h-12 text-success" />
                    </div>
                    <h3 className="font-display font-black text-2xl text-brand-800 mb-2">
                      {ar ? 'تم إرسال طلبك بنجاح!' : 'Application sent successfully!'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">
                      {ar ? 'سيقوم فريق التوظيف بمراجعة طلبك والتواصل معك قريباً.' : 'Our recruitment team will review your application and contact you soon.'}
                    </p>
                    <Button variant="outline" size="lg" onClick={() => { setSent(false); setFileName(''); }}>
                      {ar ? 'إرسال طلب آخر' : 'Submit another application'}
                    </Button>
                  </div>
                ) : (
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                    <Field label={ar ? 'الاسم الثلاثي' : 'Full Name'} htmlFor="career-name">
                      <Input id="career-name" type="text" required placeholder={ar ? 'الاسم الكامل' : 'Full Name'} />
                    </Field>
                    <Field label={ar ? 'رقم الجوال' : 'Mobile Number'} htmlFor="career-phone">
                      <Input id="career-phone" type="tel" required placeholder="05xxxxxxxx" dir="ltr" />
                    </Field>
                    <Field label={ar ? 'الجنسية' : 'Nationality'} htmlFor="career-nationality">
                      <Input id="career-nationality" type="text" placeholder={ar ? 'الجنسية' : 'Nationality'} />
                    </Field>
                    <Field label={ar ? 'موقع المطبخ' : 'Kitchen Location'} htmlFor="career-city">
                      <Select id="career-city">
                        <option>{ar ? 'الشوقية - مكة' : 'Al-Shoqiyah - Makkah'}</option>
                        <option>{ar ? 'العوالي - مكة' : 'Al-Awali - Makkah'}</option>
                        <option>{ar ? 'الشرائع - مكة' : "Al-Shara'i - Makkah"}</option>
                        <option>{ar ? 'أخرى' : 'Other'}</option>
                      </Select>
                    </Field>
                    <Field label={ar ? 'الوظيفة المرغوبة' : 'Desired Position'} htmlFor="career-position" className="md:col-span-2">
                      <Select id="career-position">
                        {positions.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </Select>
                    </Field>

                    <label
                      htmlFor="career-cv"
                      className={`md:col-span-2 border-2 border-dashed rounded-2xl p-7 text-center transition-colors cursor-pointer group block ${
                        fileName ? 'border-brand-500 bg-brand-50/50' : 'border-[#e4d6c2] hover:bg-[#fbf7ef] hover:border-brand-400'
                      }`}
                    >
                      {fileName ? (
                        <FileText className="w-9 h-9 text-brand-600 mx-auto mb-3" />
                      ) : (
                        <Upload className="w-9 h-9 text-gray-400 mx-auto mb-3 group-hover:text-brand-500 transition-colors" />
                      )}
                      <p className={`font-bold ${fileName ? 'text-brand-700' : 'text-gray-600'}`}>
                        {fileName || (ar ? 'ارفق السيرة الذاتية (PDF, DOC)' : 'Upload CV (PDF, DOC)')}
                      </p>
                      {!fileName && (
                        <p className="text-xs text-gray-400 mt-1">{ar ? 'اسحب الملف أو اضغط للاختيار' : 'Drag a file or click to browse'}</p>
                      )}
                      <input
                        id="career-cv"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                      />
                    </label>

                    <div className="md:col-span-2 mt-2">
                      <Button type="submit" variant="gold" size="lg" block>
                        {ar ? 'إرسال الطلب' : 'Submit Application'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
