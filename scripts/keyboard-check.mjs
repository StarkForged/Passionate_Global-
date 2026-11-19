// Keyboard-only smoke test: skip link, nav, testimonial tabs, values wheel, mobile menu, form. usage: node scripts/keyboard-check.mjs [base]
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4176';
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find((p) => existsSync(p));
const b = await chromium.launch({ executablePath: CHROME });
let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) fails++; };
const focused = (p) => p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''} "${(a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 40)}"` : ''; });

{ // desktop
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.keyboard.press('Tab');
  ok(/Skip to content/.test(await focused(p)), 'first Tab = skip link: ' + await focused(p));
  const visible = await p.evaluate(() => document.activeElement.getBoundingClientRect().top >= 0);
  ok(visible, 'skip link is visible when focused');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  ok(/main#main/.test(await focused(p)), 'Enter on skip link moves focus to <main>');
  // focus ring present on a nav link
  await p.keyboard.press('Shift+Tab');
  for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); if (/Services/.test(await focused(p))) break; }
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  ok(ring !== 'none', 'visible focus outline on nav link (' + ring + ')');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(2500);
  const top = await p.evaluate(() => Math.round(document.querySelector('#services').getBoundingClientRect().top));
  ok(Math.abs(top - 76) < 40, `Enter on "Services" scrolls to #services (top ${top}px)`);

  // testimonial tabs
  await p.evaluate(() => document.querySelector('#testimonials').scrollIntoView());
  await p.waitForTimeout(1500);
  await p.focus('#testimonial-tab-0');
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(200);
  ok(/testimonial-tab-1/.test(await focused(p)) && await p.getAttribute('#testimonial-tab-1', 'aria-selected') === 'true', 'ArrowRight moves to and selects the next testimonial tab');
  await p.keyboard.press('End');
  ok(await p.getAttribute('#testimonial-tab-2', 'aria-selected') === 'true', 'End selects the last tab');

  // values wheel
  await p.evaluate(() => document.querySelector('[aria-label="Core values"]').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(1200);
  const nodes = p.locator('[aria-label="Core values"] button');
  if (await nodes.count()) {
    await nodes.first().focus();
    const before = await focused(p);
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(200);
    ok(before !== await focused(p), `values wheel: ArrowRight moves focus (${before} -> ${await focused(p)})`);
  } else ok(false, 'values wheel buttons found');

  // form: keyboard submit with empty fields
  await p.evaluate(() => document.querySelector('#contact').scrollIntoView());
  await p.waitForTimeout(1200);
  await p.focus('#message');
  await p.keyboard.press('Tab'); // honeypot is tabIndex -1: next should be the submit button
  ok(/button.*Send enquiry/.test(await focused(p)), 'honeypot skipped by Tab, next stop = Send enquiry: ' + await focused(p));
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  ok(/input#name/.test(await focused(p)), 'empty submit focuses the first invalid field');
  ok(await p.getAttribute('#name', 'aria-describedby') === 'name-err', 'error linked with aria-describedby');
  await p.close();
}
{ // mobile menu
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.focus('button[aria-label="Open menu"]');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(900);
  ok(await p.locator('button[aria-label="Close menu"]').count() === 1, 'mobile menu opens with Enter');
  ok(await p.evaluate(() => getComputedStyle(document.documentElement).overflow) === 'hidden', 'page scroll locked while the menu is open');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(900);
  ok(await p.locator('button[aria-label="Open menu"]').count() === 1, 'Escape closes the menu');
  await p.close();
}
await b.close();
console.log(fails ? `${fails} failure(s)` : 'all keyboard checks passed');
process.exit(fails ? 1 : 0);
