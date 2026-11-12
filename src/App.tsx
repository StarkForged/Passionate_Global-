import { useEffect } from 'react';
import { initSmoothScroll, ScrollTrigger } from '@/lib/scroll';
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
    initSmoothScroll();
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 1500);
    addEventListener('load', refresh);
    return () => { clearTimeout(t); removeEventListener('load', refresh); };
  }, []);
  return (
    <div className="grain">
      <Preloader />
      <Nav />
      <main>
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
