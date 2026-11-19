/** Vercel Serverless Function: POST /api/contact (logic in ./_lib/enquiry.ts). */
import { handleEnquiry } from './_lib/enquiry.js';

type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown; socket?: { remoteAddress?: string } };
type Res = { status(code: number): Res; setHeader(k: string, v: string): void; json(body: unknown): void };

declare const process: { env: Record<string, string | undefined> };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function handler(req: Req, res: Res) {
  const ip = (first(req.headers['x-forwarded-for']) ?? '').split(',')[0].trim()
    || first(req.headers['x-real-ip']) || req.socket?.remoteAddress || 'unknown';
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const out = await handleEnquiry({ method: req.method ?? 'GET', origin: first(req.headers.origin), ip, body }, process.env);
  res.setHeader('Cache-Control', 'no-store');
  if (out.status === 405) res.setHeader('Allow', 'POST');
  res.status(out.status).json(out.body);
}
