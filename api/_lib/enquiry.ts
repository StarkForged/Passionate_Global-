/**
 * Contact form: validation, spam checks and email delivery. Free of Vercel types so it can be tested and run locally
 * (scripts/serve.mjs mounts it at /api/contact when given --api).
 *
 * Env (Vercel → Project → Settings → Environment Variables; see .env.example):
 *   RESEND_API_KEY, RESEND_FROM_EMAIL ("Passionate Global <website@passionateglobal.co.in>"), CONTACT_TO_EMAIL,
 *   TURNSTILE_SECRET_KEY (Turnstile is enforced only when this is set),
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL + KV_REST_API_TOKEN (optional rate-limit store).
 */
import { z } from 'zod';

// Kept in sync with src/data/content.ts (services.items titles, countries.items names). The API rejects anything else.
export const SERVICES = ['Recruitment Support', 'Finance & Accounting Support', 'Out-of-Hours Support', 'Business Support Services'] as const;
export const MARKETS = ['United Kingdom', 'Ireland', 'Europe', 'Canada', 'United States', 'Australia', 'Other'] as const;
export const TEAM_SIZES = ['1–2', '3–5', '6–10', '10+'] as const;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Removes tags and control characters and collapses whitespace (keeps paragraph breaks in the message). */
export const clean = (s: string, multiline = false) => {
  let t = s.replace(/<[^>]*>?/g, '').replace(CONTROL, '');
  t = multiline ? t.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : t.replace(/\s+/g, ' ');
  return t.trim();
};
const text = (max: number, min = 0, multiline = false) =>
  z.string().max(max * 2).transform((s) => clean(s, multiline)).pipe(z.string().min(min).max(max));

export const EnquirySchema = z.object({
  name: text(100, 1),
  company: text(150, 1),
  email: z.string().trim().toLowerCase().max(200).email(),
  phone: text(40).refine((s) => s === '' || /^[0-9+()\-.\s]{6,40}$/.test(s), 'Invalid phone').optional().default(''),
  services: z.array(z.enum(SERVICES)).max(SERVICES.length).optional().default([]),
  market: z.enum(MARKETS).optional().default('Other'),
  teamSize: z.enum(TEAM_SIZES).optional().default('1–2'),
  message: text(3000, 0, true).optional().default(''),
  website: z.string().max(500).optional().default(''), // honeypot: must stay empty
  turnstileToken: z.string().max(4096).optional().default(''),
});
export type Enquiry = z.infer<typeof EnquirySchema>;

export type Result = { status: number; body: Record<string, unknown> };
type Env = Record<string, string | undefined>;

/* ---------------- rate limit: 5 enquiries / hour / IP ---------------- */
const LIMIT = 5;
const WINDOW = 3600;
const memory = new Map<string, { n: number; reset: number }>();

/** Upstash / Vercel KV (REST) when configured, otherwise per-instance memory (resets on cold start; a backstop only). */
export async function rateLimited(ip: string, env: Env, now = Date.now()): Promise<boolean> {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  const key = `pg:contact:${ip}`;
  if (url && token) {
    try {
      const r = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(WINDOW), 'NX']]),
      });
      const [incr] = (await r.json()) as { result: number }[];
      return incr.result > LIMIT;
    } catch { /* store unreachable: fall back to memory */ }
  }
  for (const [k, v] of memory) if (v.reset < now) memory.delete(k);
  const e = memory.get(key);
  if (!e) { memory.set(key, { n: 1, reset: now + WINDOW * 1000 }); return false; }
  e.n += 1;
  return e.n > LIMIT;
}

/* ---------------- Turnstile ---------------- */
export async function turnstileOk(token: string, ip: string, env: Env): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true; // not configured yet: honeypot + rate limit only
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    });
    return ((await r.json()) as { success?: boolean }).success === true;
  } catch { return false; }
}

/* ---------------- email ---------------- */
const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

