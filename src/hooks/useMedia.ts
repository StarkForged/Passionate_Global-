import { useState } from 'react';
import { isHydrating, useIsoLayoutEffect } from '@/lib/hydration';

/** Live `matchMedia` result. `false` on the server and while hydrating (matches the pre-rendered HTML), then the real
 *  value in a layout effect, so the switch happens before the hydrated page is painted. */
export function useMedia(query: string) {
  const [match, setMatch] = useState(() => !isHydrating() && window.matchMedia(query).matches);
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** Desktop + motion allowed: gate pinned / scroll-scrubbed layouts on this. */
export const usePinnable = () => useMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
