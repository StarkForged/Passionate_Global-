/**
 * Industries — bento mosaic (client round 2: replaces the typographic rows + cursor card, which left a lot
 * of unused space). Round 4: clean background (no blurred orbs), light tiles, dark glossy GlowTile icons. Desktop: a full 4×4 grid (rows 140px, ≈608px tall):
 *   Healthcare 2×2 | Social Care 2×2            (core sectors, per the testimonials)
 *   Education | Technology | Finance & Accounting 2×1
 *   Engineering | Logistics | Professional Services 2×1
 * Visual order = content order. Each tile: GlowTile icon, name, "Recruitment sector", faint line-art watermark.
 * Hover: lift, icon scales slightly, watermark drifts, soft white cursor light inside.
 * Mobile: 2 columns; feature tiles span both columns.
 */
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, HandHeart, GraduationCap, Cpu, LineChart, Cog, Truck, Building2, type LucideIcon } from 'lucide-react';
import { industries } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';
import { FaintGrid, GlowTile } from '@/components/ui/luminous';
import { cn } from '@/lib/utils';

const icons: LucideIcon[] = [HeartPulse, HandHeart, GraduationCap, Cpu, LineChart, Cog, Truck, Building2];
const SECTOR = 'Recruitment sector';
type Kind = 'feature' | 'wide' | 'std';
const kinds: Kind[] = ['feature', 'feature', 'std', 'std', 'wide', 'std', 'std', 'wide'];
const span: Record<Kind, string> = {
  feature: 'col-span-2 lg:row-span-2',
  wide: 'col-span-1 lg:col-span-2',
  std: 'col-span-1',
};

function Tile({ i, name }: { i: number; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const kind = kinds[i], Icon = icons[i], feature = kind === 'feature';
  // cursor light: CSS vars read by the radial highlight layer
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }} className={span[kind]}>
      <div ref={ref} onPointerMove={move}
        className={cn('light-tile group relative isolate flex h-full overflow-hidden rounded-[1.75rem] transition-[transform,box-shadow,background] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1',
          feature ? 'min-h-[180px] flex-col justify-between p-6 sm:p-8' : 'min-h-[150px] flex-col justify-center gap-3 p-5 lg:min-h-0 lg:flex-row lg:items-center lg:justify-start lg:gap-4 lg:px-6')}>
        {/* soft white cursor light (not blue) */}
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(260px circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,.75), transparent 65%)' }} />
        {/* line-art watermark */}
        <Icon aria-hidden strokeWidth={1} className={cn('pointer-events-none absolute -z-10 text-brand opacity-[0.07] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:-rotate-6',
          feature ? '-bottom-8 -right-6 h-[200px] w-[200px]' : '-bottom-12 -right-10 h-[140px] w-[140px]')} />
        <GlowTile icon={Icon} size={feature ? 64 : 48} className="transition-transform duration-300 group-hover:scale-105" />
        <div className="min-w-0">
          <h3 className={cn('font-display font-semibold leading-[1.1] tracking-[-0.03em] text-navy', feature ? 'text-[clamp(1.75rem,2.4vw,2rem)]' : 'text-[clamp(1.125rem,1.6vw,1.375rem)]')}>{name}</h3>
          <p className={cn('mt-1.5 font-medium text-muted', feature ? 'text-[15px]' : 'text-[14px]')}>{SECTOR}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Industries() {
  return (
    <section id="industries" data-theme="light" className="section relative isolate overflow-hidden bg-[linear-gradient(180deg,#EFF4F9_0%,#FFFFFF_100%)]">
      <FaintGrid className="-z-10" />
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <SectionHeader align="left" tag={industries.eyebrow} title={industries.title} highlight={['Diverse']} />
          <Reveal delay={0.1}>
            <p className="max-w-[60ch] text-[17px] leading-[1.75] text-muted">{industries.intro}</p>
            <p className="mt-3 max-w-[60ch] text-[17px] font-medium text-ink">{industries.sub}</p>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-[repeat(4,140px)]">
          {industries.items.map((name, i) => <Tile key={name} i={i} name={name} />)}
        </div>
      </div>
    </section>
  );
}
