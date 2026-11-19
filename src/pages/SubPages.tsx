/**
 * Privacy Policy, Cookie Policy and 404 (launch). Same design system as the home page: the floating Nav, a dark
 * header band in the hero's colours (so the nav starts in its "top" state), light content, the locked Footer.
 */
import { Fragment, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import Nav from '@/components/Nav';
import Footer from '@/components/sections/Footer';
import { Button, Tag } from '@/components/ui';
import { company, pagesCopy } from '@/data/content';
import { cookies, privacy, LEGAL_UPDATED, type LegalDoc } from '@/data/legal';
import type { PageId } from '@/lib/page';

function Shell({ children, band }: { children: ReactNode; band: ReactNode }) {
  return (
    <div className="grain">
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <section id="home" data-theme="dark" className="relative isolate overflow-hidden bg-deep text-white">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_0%,#052149_0%,#01122B_45%,#000915_80%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 dot-grid-dark opacity-60 [mask-image:radial-gradient(60%_70%_at_50%_0%,#000,transparent)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky/40 to-transparent" />
          <div className="container-site pb-16 pt-[clamp(8.5rem,20vh,11rem)] md:pb-20">{band}</div>
        </section>
        {children}
      </main>
      <Footer />
    </div>
  );
}

/** Turns {email}, {privacy} and {cookies} tokens in the legal copy into links. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\{email\}|\{privacy\}|\{cookies\})/);
  const link = 'font-medium text-brand underline decoration-brand/30 underline-offset-[3px] transition hover:decoration-brand';
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p === '{email}' ? <a href={`mailto:${company.email}`} className={link}>{company.email}</a>
            : p === '{privacy}' ? <a href="/privacy-policy" className={link}>Privacy Policy</a>
              : p === '{cookies}' ? <a href="/cookie-policy" className={link}>Cookie Policy</a>
                : p}
        </Fragment>
      ))}
    </>
  );
}

export function LegalPage({ page }: { page: Exclude<PageId, 'home' | 'notfound'> }) {
  const doc: LegalDoc = page === 'privacy' ? privacy : cookies;
  return (
    <Shell
      band={
        <div className="max-w-[46rem]">
          <Tag dark>{doc.eyebrow}</Tag>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{doc.title}</h1>
          <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-[#B6C8E2] sm:text-[18px]">{doc.intro}</p>
          <p className="mt-6 text-[14px] text-[#8DB8EE]">{pagesCopy.legalNote} {LEGAL_UPDATED}</p>
        </div>
      }
    >
      <section data-theme="light" className="bg-white py-16 md:py-24">
        <div className="container-site">
          <article className="mx-auto max-w-[46rem]">
            {doc.sections.map((s) => (
              <section key={s.title} className="border-t border-line py-9 first:border-t-0 first:pt-0">
                <h2 className="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-semibold tracking-[-0.03em] text-navy">{s.title}</h2>
                <div className="mt-4 space-y-4 text-[16px] leading-[1.75] text-muted">
                  {s.body.map((b, i) => <p key={i}><Rich text={b} /></p>)}
                  {s.list && (
                    <ul className="space-y-2.5">
                      {s.list.map((l, i) => (
                        <li key={i} className="flex gap-3"><span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span><Rich text={l} /></span></li>
                      ))}
                    </ul>
                  )}
                  {s.after?.map((b, i) => <p key={i}><Rich text={b} /></p>)}
                </div>
              </section>
            ))}
            <div className="mt-6 flex flex-col gap-4 rounded-[1.5rem] bg-ice p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <p className="text-[16px] leading-relaxed text-navy">Questions about your data? <a href={`mailto:${company.email}`} className="font-semibold text-brand underline-offset-[3px] hover:underline">{company.email}</a></p>
              <a href={page === 'privacy' ? '/cookie-policy' : '/privacy-policy'} className="group inline-flex items-center gap-2 text-[15px] font-semibold text-navy">
                {page === 'privacy' ? 'Cookie Policy' : 'Privacy Policy'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
            </div>
          </article>
        </div>
      </section>
    </Shell>
  );
}

export function NotFound() {
  const c = pagesCopy.notFound;
  return (
    <Shell
      band={
        <div className="flex min-h-[calc(100svh-15rem)] flex-col items-center justify-center pb-8 text-center">
          <Tag dark>{c.eyebrow}</Tag>
          <p aria-hidden className="text-grad-light mt-6 font-display text-[clamp(6rem,20vw,12rem)] font-semibold leading-none tracking-[-0.06em]">404</p>
          <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2rem,4.6vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.04em]">{c.title}</h1>
          <p className="mt-5 max-w-[48ch] text-[17px] leading-relaxed text-[#B6C8E2]">{c.body}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/" variant="light">{c.home}</Button>
            <Button href="/#contact" variant="glass" arrow={false}>{c.contact}</Button>
          </div>
        </div>
      }
    >
      {null}
    </Shell>
  );
}
