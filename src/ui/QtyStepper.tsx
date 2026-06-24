import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from './cn';

export interface QtyStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  className?: string;
}

/** Quantity stepper — gold-free maroon add, soft minus. */
export const QtyStepper: React.FC<QtyStepperProps> = ({ value, onChange, min = 1, className }) => (
  <div className={cn('inline-flex items-center gap-3 bg-gray-100 rounded-full p-1', className)}>
    <button
      type="button"
      aria-label="decrease"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-700 active:scale-95 transition"
    >
      <Minus className="w-4 h-4" />
    </button>
    <span className="font-bold w-5 text-center tabular-nums">{value}</span>
    <button
      type="button"
      aria-label="increase"
      onClick={() => onChange(value + 1)}
      className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center active:scale-95 transition"
    >
      <Plus className="w-4 h-4" />
    </button>
  </div>
);
