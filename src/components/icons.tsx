import React from 'react';

/**
 * Al-Medhyaf custom icon system.
 * Unified line icons on a 24×24 grid, `currentColor` stroke, rounded caps.
 * Usage mirrors lucide-react:  <Banquets className="w-5 h-5" />
 * The visual source-of-truth is design-system/icons.html.
 */
type IconProps = React.SVGProps<SVGSVGElement> & { strokeWidth?: number };

const make = (html: string) => {
  const Icon: React.FC<IconProps> = ({ strokeWidth = 1.75, className, ...rest }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  );
  return Icon;
};

/* ── Services ───────────────────────────────────────────── */
export const HajjUmrah = make(`<path d="M4 20h16"/><rect x="6" y="7" width="12" height="13" rx="1"/><path d="M6 11h12"/><path d="M11 20v-4h2v4"/><path d="M6 7l6-3 6 3"/>`);
export const Hotels = make(`<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16"/><path d="M14 21V9h5a1 1 0 0 1 1 1v11"/><path d="M3 21h18"/><path d="M7 8h2M7 12h2M7 16h2M17 13h0M17 17h0"/>`);
export const Banquets = make(`<path d="M3 18h18"/><path d="M5 18a7 7 0 0 1 14 0"/><path d="M12 11V8.6"/><circle cx="12" cy="7.4" r="1"/>`);
export const Buffets = make(`<path d="M4 14h16l-1.2 5a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8z"/><path d="M6 14a6 6 0 0 1 12 0"/><path d="M12 8V6"/><circle cx="12" cy="5" r="1"/><path d="M3 14h18"/>`);
export const Events = make(`<path d="M12 3L3 20h18z"/><path d="M12 3v17"/><path d="M12 20l-4.2-6M12 20l4.2-6"/>`);
export const Iftar = make(`<path d="M9 4h6"/><path d="M10.5 4v2M13.5 4v2"/><rect x="7" y="6" width="10" height="12" rx="2.5"/><path d="M7 9.5h10M7 14.5h10"/><path d="M10 18v1.6h4V18"/><path d="M12 10.5c-1.1.9-1.4 2 0 2.9 1.4-.9 1.1-2 0-2.9z"/>`);
export const Ramadan = make(`<path d="M16.5 3a9 9 0 1 0 4.5 15A7 7 0 0 1 16.5 3z"/><path d="M19.5 5.2l.5 1.3 1.3.1-1 .9.3 1.3-1.1-.7-1.1.7.3-1.3-1-.9 1.3-.1z"/>`);
export const Catering = make(`<rect x="5" y="14.5" width="14" height="3" rx="1"/><rect x="6" y="10.5" width="12" height="3" rx="1"/><rect x="7" y="6.5" width="10" height="3" rx="1"/><path d="M5 17.5v.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-.5"/>`);

