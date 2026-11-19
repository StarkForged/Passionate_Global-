// End-to-end check of the contact form UI: validation, error state (real API without Resend keys -> 503),
// success state (API mocked), keyboard focus. Screenshots to qa/launch/. usage: node scripts/form-check.mjs [base]
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4175';
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
mkdirSync('qa/launch', { recursive: true });
const b = await chromium.launch({ executablePath: CHROME });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(base + '/', { waitUntil: 'networkidle' });
await p.evaluate(() => document.getElementById('contact').scrollIntoView());
await p.waitForTimeout(1500);
const form = p.locator('#contact form');

// 1. empty submit -> inline errors, focus on name
await form.getByRole('button', { name: 'Send enquiry' }).click();
await p.waitForTimeout(300);
console.log('validation: focus on', await p.evaluate(() => document.activeElement?.id), '| aria-invalid name =', await p.getAttribute('#name', 'aria-invalid'));

// 2. real API, no Resend keys -> 503 -> error with email fallback
await p.fill('#name', 'Jane Smith'); await p.fill('#company', 'Acme Recruitment'); await p.fill('#email', 'jane@acme.co.uk');
await p.fill('#message', 'Testing the enquiry form.');
await form.getByRole('button', { name: 'Send enquiry' }).click();
await p.waitForSelector('#contact [role=alert] a[href^="mailto:"]', { timeout: 8000 });
console.log('error state:', (await p.locator('#contact [role=alert]').last().innerText()).replace(/\s+/g, ' '));
await p.locator('#contact form').screenshot({ path: 'qa/launch/form-error.png' });

// 3. mocked API success -> success panel, focus on heading
let sentBody = null;
await p.route('**/api/contact', async (r) => { sentBody = JSON.parse(r.request().postData()); await new Promise((res) => setTimeout(res, 700)); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
await form.getByRole('button', { name: 'Send enquiry' }).click();
await p.waitForTimeout(150);
console.log('sending state:', await p.locator('#contact form button[type=submit]').innerText(), '| aria-busy', await p.getAttribute('#contact form', 'aria-busy'));
await p.locator('#contact form').screenshot({ path: 'qa/launch/form-sending.png' });
await p.waitForSelector('#contact [role=status] h3', { timeout: 8000 });
await p.waitForTimeout(900);
console.log('success:', await p.locator('#contact [role=status] h3').innerText(), '| focused:', await p.evaluate(() => document.activeElement?.tagName));
console.log('payload:', JSON.stringify(sentBody));
await p.locator('#contact [role=status]').screenshot({ path: 'qa/launch/form-success.png' });
console.log(errs.length ? 'page errors: ' + errs.join(' | ') : 'no page errors');
await b.close();
