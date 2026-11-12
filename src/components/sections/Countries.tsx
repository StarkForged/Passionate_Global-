/**
 * Countries — "follow-the-sun coverage". Market list with live local times beside a light cobe globe
 * (click a market to rotate to it), then a 24-hour timeline in UK time showing each market's working
 * day against the Ahmedabad team's cover, with a live "now" line.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { countries } from '@/data/content';
import { EASE, Reveal, SectionHeader } from '@/components/ui';
import { Globe } from '@/components/magicui/Globe';
import { formatTime, hourIn, useNow } from '@/hooks/useClock';
import { cn } from '@/lib/utils';

const UK = 'Europe/London';
type Seg = [number, number]; // [from, to) in UK hours, 0..24

/** Hours `tz` is ahead of the UK right now (handles DST and half-hour zones). */
const aheadOfUK = (tz: string, d: Date) => ((hourIn(tz, d) - hourIn(UK, d) + 36) % 24) - 12;
/** A [from, to) span that may wrap past midnight → 1 or 2 segments inside 0..24. */
const split = (from: number, to: number): Seg[] => {
  const f = ((from % 24) + 24) % 24, t = ((to % 24) + 24) % 24;
  if (f === t) return [[0, 24]];
  return f < t ? [[f, t]] : [[f, 24], [0, t]];
};
const pct = (h: number) => `${(h / 24) * 100}%`;
const hh = (h: number) => `${String(Math.floor(((h % 24) + 24) % 24)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

function Bar({ segs, className, label }: { segs: Seg[]; className: string; label?: string }) {
  return (
    <>
      {segs.map(([a, b], k) => (
        <motion.span key={k} className={cn('absolute inset-y-0 flex items-center overflow-hidden rounded-full', className)} style={{ left: pct(a), width: pct(b - a), transformOrigin: 'left' }}
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE, delay: 0.2 + k * 0.1 }}>
          {label && k === 0 && b - a > 4 && <span className="hidden truncate px-3 text-[13px] font-semibold sm:block">{label}</span>}
        </motion.span>
      ))}
    </>
  );
}

function Row({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6', className)}>
      <div className="text-[15px] sm:w-[200px] sm:shrink-0">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Coverage({ now, selected }: { now: Date; selected: number }) {
  const d = countries.deliveryHoursUK;
  const ukNow = hourIn(UK, now);
  const rows = countries.items.map((c) => {
    const ahead = aheadOfUK(c.tz, now);
    return { ...c, segs: split(9 - ahead, 17 - ahead) };
  });
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-ink sm:text-[28px]">{countries.coverageTitle}</h3>
        <p className="text-[14px] text-muted">{countries.coverageNote}</p>
      </div>

      {/* rows: label column + 24h track; the "now" line overlays the track column */}
      <div className="relative mt-10">
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 hidden sm:left-[224px] sm:block" aria-hidden>
          <div className="absolute bottom-0 top-9 w-0.5 -translate-x-1/2 rounded-full bg-navy" style={{ left: pct(ukNow) }}>
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+42px)] whitespace-nowrap rounded-full bg-navy px-2.5 py-1 text-[13px] font-semibold tabular-nums text-white">Now {formatTime(UK, now)}</span>
          </div>
        </div>

        <Row label={<span className="text-muted">UK time</span>}>
          <div className="relative h-5 text-[13px] font-medium tabular-nums text-muted">
            {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
              <span key={h} className={cn('absolute', h % 6 && 'hidden md:inline', h === 0 ? '' : h === 24 ? '-translate-x-full' : '-translate-x-1/2')} style={{ left: pct(h) }}>{String(h).padStart(2, '0')}:00</span>
            ))}
          </div>
        </Row>

        <Row label={<span className="font-semibold text-ink">{d.team}</span>} className="mt-4">
          <div className="relative h-10">
            <Bar segs={split(d.ooh.from, d.ooh.to)} className="bg-[repeating-linear-gradient(135deg,rgba(3,97,219,.18)_0_8px,rgba(3,97,219,.09)_8px_16px)] text-brand" label={d.ooh.label} />
            <Bar segs={split(d.core.from, d.core.to)} className="bg-grad text-white" label={d.core.label} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] font-medium text-muted sm:hidden">
            <span className="flex items-center gap-2"><span className="h-3 w-5 rounded-full bg-grad" />{d.core.label}</span>
            <span className="flex items-center gap-2"><span className="h-3 w-5 rounded-full bg-[repeating-linear-gradient(135deg,rgba(3,97,219,.3)_0_4px,rgba(3,97,219,.12)_4px_8px)]" />{d.ooh.label}</span>
          </div>
        </Row>
        <div className="my-5 h-px bg-navy/[0.08]" />

        <div className="space-y-3 sm:space-y-2.5">
          {rows.map((r, i) => (
            <Row key={r.code} label={
              <span className={cn('flex items-baseline justify-between gap-3', i === selected ? 'font-semibold text-ink' : 'text-ink/80')}>
                {r.name}
                <span className="text-[13px] font-medium tabular-nums text-muted sm:hidden">{hh(r.segs[0][0])}–{hh(r.segs[r.segs.length - 1][1])} UK</span>
              </span>
            }>
              <div className="relative h-8">
                <div className="absolute inset-0 rounded-full bg-ice" />
                <Bar segs={r.segs} className={cn('transition-colors duration-500', i === selected ? 'bg-brand/85' : 'bg-brand/25')} />
              </div>
            </Row>
          ))}
        </div>
      </div>
      <p className="mt-6 text-[14px] text-muted sm:hidden">Now in the UK: <b className="tabular-nums text-ink">{formatTime(UK, now)}</b></p>
    </div>
  );
}

export default function Countries() {
  const now = useNow(1000);
  const [sel, setSel] = useState(0);
  const c = countries.items[sel];
  const markers = useMemo(() => [
    ...countries.items.map((m, i) => ({ location: [m.lat, m.lng] as [number, number], size: i === sel ? 0.1 : 0.05 })),
    { location: [countries.hub.lat, countries.hub.lng] as [number, number], size: 0.08 },
  ], [sel]);

  return (
    <section id="countries" data-theme="light" className="section bg-ice">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
          <SectionHeader align="left" tag={countries.eyebrow} title={countries.title} highlight={['Personal']} />
          <Reveal delay={0.1}><p className="text-[17px] leading-[1.75] text-muted">{countries.intro}</p></Reveal>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <Reveal>
            <ul className="divide-y divide-navy/[0.08] border-y border-navy/[0.08]" aria-label="Markets we support">
              {countries.items.map((m, i) => (
                <li key={m.code}>
                  <button type="button" onClick={() => setSel(i)} aria-pressed={sel === i}
                    className={cn('group relative flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left transition-colors duration-300 sm:px-5', sel === i ? 'bg-white shadow-soft' : 'hover:bg-white/60')}>
                    {sel === i && <motion.span layoutId="mkt" className="absolute inset-y-3 left-0 w-1 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <span className="flex flex-col">
                      <span className={cn('font-display text-[clamp(1.4rem,2.2vw,1.75rem)] font-semibold tracking-[-0.03em]', sel === i ? 'text-ink' : 'text-ink/70')}>{m.name}</span>
                      <span className="text-[14px] text-muted">{m.city}</span>
                    </span>
                    <span className={cn('font-display text-[clamp(1.4rem,2.2vw,1.75rem)] font-medium tabular-nums tracking-[-0.02em]', sel === i ? 'text-brand' : 'text-ink/60')}>{formatTime(m.tz, now)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2.5 text-[15px] text-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/15" />
              {countries.hub.name} · {countries.hub.label} · <b className="tabular-nums text-ink">{formatTime(countries.hub.tz, now)}</b>
            </p>
          </Reveal>

          <Reveal delay={0.1} className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(90,165,255,.25),transparent_68%)] blur-2xl" />
            <Globe markers={markers} focus={[c.lat, c.lng]} />
            <span className="pointer-events-none absolute bottom-[6%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-ink shadow-soft">
              {c.city} <span className="text-muted">·</span> <span className="tabular-nums text-brand">{formatTime(c.tz, now)}</span>
            </span>
          </Reveal>
        </div>

        <Reveal className="mt-20"><Coverage now={now} selected={sel} /></Reveal>

        <Reveal className="mt-20 text-center">
          <p className="mx-auto max-w-[24ch] font-display text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-ink">{countries.quote}</p>
        </Reveal>
      </div>
    </section>
  );
}
