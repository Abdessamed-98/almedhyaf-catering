import React from 'react';
import { cn } from './cn';

export interface PriceTagProps {
  amount: number | string;
  currency: string;
  className?: string;
}

/** Maroon price with a muted currency suffix. */
export const PriceTag: React.FC<PriceTagProps> = ({ amount, currency, className }) => (
  <span className={cn('font-black text-brand-700', className)}>
    {amount} <span className="text-xs font-bold text-gray-400">{currency}</span>
  </span>
);
