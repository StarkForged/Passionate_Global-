// axe-core WCAG 2.2 AA scan of the built site.
// usage: node scripts/axe-scan.mjs [url] [out.json]   (default http://localhost:4173/)
import { chromium } from 'playwright-core';
import { AxeBuilder } from '@axe-core/playwright';
import { writeFileSync, existsSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:4173/';
const out = process.argv[3];
const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));

const browser = await chromium.launch({ executablePath: CHROME });
const results = {};
for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // scroll through so lazy / in-view content mounts
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += vp.height / 2) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  results[name] = r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, targets: v.nodes.slice(0, 8).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary ?? '').split('\n').slice(1, 2).join('')) }));
  console.log(`\n== ${name}: ${r.violations.length} rule(s) violated`);
  for (const v of results[name]) { console.log(`- [${v.impact}] ${v.id} (${v.count}): ${v.help}`); v.targets.forEach((t) => console.log('    ' + t)); }
  await ctx.close();
}
await browser.close();
if (out) writeFileSync(out, JSON.stringify(results, null, 2));