export function enquiryEmail(e: Enquiry) {
  const rows: [string, string][] = [
    ['Name', e.name], ['Company', e.company], ['Email', e.email], ['Phone', e.phone || '–'],
    ['Services', e.services.join(', ') || '–'], ['Based in', e.market], ['Team size', e.teamSize],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n')
    + `\n\nMessage:\n${e.message || '–'}\n\n(Reply to this email to answer ${e.name} directly.)`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#01152D;max-width:620px">
<h2 style="margin:0 0 16px;font-size:20px">New website enquiry</h2>
<table cellpadding="8" style="border-collapse:collapse;width:100%;font-size:15px">${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #E3EAF3;color:#5B6B80;width:120px">${k}</td><td style="border-bottom:1px solid #E3EAF3"><b>${esc(v)}</b></td></tr>`).join('')}</table>
<p style="margin:20px 0 6px;color:#5B6B80;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Message</p>
<p style="white-space:pre-wrap;font-size:15px;line-height:1.6;margin:0">${esc(e.message || '–')}</p>
<p style="margin-top:24px;color:#5B6B80;font-size:13px">Reply to this email to answer ${esc(e.name)} directly.</p></div>`;
  return { text, html };
}

export function confirmationEmail(e: Enquiry, to: string) {
  const first = e.name.split(' ')[0];
  const body = "Thank you for contacting Passionate Global. We've received your enquiry and one of our consultants will contact you to discuss your requirements.";
  const text = `Hi ${first},\n\n${body}\n\nIf you need to add anything, simply reply to this email or write to ${to}.\n\nKind regards,\nPassionate Global\nhttps://www.passionateglobal.co.in`;
  const html = `<div style="background:#EFF4F9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden">
<div style="background:#01152D;padding:24px 32px"><img src="https://www.passionateglobal.co.in/apple-touch-icon.png" width="44" height="44" alt="" style="vertical-align:middle;border-radius:10px"><span style="color:#ffffff;font-size:17px;font-weight:bold;letter-spacing:.06em;vertical-align:middle;margin-left:12px">PASSIONATE GLOBAL</span></div>
<div style="padding:32px;color:#01152D;font-size:16px;line-height:1.65">
<p style="margin:0 0 16px">Hi ${esc(first)},</p>
<p style="margin:0 0 16px">${esc(body)}</p>
<p style="margin:0 0 24px">If you need to add anything, simply reply to this email or write to <a href="mailto:${esc(to)}" style="color:#0361DB">${esc(to)}</a>.</p>
<p style="margin:0">Kind regards,<br><b>Passionate Global</b></p></div>
<div style="padding:18px 32px;border-top:1px solid #E3EAF3;color:#5B6B80;font-size:13px">Dedicated offshore teams for Recruitment Businesses · <a href="https://www.passionateglobal.co.in" style="color:#0361DB">www.passionateglobal.co.in</a></div>
</div></div>`;
  return { text, html };
}

async function resend(env: Env, payload: Record<string, unknown>) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 300)}`);
}

/* ---------------- handler ---------------- */
const ALLOWED_ORIGIN = /^https?:\/\/(([a-z0-9-]+\.)*passionateglobal\.co\.in|[a-z0-9-]+\.vercel\.app|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)$/i;

export async function handleEnquiry(input: { method: string; origin?: string; ip: string; body: unknown }, env: Env): Promise<Result> {
  if (input.method !== 'POST') return { status: 405, body: { error: 'method_not_allowed' } };
  if (input.origin && !ALLOWED_ORIGIN.test(input.origin)) return { status: 403, body: { error: 'forbidden' } };

  const parsed = EnquirySchema.safeParse(input.body);
  if (!parsed.success) return { status: 400, body: { error: 'invalid', fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))] } };
  const e = parsed.data;

  if (e.website) return { status: 200, body: { ok: true } }; // honeypot filled: pretend success, send nothing
  if (await rateLimited(input.ip, env)) return { status: 429, body: { error: 'rate_limited' } };
  if (!(await turnstileOk(e.turnstileToken, input.ip, env))) return { status: 403, body: { error: 'captcha' } };

  const to = env.CONTACT_TO_EMAIL;
  const from = env.RESEND_FROM_EMAIL;
  if (!env.RESEND_API_KEY || !to || !from) return { status: 503, body: { error: 'not_configured' } };

  try {
    await resend(env, { from, to: [to], reply_to: e.email, subject: `New enquiry: ${e.company}`, ...enquiryEmail(e) });
  } catch (err) {
    console.error('[contact] enquiry email failed', err);
    return { status: 502, body: { error: 'send_failed' } };
  }
  try {
    await resend(env, { from, to: [e.email], reply_to: to, subject: 'Thanks for contacting Passionate Global', ...confirmationEmail(e, to) });
  } catch (err) {
    console.error('[contact] confirmation email failed', err); // the enquiry itself was delivered: still a success
  }
  return { status: 200, body: { ok: true } };
}
