/**
 * Services — reference: ref1 (bottom slide: banking bento with mini interactive visuals + pill tags),
 * upgraded into an auto-advancing "service explorer" with a live product-style mock per service.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Users, Wallet, MoonStar, Briefcase, Check, Clock3, Mail, CalendarDays, Database, Inbox, ShieldCheck, Zap } from 'lucide-react';
import { services } from '@/data/content';
import { EASE, SectionHeader } from '@/components/ui';
import { formatTime, hourIn, useNow } from '@/hooks/useClock';

const icons = [Users, Wallet, MoonStar, Briefcase];
const DURATION = 8000;

/* ---------------- Mock 1: recruitment pipeline (kanban) ---------------- */
const CANDS = [
  { n: 'Sarah M.', r: 'Band 5 Nurse', c: '#5AA5FF' }, { n: 'James O.', r: 'Support Worker', c: '#1679E0' },
  { n: 'Priya K.', r: 'Teaching Asst.', c: '#7DB8FF' }, { n: 'Tom H.', r: 'HGV Driver', c: '#0361DB' },
  { n: 'Aisha B.', r: 'Care Assistant', c: '#3D8FF5' }, { n: 'Luca R.', r: 'Site Engineer', c: '#2F6FD0' },
];
const COLS = ['Sourced', 'Screened', 'Compliant', 'Booked'];
function PipelineMock() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 1300); return () => clearInterval(id); }, []);
  // each candidate advances one column every few ticks, staggered
  const colOf = (i: number) => Math.min(3, Math.max(0, Math.floor((tick - i * 1.6) / 2.2) % 5));
  return (
    <div className="grid h-full grid-cols-4 gap-3">
      {COLS.map((col, ci) => {
        const items = CANDS.map((c, i) => ({ ...c, i })).filter((c) => colOf(c.i) === ci);
        return (
          <div key={col} className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2.5">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[#8FA9CC]">{col}</span>
              <span className="rounded-full bg-white/[0.07] px-2 text-[11px] tabular-nums text-white/70">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {items.map((c) => (
                  <motion.div key={c.n} layout layoutId={'cand' + c.n} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.6, ease: EASE }}
                    className="rounded-xl border border-white/[0.08] bg-[#0E2546] p-2.5 shadow-[0_8px_20px_-10px_rgba(0,0,0,.6)]">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: c.c }}>{c.n.split(' ').map((p) => p[0]).join('')}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-semibold text-white">{c.n}</p>
                        <p className="truncate text-[11px] text-[#8FA9CC]">{c.r}</p>
                      </div>
                    </div>
                    {ci >= 2 && <div className="mt-2 flex items-center gap-1 text-[10.5px] font-medium text-emerald-300"><ShieldCheck className="h-3 w-3" />{ci === 3 ? 'Shift confirmed' : 'Docs verified'}</div>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Mock 2: bank reconciliation ---------------- */
const TX = [
  { d: '03 Nov', p: 'Client invoice #4821', a: '£4,250.00' }, { d: '04 Nov', p: 'Payroll — weekly', a: '-£18,940.12' },
  { d: '05 Nov', p: 'Client invoice #4822', a: '£6,780.50' }, { d: '06 Nov', p: 'Agency fees', a: '-£1,120.00' },
  { d: '07 Nov', p: 'Client invoice #4823', a: '£3,960.00' }, { d: '07 Nov', p: 'Credit control — recovered', a: '£2,400.00' },
];
function ReconMock() {
  const [n, setN] = useState(0);
  useEffect(() => { const id = setInterval(() => setN((v) => (v >= TX.length + 3 ? 0 : v + 1)), 900); return () => clearInterval(id); }, []);
  const matched = Math.min(n, TX.length);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
      <div className="grid grid-cols-[72px_1fr_110px_108px] gap-3 border-b border-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8FA9CC]">
        <span>Date</span><span>Description</span><span className="text-right">Amount</span><span className="text-right">Status</span>
      </div>
      {TX.map((t, i) => {
        const ok = i < matched;
        return (
          <div key={i} className={clsx('relative grid grid-cols-[72px_1fr_110px_108px] items-center gap-3 border-b border-white/[0.04] px-4 py-[11px] text-[13px] transition-colors duration-500', i === matched && 'bg-sky/[0.06]')}>
            {i === matched && <motion.span layoutId="scanline" className="absolute inset-y-0 left-0 w-[3px] bg-sky shadow-[0_0_12px_#5AA5FF]" />}
            <span className="tabular-nums text-[#8FA9CC]">{t.d}</span>
            <span className="truncate text-white/90">{t.p}</span>
            <span className={clsx('text-right font-medium tabular-nums', t.a.startsWith('-') ? 'text-white/70' : 'text-white')}>{t.a}</span>
            <span className="flex justify-end">
              <AnimatePresence mode="wait">
                {ok ? (
                  <motion.span key="ok" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300"><Check className="h-3 w-3" />Matched</motion.span>
                ) : (
                  <motion.span key="pd" exit={{ opacity: 0 }} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/50">Pending</motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        );
      })}
      <div className="mt-auto flex items-center justify-between px-4 py-3.5">
        <span className="text-[12px] text-[#8FA9CC]">Bank balance vs ledger</span>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-r from-sky to-emerald-300" animate={{ width: `${(matched / TX.length) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} /></div>
          <span className="w-12 text-right text-[13px] font-semibold tabular-nums text-white">{Math.round((matched / TX.length) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mock 3: 24h coverage dial ---------------- */
function CoverageMock() {
  const now = useNow(1000);
  const h = hourIn('Europe/London', now);
  const R = 118, C = 150;
  const pt = (hr: number, r = R) => { const a = (hr / 24) * Math.PI * 2 - Math.PI / 2; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  const arc = (from: number, to: number, r = R) => {
    const [x1, y1] = pt(from, r), [x2, y2] = pt(to, r); const span = ((to - from + 24) % 24); return `M${x1},${y1} A${r},${r} 0 ${span > 12 ? 1 : 0} 1 ${x2},${y2}`;
  };
  const [hx, hy] = pt(h, R - 26);
  const events = [
    { t: '18:42', e: 'Late booking confirmed', ic: CalendarDays }, { t: '22:15', e: 'Overnight admin queue cleared', ic: Inbox },
    { t: '02:14', e: 'Emergency shift filled', ic: Zap }, { t: '06:30', e: 'Handover notes sent', ic: Mail },
  ];
  return (
    <div className="grid h-full items-center gap-6 sm:grid-cols-[300px_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[300px]">
        <svg viewBox="0 0 300 300" className="h-full w-full">
          <defs><linearGradient id="cov" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#8B7BFF" /><stop offset="1" stopColor="#5AA5FF" /></linearGradient></defs>
          <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="16" />
          <path d={arc(9, 17)} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="16" strokeLinecap="round" />
          <motion.path d={arc(17, 9)} fill="none" stroke="url(#cov)" strokeWidth="16" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: EASE }} style={{ filter: 'drop-shadow(0 0 10px rgba(139,123,255,.6))' }} />
          {Array.from({ length: 24 }).map((_, i) => { const [x1, y1] = pt(i, R - 18), [x2, y2] = pt(i, R - (i % 6 === 0 ? 28 : 23)); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.25)" strokeWidth={i % 6 === 0 ? 1.6 : 1} />; })}
          {[0, 6, 12, 18].map((v) => { const [x, y] = pt(v, R - 42); return <text key={v} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.5)" fontFamily="inherit">{String(v).padStart(2, '0')}</text>; })}
          <line x1={C} y1={C} x2={hx} y2={hy} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={C} cy={C} r="6" fill="#5AA5FF" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
          <p className="font-display text-[26px] font-semibold tabular-nums tracking-[-0.03em] text-white">{formatTime('Europe/London', now)}</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#8FA9CC]">UK time</p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="mb-1 flex items-center gap-2 text-[12px] text-[#B9CBE4]"><span className="h-2 w-2 rounded-full bg-[#8B7BFF]" />Out-of-hours cover 17:00 – 09:00<span className="ml-3 h-2 w-2 rounded-full bg-white/30" />Your office hours</div>
        {events.map((ev, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: EASE }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#8B7BFF]/15 text-[#C2B8FF]"><ev.ic className="h-4 w-4" /></span>
            <span className="text-[13px] text-white/90">{ev.e}</span>
            <span className="ml-auto font-medium tabular-nums text-[12px] text-[#8FA9CC]">{ev.t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Mock 4: admin workspace ---------------- */
const MAILS = [
  { f: 'Client — Healthcare', s: 'New booking request for Monday', ic: Mail },
  { f: 'CRM', s: '42 candidate records updated', ic: Database },
  { f: 'Calendar', s: 'Interview slots scheduled (6)', ic: CalendarDays },
  { f: 'Client — Education', s: 'Invoice query resolved', ic: Mail },
  { f: 'Data entry', s: 'Timesheet batch imported', ic: Database },
];
function AdminMock() {
  const [done, setDone] = useState(0);
  useEffect(() => { const id = setInterval(() => setDone((d) => (d >= MAILS.length + 2 ? 0 : d + 1)), 1100); return () => clearInterval(id); }, []);
  const left = Math.max(0, MAILS.length - done);
  return (
    <div className="grid h-full gap-3 sm:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8FA9CC]"><Inbox className="h-3.5 w-3.5" />Inbox</span>
          <span className="rounded-full bg-sky/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-sky">{left} open</span>
        </div>
        {MAILS.map((m, i) => {
          const ok = i < done;
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-500 hover:bg-white/[0.03]">
              <span className={clsx('grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-500', ok ? 'border-emerald-400 bg-emerald-400 text-deep' : 'border-white/20')}>{ok && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
              <div className="min-w-0">
                <p className={clsx('truncate text-[12.5px] font-semibold transition-colors duration-500', ok ? 'text-white/40 line-through' : 'text-white')}>{m.s}</p>
                <p className="truncate text-[11px] text-[#8FA9CC]">{m.f}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8FA9CC]">Today</p>
          <div className="mt-3 flex flex-col gap-2">
            {[['09:30', 'Client call', 'bg-sky'], ['11:00', 'CRM clean-up', 'bg-[#8B7BFF]'], ['14:00', 'Diary management', 'bg-emerald-400']].map(([t, l, c]) => (
              <div key={t} className="flex items-center gap-2.5 text-[12.5px]"><span className={`h-8 w-1 rounded-full ${c}`} /><span className="tabular-nums text-[#8FA9CC]">{t}</span><span className="text-white/90">{l}</span></div>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-2xl bg-grad p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">Tasks completed</p>
          <p className="mt-1 font-display text-[40px] font-semibold tabular-nums leading-none tracking-[-0.04em]">{120 + done * 3}</p>
          <p className="mt-2 text-[12px] text-white/75">this week, behind the scenes</p>
        </div>
      </div>
    </div>
  );
}

const MOCKS = [PipelineMock, ReconMock, CoverageMock, AdminMock];
const MOCK_TITLES = ['Live pipeline', 'Bank reconciliation', '24-hour coverage', 'Admin workspace'];

export default function Services() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => { setActive((a) => (a + 1) % services.items.length); setKey((k) => k + 1); }, DURATION);
    return () => clearTimeout(id);
  }, [active, paused, key]);
  const pick = (i: number) => { setActive(i); setKey((k) => k + 1); };
  const s = services.items[active];
  const Mock = MOCKS[active];

  return (
    <section id="services" data-theme="dark" className="section overflow-hidden bg-deep text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_20%,rgba(3,97,219,.28),transparent_70%),radial-gradient(50%_40%_at_10%_90%,rgba(22,121,224,.18),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 dot-grid-dark [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />
      <div className="container-site relative">
        <SectionHeader dark tag={services.eyebrow} title={services.title} intro={services.intro} highlight={['Growth']} />

        <div className="mt-16 grid gap-6 lg:grid-cols-[400px_1fr]" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          {/* tabs */}
          <div className="flex flex-col gap-3" role="tablist" aria-label="Services">
            {services.items.map((it, i) => {
              const Icon = icons[i]; const on = i === active;
              return (
                <button key={it.id} role="tab" aria-selected={on} onClick={() => pick(i)}
                  className={clsx('group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-500', on ? 'border-sky/30 bg-white/[0.07]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]')}>
                  <div className="flex items-center gap-4">
                    <span className={clsx('grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-all duration-500', on ? 'bg-grad text-white shadow-blue' : 'bg-white/[0.06] text-sky')}><Icon className="h-[22px] w-[22px]" strokeWidth={1.7} /></span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium tabular-nums text-[#8FA9CC]">0{i + 1}</p>
                      <p className="font-display text-[19px] font-semibold tracking-[-0.02em]">{it.title}</p>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                        <span className="block pt-4 text-[14.5px] leading-relaxed text-[#A9BDD8]">{it.lead && <b className="font-semibold text-white">{it.lead} </b>}{it.body}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {on && (
                    <span className="absolute inset-x-5 bottom-0 h-[2px] overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.span key={key} className="block h-full bg-gradient-to-r from-sky to-brand" initial={{ width: '0%' }} animate={{ width: paused ? undefined : '100%' }} transition={{ duration: DURATION / 1000, ease: 'linear' }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* stage */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.015))] p-5 shadow-glow sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /></div>
              <AnimatePresence mode="wait">
                <motion.p key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-[13px] font-medium text-[#B9CBE4]">{MOCK_TITLES[active]}</motion.p>
              </AnimatePresence>
              <span className="ml-auto flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-[11.5px] font-semibold text-emerald-300"><span className="h-1.5 w-1.5 animate-[pulse-ring_2s_infinite] rounded-full bg-emerald-400" />Live</span>
            </div>
            <div className="relative h-[400px] sm:h-[380px]">
              <AnimatePresence mode="wait">
                <motion.div key={active} className="absolute inset-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none]" initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }} transition={{ duration: 0.6, ease: EASE }}>
                  <div className="h-full min-w-[600px]"><Mock /></div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#8FA9CC]">Services include</p>
              <AnimatePresence mode="wait">
                <motion.ul key={active} className="flex flex-wrap gap-2" initial="h" animate="s" exit="h" variants={{ s: { transition: { staggerChildren: 0.04 } }, h: {} }}>
                  {s.list.map((l) => (
                    <motion.li key={l} variants={{ h: { opacity: 0, y: 8 }, s: { opacity: 1, y: 0 } }}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[13px] font-medium text-white/90 transition-colors hover:border-sky/50 hover:bg-sky/10">
                      <Check className="h-3.5 w-3.5 text-sky" />{l}
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
            <Clock3 className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 text-white/[0.02]" />
          </div>
        </div>
      </div>
    </section>
  );
}
