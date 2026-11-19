# LAUNCH_TODO: owner actions

Everything in the code is done and committed. These steps need an account, a key, a DNS change or a decision.
Do them **in this order**. Tick each box as you go. Times are approximate.

> ⚠️ **passionatestaffing.com expires on 26 January 2027** (registrar: Hostinger). Renew it first (step 6.1).

---

## 1. Accounts and keys (≈ 30 min)

### 1.1 Resend (sends the enquiry and confirmation emails)
1. Sign up at https://resend.com with a company email.
2. **Domains → Add domain** → `passionateglobal.co.in` → region *EU (Ireland)* is fine.
3. Resend shows 3–4 DNS records (a DKIM `TXT` like `resend._domainkey`, and an `MX` + `TXT` (SPF) on a
   sub-domain such as `send`). Add them in Hostinger exactly as shown, see step 3.4. Click **Verify**.
4. **API keys → Create** → permission *Sending access*, domain `passionateglobal.co.in` → copy the key.

### 1.2 Cloudflare Turnstile (invisible spam check on the form)
1. https://dash.cloudflare.com → sign up (free) → **Turnstile → Add widget**.
2. Name: `Passionate Global website`. Hostnames: `passionateglobal.co.in`, `www.passionateglobal.co.in`,
   `passionate-global.vercel.app`. **Widget mode: Invisible**. Create.
3. Copy the **Site key** and the **Secret key**.

