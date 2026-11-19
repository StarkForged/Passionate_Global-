// Unit test for the contact API logic (api/_lib/enquiry.ts), fetch mocked. Node >= 22.6: node scripts/test-contact.mjs
import assert from 'node:assert/strict';
const { handleEnquiry, clean } = await import('../api/_lib/enquiry.ts');

const sent = [];
globalThis.fetch = async (url, init) => {
  if (String(url).includes('resend.com')) { sent.push(JSON.parse(init.body)); return new Response('{"id":"x"}', { status: 200 }); }
  if (String(url).includes('turnstile')) { const ok = new URLSearchParams(init.body).get('response') === 'good'; return Response.json({ success: ok }); }
  throw new Error('unexpected fetch ' + url);
};
const env = { RESEND_API_KEY: 'k', RESEND_FROM_EMAIL: 'PG <website@passionateglobal.co.in>', CONTACT_TO_EMAIL: 'hitesh@passionateglobal.co.in' };
const good = { name: ' Jane <b>Smith</b> ', company: 'Acme Recruitment', email: 'Jane@Acme.co.uk', phone: '+44 20 7946 0000', services: ['Recruitment Support'], market: 'United Kingdom', teamSize: '3–5', message: 'Hello<script>alert(1)</script>\n\n\n\nThere', website: '' };
const call = (body, o = {}) => handleEnquiry({ method: 'POST', origin: 'https://www.passionateglobal.co.in', ip: o.ip ?? '1.1.1.1', body, ...o }, o.env ?? env);

let r = await call(good);
assert.equal(r.status, 200);
assert.equal(sent.length, 2, 'enquiry + confirmation');
assert.equal(sent[0].to[0], 'hitesh@passionateglobal.co.in');
assert.equal(sent[0].reply_to, 'jane@acme.co.uk');
assert.equal(sent[0].subject, 'New enquiry: Acme Recruitment');
assert.ok(!sent[0].html.includes('<script>') && !sent[0].html.includes('<b>Smith'), 'HTML stripped');
assert.ok(sent[0].text.includes('Name: Jane Smith'));
assert.equal(sent[1].to[0], 'jane@acme.co.uk');
console.log('ok  valid enquiry -> 2 emails, stripped HTML, reply-to visitor');

assert.equal((await call({ ...good, email: 'nope' })).status, 400);
assert.deepEqual((await call({ ...good, name: '   ' })).body.fields, ['name']);
assert.equal((await call({ ...good, services: ['Visa'] })).status, 400);
assert.equal((await call({ ...good, message: 'x'.repeat(3001) })).status, 400);
console.log('ok  invalid input -> 400 with field names');

sent.length = 0;
r = await call({ ...good, website: 'http://spam' }, { ip: '2.2.2.2' });
assert.equal(r.status, 200); assert.equal(sent.length, 0);
console.log('ok  honeypot -> silent 200, nothing sent');

assert.equal((await handleEnquiry({ method: 'POST', origin: 'https://evil.example', ip: '3.3.3.3', body: good }, env)).status, 403);
assert.equal((await handleEnquiry({ method: 'GET', ip: '3.3.3.3', body: null }, env)).status, 405);
console.log('ok  foreign origin -> 403, GET -> 405');

const codes = [];
for (let i = 0; i < 6; i++) codes.push((await call(good, { ip: '9.9.9.9' })).status);
assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
console.log('ok  rate limit: 6th enquiry in an hour -> 429');

const tenv = { ...env, TURNSTILE_SECRET_KEY: 's' };
assert.equal((await call({ ...good }, { ip: '4.4.4.4', env: tenv })).status, 403);
assert.equal((await call({ ...good, turnstileToken: 'bad' }, { ip: '4.4.4.5', env: tenv })).status, 403);
assert.equal((await call({ ...good, turnstileToken: 'good' }, { ip: '4.4.4.6', env: tenv })).status, 200);
console.log('ok  Turnstile enforced when the secret is set');

assert.equal((await call(good, { ip: '5.5.5.5', env: {} })).status, 503);
console.log('ok  missing Resend config -> 503 (front end shows the email fallback)');

assert.equal(clean('a <img src=x onerror=alert(1)> b'), 'a b');
console.log('\nall contact API tests passed');
