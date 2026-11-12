import { useEffect, useState } from 'react';

/** Live `matchMedia` result. Defaults to `false` before mount. */
export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** Desktop + motion allowed: gate pinned / scroll-scrubbed layouts on this. */
export const usePinnable = () => useMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
