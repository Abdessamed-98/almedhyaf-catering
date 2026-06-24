import React, { useEffect, useRef } from 'react';

interface LogoMarqueeProps {
  logos: string[];
  /** Auto-scroll speed in pixels per frame (~60fps). Lower = slower. */
  speed?: number;
}

/**
 * Continuous logo marquee laid out along a CURVED ARC (concave valley).
 * Seamless JS-scroll loop (scrollLeft + wrap at half width). Every frame each
 * logo gets a translateY + rotate based on its distance from centre, so the row
 * dips in the middle and rises at the edges, each logo tilted to follow the arc.
 */
const LogoMarquee: React.FC<LogoMarqueeProps> = ({ logos, speed = 0.4 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const BASE_DEPTH = 72; // px vertical travel of the arc on wide screens
    const BASE_ROT = 12;   // deg of tilt at the edges on wide screens
    let raf = 0;

    const tick = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }

      const cRect = el.getBoundingClientRect();
      const center = cRect.left + cRect.width / 2;
      const halfW = cRect.width / 2 || 1;

      // gentle the arc on narrow screens (a fixed px curve over a tiny width
      // makes the logos swing/tilt too hard on mobile)
      const scale = Math.min(1, Math.max(0.22, cRect.width / 1100));
      const depth = BASE_DEPTH * scale;
      const rot = BASE_ROT * scale;

      const ns: number[] = [];
      for (let i = 0; i < items.length; i++) {
        const r = items[i].getBoundingClientRect();
        let n = (r.left + r.width / 2 - center) / halfW; // -1 (left) .. 1 (right) across the viewport
        // clamp only WAY off-screen so the visible strip is always a continuous
        // arc (clamping at the edges is what created the flat horizontal ends)
        n = n < -2.2 ? -2.2 : n > 2.2 ? 2.2 : n;
        ns[i] = n;
      }
      for (let i = 0; i < items.length; i++) {
        const n = ns[i];
        // valley: centre pushed down, edges raised — symmetric around 0
        const ty = depth * (1 - n * n) - depth / 2;
        items[i].style.transform = `translateY(${ty}px) rotate(${-rot * n}deg)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  // 4x so the track always exceeds the viewport; wrap unit (half) is 2 copies.
  const loop = [...logos, ...logos, ...logos, ...logos];

  return (
    <div
      ref={ref}
      dir="ltr"
      className="flex items-center overflow-hidden no-scrollbar py-10"
      aria-hidden="true"
    >
      {loop.map((src, i) => (
        <div key={i} className="shrink-0 px-7 md:px-10 flex items-center justify-center" style={{ willChange: 'transform' }}>
          <img
            src={src}
            alt=""
            loading="lazy"
            className="h-36 md:h-52 w-auto object-contain pointer-events-none select-none"
          />
        </div>
      ))}
    </div>
  );
};

export default LogoMarquee;
