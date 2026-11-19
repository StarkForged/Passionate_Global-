// Pre-render (launch 3.1): renders every page with React's renderToString from the SSR bundle (dist-ssr/) into the
// client template (dist/index.html), so crawlers and link previews get the full text. The browser then hydrates it
// (src/main.tsx → hydrateRoot). Canvas/WebGL parts are client-only (React.lazy → empty in the HTML).
// Run by scripts/build.mjs; standalone: node scripts/prerender.mjs (after both vite builds).
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const ssr = new URL('../dist-ssr/entry-server.js', import.meta.url);

const OUT = { home: 'index.html', privacy: 'privacy-policy.html', cookies: 'cookie-policy.html', notfound: '404.html' };

export async function prerender() {
  const { render, headFor } = await import(pathToFileURL(ssr.pathname.replace(/^\/(\w:)/, '$1')).href + `?t=${Date.now()}`);
  const template = readFileSync(new URL('index.html', dist), 'utf8');
  if (!template.includes('<!--app-head-->') || !template.includes('<div id="root"></div>')) throw new Error('prerender: placeholders missing in dist/index.html');

  for (const [page, file] of Object.entries(OUT)) {
    const html = render(page);
    if (html.length < 500) throw new Error(`prerender: ${page} rendered almost nothing`);
    const out = template
      .replace('<!--app-head-->', headFor(page))
      .replace('<div id="root"></div>', `<div id="root" data-page="${page}">${html}</div>`);
    writeFileSync(new URL(file, dist), out);
    console.log(`prerender: ${file.padEnd(20)} ${(out.length / 1024).toFixed(0)} kB`);
  }

  // sitemap.xml: the indexable pages (not the 404), lastmod = build date
  const day = (process.env.BUILD_TIME ?? new Date().toISOString()).slice(0, 10);
  const urls = [['/', '1.0'], ['/privacy-policy', '0.3'], ['/cookie-policy', '0.3']];
  writeFileSync(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>https://www.passionateglobal.co.in${u}</loc><lastmod>${day}</lastmod><priority>${p}</priority></url>`).join('\n')}
</urlset>
`);
  console.log('prerender: sitemap.xml');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await prerender();
