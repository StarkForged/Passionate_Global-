# Redirect map: passionatestaffing.com → www.passionateglobal.co.in

Implemented in `vercel.json` → `redirects` (rules with `has: host = (www.)?passionatestaffing.com`), all **308
permanent** (Vercel's `permanent: true`; Google treats 301 and 308 the same). Valid for `passionatestaffing.com` and
`www.passionatestaffing.com`, with or without `.html` and a trailing slash.

Fragments (`#about`) are never sent to the server, so redirects target the home page with a `?from=` hint. A tiny
script in `src/App.tsx` reads it, scrolls to the matching section and removes the parameter from the address bar.
The canonical URL stays `https://www.passionateglobal.co.in/`, so search engines consolidate everything there.

| Old URL (path) | New destination | Lands on |
|---|---|---|
| `/`, `/index.html` | `https://www.passionateglobal.co.in/` | Hero |
| `/about-us.html` | `/?from=about` | About section |
| `/services.html` | `/?from=services` | Services section |
| `/infrastructure.html` | `/?from=security` | IT Infrastructure & Security section |
| `/career.html` | `/?from=life` | Life at Passionate Global |
| `/contact-us.html` | `/?from=contact` | Contact section |
| `/blog-list-1.html`, `/jobs-list-1.html`, `/company-dashboard-new-job.html` | `/` | Home (pages never existed) |
| anything else (assets, unknown paths) | `/` | Home (no 404s) |

Hops: `https://(www.)passionatestaffing.com/<path>` → final URL in **one hop**. Plain `http://` requests get Vercel's
automatic HTTPS upgrade first (that hop can't be removed on Vercel), then the redirect: two hops, which search
engines follow without loss.

Requirements: both old hostnames must be added to the Vercel project as **normal domains** (not Vercel's "Redirect to
another domain" option, which keeps the path and would cause a second hop and 404s). See `LAUNCH_TODO.md` §3.
