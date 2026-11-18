/**
 * Liquid Glass (client round 3: "the glass morph is blending with the background, try liquid like iOS has").
 * Replaces the frosted glass in Mission / Vision and the Values wheel. It reads because of:
 *  (a) a clear lens with only light blur (fill 12% white; blur 3px, or 0.5px when refracting so the bent content stays crisp),
 *  (b) a bright specular rim (gradient ring, white top-left -> faint navy bottom-right) + 1px chromatic edge,
 *  (c) inner light + depth shadows,
 *  (d) refraction: in Chromium the backdrop goes through an SVG feDisplacementMap whose map bends the edge band more
 *      than the centre (a lens). Safari / Firefox get the same glass without the bending.
 * Rules:
 *  - Put something with contrast BEHIND it (pattern, ring lines, a saturated blob). On a flat background it vanishes.
 *  - `refract` on at most 2-3 elements visible at once, never on large / full-width panels (it re-filters every frame).
 *  - No filter / opacity < 1 / mask / clip-path on an ANCESTOR (it becomes the backdrop root and the lens sees nothing).
 *    Transforms are fine (the squash is a transform). Content inside may blur/fade freely: it is a sibling of the lens.
 *  - Text on it: navy / brand only.
 */
import { type CSSProperties, type ReactNode, type RefObject, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

export type LensShape = 'circle' | 'squircle' | 'pill' | 'hexagon';

const HEX_POINTS = '50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87';
const HEX_MASK = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 115.47" preserveAspectRatio="none"><polygon points="${HEX_POINTS}"/></svg>`)}")`;
const hexMask: CSSProperties = { WebkitMaskImage: HEX_MASK, maskImage: HEX_MASK, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' };

/** Chromium renders `backdrop-filter: url(#svg-filter)`; WebKit (incl. every iOS browser) and Gecko don't. */
let refractOk: boolean | null = null;
export function supportsRefraction() {
  if (refractOk !== null) return refractOk;
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  refractOk = /Chrome\/|Chromium\//.test(ua) && !/Firefox|FxiOS|CriOS|EdgiOS|OPiOS/.test(ua)
    && typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#a) blur(1px)');
  return refractOk;
}

/* ---------- Lens displacement map ----------
 * Per pixel: distance e (px) from the shape's edge and the outward normal n. Inside an edge band the backdrop is
 * sampled further inward (R/G < 128 along n), strongest at the rim and zero in the centre: content bends at the edge
 * like a thick convex lens. Cached per size + shape. */
const mapCache = new Map<string, string>();
function edgeField(shape: LensShape, w: number, h: number, x: number, y: number): [number, number, number] {
  const px = x - w / 2, py = y - h / 2;
  if (shape === 'circle') {
    const r = Math.min(w, h) / 2, d = Math.hypot(px, py) || 1e-6;
    return [r - d, px / d, py / d];
  }
  if (shape === 'hexagon') {
    // pointy-top hexagon in a w x (w * 1.1547) box: six side normals, apothem = w / 2
    const a = w / 2; let best = -Infinity, nx = 0, ny = 0;
    for (const deg of [0, 60, 120, 180, 240, 300]) {
      const t = (deg * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t), v = px * c + py * s;
      if (v > best) { best = v; nx = c; ny = s; }
    }
    return [a - best, nx, ny];
  }
  // rounded box (pill: radius = h / 2; squircle: 36% radius, the CSS approximation)
  const rr = shape === 'pill' ? Math.min(w, h) / 2 : Math.min(w, h) * 0.36;
  const qx = Math.abs(px) - (w / 2 - rr), qy = Math.abs(py) - (h / 2 - rr);
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0), ol = Math.hypot(ox, oy);
  const dist = ol + Math.min(Math.max(qx, qy), 0) - rr;
  let nx: number, ny: number;
  if (qx > 0 && qy > 0) { nx = (ox / ol) * Math.sign(px); ny = (oy / ol) * Math.sign(py); }
  else if (qx > qy) { nx = Math.sign(px); ny = 0; } else { nx = 0; ny = Math.sign(py); }
  return [-dist, nx, ny];
}
function lensMap(shape: LensShape, w: number, h: number) {
  const W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h)), key = `${shape}:${W}x${H}`;
  const hit = mapCache.get(key); if (hit) return hit;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); if (!ctx) return '';
  const img = ctx.createImageData(W, H), band = Math.min(W, H) * 0.3;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [e, nx, ny] = edgeField(shape, W, H, x + 0.5, y + 0.5);
    const f = e <= 0 ? 0 : Math.pow(1 - Math.min(1, e / band), 1.6);
    const i = (y * W + x) * 4;
    img.data[i] = 128 - 127 * nx * f; img.data[i + 1] = 128 - 127 * ny * f; img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const url = c.toDataURL(); mapCache.set(key, url); return url;
}

/* ---------- Pointer-following gloss + rim (subtle parallax) ---------- */
function usePointerLight(el: RefObject<HTMLElement>, track?: RefObject<HTMLElement>) {
  useEffect(() => {
    const node = el.current, area = track?.current ?? node;
    if (!node || !area || prefersReducedMotion() || !matchMedia('(hover: hover)').matches) return;
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      node.style.setProperty('--lg-px', x.toFixed(3)); node.style.setProperty('--lg-py', y.toFixed(3));
    };
    const leave = () => { node.style.setProperty('--lg-px', '0'); node.style.setProperty('--lg-py', '0'); };
    area.addEventListener('pointermove', move); area.addEventListener('pointerleave', leave);
    return () => { area.removeEventListener('pointermove', move); area.removeEventListener('pointerleave', leave); };
  }, [el, track]);
}

