/** CTA band (reference: ref_vid2 "Contact us" horizon card) + Contact section with enquiry form. */
import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { MapPin, Phone, Mail, Globe2, Check, ArrowRight, Clock3, AlertCircle } from 'lucide-react';
import { company, contact, countries, services } from '@/data/content';
import { Button, EASE, ExternalLink, Reveal, SectionHeader, SplitHeading } from '@/components/ui';
import { useClock } from '@/hooks/useClock';
import { useTurnstile } from '@/hooks/useTurnstile';

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

function Field({ id, label, type = 'text', required, autoComplete, textarea, value, onChange, error, message }: {
  id: string; label: string; type?: string; required?: boolean; autoComplete?: string; textarea?: boolean; value: string; onChange: (v: string) => void; error?: boolean; message?: string;
}) {
  const cls = clsx('peer w-full rounded-2xl border bg-[#F7FAFD] px-4 pb-2.5 pt-6 text-[15px] text-ink outline-none transition focus:bg-white focus:ring-4',
    error ? 'border-red-500 focus:ring-red-100' : 'border-navy/10 focus:border-brand focus:ring-brand/10');
  return (
    <label htmlFor={id} className="relative block">
      {textarea ? (
        <textarea id={id} rows={4} placeholder=" " value={value} onChange={(e) => onChange(e.target.value)} className={clsx(cls, 'resize-none')} />
      ) : (
        <input id={id} type={type} placeholder=" " required={required} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className={cls}
          aria-invalid={error || undefined} aria-describedby={error && message ? `${id}-err` : undefined} />
      )}
      <span className="pointer-events-none absolute left-4 top-[18px] text-[15px] text-muted transition-all peer-focus:top-2 peer-focus:text-[11.5px] peer-focus:font-semibold peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[11.5px] peer-[:not(:placeholder-shown)]:font-semibold">
        {label}{required && ' *'}
      </span>
      {error && message && <motion.span id={`${id}-err`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 block px-1 text-[13px] font-medium text-red-600">{message}</motion.span>}
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
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [failure, setFailure] = useState<'rate' | 'other'>('other');
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const turnstile = useTurnstile(formRef);
  const set = (k: keyof typeof f) => (v: string) => { setF((s) => ({ ...s, [k]: v })); setErrors((e) => ({ ...e, [k]: false })); };

  // move focus to the success heading once it mounts (after the form's exit animation)
  const focusDone = useCallback((el: HTMLHeadingElement | null) => el?.focus({ preventScroll: true }), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const er = { name: !f.name.trim(), company: !f.company.trim(), email: !/^\S+@\S+\.\S+$/.test(f.email) };
    setErrors(er);
    if (Object.values(er).some(Boolean)) {
      document.getElementById(er.name ? 'name' : er.company ? 'company' : 'email')?.focus();
      return;
    }
    setStatus('sending');
    try {
      const turnstileToken = await turnstile.token();
      // POST /api/contact (Vercel function, api/contact.ts): validated server-side, emailed via Resend.
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, services: svc, market, teamSize: size, website: honeypot.current?.value ?? '', turnstileToken }),
      });
      if (r.ok) { setStatus('sent'); return; }
      const body = await r.json().catch(() => ({}));
      if (r.status === 400 && Array.isArray(body.fields)) {
        const fe = Object.fromEntries((body.fields as string[]).filter((k) => k in f).map((k) => [k, true]));
        if (Object.keys(fe).length) { setErrors(fe); setStatus('idle'); return; }
      }
      setFailure(r.status === 429 ? 'rate' : 'other');
      setStatus('error');
    } catch {
      setFailure('other');
      setStatus('error');
    } finally {
      turnstile.reset();
    }
  };

  const reset = () => { setF({ name: '', company: '', email: '', phone: '', message: '' }); setStatus('idle'); };

  const info = [
    { icon: MapPin, label: 'Office Address', body: <address className="text-balance not-italic">{company.address.replace('Prahlad Nagar', 'Prahlad Nagar').replace(' – ', ' – ')}</address> },
    { icon: Phone, label: 'Phone', body: <>{company.phones.map((p) => <a key={p.href} href={p.href} className="block tabular-nums hover:text-brand">{company.phones.length > 1 && `${p.label} `}{p.value}</a>)}</> },
    { icon: Mail, label: 'Email', body: <a href={`mailto:${company.email}`} className="break-words hover:text-brand">{company.email}</a> },
    { icon: Globe2, label: 'Website', body: <ExternalLink href={company.website.href} className="hover:text-brand">{company.website.label}</ExternalLink> },
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
              {status !== 'sent' ? (
                <motion.form key="form" ref={formRef} onSubmit={submit} noValidate aria-busy={status === 'sending'} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex flex-col gap-5">
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
                    <Field id="name" label="Full name" required autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} message="Please add your name." />
                    <Field id="company" label="Company" required autoComplete="organization" value={f.company} onChange={set('company')} error={errors.company} message="Please add your company." />
                    <Field id="email" label="Work email" type="email" required autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} message="Please enter a valid work email." />
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
                  {/* honeypot: invisible to people, tempting to bots (the API silently drops anything that fills it) */}
                  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="website">Website</label>
                    <input ref={honeypot} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </div>
                  {Object.values(errors).some(Boolean) && <p role="alert" className="text-[14px] text-red-600">Please add your name, company and a valid work email so we can reply.</p>}
                  {status === 'error' && (
                    <p role="alert" className="flex gap-2.5 rounded-2xl bg-red-50 px-4 py-3 text-[14px] leading-relaxed text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span>
                        {failure === 'rate' ? 'You’ve sent several enquiries in a short time.' : 'Sorry, your enquiry couldn’t be sent just now.'}{' '}
                        Please try again later or email us directly at <a href={`mailto:${company.email}`} className="font-semibold underline underline-offset-2">{company.email}</a>.
                      </span>
                    </p>
                  )}
                  <div ref={turnstile.container} className="empty:hidden" />
                  <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'} arrow={status !== 'sending'}>
                    {status === 'sending'
                      ? <span className="inline-flex items-center gap-2.5"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />Sending…</span>
                      : 'Send enquiry'}
                  </Button>
                  <p className="-mt-1 text-center text-[13px] text-muted">By sending this form you agree to our <a href="/privacy-policy" className="font-medium text-brand underline-offset-2 hover:underline">Privacy Policy</a>.</p>
                </motion.form>
              ) : (
                <motion.div key="done" role="status" aria-live="polite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }} className="grid h-20 w-20 place-items-center rounded-full bg-grad text-white shadow-blue"><Check className="h-9 w-9" strokeWidth={2.5} /></motion.span>
                  <h3 ref={focusDone} tabIndex={-1} className="mt-7 font-display text-[28px] font-semibold tracking-[-0.03em] outline-none">Thanks, {f.name.trim().split(' ')[0]}. Your enquiry has been sent.</h3>
                  <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-muted">One of our consultants will contact you to discuss your requirements. We’ve sent a confirmation to <b className="break-words text-ink">{f.email}</b>.</p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button variant="outline" arrow={false} onClick={reset}>Send another enquiry</Button>
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
