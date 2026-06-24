import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

/** Surface card with the heritage radius + soft elevation. */
export const Card: React.FC<CardProps> = ({ interactive, className, ...props }) => (
  <div
    className={cn(
      'bg-white rounded-2xl border border-gray-100 shadow-sm',
      interactive && 'transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer',
      className,
    )}
    {...props}
  />
);
