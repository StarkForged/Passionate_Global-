import { useCallback, useSyncExternalStore } from 'react';
import { BUILD_TIME } from '@/lib/hydration';

const cache: Record<string, Intl.DateTimeFormat> = {};
export const formatTime = (tz: string, d = new Date(), seconds = false) => {
  const key = tz + seconds;
  cache[key] ??= new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}), hour12: false, timeZone: tz });
  return cache[key].format(d);
};

/** One shared ticking clock per interval (all subscribers update together). */
type Ticker = { now: Date; subs: Set<() => void>; id?: ReturnType<typeof setInterval> };
const tickers = new Map<number, Ticker>();
const ticker = (interval: number) => {
  let t = tickers.get(interval);
  if (!t) tickers.set(interval, (t = { now: new Date(), subs: new Set() }));
  return t;
};
function subscribe(interval: number, cb: () => void) {
  const t = ticker(interval);
  if (!t.subs.size) {
    t.now = new Date();
    t.id = setInterval(() => { t.now = new Date(); t.subs.forEach((f) => f()); }, interval);
  }
  t.subs.add(cb);
  return () => { t.subs.delete(cb); if (!t.subs.size) clearInterval(t.id); };
}

/** Re-renders every `interval` ms and returns the current Date. While hydrating (and on the server) it returns
 *  BUILD_TIME, so the pre-rendered clocks hydrate without a mismatch; React then re-renders with the real time. */
export function useNow(interval = 1000) {
  const sub = useCallback((cb: () => void) => subscribe(interval, cb), [interval]);
  return useSyncExternalStore(sub, () => ticker(interval).now, () => BUILD_TIME);
}

export function useClock(tz: string, seconds = false) {
  const now = useNow(1000);
  return formatTime(tz, now, seconds);
}

/** Hour (0-24 float) in a timezone. */
const hourFmt: Record<string, Intl.DateTimeFormat> = {};
export function hourIn(tz: string, d = new Date()) {
  hourFmt[tz] ??= new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, timeZone: tz });
  const p = hourFmt[tz].formatToParts(d);
  const g = (t: string) => +(p.find((x) => x.type === t)?.value ?? 0);
  return (g('hour') % 24) + g('minute') / 60 + g('second') / 3600;
}
