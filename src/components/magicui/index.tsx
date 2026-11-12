/**
 * Magic UI components (magicui.design), ported by hand for Tailwind v3 + framer-motion
 * and re-skinned with brand tokens. Keyframes live in src/styles/index.css.
 */
import { Children, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, type MotionValue, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

/* ---------------- Border Beam ---------------- */
export function BorderBeam({ size = 90, duration = 7, delay = 0, colorFrom = '#BFE0FF', colorTo = '#5AA5FF', borderWidth = 1.5, className }: {
  size?: number; duration?: number; delay?: number; colorFrom?: string; colorTo?: string; borderWidth?: number; className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn('border-beam', className)}
      style={{ '--size': size, '--duration': `${duration}s`, '--delay': `-${delay}s`, '--color-from': colorFrom, '--color-to': colorTo, '--bw': `${borderWidth}px` } as CSSProperties}
    />
  );
}

/* ---------------- Number Ticker ---------------- */
export function NumberTicker({ value, className, delay = 0 }: { value: number; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 60, stiffness: 100 });
  const inView = useInView(ref, { once: true, margin: '0px' });
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => mv.set(value), delay * 1000);
    return () => clearTimeout(t);
  }, [inView, value, delay, mv]);
  useEffect(() => spring.on('change', (v) => { if (ref.current) ref.current.textContent = Math.round(v).toString(); }), [spring]);
  return <span ref={ref} className={cn('inline-block tabular-nums', className)}>{prefersReducedMotion() ? value : 0}</span>;
}

