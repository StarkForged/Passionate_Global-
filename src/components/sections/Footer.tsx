import { ArrowUp, Linkedin, Instagram, Facebook } from 'lucide-react';
import { company, nav } from '@/data/content';
import { Logo } from '@/components/ui';
import { scrollToHash } from '@/lib/scroll';

export default function Footer() {
  const go = (h: string) => (e: React.MouseEvent) => { e.preventDefault(); scrollToHash(h); };
  return (
    <footer data-theme="dark" className="relative overflow-hidden bg-deep pt-24 text-[#9FB3CF]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-sky/40 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-[60%] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
      <div className="container-site relative">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-[36ch] text-[15px] leading-relaxed">{company.tagline}. Dedicated offshore teams that help recruitment businesses streamline operations and scale with confidence.</p>
            <div className="mt-7 flex gap-2.5">
              {[[Linkedin, company.socials.linkedin, 'LinkedIn'], [Instagram, company.socials.instagram, 'Instagram'], [Facebook, company.socials.facebook, 'Facebook']].map(([Icon, href, l]: any) => (
                <a key={l} href={href} aria-label={l} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition hover:border-brand hover:bg-brand hover:text-white"><Icon className="h-[18px] w-[18px]" /></a>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white">Explore</p>
            <ul className="space-y-3 text-[15px]">{nav.map((n) => <li key={n.href}><a href={n.href} onClick={go(n.href)} className="transition hover:text-white">{n.label}</a></li>)}</ul>
          </div>
          <div>
            <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white">Services</p>
            <ul className="space-y-3 text-[15px]">{['Recruitment Support', 'Finance & Accounting', 'Out-of-Hours Support', 'Business Support', 'IT & Security'].map((s) => <li key={s}><a href={s === 'IT & Security' ? '#security' : '#services'} onClick={go(s === 'IT & Security' ? '#security' : '#services')} className="transition hover:text-white">{s}</a></li>)}</ul>
          </div>
          <div>
            <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white">Contact</p>
            <ul className="space-y-3 text-[15px]">
              {company.phones.map((p) => <li key={p.href}><a href={p.href} className="tabular-nums transition hover:text-white">{p.label} {p.value}</a></li>)}
              <li><a href={`mailto:${company.email}`} className="transition hover:text-white">{company.email}</a></li>
              <li>Ahmedabad, Gujarat, India</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="relative mt-20 select-none overflow-hidden" aria-hidden>
        <p className="whitespace-nowrap text-center font-display text-[clamp(2.4rem,10.2vw,10.5rem)] font-bold leading-[0.82] tracking-[-0.06em]" style={{ background: 'linear-gradient(180deg, rgba(90,165,255,.42), rgba(90,165,255,0) 88%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>PASSIONATE GLOBAL</p>
      </div>
      <div className="container-site relative flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] py-7 text-[13px]">
        <span>© {new Date().getFullYear()} Passionate Global. All rights reserved.</span>
        <button onClick={() => scrollToHash('#home')} className="group flex items-center gap-2 transition hover:text-white">Back to top <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition group-hover:-translate-y-1 group-hover:border-brand group-hover:bg-brand"><ArrowUp className="h-4 w-4" /></span></button>
      </div>
    </footer>
  );
}
