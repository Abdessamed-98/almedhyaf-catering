import React, { useState } from 'react';
import { ShoppingBag, Globe, Flame } from 'lucide-react';
import {
  Button, Card, SectionHeader, Ornament, Pill, Badge, PriceTag,
  Field, Input, Textarea, Select, QtyStepper, Sheet, EmptyState,
} from './';
import { useLanguage } from '../contexts/LanguageContext';

const Block: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-12">
    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-secondary-600 mb-4">{title}</h3>
    {children}
  </section>
);

const Swatch: React.FC<{ name: string; className: string }> = ({ name, className }) => (
  <div className="text-center">
    <div className={`h-16 rounded-2xl shadow-inner border border-black/5 ${className}`} />
    <span className="text-[11px] text-gray-500 mt-1 block">{name}</span>
  </div>
);

export default function Styleguide() {
  const { toggleLanguage, language } = useLanguage();
  const [qty, setQty] = useState(2);
  const [cat, setCat] = useState('all');
  const [sheet, setSheet] = useState(false);

  return (
    <div className="min-h-screen bg-parchment p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-600">Design System</span>
          <button onClick={toggleLanguage} className="flex items-center gap-2 text-sm font-bold text-brand-700">
            <Globe className="w-4 h-4" /> {language === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-800">Almedhyaf Alarabi — المضياف العربي</h1>
        <Ornament className="my-6 justify-start" />

        <Block title="Brand · Maroon">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => (
              <Swatch key={s} name={`${s}`} className={`bg-brand-${s}`} />
            ))}
          </div>
        </Block>

        <Block title="Secondary · Gold + Ink">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => (
              <Swatch key={s} name={`${s}`} className={`bg-secondary-${s}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Swatch name="ink" className="bg-ink" />
            <Swatch name="success" className="bg-success" />
            <Swatch name="pageBg" className="bg-pageBg" />
          </div>
        </Block>

        <Block title="Typography">
          <Card className="p-6 space-y-3">
            <p className="text-5xl font-display font-bold text-brand-800">Display Heading</p>
            <p className="text-3xl font-display text-gray-800">عنوان رئيسي بخط أميري</p>
            <p className="text-lg text-gray-700">Body text in Tajawal — نص أساسي بخط تجوال للقراءة.</p>
            <p className="text-sm text-gray-400">Muted caption / supporting text</p>
          </Card>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="gold">Gold</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Block>

        <Block title="Category pills">
          <div className="flex flex-wrap gap-2.5">
            {['all', 'kabsa', 'grills', 'mezze', 'desserts'].map((c) => (
              <Pill key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Pill>
            ))}
          </div>
        </Block>

        <Block title="Badges & price">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge tone="gold"><Flame className="w-3 h-3" /> Offer</Badge>
            <Badge tone="maroon">New</Badge>
            <Badge tone="muted">Sides</Badge>
            <Badge tone="glass">1200 cal</Badge>
            <Badge tone="success">Delivered</Badge>
            <span className="ms-4"><PriceTag amount={65} currency="ر.س" /></span>
          </div>
        </Block>

        <Block title="Product card">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card interactive className="overflow-hidden">
              <div className="h-32 bg-gray-100" />
              <div className="p-3">
                <h4 className="font-bold text-gray-900 text-sm">Kabsa Lamb</h4>
                <div className="flex items-center justify-between mt-2">
                  <PriceTag amount={65} currency="ر.س" />
                  <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center"><ShoppingBag className="w-4 h-4" /></div>
                </div>
              </div>
            </Card>
          </div>
        </Block>

        <Block title="Form fields">
          <Card className="p-6 grid md:grid-cols-2 gap-4">
            <Field label="Full Name" htmlFor="sg-name"><Input id="sg-name" placeholder="Your name" /></Field>
            <Field label="City" htmlFor="sg-city"><Select id="sg-city"><option>Riyadh</option><option>Jeddah</option></Select></Field>
            <Field label="Notes" htmlFor="sg-notes" className="md:col-span-2"><Textarea id="sg-notes" rows={3} placeholder="Anything else?" /></Field>
          </Card>
        </Block>

        <Block title="Quantity stepper">
          <QtyStepper value={qty} onChange={setQty} />
        </Block>

        <Block title="Bottom sheet">
          <Button variant="gold" onClick={() => setSheet(true)}>Open sheet</Button>
          <Sheet open={sheet} onClose={() => setSheet(false)}>
            <div className="p-6">
              <SectionHeader title="Sheet Title" subtitle="Sheets replace full-screen modals across the system." />
              <Button block className="mt-6" onClick={() => setSheet(false)}>Done</Button>
            </div>
          </Sheet>
        </Block>

        <Block title="Empty state">
          <Card className="py-2">
            <EmptyState icon={ShoppingBag} title="Your tray is empty" description="Add a dish to get started." action={<Button variant="primary">Browse menu</Button>} />
          </Card>
        </Block>

        <div className="text-center text-gray-400 text-sm py-8">Add <code className="text-brand-600">#styleguide</code> to the URL to view this page.</div>
      </div>
    </div>
  );
}
