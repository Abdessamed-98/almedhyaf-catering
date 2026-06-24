import React from 'react';
import { cn } from './cn';
import { Ornament } from './Ornament';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'start';
  className?: string;
}

/** Ornamental, display-type section header — the heritage signature. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, align = 'center', className }) => (
  <div className={cn(align === 'center' ? 'text-center' : 'text-start', className)}>
    {align === 'center' && <Ornament className="mb-3" />}
    <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-800">{title}</h2>
    {subtitle && <p className="text-gray-500 mt-2 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);
