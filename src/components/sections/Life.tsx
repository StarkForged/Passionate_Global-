/** Life at Passionate Global — reference: ref_vid3 image-card row → two-row moving culture gallery. */
import { Users, Award, GraduationCap, PartyPopper, CalendarHeart, Building2, Sprout } from 'lucide-react';
import { life } from '@/data/content';
import { Reveal, SectionHeader } from '@/components/ui';

const icons = [Users, Award, GraduationCap, PartyPopper, CalendarHeart, Building2, Sprout];
const tones = [
  ['#5AA5FF', '#0361DB'], ['#1679E0', '#01152D'], ['#7DB8FF', '#1679E0'], ['#0361DB', '#0A2547'],
  ['#3D8FF5', '#01152D'], ['#9CC8FF', '#0361DB'], ['#1679E0', '#0A2547'],
];

function Card({ i }: { i: number }) {
  const g = life.gallery[i]; const Icon = icons[i]; const photo = g.photos[0];
  return (
    <figure className="group relative h-[300px] w-[300px] shrink-0 overflow-hidden rounded-[1.75rem] sm:h-[340px] sm:w-[380px]"
      style={{ background: `linear-gradient(150deg, ${tones[i][0]}, ${tones[i][1]})` }}>
      {photo ? (
        <img src={photo} alt={g.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_10%,rgba(255,255,255,.35),transparent_60%)]" />
          <svg className="absolute -bottom-16 -right-16 h-72 w-72 text-white/10 transition-transform duration-[1.4s] group-hover:rotate-45" viewBox="0 0 100 100" aria-hidden>
            {[48, 36, 24].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth=".6" />)}
          </svg>
          <span className="absolute left-6 top-6 grid h-16 w-16 place-items-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur-md transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <Icon className="h-8 w-8" strokeWidth={1.5} />
          </span>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#000915]/75 via-transparent to-transparent" />
      <figcaption className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/60">Moments · 0{i + 1}</p>
        <p className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-white">{g.title}</p>
      </figcaption>
    </figure>
  );
}

export default function Life() {
  const rowA = [0, 1, 2, 3, 4, 5, 6], rowB = [3, 5, 0, 6, 2, 4, 1];
  return (
    <section id="life" data-theme="light" className="section overflow-hidden bg-ice">
      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
          <SectionHeader align="left" tag={life.eyebrow} title={life.title} highlight={['Great', 'Partnerships']} />
          <Reveal delay={0.1} className="space-y-4">
            {life.paragraphs.map((p, i) => <p key={i} className="text-[16px] leading-[1.75] text-muted">{p}</p>)}
          </Reveal>
        </div>

        <Reveal className="mt-14">
          <div className="relative overflow-hidden rounded-[2rem] bg-navy p-8 text-white sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand/50 blur-3xl" />
            <div className="relative grid gap-6 md:grid-cols-[280px_1fr] md:items-center">
              <h3 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{life.moreTitle}</h3>
              <p className="text-[16px] leading-[1.75] text-[#B9CBE4]">{life.more}</p>
            </div>
          </div>
        </Reveal>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-semibold tracking-[-0.03em] text-ink">{life.galleryTitle}</h3>
          <p className="max-w-[52ch] text-[15px] text-muted">{life.galleryIntro}</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        {[rowA, rowB].map((row, r) => (
          <div key={r} className="group/row flex overflow-hidden">
            <div className="flex w-max gap-5 hover:[animation-play-state:paused]" style={{ animation: `marquee ${r ? 70 : 60}s linear infinite ${r ? 'reverse' : ''}` }}>
              {[...row, ...row].map((i, k) => <Card key={k} i={i} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
