/**
 * Magic UI Globe (cobe), ported + extended: light theme in brand colours, draggable, and `focus`
 * rotates the globe to a [lat, lng] (shortest path). Pauses when off-screen.
 */
import { useEffect, useRef } from 'react';
import createGlobe, { type Marker } from 'cobe';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/scroll';

const D2R = Math.PI / 180;
/** cobe angles that bring a location to the front of the globe. */
const toAngles = (lat: number, lng: number) => [Math.PI - (lng * D2R - Math.PI / 2), lat * D2R] as const;

export function Globe({ markers, focus, className }: { markers: Marker[]; focus: [number, number]; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(toAngles(...focus));
  const markersRef = useRef(markers);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const offset = useRef({ phi: 0, theta: 0 });

  markersRef.current = markers;
  useEffect(() => { target.current = toAngles(...focus); offset.current = { phi: 0, theta: 0 }; }, [focus]);

  useEffect(() => {
    const el = canvas.current!;
    let width = el.offsetWidth;
    let phi = target.current[0], theta = target.current[1] * 0.6;
    const onResize = () => (width = el.offsetWidth);
    addEventListener('resize', onResize);
    const reduce = prefersReducedMotion();
    const globe = createGlobe(el, {
      devicePixelRatio: 2, // must pair with the doubled width/height below (as in Magic UI)
      width: width * 2, height: width * 2,
      phi, theta,
      // cobe light mode can only darken land dots, so render greyscale and recolour with the
      // duotone filter below (black → brand blue, white → white). Markers black = deepest blue.
      dark: 0, diffuse: 1.2,
      mapSamples: 22000, mapBrightness: 4, mapBaseBrightness: 0,
      baseColor: [1, 1, 1],
      markerColor: [0, 0, 0],
      glowColor: [1, 1, 1],
      markers: markersRef.current,
      opacity: 0.92,
      onRender: (state) => {
        // ease towards the focused market (shortest way round) plus any drag offset
        const [tp, tt] = target.current;
        const goalPhi = tp + offset.current.phi, goalTheta = Math.max(-0.4, Math.min(0.9, tt * 0.6 + offset.current.theta));
        let d = (goalPhi - phi) % (2 * Math.PI);
        if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
        const k = reduce ? 1 : 0.07;
        phi += d * k; theta += (goalTheta - theta) * k;
        state.phi = phi; state.theta = theta;
        state.markers = markersRef.current;
        state.width = width * 2; state.height = width * 2;
      },
    });
    const io = new IntersectionObserver(([e]) => globe.toggle(e.isIntersecting));
    io.observe(el);
    requestAnimationFrame(() => (el.style.opacity = '1'));
    return () => { io.disconnect(); globe.destroy(); removeEventListener('resize', onResize); };
  }, []);

  return (
    <div className={cn('relative aspect-square w-full', className)}>
      <svg aria-hidden className="absolute h-0 w-0">
        <filter id="globe-duotone" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.008 0.94" />
            <feFuncG type="table" tableValues="0.38 0.965" />
            <feFuncB type="table" tableValues="0.86 1" />
          </feComponentTransfer>
        </filter>
      </svg>
      <canvas
        ref={canvas}
        aria-label="Globe showing the markets we support"
        role="img"
        className="h-full w-full cursor-grab opacity-0 transition-opacity duration-700 [contain:layout_paint_size] active:cursor-grabbing"
        onPointerDown={(e) => { drag.current = { x: e.clientX - offset.current.phi * 200, y: e.clientY - offset.current.theta * 200 }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onPointerMove={(e) => { if (!drag.current) return; offset.current = { phi: (e.clientX - drag.current.x) / 200, theta: (e.clientY - drag.current.y) / 200 }; }}
        style={{ touchAction: 'pan-y', filter: 'url(#globe-duotone)' }}
      />
    </div>
  );
}