### 1.3 Optional: shared rate-limit store
Without it the limit (5 enquiries per hour per IP) is per server instance, which is fine for a site this size.
For a shared limit: Vercel → project → **Storage → Marketplace → Upstash (Redis) → Create**, connect it to the
project (it adds `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically; nothing else to do).

### 1.4 Vercel environment variables
Vercel → project → **Settings → Environment Variables**. Add each for **Production and Preview**:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | key from 1.1 |
| `RESEND_FROM_EMAIL` | `Passionate Global <website@passionateglobal.co.in>` |
| `CONTACT_TO_EMAIL` | `hitesh@passionateglobal.co.in` |
| `TURNSTILE_SITE_KEY` | site key from 1.2 |
| `TURNSTILE_SECRET_KEY` | secret key from 1.2 |

Then **Deployments → ⋯ → Redeploy** (the site key is built into the page, so a redeploy is required).

### 1.5 Vercel Web Analytics (cookieless)
Vercel → project → **Analytics → Enable** (Web Analytics; *not* Speed Insights unless wanted). No banner needed.

---

## 2. Domain on Vercel (≈ 5 min)
Vercel → project → **Settings → Domains**:
1. Add `www.passionateglobal.co.in` → set as **Primary** (Production).
2. Add `passionateglobal.co.in` → choose **Redirect to `www.passionateglobal.co.in`** (308).
3. Note the DNS values Vercel shows for both (normally `A 76.76.21.21` for the apex and
   `CNAME cname.vercel-dns.com` for www; **use Vercel's values if they differ**).
4. `passionate-global.vercel.app`: click **Edit → Redirect to `www.passionateglobal.co.in`** once step 3 is live.
   (Until then it already sends `X-Robots-Tag: noindex`, so Google won't index it.)

---

## 3. Hostinger DNS for passionateglobal.co.in (≈ 15 min + propagation)

**What exists today** (checked 19 Nov 2026 via DNS-over-HTTPS):

| Type | Name | Value | Action |
|---|---|---|---|
| NS | @ | `lunar.dns-parking.com`, `solar.dns-parking.com` (Hostinger) | **Keep. Do NOT change nameservers** |
| A | @ | `84.32.84.42`, `88.222.222.44` (Hostinger "We're Upgrading" page) | **Delete** |
| AAAA | @ | `2a02:4780:84:2bd0:…`, `2a02:4780:84:51a9:…` | **Delete** (otherwise IPv6 visitors still reach Hostinger) |
| CNAME | www | `www.passionateglobal.co.in.cdn.hstgr.net` (Hostinger CDN) | **Delete** |
| MX | @ | `mx1.hostinger.com` (5), `mx2.hostinger.com` (10) | **Do not touch** (company email) |
| TXT | @ | `v=spf1 include:_spf.mail.hostinger.com ~all` | **Do not touch** |
| CNAME | hostingermail-a/-b/-c._domainkey | Hostinger DKIM | **Do not touch** |
| TXT | _dmarc | `v=DMARC1; p=none` | Update in 3.5 |

Steps in **hPanel → Domains → passionateglobal.co.in → DNS / Nameservers → DNS records**:
1. If hPanel shows the domain attached to a website with **Hostinger CDN**, turn the CDN off for it first
   (hPanel → Websites → the site → Performance → CDN → Disable), otherwise the `www` CNAME is recreated.
2. Delete the `A @` and `AAAA @` records and the `CNAME www` record listed above.
3. Add:
   - `A` · name `@` · value `76.76.21.21` (or Vercel's value) · TTL 3600
   - `CNAME` · name `www` · value `cname.vercel-dns.com` (or Vercel's value) · TTL 3600
4. **Resend records** (from 1.1): add them as *new* records. They live on their own names (`resend._domainkey`,
   `send`), so they don't clash. There must only ever be **one** SPF (`v=spf1`) record on `@`: if Resend ever asks
   for an SPF change on `@`, merge it into the existing one
   (e.g. `v=spf1 include:_spf.mail.hostinger.com include:amazonses.com ~all`), never add a second.
5. **DMARC**: edit `_dmarc` to
   `v=DMARC1; p=none; rua=mailto:hitesh@passionateglobal.co.in`
   After 3–4 weeks of clean reports (Hostinger and Resend both passing), change `p=none` to `p=quarantine`.
6. Propagation: usually 15 min – 2 h (up to 48 h). Done when Vercel → Domains shows **Valid Configuration** for both
   names, and https://www.passionateglobal.co.in opens the new site with a padlock. Vercel issues the HTTPS
   certificate automatically.
7. Send yourself a test email to hitesh@passionateglobal.co.in from Gmail afterwards: email must still arrive.

---

## 4. Real form test (≈ 10 min, after 1 + 3)
1. On https://www.passionateglobal.co.in/#contact send an enquiry with your own email.
2. Check: the enquiry arrives at hitesh@passionateglobal.co.in (subject "New enquiry: {company}"), **Reply** goes
   to the visitor; the visitor gets "Thanks for contacting Passionate Global".
3. Spam checks: sending 6 enquiries within an hour from one connection → the 6th shows the "several enquiries"
   message (429). (The honeypot and Turnstile are covered by `npm test` and need no manual test.)
4. If it fails: Vercel → project → **Logs**, filter `/api/contact` (`[contact]` lines show the Resend error).

---

## 5. Post-deploy checks (≈ 20 min)
- [ ] https://securityheaders.com/?q=www.passionateglobal.co.in → expect **A** (save a screenshot to `docs/audit/`).
- [ ] https://developer.mozilla.org/en-US/observatory → scan `www.passionateglobal.co.in` → expect **A** or better.
- [ ] https://search.google.com/test/rich-results → URL `https://www.passionateglobal.co.in/` → Organization detected,
      no errors (schema.org validator already passes: `docs/seo/schema-validator-result.json`).
- [ ] `curl -s https://www.passionateglobal.co.in/ | grep -c "Passionate Staffing Solutions"` → ≥ 1 (pre-rendered).
- [ ] Lighthouse on production (PageSpeed Insights: https://pagespeed.web.dev) mobile + desktop.
- [ ] `bash scripts/redirect-check.sh > docs/seo/redirect-check.txt` once step 6 is live → all PASS.
- [ ] Open https://www.passionateglobal.co.in/this-does-not-exist → the 404 page.
- [ ] HSTS preload list (hstspreload.org): **only** after everything above is stable for a few weeks, and only if
      every sub-domain of passionateglobal.co.in works over HTTPS (it includes `includeSubDomains`). Optional.

---

## 6. Old domain passionatestaffing.com → new site (≈ 20 min + propagation)

Facts (19 Nov 2026): registrar **Hostinger**, nameservers `ns1/ns2.dns-parking.com` (Hostinger), old site on Hostinger
hosting, **email is active on it** (`MX mx1/mx2.hostinger.com`, SPF, DKIM `hostingermail-*`, DMARC) and the old site
used `info@passionatestaffing.com`. **Keep all email records. Do not change nameservers.**

1. **Renew** passionatestaffing.com in hPanel → Domains (expires **26 Jan 2027**). Turn on **auto-renew** and keep it
   for at least 2 years (ideally permanently): the redirects only work while the domain is registered.
2. Vercel → project → Settings → **Domains**: add `passionatestaffing.com` **and** `www.passionatestaffing.com` as
   **normal domains assigned to Production** (do **not** pick "Redirect to another domain": that keeps the old path and
   causes a second hop / 404s; the page-by-page redirects are in `vercel.json`).
3. hPanel → Domains → passionatestaffing.com → DNS records:
   - delete `A @` (`84.32.84.73`, `88.222.222.66`), `AAAA @` (two `2a02:4780:…`) and `CNAME www`
     (`www.passionatestaffing.com.cdn.hstgr.net`); turn off Hostinger CDN for that site first if it is on;
   - add `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com` (or Vercel's values);
   - leave `MX`, `TXT v=spf1…`, `hostingermail-*._domainkey` and `_dmarc` exactly as they are.
4. When Vercel shows Valid Configuration, run `bash scripts/redirect-check.sh > docs/seo/redirect-check.txt` → all PASS.
   Map: `docs/seo/redirect-map.md`. (Plain `http://` gets Vercel's HTTPS upgrade first, then one redirect.)
5. The old hosting plan can then be cancelled; **do not** cancel the domain or the email.

---

## 7. Search engines (≈ 30 min, after 3 and 6)
1. **Google Search Console** (https://search.google.com/search-console) → Add property → **Domain** →
   `passionateglobal.co.in` → copy the `TXT google-site-verification=…` → add it in Hostinger DNS (`TXT @`, a new
   record; it does not affect email) → Verify.
2. **Sitemaps** → submit `https://www.passionateglobal.co.in/sitemap.xml`. **URL inspection** → home page →
   *Request indexing*.
3. Add a second Domain property for `passionatestaffing.com` (same TXT method in its DNS) and verify it.
4. In the **passionatestaffing.com** property → Settings → **Change of address** → new site
   `passionateglobal.co.in` → Validate & update (only after step 6.4 passes).
5. **Bing Webmaster Tools** (https://www.bing.com/webmasters) → *Import from Google Search Console* (both sites) →
   for the old site use **Site Move** → new domain.
6. **Google Business Profile** (https://business.google.com) for the Ahmedabad office. Use exactly:
   Passionate Global · 301, Indraprastha Corporate, Prahlad Nagar, Ahmedabad, Gujarat 380015, India ·
   +91 90165 51051 · https://www.passionateglobal.co.in. If a profile exists under "Passionate Staffing Solutions",
   rename it rather than creating a second one.
7. Update the website link on LinkedIn (company page → Edit page → Website) and Instagram (Edit profile → Website) to
   `https://www.passionateglobal.co.in`.

---

## 8. Monitoring (≈ 10 min)
1. https://uptimerobot.com (free) → **New monitor**:
   - *Keyword* monitor · `https://www.passionateglobal.co.in/` · keyword `Growth Partner` · every 5 min.
   - *Keyword* monitor · `https://www.passionateglobal.co.in/api/contact` · keyword `method_not_allowed`
     (a GET returns that JSON, proving the form function is up) · every 5 min.
   - Alert contact: hitesh@passionateglobal.co.in.
2. Optional: Sentry (free) for front-end errors. Source maps are not shipped; upload them privately to Sentry if used.

---

## 9. Decisions / reviews needed from the client
- [ ] **UK phone number**: send it and it is a one-line addition (`company.phones` in `src/data/content.ts`,
      UK first); Contact, Footer and JSON-LD update automatically.
- [ ] **Legal pages** (`/privacy-policy`, `/cookie-policy`, copy in `src/data/legal.ts`, marked DRAFT): review by the
      client or a lawyer. Points to confirm: retention period (drafted as 24 months), the processor list (Vercel,
      Resend, Cloudflare, Hostinger), and whether a **UK GDPR Article 27 representative** is required (a non-UK
      business offering services to people in the UK may need one; for B2B enquiries it is often not, but this is a
      legal call).
- [ ] UI microcopy not from the client document: the 404 page text, form success/error messages, the confirmation
      email wording, and the items already listed in CLAUDE.md §9.
- [ ] Coverage hours shown in Countries / Out-of-Hours (still marked TODO in CLAUDE.md).
- [ ] Optional performance trade-off (see `docs/audit/FINAL.md`): showing the static planet instead of the WebGL planet
      on phones would raise mobile Lighthouse performance by roughly 10–20 points.
