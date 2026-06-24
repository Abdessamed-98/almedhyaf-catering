import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

/**
 * Brand lockup = the icon mark (publiclogo-mark.png) + the brand name as live,
 * theme-able text. This keeps it crisp at any size, readable on light OR dark
 * backgrounds, and bilingual (switches with the UI language). If the image is
 * missing it falls back to a lucide icon, so nothing breaks before the asset
 * is added.
 */
const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark' }) => {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const nameColor = variant === 'light' ? 'text-white' : 'text-brand-800';
  const taglineColor = variant === 'light' ? 'text-secondary-400' : 'text-secondary-600';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {imgError ? (
        <div className={`p-2 rounded-full border-2 ${variant === 'light' ? 'border-white' : 'border-brand-600'}`}>
          <UtensilsCrossed className={`w-6 h-6 ${variant === 'light' ? 'text-white' : 'text-brand-600'}`} />
        </div>
      ) : (
        <img
          src="logo-mark.png"
          alt={t('logo_name')}
          className="h-12 w-12 object-contain shrink-0"
          onError={() => setImgError(true)}
        />
      )}
      <div className="flex flex-col">
        <span className={`text-xl font-black leading-tight ${nameColor}`}>{t('logo_name')}</span>
        <span className={`text-[11px] font-bold tracking-wide ${taglineColor}`}>{t('logo_tagline')}</span>
      </div>
    </div>
  );
};

export default Logo;
