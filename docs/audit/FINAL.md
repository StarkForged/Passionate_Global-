# Final audit (launch readiness), 2026-11-19

Same method as `BASELINE.md`: `npm run build`, served locally with `vite preview`, Lighthouse 12.2.1 (headless Chrome 157,
simulated throttling; median of 3 mobile / 2 desktop runs). Reports: `lh-final-{mobile,desktop}.report.html`.
Production numbers (real Vercel edge, HTTP/2, Brotli, CDN cache) are normally better than local; re-check on
https://pagespeed.web.dev after DNS (LAUNCH_TODO §5).

## Scores

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Mobile, before | 30 | 93 | 100 | 92 |
| **Mobile, after** | **45** | **100** | **100** | **100** |
| Desktop, before | 62 | 93 | 100 | 92 |
| **Desktop, after** | **~72** (69–74) | **97** | **100** | **100** |

| Mobile metric | Before | After | Target |
|---|---|---|---|
| First Contentful Paint | 5.4 s | **2.4 s** | |
| Largest Contentful Paint | 6.4 s | **5.2 s** | < 2.5 s ✗ |
| Total Blocking Time | 3,540 ms | **~2,000 ms** (1,950–2,930) | INP < 200 ms proxy ✗ |
| Cumulative Layout Shift | 0 | **0** | < 0.1 ✓ |
| Speed Index | 8.4 s | **5.7 s** | |

Desktop: FCP 1.0 → 0.6 s, LCP 1.4 → 1.1 s, TBT 720 → ~500 ms.

## What changed for performance
1. Pre-rendered HTML: text paints at FCP instead of after all JavaScript runs (FCP −3 s on mobile).
2. **Lazy hydration**: sections below the fold keep their pre-rendered HTML and hydrate when they come within one screen
   (or right before an in-page jump). Removed ~3–4 s of React work from a throttled phone's load.
3. Preloader and hero intro are CSS animations (identical timing), so they start at first paint.
4. WebGL planet loads on idle with a static CSS planet as poster; drei `PerformanceMonitor` drops DPR to 1 and turns off
   bloom on weak GPUs; skipped with reduced motion, Data Saver or no WebGL.
5. cobe globe (Countries) creates its WebGL context only when near the viewport.
6. GSAP ScrollTrigger and Lenis initialise on the first scroll intent (their first full-page measurement was ~1–2 s of
   layout on a throttled phone).
7. Cached `Intl.DateTimeFormat` for the live clocks.

## Why mobile performance is not ≥ 90 (and what would get closer)
The remaining main-thread time on an emulated mid-range phone (4× CPU slowdown, software WebGL) is, roughly:
- the **WebGL planet** (three.js + postprocessing, 240 kB gz): ~2.5–4 s of script + GPU work;
- the **first layout of a 3,800-element page** with heavy visual effects (masks, gradients, blurs): ~1–2 s;
- hydrating the hero and the first section.

LCP is bounded by design: the client-approved intro (logo curtain 1.5 s, then the hero copy fades up in sequence) means
the largest text cannot paint before ~2 s even on a fast connection.

Measured option (not applied, it changes the hero on phones): with the static planet instead of WebGL, mobile
performance was **51–65** in the same setup. Further steps would be redesign decisions: a lighter hero on mobile, removing
the intro curtain, or reducing the page's element count. These are for the client to decide (LAUNCH_TODO §9).

## Bundle (`bundle-final.txt`)
App chunk 201 → 221 kB (lazy hydration, form states, pages, legal copy); vendor chunks unchanged; Globe chunk loads on
idle. Source maps are not shipped.

## Accessibility (`axe-after.txt`)
Mobile: **0** axe violations (WCAG 2.2 AA + best practice). Desktop: the only remaining item is the About **Text Reveal**
in its scroll state: words start at 15% opacity and reach full contrast as the visitor scrolls (by design; the full
sentence is also exposed to assistive technology as text). Keyboard checks: `node scripts/keyboard-check.mjs` → 14/14.

## Security
- Headers in `vercel.json`: HSTS (2 years, preload), CSP enforced (no `unsafe-inline` / `unsafe-eval` for scripts),
  X-Frame-Options DENY + `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy, COOP. Every page tested
  with the CSP enforced (`scripts/csp-check.mjs`), including WebGL, the form and the 404. securityheaders.com /
  Observatory grades need the live domain (LAUNCH_TODO §5).
- `npm audit`: 5 → 3. The remaining 3 (2 moderate, 1 high) are the same chain: esbuild's **dev server** advisory via
  Vite 5 / `@vitejs/plugin-react`. Nothing from it reaches the browser or the server function; the fix is a Vite major
  upgrade (6+), which is worth doing after launch, not during it.
- Contact API: zod validation, HTML stripped, honeypot, Turnstile (when configured), 5/hour/IP rate limit, origin check,
  no secrets in the repo (`.env.example`). Unit tests: `npm test`.

## SEO
Crawler view: all page text, headings and links are in the HTML (`dist/index.html` 298 kB); "Passionate Staffing
Solutions" appears in the About line and the JSON-LD `alternateName`. Schema.org validator: 0 errors, 0 warnings
(`docs/seo/schema-validator-result.json`). robots.txt, sitemap.xml, canonical, OG/Twitter, 404 with `noindex`.
Old-domain redirects: 30/30 pass locally (`docs/seo/redirect-check-local.txt`); live check after DNS.

## Cross-browser
Checked here: Chrome 157 and Edge (Chromium), widths 360, 390, 430, 768, 1024, 1280, 1440, 1920: no horizontal scroll,
no console errors, hydration clean (also with reduced motion). **Not available on this machine**: Safari (macOS/iOS),
Firefox, Samsung Internet. Nothing used is browser-specific (no `backdrop-filter` dependence beyond the header's
existing fallback, CSS animations, standard WebGL), but please open the live site on an iPhone and in Firefox once.
