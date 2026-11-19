/**
 * Cookieless analytics (launch 6): Vercel Web Analytics. No cookies, no personal data, no consent banner needed
 * under UK GDPR / PECR. Turn it on in Vercel → Project → Analytics → Enable (see LAUNCH_TODO.md).
 * Loaded only on the production domain, after the page is interactive, from the same origin (CSP 'self').
 *
 * If GA4 or another cookie-setting tool is ever added, it must wait for consent: enable <CookieBanner/>
 * (components/CookieBanner.tsx) and load the tool only from its onAccept callback.
 */
declare global {
  interface Window { va?: (...args: unknown[]) => void; vaq?: unknown[][] }
}

export const PRODUCTION_HOST = /(^|\.)passionateglobal\.co\.in$/;

export function loadAnalytics() {
  if (typeof window === 'undefined' || !PRODUCTION_HOST.test(location.hostname)) return;
  const start = () => {
    window.va ??= (...args: unknown[]) => { (window.vaq ??= []).push(args); };
    const s = document.createElement('script');
    s.src = '/_vercel/insights/script.js';
    s.defer = true;
    document.head.appendChild(s);
  };
  if (document.readyState === 'complete') setTimeout(start, 0);
  else addEventListener('load', () => setTimeout(start, 0), { once: true });
}
