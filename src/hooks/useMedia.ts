import { useCallback, useSyncExternalStore } from 'react';

/** Live `matchMedia` result. `false` on the server and while hydrating (matches the pre-rendered HTML); React then
 *  re-renders with the real value before the hydrated section is painted. */
export function useMedia(query: string) {
  const subscribe = useCallback((cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

/** Desktop + motion allowed: gate pinned / scroll-scrubbed layouts on this. */
export const usePinnable = () => useMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