/* ── Cuisine ────────────────────────────────────────────── */
export const Kabsa = make(`<path d="M2.5 14h19"/><path d="M3.5 14a8.5 8.5 0 0 0 17 0"/><path d="M8 14a4 3 0 0 1 8 0"/><path d="M10 8.5c0 1 1 1 1 2M14 8.5c0 1 1 1 1 2"/>`);
export const Mandi = make(`<path d="M16.5 4a4 4 0 0 0-6 5l-1 1-4.5 4.5a2 2 0 1 0 3 3L13 13l1-1a4 4 0 0 0 2.5-8z"/><path d="M5 19.5l-2 2"/>`);
export const Grill = make(`<line x1="4.5" y1="19.5" x2="19.5" y2="4.5"/><circle cx="9" cy="15" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="15" cy="9" r="2"/>`);
export const Flame = make(`<path d="M12 3c3 3.5 5 5.5 5 8.8a5 5 0 0 1-10 0c0-1 .4-2 1.4-3 .5 1 1 1.4 1.6 1.4C9 8.8 11 6 12 3z"/>`);
export const Mezze = make(`<path d="M3 12.5a3 3 0 0 0 6 0z"/><path d="M9.2 12.5a3 3 0 0 0 6 0z"/><path d="M15 12.5a3 3 0 0 0 6 0z"/><path d="M2.5 12.5h6.5M9 12.5h6.2M15 12.5h6.5"/>`);
export const Sweets = make(`<path d="M3 18h18"/><path d="M5 18l7-9 7 9z"/><path d="M9 14.5c1 1 2 1 3 0s2-1 3 0"/><circle cx="12" cy="8" r="1"/>`);
export const Drinks = make(`<path d="M6 8.5h12l-1.1 10.4a1 1 0 0 1-1 .9H8.1a1 1 0 0 1-1-.9z"/><path d="M5 8.5h14"/><path d="M14.5 8.5L16 4"/>`);
export const ArabicCoffee = make(`<path d="M8.5 20a16 16 0 0 1 0-9h7a16 16 0 0 1 0 9z"/><path d="M9 20h6"/><path d="M9.6 11l1-2h2.8l1 2"/><path d="M12 9V6.6"/><path d="M10.8 6.1a1.6 1.6 0 1 0 2 1.4 1.3 1.3 0 0 1-2-1.4z"/><path d="M15 12.6c2 .2 3-1 3.4-3"/><path d="M8.5 13.2c-1.7.4-1.7 3 0 3.6"/>`);
export const Dates = make(`<ellipse cx="11.5" cy="14" rx="3.4" ry="5"/><path d="M11.5 9c0-2.4 1.2-3.7 3.5-4.4"/><path d="M11.5 11.5v5"/>`);
export const Tea = make(`<path d="M8 5h8l-1 13.5a2 2 0 0 1-2 1.8h-2a2 2 0 0 1-2-1.8z"/><path d="M7.5 5h9"/><path d="M11 2.5c0 1 1 1.2 0 2.5M14 2.5c0 1 1 1.2 0 2.5"/>`);
export const ChefHat = make(`<path d="M6.5 13.5a3.6 3.6 0 0 1-1-7A4 4 0 0 1 12 5a4 4 0 0 1 6.5 1.5 3.6 3.6 0 0 1-1 7"/><path d="M7 13.5h10v4.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/><path d="M9.5 16v1.5M14.5 16v1.5"/>`);
export const Pot = make(`<path d="M5 9.5h14l-1 9a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8z"/><path d="M3 11.5h2M19 11.5h2"/><path d="M4 9.5h16"/><path d="M11 6.5h2"/><path d="M12 6.5V5"/>`);
export const Utensils = make(`<path d="M7 3v18"/><path d="M5 3v4a2 2 0 0 0 4 0V3"/><path d="M17 21V3c-2 1.5-2.5 5-2.5 7.5H17"/>`);

