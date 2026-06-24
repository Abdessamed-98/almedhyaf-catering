import React from 'react';
import { cn } from './cn';

const fieldBase =
  'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition';

/** Label + control wrapper that wires htmlFor/id for accessibility. */
export const Field: React.FC<{ label: string; htmlFor: string; className?: string; children: React.ReactNode }> = ({
  label,
  htmlFor,
  className,
  children,
}) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="block text-gray-700 font-bold mb-2 text-sm">
      {label}
    </label>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={cn(fieldBase, className)} {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea className={cn(fieldBase, 'resize-none', className)} {...props} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, ...props }) => (
  <select className={cn(fieldBase, className)} {...props} />
);
