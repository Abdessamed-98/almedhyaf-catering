import React, { useState, useEffect } from 'react';
import { WebsitePage } from '../../types';
import { Menu, X, Phone, Facebook, Instagram, Twitter, MapPin, Globe, ShieldCheck, Award } from 'lucide-react';
import Logo from '../../components/Logo';
import ChatBot from '../../components/ChatBot';
import { useLanguage } from '../../contexts/LanguageContext';

// Pages
import HomePage from './Home';
import MenuPage from './Menu';
import BanquetMenuPage from './BanquetMenu';
import BranchesPage from './Branches';
import AboutPage from './About';
import NewsPage from './News';
import ContactPage from './Contact';
import CareersPage from './Careers';

// Placeholder social links — replace the hrefs with the client's real handles.
const SOCIAL_LINKS = [
  { label: 'Twitter', href: 'https://twitter.com', Icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
];

interface WebsiteLayoutProps {
  onBackToPortal: () => void;
  onOrderNow: () => void;
}

const WebsiteLayout: React.FC<WebsiteLayoutProps> = ({ onBackToPortal, onOrderNow }) => {
  const [activePage, setActivePage] = useState<WebsitePage>('HOME');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, toggleLanguage, language } = useLanguage();

  // Handle scroll for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string; value: WebsitePage }[] = [
    { label: t('nav_home'), value: 'HOME' },
    { label: t('nav_menu'), value: 'MENU' },
    { label: t('nav_dishes'), value: 'DISHES' },
    { label: t('nav_branches'), value: 'BRANCHES' },
    { label: t('nav_about'), value: 'ABOUT' },
    { label: t('nav_news'), value: 'NEWS' },
    { label: t('nav_careers'), value: 'CAREERS' },
    { label: t('nav_contact'), value: 'CONTACT' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'HOME': return <HomePage onNavigate={(page) => { setActivePage(page); window.scrollTo(0,0); }} onOrderNow={onOrderNow} />;
      case 'MENU': return <MenuPage onOrderNow={onOrderNow} />;
      case 'DISHES': return <BanquetMenuPage onOrderNow={onOrderNow} />;
      case 'BRANCHES': return <BranchesPage />;
      case 'ABOUT': return <AboutPage />;
      case 'NEWS': return <NewsPage />;
      case 'CAREERS': return <CareersPage />;
      case 'CONTACT': return <ContactPage />;
      default: return <HomePage onNavigate={(page) => setActivePage(page)} onOrderNow={onOrderNow} />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans ${language === 'en' ? 'font-sans' : 'font-cairo'}`}>
      
      {/* Top Bar */}
      <div className="bg-brand-900 text-white py-2 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2" dir="ltr"><Phone className="w-4 h-4" /> 0570165050</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {language === 'ar' ? 'مكة المكرمة، المملكة العربية السعودية' : 'Makkah, Saudi Arabia'}</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={toggleLanguage} className="text-gray-300 hover:text-white flex items-center gap-1 transition-colors">
                <Globe className="w-3 h-3" />
                <span className="text-xs font-bold uppercase">{language === 'ar' ? 'English' : 'عربي'}</span>
             </button>
             <div className="w-px h-3 bg-gray-600"></div>
             <button onClick={onBackToPortal} className="text-gray-300 hover:text-white text-xs underline">{t('staff_login')}</button>
             <div className="w-px h-3 bg-gray-600"></div>
             <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-brand-300 transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Navbar — transparent overlay on the Home hero (mobile + desktop); solid white
          on scroll and on other pages */}
      <nav className={`inset-x-0 z-[1000] transition-all duration-300 ${
        activePage !== 'HOME'
          ? `sticky top-0 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`
          : scrolled
            ? 'fixed top-0 bg-white shadow-md'
            : 'absolute top-0 lg:top-9 bg-transparent'
      }`}>
        <div className={`container mx-auto px-4 md:px-8 flex justify-between items-center ${scrolled ? 'py-4' : 'py-5'}`}>
          
          {/* Logo */}
          <div onClick={() => setActivePage('HOME')} className="cursor-pointer">
            <Logo variant="dark" />
          </div>

          {/* Desktop Nav — frosted pill only while transparent over the hero */}
          <div className={`hidden lg:flex items-center gap-1 rounded-full px-2 py-1.5 transition-colors ${
            activePage === 'HOME' && !scrolled
              ? 'bg-white/75 backdrop-blur-md ring-1 ring-black/5 shadow-sm'
              : 'bg-transparent'
          }`}>
            {navLinks.map((link) => (
              <button
                key={link.value}
                onClick={() => { setActivePage(link.value); window.scrollTo(0,0); }}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 ${
                  activePage === link.value
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-gray-700 hover:text-brand-700 hover:bg-brand-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button onClick={() => { setActivePage('CONTACT'); window.scrollTo(0,0); }} className="hidden md:block bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-brand-200 transition-all transform hover:-translate-y-0.5">
              {t('order_now')}
            </button>
            <button 
              className="lg:hidden text-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 absolute top-full left-0 right-0 shadow-xl p-4 flex flex-col gap-4 animate-fade-in-down z-50">
            {navLinks.map((link) => (
              <button
                key={link.value}
                onClick={() => {
                  setActivePage(link.value);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-right py-3 px-4 rounded-lg font-bold ${
                    activePage === link.value ? 'bg-brand-50 text-brand-600' : 'text-gray-700'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button onClick={toggleLanguage} className="text-gray-700 py-3 px-4 rounded-lg font-bold flex items-center gap-2 border border-gray-200 justify-center">
                <Globe className="w-4 h-4" />
                <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>
            <button onClick={() => { setActivePage('CONTACT'); window.scrollTo(0,0); setIsMobileMenuOpen(false); }} className="bg-brand-600 text-white py-3 rounded-lg font-bold">
              {t('order_now')}
            </button>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Sticky Chatbot */}
      <ChatBot />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <Logo variant="light" className="mb-6" />
            <p className="text-gray-400 leading-relaxed mb-6">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                    <Icon className="w-5 h-5"/>
                  </a>
                ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-brand-500">{t('quick_links')}</h3>
            <ul className="space-y-3">
              <li><button onClick={() => setActivePage('MENU')} className="text-gray-400 hover:text-white transition-colors">{t('nav_menu')}</button></li>
              <li><button onClick={() => setActivePage('BRANCHES')} className="text-gray-400 hover:text-white transition-colors">{t('nav_branches')}</button></li>
              <li><button onClick={() => setActivePage('CAREERS')} className="text-gray-400 hover:text-white transition-colors">{t('nav_careers')}</button></li>
              <li><button onClick={() => setActivePage('NEWS')} className="text-gray-400 hover:text-white transition-colors">{t('nav_news')}</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-brand-500">{t('contact_us')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-brand-500" />
                <span dir="ltr">0570165050</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-brand-500" />
                <span>{language === 'ar' ? 'مكة المكرمة، المملكة العربية السعودية' : 'Makkah, Saudi Arabia'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{language === 'ar' ? 'خدمة الإعاشة على مدار الساعة' : 'Catering service around the clock'}</span>
              </li>
            </ul>
          </div>

          {/* Certifications & Partnership */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-brand-500">{language === 'ar' ? 'اعتماداتنا' : 'Our Certifications'}</h3>
            <p className="text-gray-400 mb-4 text-sm">{language === 'ar' ? 'نلتزم بأعلى معايير سلامة الغذاء، معتمدون من HACCP والهيئة العامة للغذاء والدواء (SFDA).' : 'Committed to the highest food-safety standards — certified by HACCP and the Saudi Food & Drug Authority (SFDA).'}</p>
            <div className="flex flex-col gap-3">
                <div className="bg-gray-800 flex items-center gap-3 p-3 px-4 rounded-lg border border-gray-700">
                    <ShieldCheck className="w-6 h-6 text-brand-500 shrink-0" />
                    <div className="text-start">
                        <div className="text-[10px] uppercase text-gray-400">{language === 'ar' ? 'معتمد' : 'Certified'}</div>
                        <div className="font-bold leading-none">HACCP</div>
                    </div>
                </div>
                <div className="bg-gray-800 flex items-center gap-3 p-3 px-4 rounded-lg border border-gray-700">
                    <Award className="w-6 h-6 text-brand-500 shrink-0" />
                    <div className="text-start">
                        <div className="text-[10px] uppercase text-gray-400">{language === 'ar' ? 'مرخّص من' : 'Licensed by'}</div>
                        <div className="font-bold leading-none">SFDA</div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          {t('rights_reserved')} &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default WebsiteLayout;