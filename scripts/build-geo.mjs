// Generates src/data/geo.json — land-dot coordinates for the hero globe and the world map.
// Run: npm run geo
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);

// Globe: Fibonacci sphere, keep land points -> [lat, lng, ...]
const N = 42000, globe = [];
const ga = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const lat = Math.asin(y) * 180 / Math.PI;
  const lng = (((i * ga) * 180 / Math.PI) % 360) - 180;
  if (geoContains(land, [lng, lat])) globe.push(+lat.toFixed(2), +lng.toFixed(2));
}

// Flat map: equirectangular grid
const COLS = 190, ROWS = 80, LAT_TOP = 80, LAT_BOTTOM = -58, map = [];
for (let r = 0; r < ROWS; r++) {
  const lat = LAT_TOP - r * ((LAT_TOP - LAT_BOTTOM) / (ROWS - 1));
  for (let c = 0; c < COLS; c++) {
    const lng = -180 + (c + 0.5) * (360 / COLS);
    if (geoContains(land, [lng, lat])) map.push(c, r);
  }
}
writeFileSync(new URL('../src/data/geo.json', import.meta.url),
  JSON.stringify({ globe, map: { cols: COLS, rows: ROWS, latTop: LAT_TOP, latBottom: LAT_BOTTOM, pts: map } }));
console.log('globe', globe.length / 2, 'map', map.length / 2);
