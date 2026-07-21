import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button, Field, Input, Textarea, Select } from '../../ui';

const TYPES_AR = ['إعاشة حج وعمرة', 'عقود فنادق', 'شركات ومؤسسات', 'مناسبة خاصة', 'إفطار صائم', 'بوفيهات وفعاليات', 'أخرى'];
const TYPES_EN = ['Hajj & Umrah catering', 'Hotel contracts', 'Companies & institutions', 'Private occasion', 'Iftar', 'Buffets & events', 'Other'];

// Shared quote-request form (used on the home CTA and the Contact page).
// Submission is UI-only — wire it to a backend/email service when available.
const QuoteForm: React.FC<{ idPrefix?: string }> = ({ idPrefix = 'q' }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const empty = { name: '', email: '', phone: '', projectType: '', people: '', date: '', message: '' };
  const [data, setData] = useState(empty);
  const [sent, setSent] = useState(false);
  const id = (k: string) => `${idPrefix}-${k}`;
  const submit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); setData(empty); };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
      {sent && (
        <div className="sm:col-span-2 rounded-2xl bg-green-50 border border-green-200 text-green-800 px-5 py-4 text-sm font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {ar ? 'شكراً! استلمنا طلبك وسنرسل لك عرض السعر قريباً.' : 'Thanks! We received your request and will send your quote shortly.'}
        </div>
      )}
      <Field className="sm:col-span-2" label={ar ? 'الاسم الكريم' : 'Full Name'} htmlFor={id('name')}>
        <Input id={id('name')} type="text" required value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
      </Field>
      <Field label={ar ? 'البريد الإلكتروني' : 'Email'} htmlFor={id('email')}>
        <Input id={id('email')} type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
      </Field>
      <Field label={ar ? 'الجوال' : 'Mobile'} htmlFor={id('phone')}>
        <Input id={id('phone')} type="tel" required dir="ltr" placeholder="05xxxxxxxx" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value.replace(/[^0-9+]/g, '') })} />
      </Field>
      <Field className="sm:col-span-2" label={ar ? 'نوع المشروع' : 'Project type'} htmlFor={id('type')}>
        <Select id={id('type')} required value={data.projectType} onChange={e => setData({ ...data, projectType: e.target.value })}>
          <option value="" disabled>{ar ? 'اختر نوع المشروع…' : 'Select a type…'}</option>
          {(ar ? TYPES_AR : TYPES_EN).map(o => <option key={o} value={o}>{o}</option>)}
        </Select>
      </Field>
      <Field label={ar ? 'عدد الأشخاص' : 'Number of people'} htmlFor={id('people')}>
        <Input id={id('people')} type="number" min={1} inputMode="numeric" placeholder={ar ? 'مثال: 500' : 'e.g. 500'} value={data.people} onChange={e => setData({ ...data, people: e.target.value })} />
      </Field>
      <Field label={ar ? 'تاريخ التنفيذ' : 'Execution date'} htmlFor={id('date')}>
        <Input id={id('date')} type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
      </Field>
      <Field className="sm:col-span-2" label={ar ? 'تفاصيل إضافية' : 'Additional details'} htmlFor={id('msg')}>
        <Textarea id={id('msg')} rows={3} value={data.message} onChange={e => setData({ ...data, message: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" variant="gold" size="lg" block>
          <Send className="w-5 h-5" /> {ar ? 'اطلب عرض السعر' : 'Request quote'}
        </Button>
      </div>
    </form>
  );
};

export default QuoteForm;
