import React, { useEffect, useRef } from 'react';

interface ServiceTickerProps {
  items: string[];
  /** Auto-scroll speed in pixels per frame (~60fps). Lower = slower. */
  speed?: number;
}

/**
 * Continuous, seamless text ticker — same JS-scroll technique as PhotoStrip/LogoMarquee
 * (programmatic scrollLeft + wrap at half width). Loops forever, no gaps/jumps.
 */
const ServiceTicker: React.FC<ServiceTickerProps> = ({ items, speed = 0.6 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  // Rendered 4x so the track always exceeds the viewport; wrap point (half) is
  // 2 full sets — identical content → perfectly seamless reset.
  const loop = [...items, ...items, ...items, ...items];

  return (
    <div ref={ref} dir="ltr" className="flex overflow-x-hidden no-scrollbar" aria-hidden="true">
      {loop.map((t, i) => (
        <span key={i} className="flex items-center shrink-0">
          <span className="px-7 font-bold text-sm md:text-base whitespace-nowrap">{t}</span>
          <span className="w-1.5 h-1.5 rotate-45 bg-secondary-400 shrink-0" />
        </span>
      ))}
    </div>
  );
};

export default ServiceTicker;
