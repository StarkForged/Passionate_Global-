/**
 * Aceternity UI components (ui.aceternity.com), ported by hand for Tailwind v3 + framer-motion
 * and re-skinned with brand tokens.
 */
import { memo, useCallback, useEffect, useRef } from 'react';
import { animate, motion, stagger, useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

/* ---------------- Text Generate Effect (words blur in) ---------------- */
export function TextGenerateEffect({ words, className, duration = 0.5, filter = true }: { words: string; className?: string; duration?: number; filter?: boolean }) {
  const [scope, run] = useAnimate();
  const list = words.split(' ');
  useEffect(() => {
    if (prefersReducedMotion()) { run('span', { opacity: 1, filter: 'blur(0px)' }, { duration: 0 }); return; }
    run('span', { opacity: 1, filter: filter ? 'blur(0px)' : 'none' }, { duration, delay: stagger(0.06) });
  }, [words, run, duration, filter]);
  return (
    <div ref={scope} className={className} aria-label={words}>
      {list.map((w, i) => (
        <motion.span key={w + i} aria-hidden className="inline-block opacity-0" style={{ filter: filter ? 'blur(10px)' : 'none' }}>
          {w}{i < list.length - 1 && ' '}
        </motion.span>
      ))}
    </div>
  );
}

/* ---------------- Glowing Effect (pointer-tracking conic border) ---------------- */
export const GlowingEffect = memo(function GlowingEffect({ spread = 32, proximity = 64, inactiveZone = 0.6, borderWidth = 1.5, movementDuration = 1.2, className }: {
  spread?: number; proximity?: number; inactiveZone?: number; borderWidth?: number; movementDuration?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  const handleMove = useCallback((e?: { x: number; y: number }) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const mx = e?.x ?? last.current.x, my = e?.y ?? last.current.y;
      if (e) last.current = { x: mx, y: my };
      const cx = left + width / 2, cy = top + height / 2;
      if (Math.hypot(mx - cx, my - cy) < 0.5 * Math.min(width, height) * inactiveZone) { el.style.setProperty('--active', '0'); return; }
      const active = mx > left - proximity && mx < left + width + proximity && my > top - proximity && my < top + height + proximity;
      el.style.setProperty('--active', active ? '1' : '0');
      if (!active) return;
      const cur = parseFloat(el.style.getPropertyValue('--start')) || 0;
      const target = (180 * Math.atan2(my - cy, mx - cx)) / Math.PI + 90;
      const diff = ((target - cur + 180) % 360) - 180;
      animate(cur, cur + diff, { duration: movementDuration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => el.style.setProperty('--start', String(v)) });
    });
  }, [inactiveZone, proximity, movementDuration]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onScroll = () => handleMove();
    const onPointer = (e: PointerEvent) => handleMove(e);
    addEventListener('scroll', onScroll, { passive: true });
    document.body.addEventListener('pointermove', onPointer, { passive: true });
    return () => { cancelAnimationFrame(raf.current); removeEventListener('scroll', onScroll); document.body.removeEventListener('pointermove', onPointer); };
  }, [handleMove]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('glow-effect pointer-events-none absolute inset-0 rounded-[inherit]', className)}
      style={{ '--spread': spread, '--start': 0, '--active': 0, '--glow-bw': `${borderWidth}px` } as React.CSSProperties}
    />
  );
});
