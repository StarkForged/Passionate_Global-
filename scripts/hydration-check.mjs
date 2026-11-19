// Loads each pre-rendered page and reports hydration warnings, console errors and page errors.
// usage: node scripts/hydration-check.mjs [base=http://localhost:4175] [paths...]  (MSYS_NO_PATHCONV=1 in Git Bash)
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4175';
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/', '/privacy-policy', '/cookie-policy', '/no-such-page'];
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
const b = await chromium.launch({ executablePath: CHROME });
let bad = 0;
for (const reduced of [false, true]) for (const path of paths) for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const ctx = await b.newContext({ viewport: vp, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const msgs = [];
  p.on('console', (m) => { if (m.type() === 'error' || /hydrat/i.test(m.text())) msgs.push(`${m.type()}: ${m.text().slice(0, 240)}`); });
  p.on('pageerror', (e) => msgs.push('pageerror: ' + e.message.slice(0, 240)));
  const r = await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const title = await p.title();
  console.log(`${reduced ? 'reduced ' : ''}${path} @${vp.width} [${r.status()}] "${title}": ${msgs.length ? msgs.length + ' issue(s)' : 'clean'}`);
  msgs.forEach((m) => console.log('   ' + m));
  if (!reduced) bad += msgs.length;
  await ctx.close();
}
await b.close();
process.exit(bad ? 1 : 0);
