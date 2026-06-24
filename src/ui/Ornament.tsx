import React from 'react';
import { cn } from './cn';

/** Gold ornamental divider with a center diamond motif. */
export const Ornament: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('ornament', className)}>
    <span className="w-2 h-2 rotate-45 bg-secondary-500" />
  </div>
);
