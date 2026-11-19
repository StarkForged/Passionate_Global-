/**
 * PECR / UK GDPR opt-in cookie banner (launch 6). DISABLED: the site uses only cookieless analytics (Vercel Web
 * Analytics), so there is nothing to consent to and no banner is shown.
 *
 * To use it (e.g. if GA4 is added):
 *   1. set COOKIE_BANNER_ENABLED = true below;
 *   2. load the tool ONLY inside `onConsent(granted => …)` when `granted` is true (never before);
 *   3. update the Cookie Policy (src/data/legal.ts) and the CSP in vercel.json (script-src / connect-src).
 * Rules it follows: nothing non-essential runs before a choice; "Reject" is as prominent as "Accept"; the choice is
 * remembered (localStorage, an essential "preference" item) and can be changed from the Cookie Policy page.
 */
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

export const COOKIE_BANNER_ENABLED = false;
const KEY = 'pg-consent'; // 'granted' | 'denied'

type Choice = 'granted' | 'denied';
const listeners = new Set<(granted: boolean) => void>();

export function getConsent(): Choice | null {
  try { const v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null; } catch { return null; }
}
/** Subscribe to the visitor's decision; called immediately if they already chose. */
export function onConsent(cb: (granted: boolean) => void) {
  const c = getConsent();
  if (c) cb(c === 'granted');
  listeners.add(cb);
  return () => listeners.delete(cb);
}
/** Re-open the banner (e.g. a "Change cookie settings" link on the Cookie Policy page). */
export function resetConsent() {
  try { localStorage.removeItem(KEY); } catch { /* storage blocked */ }
  window.dispatchEvent(new Event('pg-consent-reset'));
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!COOKIE_BANNER_ENABLED) return;
    setOpen(getConsent() === null);
    const reopen = () => setOpen(true);
    addEventListener('pg-consent-reset', reopen);
    return () => removeEventListener('pg-consent-reset', reopen);
  }, []);
  if (!COOKIE_BANNER_ENABLED || !open) return null;

  const choose = (c: Choice) => {
    try { localStorage.setItem(KEY, c); } catch { /* storage blocked: ask again next visit */ }
    listeners.forEach((f) => f(c === 'granted'));
    setOpen(false);
  };
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-desc"
      className="fixed inset-x-3 bottom-3 z-[150] mx-auto max-w-[680px] rounded-[1.5rem] border border-navy/10 bg-white p-5 shadow-lift sm:bottom-5 sm:p-6">
      <p id="cookie-title" className="font-display text-[18px] font-semibold tracking-[-0.02em] text-navy">Cookies</p>
      <p id="cookie-desc" className="mt-2 text-[15px] leading-relaxed text-muted">
        We’d like to use analytics cookies to understand how the site is used. They’re off unless you accept.{' '}
        <a href="/cookie-policy" className="font-medium text-brand underline-offset-2 hover:underline">Cookie Policy</a>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button size="sm" variant="dark" arrow={false} onClick={() => choose('denied')}>Reject</Button>
        <Button size="sm" variant="dark" arrow={false} onClick={() => choose('granted')}>Accept</Button>
      </div>
    </div>
  );
}
