import React, { useEffect, useRef } from 'react';

interface PhotoStripProps {
  images: string[];
  /** Auto-scroll speed in pixels per frame (~60fps). Lower = slower. */
  speed?: number;
}

/**
 * Full-width photo strip:
 *  - auto-scrolls slowly in a seamless loop
 *  - pauses while dragged
 *  - can be dragged / swiped manually
 */
const PhotoStrip: React.FC<PhotoStripProps> = ({ images, speed = 0.4 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const start = useRef({ x: 0, scroll: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (!dragging.current) el.scrollLeft += speed;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        else if (el.scrollLeft < 0) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    dragging.current = true;
    start.current = { x: e.clientX, scroll: el.scrollLeft };
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !dragging.current) return;
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = start.current.scroll - (e.clientX - start.current.x);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') dragging.current = false;
  };
  const endDrag = () => { dragging.current = false; };

  return (
    <div
      ref={ref}
      dir="ltr"
      className="flex gap-4 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none px-3"
      style={{ touchAction: 'pan-x' }}
      onMouseLeave={endDrag}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onTouchStart={() => { dragging.current = true; }}
      onTouchEnd={endDrag}
      onTouchCancel={endDrag}
    >
      {[...images, ...images].map((src, i) => (
        <div
          key={i}
          className="shrink-0 w-48 sm:w-60 md:w-72 aspect-[9/16] rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5"
        >
          <img
            src={src}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
      ))}
    </div>
  );
};

export default PhotoStrip;
