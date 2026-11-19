import { useEffect, useState } from 'react';
import { BUILD_TIME, isHydrating, useIsoLayoutEffect } from '@/lib/hydration';

const cache: Record<string, Intl.DateTimeFormat> = {};
export const formatTime = (tz: string, d = new Date(), seconds = false) => {
  const key = tz + seconds;
  cache[key] ??= new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}), hour12: false, timeZone: tz });
  return cache[key].format(d);
};

/** Re-renders every `interval` ms and returns the current Date. Server + hydration render use BUILD_TIME (so the
 *  pre-rendered HTML hydrates without a mismatch); the real time is set in a layout effect before the first paint. */
export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => (isHydrating() ? BUILD_TIME : new Date()));
  useIsoLayoutEffect(() => { setNow(new Date()); }, []);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), interval); return () => clearInterval(id); }, [interval]);
  return now;
}

export function useClock(tz: string, seconds = false) {
  const now = useNow(1000);
  return formatTime(tz, now, seconds);
}

/** Hour (0-24 float) in a timezone. */
export function hourIn(tz: string, d = new Date()) {
  const p = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, timeZone: tz }).formatToParts(d);
  const g = (t: string) => +(p.find((x) => x.type === t)?.value ?? 0);
  return (g('hour') % 24) + g('minute') / 60 + g('second') / 3600;
}
