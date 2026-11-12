# Passionate Global — website (v3)

React + Three.js + GSAP marketing site.

```bash
npm install
npm run dev      # local dev
npm run build    # production build → dist/ (deploy this folder to any static host)
```

**Read `CLAUDE.md` first** — it is the project memory (brief, brand, section/reference mapping, how-tos, open items, polish backlog).
Copy lives in `src/data/content.ts`. References live in `docs/`.

QA screenshots (needs `pip install playwright pillow` + Chrome): `npm run build && npm run preview`, then
`python scripts/qa-frames.py 1440 d && python scripts/qa-sheet.py d 4` (add `'#section-id'` to capture one
section) → images in `<system temp>/pg-qa` (override with `QA_OUT`).
