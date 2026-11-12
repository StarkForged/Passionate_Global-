/** About — "statement + orbit". The about copy is the visual (Text Reveal); ref2's arcs become an orbit system. */
import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { Users, Calculator, ShieldCheck, MoonStar, Briefcase, Target, Workflow, Handshake } from 'lucide-react';
import { about, hero } from '@/data/content';
import { Reveal, SplitHeading, Tag } from '@/components/ui';
import { BlurFade, NumberTicker, OrbitingCircles, TextReveal } from '@/components/magicui';
import { usePinnable } from '@/hooks/useMedia';

// outer orbit = the services (trust.items); inner orbit = "your goals, processes and ways of working"
const outer = [
  { icon: Users, label: 'Recruitment Support' },
  { icon: Calculator, label: 'Finance & Accounting' },
  { icon: ShieldCheck, label: 'Compliance' },
  { icon: MoonStar, label: 'Out-of-Hours Services' },
  { icon: Briefcase, label: 'Business Support Services' },
];
const inner = [
  { icon: Target, label: 'Your goals' },
  { icon: Workflow, label: 'Your processes' },
  { icon: Handshake, label: 'Your ways of working' },
];

function Disc({ icon: Icon, label, size = 'lg' }: { icon: typeof Users; label: string; size?: 'lg' | 'sm' }) {
  return (
    <span title={label} aria-label={label} role="img"
      className={`grid place-items-center rounded-full border border-white bg-white text-brand shadow-soft ${size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'}`}>
      <Icon className={size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'} strokeWidth={1.6} />
    </span>
  );
}

/** 520px stage; scaled down on small screens so radii stay proportional. */
function Orbit() {
  return (
    <div className="relative mx-auto h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] xl:h-[520px] xl:w-[520px]" aria-label="Our services orbiting around your business" role="img">
      <div className="absolute left-0 top-0 h-[520px] w-[520px] origin-top-left scale-[.5385] sm:scale-[.769] xl:scale-100">
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(90,165,255,.14),transparent_70%)]" />
        <OrbitingCircles radius={128} duration={38} iconSize={48} reverse>
          {inner.map((d) => <Disc key={d.label} {...d} size="sm" />)}
        </OrbitingCircles>
        <OrbitingCircles radius={228} duration={60} iconSize={64}>
          {outer.map((d) => <Disc key={d.label} {...d} />)}
        </OrbitingCircles>
        <div className="absolute left-1/2 top-1/2 grid h-[124px] w-[124px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lift ring-1 ring-brand/10">
          <span className="absolute inset-[-10px] rounded-full border border-brand/10" />
          <img src="./img/logo-mark.png" alt="Passionate Global" className="h-14 w-auto" />
        </div>
      </div>
    </div>
  );
}

function PinnedStatement() {
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] });
  return (
    <div ref={stage} className="relative h-[230vh]">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="container-site grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
          <TextReveal progress={scrollYProgress} text={about.paragraphs[0]} className="font-display text-[clamp(2.125rem,2.9vw,2.75rem)] font-medium leading-[1.22] tracking-[-0.03em] text-ink" />
          <Orbit />
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const pin = usePinnable();
  const sentences = about.paragraphs[0].match(/[^.]+\./g) ?? [about.paragraphs[0]];

  return (
    <section id="about" data-theme="light" className="relative bg-white pt-24 md:pt-32 lg:pt-36">
      {/* header: H2 + the hero's long paragraph (moved here as the opener) */}
      <div className="container-site grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
        <div className="flex flex-col items-start gap-6">
          <Reveal y={12}><Tag>{about.eyebrow}</Tag></Reveal>
          <SplitHeading text={about.title} highlight={['differently']} className="h-section max-w-[16ch] text-ink" />
        </div>
        <Reveal delay={0.1}><p className="text-[17px] leading-[1.75] text-muted">{hero.body}</p></Reveal>
      </div>

      {/* statement + orbit */}
      {pin ? <PinnedStatement /> : (
        <div className="container-site mt-16 grid gap-14">
          <div className="space-y-4 font-display text-[clamp(1.6rem,6.4vw,2.4rem)] font-medium leading-[1.25] tracking-[-0.03em] text-ink">
            {sentences.map((s, i) => <BlurFade key={i} delay={i * 0.1}><p>{s.trim()}</p></BlurFade>)}
          </div>
          <Orbit />
        </div>
      )}

      {/* stats */}
      <div className="container-site mt-16 lg:mt-8">
        <div className="grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {about.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="flex flex-col items-center px-6 py-10 text-center sm:py-12">
              <span className="font-display text-[clamp(3.5rem,6vw,5.5rem)] font-semibold leading-none tracking-[-0.05em] text-ink">
                <NumberTicker value={s.value} className="normal-nums" />{s.suffix && <span className="text-grad">{s.suffix}</span>}
              </span>
              <span className="mt-3 text-[16px] text-muted">{s.label}</span>
            </Reveal>
          ))}
        </div>
      </div>

      {/* second paragraph + punch line */}
      <div className="container-site pb-24 pt-20 text-center md:pb-32 lg:pb-36 lg:pt-28">
        <Reveal><p className="mx-auto max-w-[60ch] text-[18px] leading-[1.75] text-muted">{about.paragraphs[1]}</p></Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-14 max-w-[20ch] font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-ink">
            {about.punch[0]} <span className="text-sweep whitespace-nowrap">{about.punch[1]}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
