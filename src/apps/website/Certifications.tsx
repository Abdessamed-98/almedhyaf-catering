import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ShieldCheck, BadgeCheck, Landmark, Award, ScrollText, X } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

// Accreditations + certificates. NOTE: the modal shows placeholder certificate frames —
// replace each frame with <img src="certs/..."/> once the client provides the real scans.
const Certifications: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [open, setOpen] = useState(false);

  const certs = [
    { n: 'HACCP', sub: '', d: ar ? 'تطبيق صارم لأنظمة تحليل المخاطر ونقاط التحكم الحرجة.' : 'Strict hazard analysis & critical control points.', Icon: ShieldCheck },
    { n: ar ? 'سلامة الغذاء' : 'Food safety', sub: 'SFDA', d: ar ? 'توافق مع الهيئة العامة للغذاء والدواء.' : 'Compliant with the Saudi Food & Drug Authority.', Icon: BadgeCheck },
    { n: ar ? 'أمانة العاصمة المقدسة' : 'Makkah Municipality', sub: '', d: ar ? 'تراخيص ورقابة بلدية على المطابخ.' : 'Municipal licensing & kitchen inspection.', Icon: Landmark },
    { n: ar ? 'الجهات الحكومية' : 'Government bodies', sub: '', d: ar ? 'اعتمادات وتأهيل لمشاريع الجهات الحكومية.' : 'Approvals & qualification for government projects.', Icon: Award },
  ];

  return (
    <section className="bg-[#fbf7ef] text-ink py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-brand-600 font-black text-xs md:text-sm tracking-wide">{ar ? 'الاعتمادات والجودة' : 'Accreditation & quality'}</span>
            <h2 className="mt-2 font-display font-black text-3xl md:text-4xl text-brand-800 leading-tight">{ar ? 'معتمدون من الجهات المختصة' : 'Accredited by the competent authorities'}</h2>
            <p className="mt-3 text-gray-600 leading-relaxed max-w-xl">{ar ? 'نلتزم بأعلى معايير السلامة والجودة، بشهادات واعتمادات من جهات حكومية ومختصة.' : 'We uphold the highest safety and quality standards, with certificates from government and specialized bodies.'}</p>
          </div>
          <button onClick={() => setOpen(true)} className="shrink-0 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-brand-200 transition-colors">
            <ScrollText className="w-5 h-5" />{ar ? 'عرض صور الشهادات' : 'View certificates'}
          </button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certs.map((c, i) => (
            <motion.button key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} onClick={() => setOpen(true)} className="bg-white border border-[#eee1d0] rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
              <span className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-4"><c.Icon className="w-7 h-7" /></span>
              <strong className="block font-display font-bold text-brand-800">{c.n}</strong>
              {c.sub && <span className="block text-xs text-brand-600 font-bold mt-0.5" dir="ltr">{c.sub}</span>}
              <span className="block text-xs text-gray-500 mt-1.5 leading-relaxed">{c.d}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[1100] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-parchment rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#eee1d0] flex items-center justify-between shrink-0">
              <h3 className="font-display font-black text-lg md:text-xl text-brand-800">{ar ? 'الاعتمادات والشهادات' : 'Accreditations & certificates'}</h3>
              <button onClick={() => setOpen(false)} aria-label={ar ? 'إغلاق' : 'Close'} className="w-9 h-9 rounded-full bg-white border border-[#eee1d0] grid place-items-center text-gray-500 hover:text-brand-700 shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-5 grid sm:grid-cols-2 gap-4">
              {certs.map((c, i) => (
                /* placeholder certificate frame — swap for <img src="certs/..."/> when scans are ready */
                <div key={i} className="rounded-xl border-4 border-double border-[#d8c7a8] bg-[#fffdf8] aspect-[4/3] p-5 flex flex-col items-center justify-center text-center shadow-sm">
                  <c.Icon className="w-10 h-10 text-brand-600 mb-2.5" />
                  <strong className="font-display font-bold text-brand-800">{c.n}</strong>
                  {c.sub && <span className="text-xs text-brand-600 font-bold" dir="ltr">{c.sub}</span>}
                  <span className="text-[11px] text-gray-500 mt-1.5 max-w-[85%] leading-relaxed">{c.d}</span>
                  <span className="mt-3 text-[10px] text-gray-400 border-t border-dashed border-gray-300 pt-2">{ar ? 'صورة الشهادة — تُستبدل لاحقاً' : 'Certificate image — to be added'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Certifications;
