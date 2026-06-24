import React from 'react';
import { cn } from './cn';

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Category / filter pill — gold-ringed when active. */
export const Pill: React.FC<PillProps> = ({ active, className, ...props }) => (
  <button
    className={cn(
      'whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all',
      active
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20 ring-2 ring-secondary-400/50'
        : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300',
      className,
    )}
    {...props}
  />
);
