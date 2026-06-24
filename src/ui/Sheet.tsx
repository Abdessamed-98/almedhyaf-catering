import React from 'react';
import { cn } from './cn';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Bottom sheet with scrim + grab handle — replaces full-screen modals. */
export const Sheet: React.FC<SheetProps> = ({ open, onClose, children, className }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-2xl bg-white rounded-t-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto',
          className,
        )}
      >
        <div className="sticky top-0 flex justify-center pt-3 pb-1 bg-white z-10">
          <span className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );
};
