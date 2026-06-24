import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Twitter, Instagram, Facebook, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button, Field, Input, Textarea } from '../../ui';
import { motion } from 'motion/react';

const SOCIAL_LINKS = [
  { label: 'Twitter', href: 'https://twitter.com', Icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const Contact: React.FC = () => {
  const { t, language } = useLanguage();
  const ar = language === 'ar';
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setFormData({ name: '', email: '', message: '' });
  };

  const infoBlocks = [
    {
      Icon: Phone,
      label: ar ? 'الهاتف' : 'Phone',
      value: '0570165050',
      ltr: true,
    },
    {
      Icon: Mail,
      label: ar ? 'البريد الإلكتروني' : 'Email',
      value: 'info@almedhyaf.sa',
      ltr: true,
    },
    {
      Icon: MapPin,
      label: ar ? 'الإدارة العامة' : 'Headquarters',
      value: ar ? 'شارع عبدالله عارف، حي النزهة، مكة المكرمة' : 'Abdullah Arif St, Al-Nuzha District, Makkah',
      ltr: false,
    },
  ];

  // keep translation keys available for shared copy
  void t;

  const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-brand-600 font-black text-xs md:text-sm tracking-wide">{children}</span>
  );

  return (
    <div className="overflow-hidden">

      {/* ===== PAGE HEADER (compact, light) ===== */}
      <section className="bg-gradient-to-b from-[#f7f3ec] to-[#f4f1ec] border-b border-[#eadfce]">
        <motion.div {...fadeUp} className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <span className="inline-flex items-center gap-3 text-brand-600 font-bold text-sm">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-500" />
            {ar ? 'نسعد بتواصلكم' : 'We’d love to hear from you'}
          </span>
          <h1 className="mt-3 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'تواصل معنا' : 'Contact us'}</h1>
          <p className="mt-3 text-gray-600 text-base md:text-lg max-w-2xl leading-relaxed">
            {ar
              ? 'أخبرنا باحتياج الإعاشة القادم — عدد الوجبات، الموقع، ونطاق الخدمة — وفريقنا جاهز للرد والإعداد لك.'
              : 'Tell us your next catering need — meal counts, location and service scope — and our team is ready to respond and prepare for you.'}
          </p>
        </motion.div>
      </section>

      {/* ===== CONTACT PANEL + FORM (light) ===== */}
      <section className="bg-[#fbf7ef] text-ink py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="mb-12">
            <Kicker>{ar ? 'ابقَ على تواصل' : 'Get in touch'}</Kicker>
            <h2 className="mt-2 font-display font-black text-3xl md:text-5xl text-brand-800 leading-tight">{ar ? 'معلومات الاتصال ونموذج الرسالة' : 'Contact details & message form'}</h2>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6 items-start">

            {/* DARK info panel */}
            <motion.div {...fadeUp} className="lg:col-span-2 space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-[#221713] text-white p-8 shadow-xl">
                <span className="absolute -end-24 -top-24 w-64 h-64 rounded-full bg-secondary-500/10" />
                <div className="relative">
                  <h3 className="text-2xl font-display font-bold mb-3">{ar ? 'معلومات الاتصال' : 'Contact Information'}</h3>
                  <p className="text-white/70 mb-8 leading-relaxed text-sm">
                    {ar ? 'فريق خدمة العملاء جاهز للرد على استفساراتكم طوال أيام الأسبوع.' : 'Our customer service team is ready to answer your inquiries all week long.'}
                  </p>

                  <div className="space-y-5">
                    {infoBlocks.map(({ Icon, label, value, ltr }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-secondary-300" />
                        </div>
                        <div>
                          <p className="font-bold">{label}</p>
                          <p className="text-white/60 text-sm" {...(ltr ? { dir: 'ltr' } : {})}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-6 border-t border-white/10">
                    <p className="text-sm font-bold text-secondary-300 mb-3">{ar ? 'تابعنا' : 'Follow us'}</p>
                    <div className="flex gap-3">
                      {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary-500 hover:text-ink transition-colors">
                          <Icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Working-hours card (light) */}
              <div className="rounded-2xl bg-white border border-[#eee1d0] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </span>
                  <h4 className="text-lg font-display font-bold text-brand-800">{ar ? 'ساعات العمل' : 'Working Hours'}</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{ar ? 'السبت - الخميس' : 'Sat - Thu'}</span>
                    <span className="font-bold text-gray-800" dir="ltr">11:00 AM - 02:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{ar ? 'الجمعة' : 'Friday'}</span>
                    <span className="font-bold text-gray-800" dir="ltr">02:00 PM - 02:00 AM</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {ar ? 'مفتوح الآن' : 'Open now'}
                </span>
              </div>
            </motion.div>

            {/* Light form card */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl bg-white border border-[#eee1d0] shadow-sm p-8 lg:p-10">
                <h3 className="text-2xl font-display font-bold text-brand-800 mb-2">{ar ? 'أرسل لنا رسالة' : 'Send us a message'}</h3>
                <p className="text-gray-500 mb-6 text-sm">{ar ? 'املأ النموذج وسنعاود التواصل معك في أقرب وقت.' : 'Fill in the form and we will get back to you shortly.'}</p>

                {sent && (
                  <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 text-green-800 px-5 py-4 text-sm font-bold flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    {ar ? 'شكراً لتواصلك معنا! سيتم الرد عليك قريباً.' : 'Thank you for contacting us! We will reply shortly.'}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Field label={ar ? 'الاسم الكريم' : 'Full Name'} htmlFor="contact-name">
                    <Input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field>
                  <Field label={ar ? 'البريد الإلكتروني' : 'Email Address'} htmlFor="contact-email">
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Field>
                  <Field label={ar ? 'الرسالة' : 'Message'} htmlFor="contact-message">
                    <Textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                  </Field>
                  <Button type="submit" variant="gold" size="lg" block>
                    <Send className="w-5 h-5" /> {ar ? 'إرسال الرسالة' : 'Send Message'}
                  </Button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
