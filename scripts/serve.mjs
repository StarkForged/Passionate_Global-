// Local stand-in for Vercel's static hosting, for testing headers, CSP and redirects before deploying.
// Serves dist/ with vercel.json `headers`, `redirects` (incl. `has: host`), cleanUrls and 404.html.
//   node scripts/serve.mjs [port=4174] [--enforce] [--api]
//   --enforce  turns CSP-Report-Only into an enforced CSP
//   --api      mounts POST /api/contact (api/_lib/enquiry.ts, env from .env.local + process.env; Node >= 22.6)
// Test a host rule: curl -sI -H "Host: www.passionatestaffing.com" http://localhost:4174/about-us
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const cfg = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const port = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 4174);
const enforce = process.argv.includes('--enforce');
const api = process.argv.includes('--api') ? await import('../api/_lib/enquiry.ts') : null;
const env = { ...process.env };
try {
  for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && m[2]) env[m[1]] ??= m[2];
  }
} catch { /* no .env.local */ }
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };

/** path-to-regexp subset used in vercel.json: `:name*`, `:name`, and raw regex groups. Returns [regex, names]. */
function compile(src) {
  const names = [];
  const re = src.replace(/:(\w+)(\*)?/g, (_, n, star) => { names.push(n); return star ? '(.*)' : '([^/]+)'; });
  return [new RegExp('^' + re + '$'), names];
}
const hostOk = (has, host) => !has || has.every((h) => h.type !== 'host' || new RegExp('^' + h.value + '$').test(host));

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (api && url.pathname === '/api/contact') {
    let raw = '';
    for await (const c of req) raw += c;
    let body = null;
    try { body = JSON.parse(raw); } catch { /* invalid JSON -> 400 */ }
    const out = await api.handleEnquiry({ method: req.method, origin: req.headers.origin, ip: req.socket.remoteAddress ?? 'local', body }, env);
    res.writeHead(out.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(out.body));
  }
  const host = (req.headers.host ?? '').replace(/:\d+$/, '');
  let path = decodeURIComponent(url.pathname);

  for (const r of cfg.redirects ?? []) {
    const [re, names] = compile(r.source);
    const m = path.match(re);
    if (m && hostOk(r.has, host)) {
      let dest = r.destination;
      names.forEach((n, i) => { dest = dest.replace(':' + n + '*', m[i + 1] ?? '').replace(':' + n, m[i + 1] ?? ''); });
      dest = dest.replace(/\/$/, '') || '/';
      if (/^https?:\/\/[^/]+$/.test(dest)) dest += '/';
      res.writeHead(r.statusCode ?? (r.permanent ? 308 : 307), { Location: dest + (url.search && !dest.includes('?') ? url.search : '') });
      return res.end();
    }
  }
  if (cfg.trailingSlash === false && path.length > 1 && path.endsWith('/')) { res.writeHead(308, { Location: path.slice(0, -1) }); return res.end(); }

  let file = join(root, normalize(path));
  let status = 200;
  if (path.endsWith('.html') && cfg.cleanUrls) { res.writeHead(308, { Location: path.replace(/(index)?\.html$/, '') || '/' }); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  else if (!existsSync(file) && cfg.cleanUrls && existsSync(file + '.html')) file += '.html';
  if (!existsSync(file)) { file = join(root, '404.html'); status = 404; }
  if (!existsSync(file)) { res.writeHead(404); return res.end('404'); }

  const headers = { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' };
  for (const h of cfg.headers ?? []) {
    if (compile(h.source)[0].test(path) && hostOk(h.has, host)) for (const { key, value } of h.headers) headers[key] = value;
  }
  if (enforce && headers['Content-Security-Policy-Report-Only']) {
    headers['Content-Security-Policy'] = headers['Content-Security-Policy-Report-Only'];
    delete headers['Content-Security-Policy-Report-Only'];
  }
  for (const k of ['Content-Security-Policy', 'Content-Security-Policy-Report-Only']) // plain-http localhost
    if (headers[k]) headers[k] = headers[k].replace(/;\s*upgrade-insecure-requests/, '');
  delete headers['Strict-Transport-Security']; // never pin localhost to HTTPS
  res.writeHead(status, headers);
  res.end(readFileSync(file));
}).listen(port, () => console.log(`serving dist on http://localhost:${port}${enforce ? ' (CSP enforced)' : ''}`));
