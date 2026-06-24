import React from 'react';
import { cn } from './cn';

type Tone = 'gold' | 'maroon' | 'muted' | 'glass' | 'success';

const tones: Record<Tone, string> = {
  gold: 'bg-secondary-500 text-ink',
  maroon: 'bg-brand-600 text-white',
  muted: 'bg-gray-100 text-gray-600',
  glass: 'bg-black/50 text-white backdrop-blur-sm',
  success: 'bg-success/15 text-green-700',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'gold', className, ...props }) => (
  <span
    className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full', tones[tone], className)}
    {...props}
  />
);
