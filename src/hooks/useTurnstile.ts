/**
 * Cloudflare Turnstile (invisible) for the contact form.
 * The script loads only when the form comes near the viewport or gets focus, so it costs nothing on first paint.
 * No site key at build time (env TURNSTILE_SITE_KEY, see .env.example) → no widget; token() resolves ''.
 */
import { useCallback, useEffect, useRef, type RefObject } from 'react';

type Turnstile = {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  execute(id: string): void;
  reset(id: string): void;
  getResponse(id: string): string | undefined;
};
declare global { interface Window { turnstile?: Turnstile } }

const SITE_KEY = (import.meta.env.TURNSTILE_SITE_KEY as string | undefined) ?? '';
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<void> | null = null;

function load(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SRC; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { loading = null; reject(new Error('turnstile load failed')); };
    document.head.appendChild(s);
  });
  return loading;
}

export function useTurnstile(form: RefObject<HTMLElement>) {
  const container = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const waiting = useRef<((t: string) => void) | null>(null);
  const ready = useRef<Promise<void> | null>(null);

  const mount = useCallback(() => {
    if (!SITE_KEY || ready.current) return ready.current;
    ready.current = load().then(() => {
      if (!container.current || !window.turnstile || id.current) return;
      id.current = window.turnstile.render(container.current, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only', // invisible unless Cloudflare needs the visitor to click
        execution: 'execute', // token requested on submit
        callback: (t: string) => { waiting.current?.(t); waiting.current = null; },
        'error-callback': () => { waiting.current?.(''); waiting.current = null; },
        'expired-callback': () => { if (id.current) window.turnstile?.reset(id.current); },
      });
    }).catch(() => { ready.current = null; });
    return ready.current;
  }, []);

  useEffect(() => {
    const el = form.current;
    if (!SITE_KEY || !el) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { mount(); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(el);
    el.addEventListener('focusin', mount, { once: true });
    return () => { io.disconnect(); el.removeEventListener('focusin', mount); };
  }, [form, mount]);

  /** Resolves with a fresh token ('' if Turnstile isn't configured or fails; the API then decides). Gives up after 15s. */
  const token = useCallback(async (): Promise<string> => {
    if (!SITE_KEY) return '';
    await mount();
    const t = window.turnstile;
    if (!t || !id.current) return '';
    const existing = t.getResponse(id.current);
    if (existing) return existing;
    return new Promise<string>((resolve) => {
      const timer = setTimeout(() => { waiting.current = null; resolve(''); }, 15000);
      waiting.current = (v) => { clearTimeout(timer); resolve(v); };
      t.execute(id.current!);
    });
  }, [mount]);

  const reset = useCallback(() => { if (id.current) window.turnstile?.reset(id.current); }, []);

  return { container, token, reset };
}
