// Generates src/data/geo.json — land-dot indices for the hero planet (three/Globe.tsx).
// Run: npm run geo
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);

// Globe: Fibonacci sphere of N points; keep the land ones. Stored as delta-encoded indices
// (positions are deterministic from the index, see fibPoint() in three/Globe.tsx).
const N = 120000, idx = [];
const ga = Math.PI * (3 - Math.sqrt(5));
let prev = 0;
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const lat = Math.asin(y) * 180 / Math.PI;
  const lng = (((i * ga) * 180 / Math.PI) % 360) - 180;
  if (geoContains(land, [lng, lat])) { idx.push(i - prev); prev = i; }
}

writeFileSync(new URL('../src/data/geo.json', import.meta.url),
  JSON.stringify({ globe: { n: N, idx } }));
console.log('globe', idx.length);
