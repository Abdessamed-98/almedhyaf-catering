import React, { useState, useEffect, createContext, useContext } from 'react';
import { WebsitePage } from '../../types';
import { Menu, X, ShoppingBag, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { SiSnapchat, SiInstagram, SiTiktok, SiX, SiYoutube, SiFacebook } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa6';
import { Phone, Location, Globe, FoodSafety, Quality } from '../../components/icons';
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
import GalleryPage from './Gallery';
import ProjectsPage from './Projects';
import BlogPage from './Blog';
import FAQPage from './FAQ';
import PartnersPage from './Partners';

// Placeholder social links — replace the hrefs with the client's real handles.
const SOCIAL_LINKS: { label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Snapchat', href: 'https://snapchat.com', Icon: SiSnapchat },
  { label: 'Instagram', href: 'https://instagram.com', Icon: SiInstagram },
  { label: 'TikTok', href: 'https://tiktok.com', Icon: SiTiktok },
  { label: 'X (Twitter)', href: 'https://twitter.com', Icon: SiX },
  { label: 'YouTube', href: 'https://youtube.com', Icon: SiYoutube },
  { label: 'Facebook', href: 'https://facebook.com', Icon: SiFacebook },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: FaLinkedinIn },
];

// The website's pages live in the URL hash (#website, #website/projects, …) so each
// page is a real link and Back/Forward navigate between pages (not straight to the portal).
const PAGES: WebsitePage[] = ['HOME', 'MENU', 'DISHES', 'BRANCHES', 'ABOUT', 'NEWS', 'CONTACT', 'CAREERS', 'GALLERY', 'PROJECTS', 'BLOG', 'FAQ', 'PARTNERS'];
const pageToHash = (p: WebsitePage) => (p === 'HOME' ? '#website' : `#website/${p.toLowerCase()}`);
const hashToPage = (): WebsitePage => {
  const m = window.location.hash.match(/^#website\/([a-z]+)/i);
  if (m) { const up = m[1].toUpperCase() as WebsitePage; if (PAGES.includes(up)) return up; }
  return 'HOME';
};

interface WebsiteLayoutProps {
  onBackToPortal: () => void;
  onOrderNow: () => void;
}

// Website theme — pages read this to swap dark assets (e.g. the hero images).
const SiteThemeContext = createContext(false);
export const useSiteTheme = () => useContext(SiteThemeContext);

const WebsiteLayout: React.FC<WebsiteLayoutProps> = ({ onBackToPortal, onOrderNow }) => {
  const [activePage, setActivePage] = useState<WebsitePage>(() => hashToPage());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('site-dark') === '1');
  useEffect(() => { localStorage.setItem('site-dark', dark ? '1' : '0'); }, [dark]);
  const { t, toggleLanguage, language } = useLanguage();

  // Navigate by setting the hash; the listener below syncs the active page.
  const go = (page: WebsitePage) => { window.location.hash = pageToHash(page); };
  useEffect(() => {
    const apply = () => { setActivePage(hashToPage()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

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
    { label: t('nav_branches'), value: 'BRANCHES' },
    { label: t('nav_about'), value: 'ABOUT' },
    { label: t('nav_projects'), value: 'PROJECTS' },
    { label: t('nav_news'), value: 'NEWS' },
    { label: t('nav_blog'), value: 'BLOG' },
    { label: t('nav_careers'), value: 'CAREERS' },
    { label: t('nav_faq'), value: 'FAQ' },
    { label: t('nav_contact'), value: 'CONTACT' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'HOME': return <HomePage onNavigate={go} onOrderNow={onOrderNow} />;
      case 'MENU': return <MenuPage onOrderNow={onOrderNow} />;
      case 'DISHES': return <BanquetMenuPage onOrderNow={onOrderNow} />;
      case 'BRANCHES': return <BranchesPage />;
      case 'ABOUT': return <AboutPage />;
      case 'NEWS': return <NewsPage />;
      case 'CAREERS': return <CareersPage />;
      case 'CONTACT': return <ContactPage />;
      case 'GALLERY': return <GalleryPage onOrderNow={onOrderNow} />;
      case 'PROJECTS': return <ProjectsPage onNavigate={go} />;
      case 'BLOG': return <BlogPage />;
      case 'FAQ': return <FAQPage onNavigate={go} />;
      case 'PARTNERS': return <PartnersPage onNavigate={go} />;
      default: return <HomePage onNavigate={go} onOrderNow={onOrderNow} />;
    }
  };

  return (
    <SiteThemeContext.Provider value={dark}>
    <div className={`flex flex-col min-h-screen font-sans ${language === 'en' ? 'font-sans' : 'font-cairo'} ${dark ? 'dark bg-[#151413]' : ''}`}>
      
      {/* Top Bar */}
      <div className="bg-brand-900 text-white py-2 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2" dir="ltr"><Phone className="w-4 h-4" /> 9200 18 116</span>
            <span className="flex items-center gap-2"><Location className="w-4 h-4" /> {language === 'ar' ? 'مكة المكرمة، المملكة العربية السعودية' : 'Makkah, Saudi Arabia'}</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={toggleLanguage} className="text-gray-300 hover:text-white flex items-center gap-1 transition-colors">
                <Globe className="w-3 h-3" />
                <span className="text-xs font-bold uppercase">{language === 'ar' ? 'English' : 'عربي'}</span>
             </button>
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
          
          {/* Logo — the full brand lockup asset */}
          <div onClick={() => go('HOME')} className="cursor-pointer">
            <img src={dark ? 'logo-full-white.png' : 'logo-full.png'} alt={t('logo_name')} className={`w-auto object-contain transition-all ${scrolled ? 'h-12 md:h-14' : 'h-14 md:h-16'}`} />
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
                onClick={() => go(link.value)}
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
          <div className="flex items-center gap-3">
            {/* dark mode toggle */}
            <button
              onClick={() => setDark(v => !v)}
              aria-label={dark ? (language === 'ar' ? 'الوضع الفاتح' : 'Light mode') : (language === 'ar' ? 'الوضع الداكن' : 'Dark mode')}
              title={dark ? (language === 'ar' ? 'الوضع الفاتح' : 'Light mode') : (language === 'ar' ? 'الوضع الداكن' : 'Dark mode')}
              className={`w-10 h-10 rounded-full grid place-items-center transition-colors ${
                activePage === 'HOME' && !scrolled
                  ? 'bg-white/75 backdrop-blur-md ring-1 ring-black/5 text-gray-700 hover:text-brand-700'
                  : 'bg-gray-100 text-gray-700 hover:text-brand-700'
              }`}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <motion.div
              animate={{ rotate: [0, -4, 4, -4, 4, -2, 2, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
              className="hidden md:block"
            >
              <button onClick={onOrderNow} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-bold transition-all transform hover:-translate-y-0.5">
                <ShoppingBag className="w-5 h-5" />{t('order_now')}
              </button>
            </motion.div>
            <button 
              className="lg:hidden text-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu — full-screen overlay (pinned header + scrollable links + pinned actions) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[1000] bg-white flex flex-col">
            {/* header */}
            <div className="shrink-0 flex items-center justify-between px-4 h-[72px] border-b border-gray-100">
              <img src={dark ? 'logo-full-white.png' : 'logo-full.png'} alt={t('logo_name')} className="h-12 w-auto object-contain" />
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label={language === 'ar' ? 'إغلاق' : 'Close'} className="text-gray-800">
                <X className="w-8 h-8" />
              </button>
            </div>
            {/* scrollable nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <button
                  key={link.value}
                  onClick={() => { go(link.value); setIsMobileMenuOpen(false); }}
                  className={`text-start py-3.5 px-4 rounded-xl font-bold text-lg ${activePage === link.value ? 'bg-brand-50 text-brand-600' : 'text-gray-700'}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            {/* pinned footer actions */}
            <div className="shrink-0 border-t border-gray-100 p-4 flex flex-col gap-3">
              <button onClick={toggleLanguage} className="text-gray-700 py-3 px-4 rounded-xl font-bold flex items-center gap-2 border border-gray-200 justify-center">
                <Globe className="w-4 h-4" />
                <span>{language === 'ar' ? 'English' : 'عربي'}</span>
              </button>
              <button onClick={() => { onOrderNow(); setIsMobileMenuOpen(false); }} className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white py-3.5 rounded-xl font-bold">
                <ShoppingBag className="w-5 h-5" />{t('order_now')}
              </button>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                    <Icon className="w-[18px] h-[18px]" />
                  </a>
                ))}
              </div>
            </div>
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
      <footer className="bg-brand-900 text-white py-12 relative">
        {/* gold hairline accent at the very top */}
        <span className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-secondary-500 to-transparent" />
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <img src="logo-full-white.png" alt={t('logo_name')} className="h-24 w-auto object-contain mb-6" />
            <p className="text-brand-100/70 leading-relaxed mb-6">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary-500 hover:text-ink transition-colors">
                    <Icon className="w-5 h-5"/>
                  </a>
                ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-secondary-400">{t('quick_links')}</h3>
            <ul className="space-y-3">
              <li><button onClick={() => go('MENU')} className="text-brand-100/70 hover:text-white transition-colors">{t('nav_menu')}</button></li>
              <li><button onClick={() => go('BRANCHES')} className="text-brand-100/70 hover:text-white transition-colors">{t('nav_branches')}</button></li>
              <li><button onClick={() => go('CAREERS')} className="text-brand-100/70 hover:text-white transition-colors">{t('nav_careers')}</button></li>
              <li><button onClick={() => go('NEWS')} className="text-brand-100/70 hover:text-white transition-colors">{t('nav_news')}</button></li>
              <li><button onClick={() => go('FAQ')} className="text-brand-100/70 hover:text-white transition-colors">{t('nav_faq')}</button></li>
              <li><a href="#" className="text-brand-100/70 hover:text-white transition-colors">{t('nav_governance')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-secondary-400">{t('contact_us')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-brand-100/70">
                <Phone className="w-5 h-5 text-secondary-400" />
                <span dir="ltr">9200 18 116</span>
              </li>
              <li className="flex items-center gap-3 text-brand-100/70">
                <Location className="w-5 h-5 text-secondary-400" />
                <span>{language === 'ar' ? 'مكة المكرمة، المملكة العربية السعودية' : 'Makkah, Saudi Arabia'}</span>
              </li>
              <li className="flex items-center gap-3 text-brand-100/70">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{language === 'ar' ? 'خدمة الإعاشة على مدار الساعة' : 'Catering service around the clock'}</span>
              </li>
            </ul>
          </div>

          {/* Certifications & Partnership */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-secondary-400">{language === 'ar' ? 'اعتماداتنا' : 'Our Certifications'}</h3>
            <p className="text-brand-100/70 mb-4 text-sm">{language === 'ar' ? 'نلتزم بأعلى معايير سلامة الغذاء، معتمدون من HACCP والهيئة العامة للغذاء والدواء (SFDA).' : 'Committed to the highest food-safety standards — certified by HACCP and the Saudi Food & Drug Authority (SFDA).'}</p>
            <div className="flex flex-col gap-3">
                <div className="bg-white/5 flex items-center gap-3 p-3 px-4 rounded-lg border border-white/10">
                    <FoodSafety className="w-6 h-6 text-secondary-400 shrink-0" />
                    <div className="text-start">
                        <div className="text-[10px] uppercase text-brand-100/60">{language === 'ar' ? 'معتمد' : 'Certified'}</div>
                        <div className="font-bold leading-none">HACCP</div>
                    </div>
                </div>
                <div className="bg-white/5 flex items-center gap-3 p-3 px-4 rounded-lg border border-white/10">
                    <Quality className="w-6 h-6 text-secondary-400 shrink-0" />
                    <div className="text-start">
                        <div className="text-[10px] uppercase text-brand-100/60">{language === 'ar' ? 'مرخّص من' : 'Licensed by'}</div>
                        <div className="font-bold leading-none">SFDA</div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-brand-100/60 text-sm">
          {t('rights_reserved')} &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
    </SiteThemeContext.Provider>
  );
};

export default WebsiteLayout;