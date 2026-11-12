/**
 * Countries — references: ref4 (dotted world map + pin popup + country picker),
 * ref1 middle slide (pins on stems with dark labels), ref9 (highlighted regions).
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { MapPin, Clock3, Building2 } from 'lucide-react';
import geo from '@/data/geo.json';
import { countries } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';
import { formatTime, useNow } from '@/hooks/useClock';

const M = geo.map as { cols: number; rows: number; latTop: number; latBottom: number; pts: number[] };
const latStep = (M.latTop - M.latBottom) / (M.rows - 1);
const toXY = (lat: number, lng: number) => [((lng + 180) / 360) * M.cols, (M.latTop - lat) / latStep + 0.5] as const;
const pct = (lat: number, lng: number) => { const [x, y] = toXY(lat, lng); return { left: `${(x / M.cols) * 100}%`, top: `${(y / M.rows) * 100}%` }; };

// lat/lng boxes for highlighted market regions [latMin, latMax, lngMin, lngMax]
const REGIONS: Record<string, number[][]> = {
  GB: [[49.8, 59.5, -8.2, 2.0]],
  IE: [[51.3, 55.5, -10.8, -5.95]],
  EU: [[36, 71, -10, 32]],
  CA: [[42, 72, -141, -52]],
  US: [[24, 49.3, -125, -66.5]],
  AU: [[-44, -10, 112, 155]],
};
const inBox = (lat: number, lng: number, b: number[]) => lat >= b[0] && lat <= b[1] && lng >= b[2] && lng <= b[3];
const STEMS: Record<string, { h: number; side?: 'l' | 'r' }> = { GB: { h: 86 }, IE: { h: 36, side: 'l' }, EU: { h: 52, side: 'r' }, CA: { h: 44 }, US: { h: 40 }, AU: { h: 44 } };

export default function Countries() {
  const [sel, setSel] = useState('GB');
  const now = useNow(1000);
  const hub = countries.hub;
  const selected = countries.items.find((c) => c.code === sel)!;

  const dots = useMemo(() => {
    const out: { x: number; y: number; region: string | null; hub: boolean }[] = [];
    for (let i = 0; i < M.pts.length; i += 2) {
      const c = M.pts[i], r = M.pts[i + 1];
      const lat = M.latTop - r * latStep, lng = -180 + (c + 0.5) * (360 / M.cols);
      let region: string | null = null;
      for (const k of ['GB', 'IE', 'CA', 'US', 'AU', 'EU']) if (REGIONS[k].some((b) => inBox(lat, lng, b))) { region = k; break; }
      out.push({ x: c + 0.5, y: r + 0.5, region, hub: inBox(lat, lng, [8, 32, 68, 89]) });
    }
    return out;
  }, []);

  const [hx, hy] = toXY(hub.lat, hub.lng);
  const arcs = countries.items.map((c) => {
    const [x, y] = toXY(c.lat, c.lng); const d = Math.hypot(x - hx, y - hy);
    return { code: c.code, d: `M${hx},${hy} Q${(hx + x) / 2},${Math.min(hy, y) - d * 0.38} ${x},${y}` };
  });

  return (
    <section id="countries" data-theme="light" className="section overflow-hidden bg-gradient-to-b from-white to-ice">
      <div className="container-site">
        <SectionHeader tag={countries.eyebrow} title={countries.title} intro={countries.intro} highlight={['Personal']} />

        {/* market picker (ref4) */}
        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <div className="flex max-w-full flex-wrap justify-center gap-1.5 rounded-[1.25rem] border border-line bg-white p-1.5 shadow-soft">
            {countries.items.map((c) => (
              <button key={c.code} onClick={() => setSel(c.code)} aria-pressed={sel === c.code}
                className={clsx('relative rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition-colors', sel === c.code ? 'text-white' : 'text-ink/70 hover:text-ink')}>
                {sel === c.code && <motion.span layoutId="mkt" className="absolute inset-0 rounded-xl bg-grad shadow-blue" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative">{c.name}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mx-auto mt-10 w-full max-w-[1180px]" style={{ aspectRatio: `${M.cols}/${M.rows}` }}>
            <svg viewBox={`0 0 ${M.cols} ${M.rows}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-label="World map showing supported markets" role="img">
              <defs>
                <linearGradient id="arcG" x1="0" x2="1"><stop offset="0" stopColor="#0361DB" /><stop offset="1" stopColor="#5AA5FF" /></linearGradient>
              </defs>
              {dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={0.36}
                  fill={d.hub ? '#01152D' : d.region === sel ? '#0361DB' : d.region === 'EU' ? '#9CC4F2' : d.region ? '#5E97E6' : '#CBD6E4'}
                  style={{ transition: 'fill .5s' }} />
              ))}
              {arcs.map((a, i) => (
                <g key={a.code}>
                  <path id={`marc${i}`} d={a.d} fill="none" stroke="url(#arcG)" strokeWidth={a.code === sel ? 2.2 : 1.2} strokeOpacity={a.code === sel ? 1 : 0.45} strokeDasharray="4 5" vectorEffect="non-scaling-stroke" style={{ transition: 'stroke-width .4s, stroke-opacity .4s' }}>
                    <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r={a.code === sel ? 0.9 : 0.6} fill="#fff" stroke="#0361DB" strokeWidth={0.35}>
                    <animateMotion dur={`${2.6 + i * 0.35}s`} repeatCount="indefinite"><mpath href={`#marc${i}`} /></animateMotion>
                  </circle>
                </g>
              ))}
            </svg>

            {/* hub pin */}
            <div className="absolute z-10 -translate-x-1/2 -translate-y-full" style={pct(hub.lat, hub.lng)}>
              <div className="flex flex-col items-center">
                <span className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-grad px-3 py-1.5 text-[12px] font-semibold text-white shadow-blue"><Building2 className="h-3.5 w-3.5" />{hub.label} · Ahmedabad</span>
                <span className="h-9 w-px bg-brand" />
                <span className="relative h-3 w-3 rounded-full bg-brand"><span className="absolute inset-0 animate-ping rounded-full bg-brand/60" /></span>
              </div>
            </div>

            {/* market pins */}
            {countries.items.map((c) => {
              const st = STEMS[c.code]; const on = c.code === sel;
              return (
                <button key={c.code} onClick={() => setSel(c.code)} className="absolute z-10 -translate-x-1/2 -translate-y-full" style={pct(c.lat, c.lng)} aria-label={c.name}>
                  <div className="flex flex-col items-center">
                    <span className={clsx('hidden whitespace-nowrap rounded-[10px] px-3 py-1.5 text-[12px] font-semibold shadow-[0_8px_20px_-8px_rgba(1,21,45,.6)] transition-all duration-300 md:block', on ? 'bg-brand text-white' : 'bg-[#1B2A3F] text-white hover:bg-brand', st.side === 'l' && '-translate-x-[38%]', st.side === 'r' && 'translate-x-[38%]')}>{c.name}</span>
                    <span className={clsx('hidden w-px md:block', on ? 'bg-brand' : 'bg-[#1B2A3F]')} style={{ height: st.h }} />
                    <span className={clsx('h-2.5 w-2.5 rounded-full ring-4 transition-all', on ? 'bg-brand ring-brand/20' : 'bg-[#1B2A3F] ring-[#1B2A3F]/10')} />
                  </div>
                </button>
              );
            })}

            {/* info card (ref4 popup) */}
            <AnimatePresence mode="wait">
              <motion.div key={sel} initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE }}
                className="absolute bottom-[2%] left-0 z-20 hidden w-[290px] rounded-2xl border border-line bg-white/90 p-5 shadow-lift backdrop-blur-xl md:block">
                <p className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-brand"><MapPin className="h-3.5 w-3.5" />Supported market</p>
                <p className="mt-2 font-display text-[24px] font-semibold tracking-[-0.03em] text-ink">{selected.name}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-ice p-3">
                    <p className="text-[11px] text-muted">{selected.city}</p>
                    <p className="font-display text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-navy">{formatTime(selected.tz, now)}</p>
                  </div>
                  <div className="rounded-xl bg-navy p-3 text-white">
                    <p className="text-[11px] text-white/60">Ahmedabad team</p>
                    <p className="font-display text-[22px] font-semibold tabular-nums tracking-[-0.03em]">{formatTime(hub.tz, now)}</p>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-2 text-[12.5px] text-muted"><Clock3 className="h-3.5 w-3.5 text-brand" />Dedicated support across your working hours and beyond.</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* mobile market card */}
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-soft md:hidden">
          <p className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-brand"><MapPin className="h-3.5 w-3.5" />Supported market</p>
          <p className="mt-1 font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">{selected.name}</p>
          <p className="mt-1 text-[14px] text-muted">{selected.city} {formatTime(selected.tz, now)} · Ahmedabad team {formatTime(hub.tz, now)}</p>
        </div>

        {/* clocks */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {countries.items.map((c, i) => (
            <Reveal key={c.code} delay={i * 0.05}>
              <button onClick={() => setSel(c.code)} className={clsx('w-full rounded-2xl border p-4 text-left transition-all duration-300', c.code === sel ? 'border-brand/30 bg-white shadow-lift' : 'border-line bg-white/60 hover:bg-white')}>
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">{c.name}</p>
                <p className={clsx('mt-1 font-display text-[30px] font-semibold tabular-nums tracking-[-0.04em]', c.code === sel ? 'text-brand' : 'text-navy')}>{formatTime(c.tz, now)}</p>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <blockquote className="mx-auto max-w-[30ch] text-center font-display text-[clamp(1.5rem,2.8vw,2.3rem)] font-medium leading-[1.2] tracking-[-0.03em] text-navy">
            <span className="text-brand">“</span>{countries.quote}<span className="text-brand">”</span>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
