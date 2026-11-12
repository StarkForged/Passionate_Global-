import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { nav } from '@/data/content';
import { Button, EASE, Logo } from '@/components/ui';
import { scrollToHash } from '@/lib/scroll';

export default function Nav() {
  const [light, setLight] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = 0;
    const on = () => {
      const y = scrollY;
      const hero = document.getElementById('home')?.offsetHeight ?? 800;
      // light mode on light sections: check what's under the nav
      const el = document.elementsFromPoint(innerWidth / 2, 40).find((n) => (n as HTMLElement).dataset?.theme);
      setLight(y > hero - 80 && (el as HTMLElement | undefined)?.dataset.theme !== 'dark');
      setHidden(y > 600 && y > last + 4 && !open);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    on(); addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, [open]);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive('#' + e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    nav.forEach((n) => { const s = document.querySelector(n.href); if (s) io.observe(s); });
    return () => io.disconnect();
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => { e.preventDefault(); setOpen(false); scrollToHash(href); };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }} animate={{ y: hidden ? -110 : 0, opacity: 1 }} transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-4 z-50 mx-auto w-[min(1200px,calc(100%-24px))]"
      >
        <div className={clsx(
          'flex items-center gap-4 rounded-full border py-2 pl-5 pr-2 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-500',
          light ? 'border-navy/[0.07] bg-white/75 text-navy shadow-[0_10px_40px_-18px_rgba(1,21,45,.35)]' : 'border-white/10 bg-[#01152D]/40 text-white',
        )}>
          <a href="#home" onClick={go('#home')} aria-label="Passionate Global home"><Logo light={!light} /></a>
          <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={go(n.href)}
                className={clsx('relative rounded-full px-4 py-2 text-[14px] font-medium transition-opacity', active === n.href ? 'opacity-100' : 'opacity-70 hover:opacity-100')}>
                {active === n.href && <motion.span layoutId="navpill" className={clsx('absolute inset-0 -z-0 rounded-full', light ? 'bg-brand/[0.08]' : 'bg-white/10')} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className={clsx('relative', active === n.href && light && 'text-brand')}>{n.label}</span>
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button href="#contact" size="sm" variant={light ? 'primary' : 'light'} className="hidden sm:inline-flex">Let's talk</Button>
            <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}
              className={clsx('grid h-10 w-10 place-items-center rounded-full lg:hidden', light ? 'bg-navy/5' : 'bg-white/10')}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ clipPath: 'circle(0% at 92% 4%)' }} animate={{ clipPath: 'circle(150% at 92% 4%)' }} exit={{ clipPath: 'circle(0% at 92% 4%)' }} transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-deep px-6 pb-10 pt-28 text-white lg:hidden">
            <nav className="flex flex-col gap-1">
              {[...nav, { label: 'Contact', href: '#contact' }].map((n, i) => (
                <motion.a key={n.href} href={n.href} onClick={go(n.href)} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}
                  className="flex items-baseline gap-4 border-b border-white/[0.06] py-4 font-display text-[34px] font-semibold tracking-[-0.03em]">
                  <span className="text-[13px] font-medium tabular-nums text-sky">0{i + 1}</span>{n.label}
                </motion.a>
              ))}
            </nav>
            <Button href="#contact" className="w-full">Let's talk</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
