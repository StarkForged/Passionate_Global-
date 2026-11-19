/**
 * Pre-render / hydration helpers (launch 3.1).
 *
 * The production HTML is pre-rendered at build time (scripts/prerender.mjs) and hydrated with `hydrateRoot`.
 * The first client render must produce exactly the server markup, so anything that depends on the browser
 * (media queries, the current time) starts from a deterministic value while hydrating and switches to the real
 * value in a layout effect right after (before the browser paints the hydrated page).
 */
import { useEffect, useLayoutEffect } from 'react';

export const isServer = typeof window === 'undefined';

/** True from module load until the first commit when the page arrived pre-rendered. Dev (empty #root) → false. */
let hydrating = !isServer && !!document.getElementById('root')?.firstElementChild
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; // reduced motion → fresh client render (main.tsx)
export const isHydrating = () => isServer || hydrating;
export const markHydrated = () => { hydrating = false; };

/** useLayoutEffect in the browser, useEffect on the server (no SSR warning). */
export const useIsoLayoutEffect = isServer ? useEffect : useLayoutEffect;

/** Fixed timestamp baked in at build time: server and first client render show the same clock values. */
export const BUILD_TIME = new Date(__BUILD_TIME__);
