import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewState } from './types';
import Portal from './apps/portal/Portal';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './ui';

// Code-split the heavy screens so the portal opens instantly and each app
// (plus its deps like Leaflet) is only downloaded when actually opened.
const WebsiteLayout = lazy(() => import('./apps/website/WebsiteLayout'));
const Ordering = lazy(() => import('./apps/ordering/Ordering'));
const POS = lazy(() => import('./apps/pos/POS'));

const ScreenLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
  </div>
);

const VIEW_TO_HASH: Record<ViewState, string> = {
  PORTAL: '',
  WEBSITE: '#website',
  ORDERING: '#ordering',
  POS: '#pos',
};
const HASH_TO_VIEW: Record<string, ViewState> = {
  '#website': 'WEBSITE',
  '#ordering': 'ORDERING',
  '#pos': 'POS',
};

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('PORTAL');

  // The URL hash is the source of truth for which view is shown.
  // e.g. /#website, /#ordering ; empty hash = portal.
  useEffect(() => {
    const apply = () => setCurrentView(HASH_TO_VIEW[window.location.hash] ?? 'PORTAL');
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  // Navigate by setting the hash (the listener above updates the view).
  const go = (view: ViewState) => {
    const target = VIEW_TO_HASH[view];
    if (window.location.hash === target) {
      setCurrentView(view); // hash unchanged → set directly so it still navigates
    } else {
      window.location.hash = target;
    }
  };

  return (
    <Suspense fallback={<ScreenLoader />}>
    <div className="min-h-screen bg-gray-50">
      {currentView === 'PORTAL' && (
        <Portal
          onNavigateToWebsite={() => go('WEBSITE')}
          onNavigateToOrdering={() => go('ORDERING')}
          onNavigateToPOS={() => go('POS')}
        />
      )}
      {currentView === 'WEBSITE' && (
        <WebsiteLayout
          onBackToPortal={() => go('PORTAL')}
          onOrderNow={() => go('ORDERING')}
        />
      )}
      {currentView === 'ORDERING' && (
        <Ordering onBackToPortal={() => go('PORTAL')} />
      )}
      {currentView === 'POS' && (
        <POS onBackToPortal={() => go('PORTAL')} />
      )}
    </div>
    </Suspense>
  );
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;
