import React from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'gold' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-900/20',
  gold: 'bg-secondary-500 text-ink hover:bg-secondary-600 shadow-md shadow-secondary-900/10',
  ghost: 'text-brand-700 hover:bg-brand-50',
  outline: 'border-2 border-brand-600 text-brand-700 hover:bg-brand-50',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3',
  lg: 'px-8 py-4 text-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

/** Heritage button — pill-shaped, brand/gold variants. */
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', block, className, ...props }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      block && 'w-full',
      className,
    )}
    {...props}
  />
);
