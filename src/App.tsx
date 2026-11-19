import { useEffect } from 'react';
import { initSmoothScroll, ScrollTrigger, scrollToHash } from '@/lib/scroll';
import { markHydrated, useIsoLayoutEffect } from '@/lib/hydration';
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
  // root layout effect = runs after every child's: hydration is complete
  useIsoLayoutEffect(() => { markHydrated(); }, []);
  useEffect(() => {
    initSmoothScroll();
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 1500);
    addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
    // arriving with a section hash (e.g. /#contact from the privacy page): land on it once the layout has settled
    const hash = /^#[a-z][\w-]*$/i.test(location.hash) ? location.hash : '';
    const h = hash ? setTimeout(() => { refresh(); scrollToHash(hash, true); }, 1600) : undefined;
    return () => { clearTimeout(t); clearTimeout(h); removeEventListener('load', refresh); };
  }, []);
  return (
    <div className="grain">
      <a href="#main" className="skip-link">Skip to content</a>
      <Preloader />
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Purpose />
        <Why />
        <Services />
        <Industries />
        <Countries />
        <Process />
        <Security />
        <Team />
        <Life />
        <Testimonials />
        <CtaBand />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
