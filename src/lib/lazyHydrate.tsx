/**
 * Lazy hydration (launch 4). Below-the-fold sections keep their pre-rendered HTML (fully readable and visible) and
 * are hydrated only when they come within one screen of the viewport, or right before an in-page jump
 * (scrollToHash → hydrateAll). This keeps several seconds of main-thread work off a phone's initial load.
 *
 * How: each section sits in its own Suspense boundary with a <Gate> that suspends during the initial hydration until
 * its section is near. React 18 keeps a dehydrated boundary's server HTML in place while it is suspended and
 * hydrates it when the promise resolves (the same mechanism React.lazy uses with SSR).
 * Not used on the server, in dev (no pre-render) or for reduced-motion visitors (fresh client render, main.tsx).
 */
import { Suspense, useEffect, type ReactNode } from 'react';
import { isServer } from './hydration';

const LAZY = !isServer && !!document.getElementById('root')?.firstElementChild
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type GateState = { promise: Promise<void>; open: () => void; isOpen: boolean; hydrated: boolean };
const gates = new Map<string, GateState>();
const waiters = new Set<() => void>();

function gate(k: string): GateState {
  let g = gates.get(k);
  if (g) return g;
  let resolve!: () => void;
  const promise = new Promise<void>((r) => { resolve = r; });
  const state: GateState = { promise, isOpen: !LAZY, hydrated: !LAZY, open: () => { if (!state.isOpen) { state.isOpen = true; resolve(); } } };
  gates.set(k, state);
  if (LAZY) {
    const el = document.querySelector(`[data-hk="${k}"]`);
    if (!el) state.open();
    else {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); state.open(); } }, { rootMargin: '100% 0px' });
      io.observe(el);
    }
  }
  return state;
}

const allHydrated = () => [...gates.values()].every((g) => g.hydrated);

function Gate({ k }: { k: string }) {
  const g = gate(k);
  if (!g.isOpen) throw g.promise; // keeps the server HTML until the section is near
  return null;
}

function Hydrated({ k }: { k: string }) {
  useEffect(() => {
    gate(k).hydrated = true;
    if (allHydrated()) { waiters.forEach((f) => f()); waiters.clear(); }
  }, [k]);
  return null;
}

/** Wrap a below-the-fold section. `k` must be unique on the page. */
export function LazyHydrate({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div data-hk={k}>
      <Suspense fallback={null}>
        <Gate k={k} />
        {children}
        <Hydrated k={k} />
      </Suspense>
    </div>
  );
}

/** Hydrate every remaining section (before an in-page jump, so heights are final). Resolves when done (max 3s). */
export function hydrateAll(): Promise<void> {
  if (!LAZY || allHydrated()) return Promise.resolve();
  gates.forEach((g) => g.open());
  return new Promise((resolve) => {
    const t = setTimeout(resolve, 3000);
    waiters.add(() => { clearTimeout(t); requestAnimationFrame(() => requestAnimationFrame(() => resolve())); });
  });
}
