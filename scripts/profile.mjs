// CPU profile of the page load (mobile viewport, 4x CPU throttle): top functions by self time and long tasks.
// usage: node scripts/profile.mjs [url=http://localhost:4173/] [seconds=12]
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const url = process.argv[2] ?? 'http://localhost:4173/';
const secs = Number(process.argv[3] ?? 12);
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find((p) => existsSync(p));
const b = await chromium.launch({ executablePath: CHROME, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
await p.addInitScript(() => {
  window.__lt = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true });
});
await cdp.send('Profiler.start');
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(secs * 1000);
const { profile } = await cdp.send('Profiler.stop');
const lt = await p.evaluate(() => window.__lt);
const self = new Map();
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const dt = profile.timeDeltas;
profile.samples.forEach((id, i) => {
  const n = byId.get(id); const f = n.callFrame;
  const key = `${f.functionName || '(anon)'} ${f.url.split('/').pop()}:${f.lineNumber}`;
  self.set(key, (self.get(key) ?? 0) + (dt[i] ?? 0) / 1000);
});
const top = [...self.entries()].filter(([k]) => !/\(idle\)|\(program\)|\(garbage/.test(k)).sort((a, z) => z[1] - a[1]).slice(0, 25);
console.log('long tasks [start, ms]:', JSON.stringify(lt.filter(([, d]) => d > 100)));
console.log('TBT-ish (sum over 50ms):', lt.reduce((s, [, d]) => s + Math.max(0, d - 50), 0));
top.forEach(([k, v]) => console.log(String(Math.round(v)).padStart(6), k));
await b.close();
