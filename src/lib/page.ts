import { createContext, useContext } from 'react';

/** Which page is rendering. Pre-rendered pages: '/', '/privacy-policy', '/cookie-policy', '/404'. */
export type PageId = 'home' | 'privacy' | 'cookies' | 'notfound';

export const PAGE_PATHS: Record<PageId, string> = { home: '/', privacy: '/privacy-policy', cookies: '/cookie-policy', notfound: '/404' };

export function pageFromPath(path: string): PageId {
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/' || p === '/index.html') return 'home';
  if (p === '/privacy-policy') return 'privacy';
  if (p === '/cookie-policy') return 'cookies';
  return 'notfound';
}

export const PageContext = createContext<PageId>('home');
export const usePage = () => useContext(PageContext);

/** Section links that work from every page: '#about' on the home page, '/#about' on the others. */
export function useSectionHref() {
  const home = usePage() === 'home';
  return (hash: string) => (home ? hash : '/' + (hash === '#home' ? '' : hash));
}
