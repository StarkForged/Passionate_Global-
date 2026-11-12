/** CTA band (reference: ref_vid2 "Contact us" horizon card) + Contact section with enquiry form. */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { MapPin, Phone, Mail, Globe2, Check, ArrowRight, Clock3 } from 'lucide-react';
import { company, contact, countries, services } from '@/data/content';
import { Button, EASE, Reveal, SectionHeader, SplitHeading } from '@/components/ui';
import { useClock } from '@/hooks/useClock';

export function CtaBand() {
  return (
    <section data-theme="light" className="bg-ice pt-8">
      <div className="container-site">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-[radial-gradient(90%_70%_at_50%_100%,#0A2F6B_0%,#021836_45%,#000915_100%)] px-6 pb-48 pt-24 text-center text-white sm:pb-56">
            <div className="pointer-events-none absolute inset-0 dot-grid-dark [mask-image:radial-gradient(60%_60%_at_50%_30%,#000,transparent)]" />
            <SplitHeading text={contact.ctaTitle} className="mx-auto max-w-[16ch] font-display text-[clamp(2.2rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.045em]" highlight={['Offshore']} dark />
            <p className="mx-auto mt-6 max-w-[54ch] text-[17px] leading-relaxed text-[#AFC4E0]">{contact.ctaBody}</p>
            <div className="mt-10 flex justify-center"><Button href="#contact" variant="light" size="lg">{contact.ctaButton}</Button></div>
            {/* planet horizon */}
            <motion.div className="pointer-events-none absolute left-1/2 top-[calc(100%-120px)] -z-10 h-[1000px] w-[180%] rounded-[50%]"
              style={{ x: '-50%', background: 'radial-gradient(60% 40% at 50% 0%, #F4F9FF 0%, #A6D0FF 8%, #3485F2 22%, #0B3E8F 46%, #021836 80%)', boxShadow: '0 -10px 50px rgba(160,205,255,.75), 0 -50px 180px rgba(60,140,255,.6)' }}
              animate={{ y: [0, -12, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ id, label, type = 'text', required, autoComplete, textarea, value, onChange, error }: {
  id: string; label: string; type?: string; required?: boolean; autoComplete?: string; textarea?: boolean; value: string; onChange: (v: string) => void; error?: boolean;
}) {
  const cls = clsx('peer w-full rounded-2xl border bg-[#F7FAFD] px-4 pb-2.5 pt-6 text-[15px] text-ink outline-none transition focus:bg-white focus:ring-4',
    error ? 'border-red-400 focus:ring-red-100' : 'border-navy/10 focus:border-brand focus:ring-brand/10');
  return (
    <label htmlFor={id} className="relative block">
      {textarea ? (
        <textarea id={id} rows={4} placeholder=" " value={value} onChange={(e) => onChange(e.target.value)} className={clsx(cls, 'resize-none')} />
      ) : (
        <input id={id} type={type} placeholder=" " required={required} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
      <span className="pointer-events-none absolute left-4 top-[18px] text-[15px] text-muted transition-all peer-focus:top-2 peer-focus:text-[11.5px] peer-focus:font-semibold peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[11.5px] peer-[:not(:placeholder-shown)]:font-semibold">
        {label}{required && ' *'}
      </span>
    </label>
  );
}

export default function Contact() {
  const officeTime = useClock(countries.hub.tz);
  const [f, setF] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [svc, setSvc] = useState<string[]>([services.items[0].title]);
  const [size, setSize] = useState('3–5');
  const [market, setMarket] = useState('United Kingdom');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (v: string) => { setF((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: false })); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er = { name: !f.name.trim(), company: !f.company.trim(), email: !/^\S+@\S+\.\S+$/.test(f.email) };
    setErrors(er);
    if (Object.values(er).some(Boolean)) return;
    // BACKEND: replace this block with a POST to your form service / API (Formspree, Netlify Forms, HubSpot…)
    const body = `Name: ${f.name}\nCompany: ${f.company}\nEmail: ${f.email}\nPhone: ${f.phone || '-'}\nServices: ${svc.join(', ') || '-'}\nBased in: ${market}\nTeam size: ${size}\n\n${f.message}`;
    setSent(`mailto:${company.email}?subject=${encodeURIComponent('Website enquiry: ' + f.company)}&body=${encodeURIComponent(body)}`);
  };

  const info = [
    { icon: MapPin, label: 'Office Address', body: <>{company.address}</> },
    { icon: Phone, label: 'Phone', body: <>{company.phones.map((p) => <a key={p.href} href={p.href} className="block hover:text-brand">{p.label} {p.value}</a>)}</> },
    { icon: Mail, label: 'Email', body: <a href={`mailto:${company.email}`} className="hover:text-brand">{company.email}</a> },
    { icon: Globe2, label: 'Website', body: <a href={company.website.href} className="hover:text-brand">{company.website.label}</a> },
  ];

  return (
    <section id="contact" data-theme="light" className="section bg-ice">
      <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeader align="left" tag={contact.eyebrow} title={contact.title} highlight={['Conversation']} />
          <Reveal delay={0.1} className="mt-6 space-y-4">
            <p className="font-display text-[20px] font-medium tracking-[-0.02em] text-navy">{contact.lead}</p>
            <p className="text-[16px] leading-[1.75] text-muted">{contact.body}</p>
          </Reveal>
          <p className="mb-4 mt-10 font-display text-[18px] font-semibold tracking-[-0.02em] text-ink">Get in Touch</p>
          <div className="grid gap-3">
            {info.map((it, i) => (
              <Reveal key={it.label} delay={i * 0.06}>
                <div className="flex gap-4 rounded-2xl border border-white bg-white/80 p-4 shadow-soft backdrop-blur">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/[0.08] text-brand"><it.icon className="h-5 w-5" strokeWidth={1.7} /></span>
                  <div className="text-[15px] leading-relaxed text-ink">
                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">{it.label}</p>
                    {it.body}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-navy p-4 text-white">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-sky"><Clock3 className="h-5 w-5" /></span>
            <p className="text-[14px] text-[#B9CBE4]">Our Ahmedabad office time is now <b className="font-display text-[18px] tabular-nums text-white">{officeTime}</b></p>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-lift sm:p-10">
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex flex-col gap-5">
                  <div>
                    <h3 className="font-display text-[28px] font-semibold tracking-[-0.03em] text-ink">{contact.formTitle}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{contact.formIntro}</p>
                  </div>
                  <fieldset>
                    <legend className="mb-3 text-[13px] font-semibold text-ink">What do you need help with?</legend>
                    <div className="flex flex-wrap gap-2">
                      {services.items.map((s) => {
                        const on = svc.includes(s.title);
                        return (
                          <button type="button" key={s.id} onClick={() => setSvc((v) => (on ? v.filter((x) => x !== s.title) : [...v, s.title]))} aria-pressed={on}
                            className={clsx('flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-medium transition-all', on ? 'border-brand bg-brand text-white shadow-blue' : 'border-navy/10 bg-white text-ink hover:border-brand/40')}>
                            <span className={clsx('grid h-4 w-4 place-items-center rounded-full border transition', on ? 'border-white bg-white text-brand' : 'border-navy/25')}>{on && <Check className="h-3 w-3" strokeWidth={3.5} />}</span>
                            {s.title}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="name" label="Full name" required autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} />
                    <Field id="company" label="Company" required autoComplete="organization" value={f.company} onChange={set('company')} error={errors.company} />
                    <Field id="email" label="Work email" type="email" required autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
                    <Field id="phone" label="Phone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="relative block">
                      <select id="market" value={market} onChange={(e) => setMarket(e.target.value)} className="w-full appearance-none rounded-2xl border border-navy/10 bg-[#F7FAFD] px-4 pb-2.5 pt-6 text-[15px] text-ink outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10">
                        {[...countries.items.map((c) => c.name), 'Other'].map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <span className="pointer-events-none absolute left-4 top-2 text-[11.5px] font-semibold text-muted">Where are you based?</span>
                      <ArrowRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
                    </label>
                    <fieldset className="rounded-2xl border border-navy/10 bg-[#F7FAFD] px-2 pb-2 pt-1.5">
                      <legend className="sr-only">Team size</legend>
                      <p className="px-2 text-[11.5px] font-semibold text-muted">Team size</p>
                      <div className="mt-1 grid grid-cols-4 gap-1">
                        {['1–2', '3–5', '6–10', '10+'].map((s) => (
                          <button type="button" key={s} onClick={() => setSize(s)} aria-pressed={size === s} className={clsx('relative rounded-xl py-1.5 text-[13.5px] font-semibold transition-colors', size === s ? 'text-white' : 'text-ink/70 hover:text-ink')}>
                            {size === s && <motion.span layoutId="size" className="absolute inset-0 rounded-xl bg-navy" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                            <span className="relative">{s}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                  <Field id="message" label="How can we help?" textarea value={f.message} onChange={set('message')} />
                  {Object.values(errors).some(Boolean) && <p className="text-[14px] text-red-500">Please add your name, company and a valid work email so we can reply.</p>}
                  <Button type="submit" size="lg" className="w-full">Send enquiry</Button>
                </motion.form>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }} className="grid h-20 w-20 place-items-center rounded-full bg-grad text-white shadow-blue"><Check className="h-9 w-9" strokeWidth={2.5} /></motion.span>
                  <h3 className="mt-7 font-display text-[28px] font-semibold tracking-[-0.03em]">Thanks, {f.name.split(' ')[0]}. Your enquiry is ready.</h3>
                  <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted">Open it in your email app to send it to our team, or write to us directly at <b className="text-ink">{company.email}</b>.</p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button href={sent}>Open in email app</Button>
                    <Button variant="outline" arrow={false} onClick={() => setSent(null)}>Edit enquiry</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
