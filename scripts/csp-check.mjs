// Load pages with an enforced CSP (scripts/serve.mjs --enforce), scroll through, interact, report violations + console errors.
// usage: node scripts/csp-check.mjs [base=http://localhost:4174] [paths...]
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4174';
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/'];
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
const b = await chromium.launch({ executablePath: CHROME, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let bad = 0;
for (const path of paths) for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error' || /Content Security Policy|Refused/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await p.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP ${e.violatedDirective} blocked ${e.blockedURI} (${e.sourceFile}:${e.lineNumber})`)));
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += vp.height * 0.6) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(150); }
  await p.waitForTimeout(1500);
  console.log(`${path} @${vp.width}: ${errs.length ? errs.length + ' issue(s)' : 'clean'}`);
  errs.forEach((e) => console.log('   ' + e));
  bad += errs.length;
  await ctx.close();
}
await b.close();
process.exit(bad ? 1 : 0);
