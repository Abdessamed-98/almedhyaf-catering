import React from 'react';
import { Globe, ArrowLeft, LayoutTemplate } from 'lucide-react';
import Logo from '../../components/Logo';
import { useLanguage } from '../../contexts/LanguageContext';

interface PortalProps {
  onNavigateToWebsite: () => void;
  onNavigateToOrdering?: () => void;
  onNavigateToPOS?: () => void;
  onNavigateToMiniPOS?: () => void;
  onNavigateToDeliveryApp?: () => void;
}

const Portal: React.FC<PortalProps> = ({ onNavigateToWebsite, onNavigateToOrdering, onNavigateToPOS, onNavigateToMiniPOS, onNavigateToDeliveryApp }) => {
  const { t, toggleLanguage, language } = useLanguage();

  // Portal surfaces the company website + the Ordering app.
  // (POS / Mini-POS / Delivery stay in the codebase as extras, hidden.)
  const apps = [
    {
      title: t('app_landing'),
      subtitle: t('app_landing_sub'),
      icon: <LayoutTemplate className="w-7 h-7" />,
      tile: 'bg-brand-600 text-white',
      action: onNavigateToWebsite,
    },
    {
      title: t('app_ordering'),
      subtitle: t('app_ordering_sub'),
      icon: <Globe className="w-7 h-7" />,
      tile: 'bg-secondary-500 text-ink',
      action: onNavigateToOrdering || (() => alert(t('loading_redirect'))),
      primary: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink via-brand-900 to-ink flex flex-col relative overflow-hidden">

      {/* Warm ambient glows */}
      <div className="absolute -top-24 -end-24 w-[28rem] h-[28rem] bg-secondary-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -start-24 w-[28rem] h-[28rem] bg-brand-600/25 rounded-full blur-3xl pointer-events-none"></div>
      {/* Faint texture lines */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-secondary-500/60 to-transparent"></div>

      {/* Language Toggle */}
      <div className="absolute top-6 end-6 z-30">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all border border-white/10"
        >
          <Globe className="w-4 h-4" />
          <span className="font-bold text-sm uppercase">{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center p-6 z-10">
        <div className="max-w-5xl w-full">
          {/* Brand header */}
          <div className="text-center mb-14 animate-fade-in-down">
            <div className="flex justify-center mb-8">
              <Logo variant="light" className="scale-110" />
            </div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-secondary-500/60"></span>
              <span className="text-secondary-400 font-bold text-xs uppercase tracking-[0.3em]">{t('portal_subtitle')}</span>
              <span className="h-px w-8 bg-secondary-500/60"></span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">{t('portal_title')}</h1>
          </div>

          {/* App grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {apps.map((app, index) => (
              <button
                key={index}
                onClick={app.action}
                className={`group relative overflow-hidden rounded-2xl p-6 text-start transition-all duration-300 hover:-translate-y-1.5 backdrop-blur-xl
                  ${app.primary
                    ? 'bg-white/[0.08] border border-secondary-500/50 shadow-[0_0_0_1px_rgba(248,193,93,0.15),0_20px_40px_-12px_rgba(0,0,0,0.6)] hover:border-secondary-400'
                    : 'bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] hover:border-white/20'}`}
              >
                {app.primary && (
                  <span className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-secondary-400 to-secondary-600"></span>
                )}

                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${app.tile} transition-transform group-hover:scale-110`}>
                    {app.icon}
                  </div>
                  {app.primary && (
                    <span className="bg-secondary-500 text-ink text-[11px] px-2.5 py-1 rounded-full font-black uppercase tracking-wide">
                      {t('recommended')}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-secondary-300 transition-colors">
                  {app.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm tracking-wide">{app.subtitle}</p>
                  <ArrowLeft className="w-4 h-4 text-gray-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all rtl:rotate-0 ltr:rotate-180" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-14 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {t('portal_rights')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portal;
