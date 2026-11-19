import { useEffect } from 'react';
import { LazyHydrate } from '@/lib/lazyHydrate';
import { initSmoothScroll, onFirstIntent, ScrollTrigger, scrollToHash, scrollTriggerReady } from '@/lib/scroll';
import Nav from '@/components/Nav';
import Preloader from '@/components/Preloader';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Purpose from '@/components/sections/Purpose';
import Why from '@/components/sections/Why';
import Services from '@/components/sections/Services';
import Industries from '@/components/sections/Industries';
import Countries from '@/components/sections/Countries';
import Process from '@/components/sections/Process';
import Security from '@/components/sections/Security';
import Team from '@/components/sections/Team';
import Life from '@/components/sections/Life';
import Testimonials from '@/components/sections/Testimonials';
import Contact, { CtaBand } from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

export default function App() {
  useEffect(() => {
    // Lenis measures the whole page when it starts: do it when the visitor first scrolls, not during load (launch 4)
    const stopIntent = onFirstIntent(() => initSmoothScroll());
    // one ScrollTrigger.refresh (it re-measures every trigger) per burst of layout changes, not one per event
    let raf = 0;
    const refresh = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (scrollTriggerReady()) ScrollTrigger.refresh(); }); };
    const t = setTimeout(refresh, 1500);
    addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    // arriving with a section hash (e.g. /#contact from the privacy page): land on it once the layout has settled
    // ?from=about etc.: hint left by the passionatestaffing.com redirects (docs/seo/redirect-map.md)
    const from = new URLSearchParams(location.search).get('from');
    const FROM: Record<string, string> = { about: '#about', services: '#services', security: '#security', life: '#life', contact: '#contact' };
    if (from) history.replaceState(null, '', location.pathname + (FROM[from] ?? location.hash));
    const hash = (from && FROM[from]) || (/^#[a-z][\w-]*$/i.test(location.hash) ? location.hash : '');
    const h = hash ? setTimeout(() => { refresh(); scrollToHash(hash, true); }, 1600) : undefined;
    return () => { stopIntent(); cancelAnimationFrame(raf); clearTimeout(t); clearTimeout(h); removeEventListener('load', refresh); };
  }, []);
  return (
    <div className="grain">
      <a href="#main" className="skip-link">Skip to content</a>
      <Preloader />
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <LazyHydrate k="about"><About /></LazyHydrate>
        <LazyHydrate k="purpose"><Purpose /></LazyHydrate>
        <LazyHydrate k="why"><Why /></LazyHydrate>
        <LazyHydrate k="services"><Services /></LazyHydrate>
        <LazyHydrate k="industries"><Industries /></LazyHydrate>
        <LazyHydrate k="countries"><Countries /></LazyHydrate>
        <LazyHydrate k="process"><Process /></LazyHydrate>
        <LazyHydrate k="security"><Security /></LazyHydrate>
        <LazyHydrate k="team"><Team /></LazyHydrate>
        <LazyHydrate k="life"><Life /></LazyHydrate>
        <LazyHydrate k="testimonials"><Testimonials /></LazyHydrate>
        <LazyHydrate k="ctaband"><CtaBand /></LazyHydrate>
        <LazyHydrate k="contact"><Contact /></LazyHydrate>
      </main>
      <LazyHydrate k="footer"><Footer /></LazyHydrate>
    </div>
  );
}