/* ── Quality & Operations ───────────────────────────────── */
export const FoodSafety = make(`<path d="M12 3l7 3v5c0 5-3 8.2-7 10-4-1.8-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>`);
export const Certified = make(`<circle cx="12" cy="9" r="6"/><path d="M9.5 9l1.6 1.6L15 6.7"/><path d="M8.6 13.7L7 21l5-2.6L17 21l-1.6-7.3"/>`);
export const Quality = make(`<circle cx="12" cy="14.5" r="5"/><path d="M8.5 10L5.5 3M15.5 10l3-7M10 3l2 4 2-4"/><path d="M12 12.6l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7L9.5 14.4l1.7-.2z"/>`);
export const Hygiene = make(`<path d="M12 3c4 5 6 7 6 10a6 6 0 0 1-12 0c0-3 2-5 6-10z"/><path d="M9.3 13l1.6 1.6L14.7 11"/>`);
export const Temperature = make(`<path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z"/><path d="M12 9v6"/>`);
export const Fresh = make(`<path d="M5 19c0-8 6-13.5 14-13.5C19 13.5 13 19 5 19z"/><path d="M5 19c4-4 7.5-6.5 11-7.5"/>`);
export const Halal = make(`<circle cx="12" cy="12" r="8.5"/><path d="M14.5 8.5a4.5 4.5 0 1 0 0 7 3.4 3.4 0 0 1 0-7z"/><path d="M16.5 9.5l.4 1 1 .1-.8.7.2 1-.8-.5-.9.5.2-1-.7-.7 1-.1z"/>`);
export const Truck = make(`<path d="M3 6.5h11v9.5H3z"/><path d="M14 9.5h3.5l3 3v3.5H14z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/><path d="M9 18h6"/>`);
export const Scooter = make(`<circle cx="6" cy="17.5" r="2.5"/><circle cx="18" cy="17.5" r="2.5"/><path d="M6 17.5h7l3.2-7H19"/><path d="M13 10.5l-1 7"/><path d="M8.5 7.5H12l2 3"/>`);
export const Packaging = make(`<path d="M12 3l8 4v9.5l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v9.5"/>`);
export const AroundClock = make(`<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>`);
export const Seasons = make(`<rect x="4" y="5" width="16" height="15" rx="2.2"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/><path d="M8 13h2.4M13.5 13h2.5M8 16.5h2.4M13.5 16.5h2.5"/>`);
export const Team = make(`<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1"/><path d="M21 20a6 6 0 0 0-4.5-5.8"/>`);
export const Locations = make(`<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>`);
export const MapIcon = make(`<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>`);
export const Distribution = make(`<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2v3.3M11.4 11.5L6.2 17M12.6 11.5L17.8 17"/>`);
export const Clipboard = make(`<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2.5" width="6" height="3" rx="1"/><path d="M9 11h6M9 15h4"/>`);
export const Report = make(`<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8.5 14l2 2 3.5-3.5"/>`);

/* ── Interface & Contact ────────────────────────────────── */
export const Phone = make(`<path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 5 5l1.4-2.3 4.6 1.8V18a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 6a2 2 0 0 1 2-2z"/>`);
export const Whatsapp = make(`<path d="M3.5 20.5l1.4-4.1A8 8 0 1 1 8 19.2z"/><path d="M9 9.2c.2 3.3 2.3 5.4 5.6 5.7.8-.2 1.4-.8 1-1.6l-1.6-.9-1 1c-1-.5-1.7-1.2-2.2-2.2l1-1-.9-1.6c-.8-.4-1.7.1-1.9.9z"/>`);
export const Email = make(`<rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="M3.5 7l8.5 6 8.5-6"/>`);
export const Location = make(`<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>`);
export const Cart = make(`<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M3 4h2.2l2.4 11.4a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L20.5 8H6.2"/>`);
export const Bag = make(`<path d="M6 8h12l1 12.2H5z"/><path d="M9 8a3 3 0 0 1 6 0"/>`);
export const Search = make(`<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.2-4.2"/>`);
export const User = make(`<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`);
export const Heart = make(`<path d="M12 20.5C5.5 16 3 12.2 3 8.7A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 9 2.5c0 3.5-2.5 7.3-9 11.8z"/>`);
export const Star = make(`<path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.3 1.2 6.1L12 17l-5.4 2.9 1.2-6.1L3.3 9.5l6.1-.7z"/>`);
export const Loyalty = make(`<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M4 13h16M12 9v11"/><path d="M12 9C9.5 9 8 8 8 6.6 8 5.5 9 5 12 9zM12 9c2.5 0 4-1 4-2.4C16 5.5 15 5 12 9z"/>`);
export const Menu = make(`<path d="M4 7h16M4 12h16M4 17h16"/>`);
export const Globe = make(`<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 2.6 3 14.4 0 17M12 3.5c-3 2.6-3 14.4 0 17"/>`);
export const Chevron = make(`<path d="M14.5 6l-6 6 6 6"/>`);
export const Plus = make(`<path d="M12 5v14M5 12h14"/>`);
export const Minus = make(`<path d="M5 12h14"/>`);
export const Check = make(`<path d="M5 12.5l4.5 4.5L20 6.5"/>`);