/** The glass layers, for any element that carries `lg` (+ a shape class). Use directly for buttons / pills. */
export function LiquidLayers({ hex = false, filterId }: { hex?: boolean; filterId?: string }) {
  const m = hex ? hexMask : undefined;
  return (
    <>
      <span aria-hidden className="lg-lens" style={{ ...m, ...(filterId ? { WebkitBackdropFilter: `url(#${filterId}) blur(0.5px) saturate(180%) brightness(1.05)`, backdropFilter: `url(#${filterId}) blur(0.5px) saturate(180%) brightness(1.05)` } : null) }} />
      <span aria-hidden className="lg-gloss" style={m} />
      {!hex && <span aria-hidden className="lg-chroma" />}
      {!hex && <span aria-hidden className="lg-rim" />}
    </>
  );
}

type Props = {
  shape?: LensShape;
  /** SVG edge refraction (Chromium only; falls back silently). Max 2-3 on screen. */
  refract?: boolean;
  /** displacement strength in px (default: 15% of the smaller side, clamped 20-44, so small lenses don't over-bend) */
  strength?: number;
  active?: boolean;
  /** change this value to play the liquid squash-and-settle (e.g. the active index) */
  pulse?: unknown;
  /** element whose pointer movement steers the gloss (default: the glass itself) */
  track?: RefObject<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function LiquidGlass({ shape = 'circle', refract = false, strength, active = false, pulse, track, className, style, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = 'lg' + useId().replace(/:/g, '');
  const [size, setSize] = useState<[number, number] | null>(null);
  const useRefract = refract && supportsRefraction();
  const hex = shape === 'hexagon';
  const controls = useAnimationControls();
  const first = useRef(true);
  usePointerLight(ref, track);

  useLayoutEffect(() => {
    if (!useRefract) return;
    const el = ref.current; if (!el) return;
    // offsetWidth/Height ignore transforms, so the squash never regenerates the map
    const measure = () => setSize((s) => (s && s[0] === el.offsetWidth && s[1] === el.offsetHeight ? s : [el.offsetWidth, el.offsetHeight]));
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [useRefract]);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (prefersReducedMotion()) return;
    controls.start({ scaleX: [1, 1.04, 0.985, 1], scaleY: [1, 0.96, 1.015, 1], transition: { duration: 0.45, times: [0, 0.35, 0.7, 1], ease: 'easeOut' } });
  }, [pulse, controls]);

  const map = useRefract && size ? lensMap(shape, size[0], size[1]) : '';
  return (
    <motion.div ref={ref} animate={controls} className={cn('lg', `lg-${shape}`, active && 'is-active', className)} style={style}>
      {map && size && (
        <svg aria-hidden width="0" height="0" className="absolute">
          <filter id={id} x="0" y="0" width={size[0]} height={size[1]} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feImage href={map} x="0" y="0" width={size[0]} height={size[1]} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={strength ?? Math.max(20, Math.min(44, Math.min(size[0], size[1]) * 0.15))} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {hex && (
        // hexagon: CSS box-shadows / borders would be rectangular, so depth = drop-shadow on a sibling shape, rim = SVG stroke
        // the shadow is masked to OUTSIDE the hexagon so the clear lens never sees it
        <svg aria-hidden viewBox="0 0 100 115.47" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <filter id={`${id}s`} x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#01152D" floodOpacity=".28" /></filter>
            <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="-60" y="-60" width="220" height="236"><rect x="-60" y="-60" width="220" height="236" fill="#fff" /><polygon points={HEX_POINTS} fill="#000" /></mask>
          </defs>
          <g mask={`url(#${id}m)`}><polygon points={HEX_POINTS} fill="#fff" filter={`url(#${id}s)`} /></g>
        </svg>
      )}
      <LiquidLayers hex={hex} filterId={map ? id : undefined} />
      {hex && (
        <svg aria-hidden viewBox="0 0 100 115.47" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".95" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#01152D" stopOpacity=".14" /></linearGradient>
          </defs>
          <polygon points={HEX_POINTS} fill="none" stroke={`url(#${id}r)`} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      <div className="relative z-[1] h-full w-full">{children}</div>
    </motion.div>
  );
}

/** Saturated soft blob to put directly BEHIND a lens (#3D8FF5 -> #1679E0, ~55-65%), slowly drifting. Offset it so its
 *  edge crosses the lens: that edge is what visibly bends. The falloff is eased over many stops: a linear fade with a
 *  "knee" shows as a hard edge through the lens once saturate(180%) amplifies the faint tail. */
export function LensBlob({ radius, dx = 0, dy = 0 }: { radius: number; dx?: number; dy?: number }) {
  const box = radius * 2.4;
  return (
    <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2" initial={false}
      animate={{ x: dx - box / 2, y: dy - box / 2 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} style={{ width: box, height: box }}>
      <div className="lg-blob h-full w-full" style={{ backgroundImage: `radial-gradient(circle ${radius}px at center, rgba(61,143,245,.66), rgba(52,135,240,.56) 25%, rgba(38,127,232,.4) 50%, rgba(22,121,224,.2) 72%, rgba(22,121,224,.06) 88%, rgba(22,121,224,0) 100%)` }} />
    </motion.div>
  );
}
