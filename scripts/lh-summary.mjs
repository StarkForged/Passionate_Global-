// Summarise Lighthouse JSON reports: node scripts/lh-summary.mjs file1.json file2.json ...
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
  const r = JSON.parse(readFileSync(f, 'utf8'));
  const c = r.categories, a = r.audits;
  const s = (k) => Math.round((c[k]?.score ?? 0) * 100);
  console.log(`${f}\n  perf ${s('performance')} | a11y ${s('accessibility')} | bp ${s('best-practices')} | seo ${s('seo')}`);
  console.log(`  FCP ${a['first-contentful-paint'].displayValue} | LCP ${a['largest-contentful-paint'].displayValue} | TBT ${a['total-blocking-time'].displayValue} | CLS ${a['cumulative-layout-shift'].displayValue} | SI ${a['speed-index'].displayValue}`);
  const fails = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable' && x.scoreDisplayMode !== 'manual');
  console.log('  failing: ' + fails.map((x) => `${x.id}(${x.displayValue ?? x.score})`).join(', '));
}
