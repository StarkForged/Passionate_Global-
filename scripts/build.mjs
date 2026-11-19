// Production build (npm run build): client bundle → pre-render bundle → static HTML for every page.
//   1. vite build                       → dist/ (index.html template + assets)
//   2. vite build --ssr entry-server    → dist-ssr/ (Node bundle, deleted afterwards)
//   3. scripts/prerender.mjs            → dist/index.html, privacy-policy.html, cookie-policy.html, 404.html
// Both bundles share one BUILD_TIME so live clocks hydrate without a mismatch.
import { build } from 'vite';
import { rmSync } from 'node:fs';
import { prerender } from './prerender.mjs';

process.env.BUILD_TIME ??= new Date().toISOString();
const root = new URL('..', import.meta.url);

await build({ root: root.pathname.replace(/^\/(\w:)/, '$1'), logLevel: 'info' });
await build({
  root: root.pathname.replace(/^\/(\w:)/, '$1'),
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', emptyOutDir: true, copyPublicDir: false },
});
await prerender();
rmSync(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true });
