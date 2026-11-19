// Screenshot an element/section: node scripts/shot.mjs <url> <selector> <width>x<height> <out.png> [scrollOffset]
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const [url, sel, size, out, off = '0'] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
const b = await chromium.launch({ executablePath: CHROME });
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(2200);
await p.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + Number(o)); }, [sel, off]);
await p.waitForTimeout(1800);
await p.screenshot({ path: out });
await b.close();
