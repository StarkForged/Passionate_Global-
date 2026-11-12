import { motion, useInView, useMotionValue, useSpring, type HTMLMotionProps } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { scrollToHash } from '@/lib/scroll';

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------- Tag (section eyebrow pill) ---------------- */
export function Tag({ children, dark = false, className }: { children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em]',
        dark ? 'border border-white/10 bg-white/[0.06] text-sky' : 'border border-line bg-white text-brand shadow-soft',
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', dark ? 'bg-sky shadow-[0_0_0_4px_rgba(90,165,255,.18)]' : 'bg-brand shadow-[0_0_0_4px_rgba(3,97,219,.14)]')} />
      {children}
    </span>
  );
}

/* ---------------- Word-by-word heading reveal ---------------- */
export function SplitHeading({ text, as: As = 'h2', className, delay = 0, highlight, dark }: { text: string; as?: 'h1' | 'h2' | 'h3'; className?: string; delay?: number; highlight?: string[]; dark?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const words = text.split(' ');
  return (
    <As ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
          <motion.span
            className={clsx('inline-block', highlight?.includes(w.replace(/[.,]/g, '')) && (dark ? 'text-grad-sky' : 'text-grad'))}
            initial={{ y: '105%' }}
            animate={inView ? { y: 0 } : undefined}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.045 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </As>
  );
}

/* ---------------- Reveal ---------------- */
export function Reveal({ children, delay = 0, y = 28, className, ...rest }: { children: ReactNode; delay?: number; y?: number; className?: string } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Section header ---------------- */
export function SectionHeader({ tag, title, intro, dark, align = 'center', highlight, className, children }: {
  tag: string; title: string; intro?: string; dark?: boolean; align?: 'center' | 'left'; highlight?: string[]; className?: string; children?: ReactNode;
}) {
  return (
    <div className={clsx('flex flex-col gap-6', align === 'center' ? 'items-center text-center' : 'items-start text-left', className)}>
      <Reveal y={12}><Tag dark={dark}>{tag}</Tag></Reveal>
      <SplitHeading text={title} highlight={highlight} dark={dark} className={clsx('h-section max-w-[18ch]', dark ? 'text-white' : 'text-ink', align === 'center' && 'mx-auto')} />
      {intro && (
        <Reveal delay={0.15}>
          <p className={clsx('lead max-w-[62ch]', dark && '!text-[#9FB3CF]', align === 'center' && 'mx-auto')}>{intro}</p>
        </Reveal>
      )}
      {children}
    </div>
  );
}

/* ---------------- Magnetic button ---------------- */
type BtnVariant = 'primary' | 'glass' | 'light' | 'outline' | 'dark';
export function Button({ href, children, variant = 'primary', size = 'md', arrow = true, className, onClick, type }: {
  href?: string; children: ReactNode; variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; arrow?: boolean; className?: string; onClick?: () => void; type?: 'submit' | 'button';
}) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 }), sy = useSpring(y, { stiffness: 220, damping: 18 });
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.2); y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const reset = () => { x.set(0); y.set(0); };
  const cls = clsx(
    'group relative inline-flex select-none items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] transition-[box-shadow,background-color,color] duration-300',
    size === 'sm' && 'h-10 px-5 text-[14px]',
    size === 'md' && 'h-[52px] px-7 text-[15px]',
    size === 'lg' && 'h-[60px] px-9 text-[16px]',
    variant === 'primary' && 'bg-grad text-white shadow-blue hover:shadow-[0_22px_50px_-12px_rgba(3,97,219,.8)]',
    variant === 'glass' && 'border border-white/15 bg-white/[0.06] text-white backdrop-blur-md hover:bg-white/[0.12]',
    variant === 'light' && 'bg-white text-navy shadow-[0_12px_30px_-10px_rgba(0,0,0,.4)]',
    variant === 'outline' && 'border border-navy/15 bg-white text-navy hover:border-brand/40',
    variant === 'dark' && 'bg-navy text-white hover:bg-[#0A2547]',
    className,
  );
  const inner = (
    <>
      {variant === 'primary' && <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,.35)_50%,transparent_75%)] transition-transform duration-700 group-hover:translate-x-full" />}
      <span className="relative">{children}</span>
      {arrow && <ArrowRight className="relative h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  );
  const common = { ref: ref as never, onPointerMove: onMove, onPointerLeave: reset, style: { x: sx, y: sy }, className: cls };
  if (href)
    return (
      <motion.a href={href} {...common} onClick={(e: React.MouseEvent) => { if (href.startsWith('#')) { e.preventDefault(); scrollToHash(href); } onClick?.(); }}>
        {inner}
      </motion.a>
    );
  return <motion.button type={type ?? 'button'} onClick={onClick} {...common}>{inner}</motion.button>;
}

/* ---------------- Count-up number ---------------- */
export function Counter({ to, duration = 1.6, className }: { to: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const p = Math.min(1, (t - t0) / (duration * 1000)); setV(Math.round(to * (1 - Math.pow(1 - p, 4)))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} className={clsx('tabular-nums', className)}>{v}</span>;
}

/* ---------------- Logo ---------------- */
export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span className={clsx('flex items-center gap-2.5', className)}>
      <img src={light ? './img/logo-mark-light.png' : './img/logo-mark.png'} alt="" className="h-9 w-auto" />
      <span className={clsx('flex flex-col font-display text-[13px] font-bold leading-[1.02] tracking-[0.02em]', light ? 'text-white' : 'text-navy')}>
        <span>PASSIONATE</span><span>GLOBAL</span>
      </span>
    </span>
  );
}

/* ---------------- Spotlight card wrapper (cursor-follow glow) ---------------- */
export function Spotlight({ children, className, color = 'rgba(90,165,255,.16)', size = 420 }: { children: ReactNode; className?: string; color?: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={clsx('group/spot relative isolate overflow-hidden', className)}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty('--mx', `${e.clientX - r.left}px`);
        ref.current!.style.setProperty('--my', `${e.clientY - r.top}px`);
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-[1] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100" style={{ background: `radial-gradient(${size}px circle at var(--mx) var(--my), ${color}, transparent 60%)` }} />
      {children}
    </div>
  );
}

/* ---------------- 3D tilt on hover ---------------- */
export function Tilt({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 }), sry = useSpring(ry, { stiffness: 150, damping: 15 });
  return (
    <motion.div
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2); rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
    >
      {children}
    </motion.div>
  );
}
