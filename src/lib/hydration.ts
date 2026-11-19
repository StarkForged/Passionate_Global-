/**
 * Pre-render / hydration helpers (launch 3.1).
 *
 * The production HTML is pre-rendered at build time (scripts/prerender.mjs) and hydrated with `hydrateRoot`, one
 * Suspense boundary (section) at a time. Each component's first client render must equal the server markup, so
 * browser-dependent values (media queries, the clock) are read through `useSyncExternalStore` with a server
 * snapshot: React uses the server value while hydrating that component, then re-renders it with the live value.
 * Components mounted later on the client get the live value straight away.
 */
import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react';

export const isServer = typeof window === 'undefined';

/** useLayoutEffect in the browser, useEffect on the server (no SSR warning). */
export const useIsoLayoutEffect = isServer ? useEffect : useLayoutEffect;

/** Fixed timestamp baked in at build time: server and hydration render show the same clock values. */
export const BUILD_TIME = new Date(__BUILD_TIME__);

const noop = () => () => {};
/** false on the server and while this component hydrates; true afterwards and for client-only mounts. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);
