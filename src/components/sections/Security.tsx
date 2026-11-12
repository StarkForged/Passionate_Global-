/** IT Infrastructure & Security — reference: ref5 (bottom slide: glass "data centre" cube hub with spokes). */
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Lock, ServerCog, Cpu, Wifi, Globe2, RefreshCw } from 'lucide-react';
import { security } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';

const SecureCube = lazy(() => import('@/components/three/SecureCube'));
const icons = [Lock, ServerCog, Cpu, Wifi, Globe2, RefreshCw];

function Feature({ i, right }: { i: number; right?: boolean }) {
  const it = security.items[i]; const Icon = icons[i];
  return (
    <motion.article data-feat={right ? 'r' : 'l'}
      initial={{ opacity: 0, x: right ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease: EASE, delay: (i % 3) * 0.1 }}
      className={clsx('group relative flex gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-md transition-colors duration-500 hover:border-sky/30 hover:bg-white/[0.06]', right && 'lg:flex-row-reverse lg:text-right')}>
      <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,.18),rgba(255,255,255,.03))] text-[#BFDCFF] shadow-[inset_0_1px_0_rgba(255,255,255,.25)] transition-colors group-hover:text-white">
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
      </span>
      <div>
        <h3 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-white">{it.title}</h3>
        <p className="mt-1.5 text-[14px] leading-relaxed text-[#9FB3CF]">{it.body}</p>
      </div>
    </motion.article>
  );
}

export default function Security() {
  const hub = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ d: string; r: boolean }[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const calc = () => {
      if (!hub.current || !core.current || innerWidth < 1024) { setPaths([]); return; }
      const H = hub.current.getBoundingClientRect(), C = core.current.getBoundingClientRect();
      const cx = C.left + C.width / 2 - H.left, cy = C.top + C.height / 2 - H.top;
      setBox({ w: H.width, h: H.height });
      setPaths([...hub.current.querySelectorAll<HTMLElement>('[data-feat]')].map((f) => {
        const R = f.getBoundingClientRect(), r = f.dataset.feat === 'r';
        const x = (r ? R.left : R.right) - H.left, y = R.top + R.height / 2 - H.top, ex = cx + (r ? 70 : -70);
        return { d: `M${x},${y} C${(x + ex) / 2},${y} ${(x + ex) / 2},${cy} ${ex},${cy}`, r };
      }));
    };
    const t = setTimeout(calc, 1200);
    const ro = new ResizeObserver(calc); if (hub.current) ro.observe(hub.current);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);

  return (
    <section id="security" data-theme="dark" className="section overflow-hidden bg-[radial-gradient(80%_60%_at_50%_45%,#0B2A57_0%,#01152D_55%,#000915_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 dot-grid-dark [mask-image:radial-gradient(60%_50%_at_50%_50%,#000,transparent)]" />
      <div className="container-site relative">
        <SectionHeader dark tag={security.eyebrow} title={security.title} intro={security.intro} highlight={['Peace', 'Mind.']} className="[&_h2]:max-w-[22ch]" />

        <div ref={hub} className="relative mt-16 grid items-center gap-5 lg:grid-cols-[1fr_380px_1fr] lg:gap-8">
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block" viewBox={`0 0 ${box.w || 1} ${box.h || 1}`} aria-hidden>
            <defs>
              <linearGradient id="beamL" x1="0" x2="1"><stop offset="0" stopColor="#5AA5FF" stopOpacity=".05" /><stop offset="1" stopColor="#5AA5FF" stopOpacity=".55" /></linearGradient>
              <linearGradient id="beamR" x1="1" x2="0"><stop offset="0" stopColor="#5AA5FF" stopOpacity=".05" /><stop offset="1" stopColor="#5AA5FF" stopOpacity=".55" /></linearGradient>
            </defs>
            {paths.map((p, i) => (
              <g key={i}>
                <path id={`beam${i}`} d={p.d} fill="none" stroke={`url(#${p.r ? 'beamR' : 'beamL'})`} strokeWidth="1.3" />
                <circle r="3" fill="#BFE0FF" style={{ filter: 'drop-shadow(0 0 6px #5AA5FF)' }}>
                  <animateMotion dur={`${2.2 + i * 0.3}s`} repeatCount="indefinite" keyPoints={p.r ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear"><mpath href={`#beam${i}`} /></animateMotion>
                </circle>
              </g>
            ))}
          </svg>
          <div className="flex flex-col gap-5">{[0, 1, 2].map((i) => <Feature key={i} i={i} />)}</div>
          <div ref={core} className="relative order-first mx-auto aspect-square w-full max-w-[380px] lg:order-none">
            <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(60,140,255,.45),transparent_65%)] blur-2xl" />
            <Suspense fallback={null}><SecureCube /></Suspense>
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-[#CFE3FF] backdrop-blur-md">Secure Core</p>
          </div>
          <div className="flex flex-col gap-5">{[3, 4, 5].map((i) => <Feature key={i} i={i} right />)}</div>
        </div>

        <Reveal className="mt-16">
          <p className="mx-auto max-w-[62ch] text-center text-[16px] leading-relaxed text-[#9FB3CF]">{security.outro}</p>
        </Reveal>
      </div>
    </section>
  );
}
