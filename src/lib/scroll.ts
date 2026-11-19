import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hydrateAll } from './lazyHydrate';

// Registered on first use, not at import: once registered, ScrollTrigger re-measures the whole page on load/resize,
// which is wasted work until something actually uses it (the hero timeline, built on the first scroll intent).
let registered = false;
export function ensureScrollTrigger() {
  if (!registered) { gsap.registerPlugin(ScrollTrigger); registered = true; }
  return ScrollTrigger;
}
export const scrollTriggerReady = () => registered;
export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

/** Run `cb` once, on the visitor's first scroll intent (or immediately if the page is already scrolled). */
export function onFirstIntent(cb: () => void) {
  const events = ['scroll', 'wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  let done = false;
  const run = () => { if (done) return; done = true; events.forEach((e) => removeEventListener(e, run)); cb(); };
  if (scrollY > 0) run();
  else events.forEach((e) => addEventListener(e, run, { passive: true }));
  return () => { done = true; events.forEach((e) => removeEventListener(e, run)); };
}

/** Smooth scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', () => { if (registered) ScrollTrigger.update(); });
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/** Lock / unlock page scrolling (mobile menu). Works with and without Lenis. */
export function lockScroll(lock: boolean) {
  if (lock) lenis?.stop(); else lenis?.start();
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}

/** Fixed header height + top gap (CSS custom property `--nav-h`, index.css), in px. */
export const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;

/** Smooth-scroll to a section. On another page (privacy, cookies, 404) the section isn't there: go to the home page. */
export function scrollToHash(hash: string, immediate = false) {
  if (!document.querySelector(hash)) { location.href = '/' + (hash === '#home' ? '' : hash); return; }
  // sections hydrate lazily (lib/lazyHydrate) and desktop layouts change height when they do: finish first
  hydrateAll().then(() => {
    const el = document.querySelector(hash) as HTMLElement | null;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: hash === '#home' ? 0 : -navH(), duration: 1.4, immediate });
    else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  });
}
