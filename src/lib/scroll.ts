import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

/** Smooth scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
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

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: hash === '#home' ? 0 : -navH(), duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