/* ---------------- Orbiting Circles ---------------- */
export function OrbitingCircles({ children, radius = 160, duration = 30, reverse, path = true, iconSize = 56, className }: {
  children: ReactNode; radius?: number; duration?: number; reverse?: boolean; path?: boolean; iconSize?: number; className?: string;
}) {
  const items = Children.toArray(children);
  return (
    <>
      {path && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
          <circle cx="50%" cy="50%" r={radius} fill="none" stroke="rgba(3,97,219,.16)" strokeWidth="1" />
        </svg>
      )}
      {items.map((child, i) => (
        <div
          key={i}
          className={cn('orbit absolute left-1/2 top-1/2 flex items-center justify-center', className)}
          style={{ '--duration': `${duration}s`, '--radius': radius, '--angle': (360 / items.length) * i, width: iconSize, height: iconSize, marginLeft: -iconSize / 2, marginTop: -iconSize / 2, animationDirection: reverse ? 'reverse' : undefined } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </>
  );
}

/* ---------------- Animated Beam ---------------- */
export function AnimatedBeam({ containerRef, fromRef, toRef, curvature = 0, reverse = false, duration = 5, delay = 0, pathColor = 'rgba(140,190,255,1)', pathWidth = 2, pathOpacity = 0.12, gradientStartColor = '#5AA5FF', gradientStopColor = '#1679E0', startXOffset = 0, endXOffset = 0 }: {
  containerRef: RefObject<HTMLElement>; fromRef: RefObject<HTMLElement>; toRef: RefObject<HTMLElement>;
  curvature?: number; reverse?: boolean; duration?: number; delay?: number; pathColor?: string; pathWidth?: number; pathOpacity?: number;
  gradientStartColor?: string; gradientStopColor?: string; startXOffset?: number; endXOffset?: number;
}) {
  const id = useId();
  const [d, setD] = useState('');
  const [box, setBox] = useState({ w: 0, h: 0 });
  const g = reverse
    ? { x1: ['90%', '-10%'], x2: ['100%', '0%'], y1: ['0%', '0%'], y2: ['0%', '0%'] }
    : { x1: ['10%', '110%'], x2: ['0%', '100%'], y1: ['0%', '0%'], y2: ['0%', '0%'] };

  useEffect(() => {
    const update = () => {
      const c = containerRef.current, a = fromRef.current, b = toRef.current;
      if (!c || !a || !b) return;
      const cr = c.getBoundingClientRect(), ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      setBox({ w: cr.width, h: cr.height });
      const sx = ar.left - cr.left + ar.width / 2 + startXOffset, sy = ar.top - cr.top + ar.height / 2;
      const ex = br.left - cr.left + br.width / 2 + endXOffset, ey = br.top - cr.top + br.height / 2;
      setD(`M ${sx},${sy} Q ${(sx + ex) / 2},${sy - curvature} ${ex},${ey}`);
    };
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, [containerRef, fromRef, toRef, curvature, startXOffset, endXOffset]);

  return (
    <svg aria-hidden fill="none" width={box.w} height={box.h} className="pointer-events-none absolute left-0 top-0" viewBox={`0 0 ${box.w} ${box.h}`}>
      <path d={d} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      <path d={d} strokeWidth={pathWidth} stroke={`url(#${id})`} strokeOpacity="1" strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          id={id} gradientUnits="userSpaceOnUse"
          initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
          animate={prefersReducedMotion() ? undefined : g}
          transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 0 }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}

/* ---------------- Marquee ---------------- */
export function Marquee({ children, reverse, pauseOnHover = true, duration = 40, gap = 56, repeat = 4, className }: {
  children: ReactNode; reverse?: boolean; pauseOnHover?: boolean; duration?: number; gap?: number; repeat?: number; className?: string;
}) {
  return (
    <div className={cn('group/mq flex overflow-hidden', className)} style={{ '--duration': `${duration}s`, '--gap': `${gap}px`, gap } as CSSProperties}>
      {Array.from({ length: repeat }).map((_, i) => (
        <div key={i} aria-hidden={i > 0} className={cn('mq-track flex shrink-0 justify-around', pauseOnHover && 'group-hover/mq:[animation-play-state:paused]', reverse && '[animation-direction:reverse]')} style={{ gap }}>
          {children}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Blur Fade ---------------- */
export function BlurFade({ children, className, delay = 0, duration = 0.6, y = 8, blur = '8px', inViewMargin = '-60px' }: {
  children: ReactNode; className?: string; delay?: number; duration?: number; y?: number; blur?: string; inViewMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: inViewMargin as never });
  const v: Variants = { hidden: { y, opacity: 0, filter: `blur(${blur})` }, visible: { y: 0, opacity: 1, filter: 'blur(0px)' } };
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={v} transition={{ delay: 0.04 + delay, duration, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

/* ---------------- Dot Pattern ---------------- */
export function DotPattern({ width = 22, height = 22, cr = 1, className }: { width?: number; height?: number; cr?: number; className?: string }) {
  const id = useId();
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}>
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse">
          <circle cx={width / 2} cy={height / 2} r={cr} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ---------------- Text Reveal (words fill in with scroll) ----------------
 * Magic UI ships this with its own 200vh wrapper; here the caller owns the tall/sticky layout
 * and passes its `useScroll` progress, so the reveal can share a pinned stage with other content.
 * (The caller must own the ref: a child's layout effect runs before the parent's ref attaches.) */
export function TextReveal({ text, progress, className, from = 0.15 }: { text: string; progress: MotionValue<number>; className?: string; from?: number }) {
  const words = text.split(' ');
  return (
    <p className={cn('flex flex-wrap', className)} aria-label={text}>
      {words.map((w, i) => {
        const s = 0.08 + (i / words.length) * 0.8;
        return <Word key={i} progress={progress} range={[s, s + 0.8 / words.length]} from={from}>{w}</Word>;
      })}
    </p>
  );
}
function Word({ children, progress, range, from }: { children: string; progress: MotionValue<number>; range: [number, number]; from: number }) {
  const opacity = useTransform(progress, range, [from, 1]);
  return <motion.span aria-hidden style={{ opacity }} className="mr-[0.25em]">{children}</motion.span>;
}

/* ---------------- Bento Grid ---------------- */
export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid w-full auto-rows-[minmax(22rem,auto)] grid-cols-1 gap-5 md:grid-cols-4', className)}>{children}</div>;
}
