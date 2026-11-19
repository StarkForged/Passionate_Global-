/** Pre-render entry (launch 3.1): built with `vite build --ssr`, called by scripts/prerender.mjs for every page. */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import Root from './Root';
import type { PageId } from './lib/page';
import { headFor } from './data/meta';

export { headFor };
export { PAGE_PATHS } from './lib/page';

export function render(page: PageId) {
  return renderToString(
    <StrictMode>
      <Root page={page} />
    </StrictMode>,
  );
}
