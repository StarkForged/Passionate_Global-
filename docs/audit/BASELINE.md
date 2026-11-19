# Baseline audit (before launch work), 2026-11-19

Build: `npm ci && npm run build` on commit `9d30620`, served with `vite preview` (localhost:4173).
Lighthouse 12.2.1, headless Chrome 157 (simulated throttling). Reports: `lighthouse-baseline-{mobile,desktop}.report.html`.

## Scores

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Mobile  | **30** | 93 | 100 | 92 |
| Desktop | **62** | 93 | 100 | 92 |

| Metric (mobile) | Value | Target |
|---|---|---|
| FCP | 5.4 s | |
| LCP | 6.4 s | < 2.5 s |
| TBT | 3,540 ms | (INP proxy) |
| CLS | 0 | < 0.1 |
| Speed Index | 8.4 s | |

## Bundle (`bundle-baseline.txt`)

| chunk | raw | gzip |
|---|---|---|
| Globe (three + R3F + drei + postprocessing) | 892 kB | 239 kB |
| index (app) | 201 kB | 61 kB |
| react | 146 kB | 47 kB |
| scroll (gsap + lenis) | 127 kB | 49 kB |
| motion (framer-motion) | 127 kB | 42 kB |
| geo (dotted world) | 70 kB | 5 kB |
| CSS | 72 kB | 15 kB |
| fonts | 7 subsets of Inter Tight (only latin is preloaded) | |

## npm audit (`npm-audit-baseline.txt`)
5 vulnerabilities (3 moderate, 2 high): `postcss` <= 8.5.22 (high, build-time only), `esbuild`/`vite` (moderate, dev server
only), `uuid` via `@react-three/drei` (moderate). None reach the browser except drei's uuid (not used with a buffer).

## axe-core (`axe-baseline.txt`, WCAG 2.2 AA + best practice, 1440 and 390 wide)
- `aria-prohibited-attr` (serious): `aria-label` on a plain `<p>` / `<div>` (About text reveal, Purpose statement).
- `color-contrast` (serious): 47 desktop / 15 mobile nodes. Most are deliberate scroll states captured mid-animation
  (Text Reveal words at 15% before they light up, inactive Process steps, dimmed market rows). Real ones to fix: market
  clock text `#667180` on ice (4.47:1), inactive Process step titles/bodies (2.9:1 and 2.46:1) when not active.

## Crawlability (the biggest SEO problem)
`dist/index.html` `<body>` is `<div id="root"></div>` only. "Growth Partner" appears once, inside `og:image:alt`.
No section text, headings or links are in the HTML: crawlers that don't run JS (and social previews) see an empty page.

## Other top issues
1. Mobile performance 30: 3.5 s TBT from the WebGL chunk (three/drei/postprocessing) parsed + compiled on load and every
   section mounted eagerly (DOM 3,810 elements).
2. No `robots.txt` (Lighthouse "57 errors": the SPA fallback serves index.html), no `sitemap.xml`, no 404 page.
3. Contact form builds a `mailto:` (no backend, no spam protection).
4. No security headers / CSP (no `vercel.json`).
5. Images without width/height (logo marks), PNG logos not WebP, oversize responsive images.
6. Source maps: `valid-source-maps` flagged (none shipped, informational).
7. JSON-LD is `Organization` only, no `alternateName` (old name) / `foundingDate` / `sameAs`.
