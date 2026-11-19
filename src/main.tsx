import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/inter-tight';
import './styles/index.css';
import Root from './Root';
import { pageFromPath, type PageId } from './lib/page';
import { loadAnalytics } from './lib/analytics';

const el = document.getElementById('root')!;
// The pre-renderer stamps the page id on #root (the 404 page is served for any unknown URL).
const page = (el.dataset.page as PageId | undefined) ?? pageFromPath(location.pathname);
const app = (
  <StrictMode>
    <Root page={page} />
  </StrictMode>
);

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (el.firstElementChild && !reducedMotion) {
  // Production: hydrate the pre-rendered HTML (rendered for the default, motion-allowed experience).
  hydrateRoot(el, app, { onRecoverableError: (err) => console.warn('[hydration]', err) });
} else {
  // Dev server (no pre-render), or reduced-motion visitors: their first render intentionally differs from the
  // pre-rendered markup (static layouts, no animations), so render fresh instead of hydrating.
  createRoot(el).render(app);
}

loadAnalytics();
