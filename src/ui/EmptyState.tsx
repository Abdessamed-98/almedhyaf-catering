import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center px-6 py-16">
    <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-300 mb-5">
      {Icon && <Icon className="w-9 h-9" />}
    </div>
    <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-500 mb-6 max-w-xs">{description}</p>}
    {action}
  </div>
);
