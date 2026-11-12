/**
 * Hero planet — WebGL (react-three-fiber). Reference: ref_vid1 / ref_vid2.
 * Crisp evenly spaced land dots on a near-black sphere, thin rim light, tight atmosphere,
 * arcs from the Ahmedabad delivery centre to every market with travelling pulses, and
 * 3D-anchored city labels (live local time) that fade out at the limb.
 * `progress` (0..1, scroll through the hero) makes the planet rise and scale up ~1.3×.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import geo from '@/data/geo.json';
import { countries } from '@/data/content';
import { formatTime, useNow } from '@/hooks/useClock';
import { prefersReducedMotion } from '@/lib/scroll';

const D2R = Math.PI / 180;
const toVec = (lat: number, lng: number, r = 1) => {
  const la = lat * D2R, lo = lng * D2R;
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
};
/** Point i of an N-point Fibonacci sphere, as [lat, lng] (matches scripts/build-geo.mjs). */
const GA = Math.PI * (3 - Math.sqrt(5));
const fibPoint = (i: number, n: number) => {
  const y = 1 - (i / (n - 1)) * 2;
  return [Math.asin(y) / D2R, (((i * GA) / D2R) % 360) - 180] as const;
};

/* ---------- shaders ---------- */
const bodyVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const bodyFrag = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = 1. - max(dot(vN, vV), 0.);
    vec3 col = vec3(0.004,0.016,0.04);                      // near-black interior
    col += vec3(0.04,0.18,0.55) * pow(f, 10.0) * 0.8;        // soft blue falloff, kept to the edge
    col += vec3(0.62,0.84,1.0) * pow(f, 22.0) * 1.6;         // thin bright rim
    gl_FragColor = vec4(col, 1.);
  }`;
const atmoFrag = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = pow(clamp(0.5 - dot(vN, vV), 0., 1.), 4.0);
    gl_FragColor = vec4(vec3(0.36,0.66,1.0) * f * 2.6, f);
  }`;
const dotVert = /* glsl */ `
  uniform float uSize;
  varying float vA;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position,1.);
    vec3 n = normalize(normalMatrix * normalize(position));
    float facing = dot(n, normalize(-mv.xyz));
    vA = smoothstep(0.0, 0.35, facing);
    gl_PointSize = uSize;
    gl_Position = projectionMatrix * mv;
  }`;
const dotFrag = /* glsl */ `
  varying float vA;
  void main(){
    float d = length(gl_PointCoord - .5);
    if (d > .5) discard;
    float a = smoothstep(.5, .32, d) * vA;
    gl_FragColor = vec4(mix(vec3(0.30,0.55,0.95), vec3(0.78,0.89,1.0), vA), a * 0.9);
  }`;
const arcVert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const arcFrag = /* glsl */ `
  uniform float uTime; uniform float uOff; varying vec2 vUv;
  void main(){
    float h = fract(uTime * 0.16 + uOff);
    float head = exp(-pow((vUv.x - h) * 16., 2.));
    float tail = smoothstep(h - 0.3, h, vUv.x) * step(vUv.x, h);
    float a = 0.14 + head * 1.4 + tail * 0.3;
    gl_FragColor = vec4(mix(vec3(0.35,0.62,1.0), vec3(1.0), head) * (1.0 + head * 1.5), a);
  }`;

type Side = 'left' | 'right' | 'up';
type Label = { key: string; text: string; time?: string; hub?: boolean; side?: Side; pos: THREE.Vector3 };
// Close neighbours (Dublin / London / Berlin) get their pills pushed apart so they never overlap.
const SIDE: Record<string, Side> = { IE: 'left', GB: 'up', EU: 'right', hub: 'right' };
const OFFSET: Record<Side, string> = { left: 'translate(-54%, -20px)', right: 'translate(54%, -20px)', up: 'translate(0, -52px)' };

function Labels({ items }: { items: Label[] }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const { camera } = useThree();
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), c: new THREE.Vector3(), n: new THREE.Vector3(), o: new THREE.Vector3(), s: new THREE.Vector3() }), []);
  useFrame(({ scene }) => {
    items.forEach((it, i) => {
      const el = refs.current[i];
      const anchor = scene.getObjectByName('lbl-' + it.key);
      if (!el || !anchor) return;
      anchor.getWorldPosition(tmp.p);
      anchor.parent!.getWorldPosition(tmp.o);
      tmp.n.copy(tmp.p).sub(tmp.o).normalize();
      tmp.c.copy(camera.position).sub(tmp.p).normalize();
      const f = tmp.n.dot(tmp.c);
      // fade at the limb, near the screen edges and in the bottom band (trust marquee lives there)
      tmp.s.copy(tmp.p).project(camera);
      const edge = 1 - THREE.MathUtils.smoothstep(Math.abs(tmp.s.x), 0.62, 0.8);
      const low = 1 - THREE.MathUtils.smoothstep(-tmp.s.y, 0.72, 0.8);
      el.style.opacity = String(THREE.MathUtils.smoothstep(f, 0.1, 0.25) * edge * low);
    });
  });
  return (
    <>
      {items.map((it, i) => (
        <group key={it.key} position={it.pos} name={'lbl-' + it.key}>
          <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
            <div ref={(el) => (refs.current[i] = el)} style={{ opacity: 0, transform: it.side ? OFFSET[it.side] : 'translate(0, -20px)' }}>
              <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-medium backdrop-blur-md ${it.hub ? 'border-sky/40 bg-brand/40 text-white' : 'border-white/15 bg-[#021534]/60 text-[#DCEBFF]'}`}>
                {it.text}
                {it.time && <><span className="text-white/40">·</span><span className="tabular-nums text-white">{it.time}</span></>}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

function Planet({ progress }: { progress: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const markerRefs = useRef<THREE.Mesh[]>([]);
  const { viewport, size, gl } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const now = useNow(15000);
  const still = useMemo(prefersReducedMotion, []);

  useEffect(() => {
    const m = (e: PointerEvent) => { pointer.current.x = (e.clientX / innerWidth - 0.5) * 2; pointer.current.y = (e.clientY / innerHeight - 0.5) * 2; };
    addEventListener('pointermove', m, { passive: true });
    return () => removeEventListener('pointermove', m);
  }, []);

  const mobile = size.width < 768;
  // Planet size & placement. `horizon` = where the top of the planet sits, as a fraction of
  // the hero height measured from the bottom. Solved exactly for the perspective camera.
  const R = mobile ? viewport.width * 1.3 : Math.max(viewport.width * 0.72, viewport.height * 1.05);
  const zc = -R * 0.55;
  const horizon = mobile ? 0.21 : 0.265;
  const baseY = useMemo(() => {
    const camZ = 6, half = (35 / 2) * D2R;
    const top = Math.atan((-1 + 2 * horizon) * Math.tan(half));
    let yc = -R;
    for (let k = 0; k < 6; k++) { const d = Math.hypot(yc, camZ - zc); const alpha = Math.asin(Math.min(0.999, R / d)); yc = (camZ - zc) * Math.tan(top - alpha); }
    return yc;
  }, [R, zc, horizon]);

  const dots = useMemo(() => {
    const { n, idx } = geo.globe as { n: number; idx: number[] };
    const pos = new Float32Array(idx.length * 3);
    let i = 0;
    idx.forEach((d, j) => { i += d; const [la, lo] = fibPoint(i, n); const v = toVec(la, lo, 1.002); pos[j * 3] = v.x; pos[j * 3 + 1] = v.y; pos[j * 3 + 2] = v.z; });
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geom;
  }, []);

  const dotMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: dotVert, fragmentShader: dotFrag, transparent: true, depthWrite: false, uniforms: { uSize: { value: 2 } } }), []);
  useEffect(() => { dotMat.uniforms.uSize.value = (mobile ? 1.5 : 1.8) * Math.min(gl.getPixelRatio(), 2); }, [mobile, gl, dotMat]);

  const hub = countries.hub;
  const arcs = useMemo(() => countries.items.map((c, i) => {
    const a = toVec(hub.lat, hub.lng), b = toVec(c.lat, c.lng);
    const dist = a.distanceTo(b);
    // altitude capped so arcs hug the planet instead of climbing behind the copy
    const lift = Math.min(0.03 + dist * 0.06, 0.12);
    const c1 = a.clone().lerp(b, 0.25).normalize().multiplyScalar(1 + lift);
    const c2 = a.clone().lerp(b, 0.75).normalize().multiplyScalar(1 + lift);
    const geom = new THREE.TubeGeometry(new THREE.CubicBezierCurve3(a, c1, c2, b), 160, 0.0022, 6, false);
    const mat = new THREE.ShaderMaterial({ vertexShader: arcVert, fragmentShader: arcFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uOff: { value: i * 0.17 } } });
    return { geom, mat, end: b };
  }), [hub.lat, hub.lng]);

  const hubPos = useMemo(() => toVec(hub.lat, hub.lng, 1.004), [hub.lat, hub.lng]);
  // mobile: only London + the delivery centre, so the thin planet band never gets crowded
  const labels: Label[] = useMemo(() => [
    ...countries.items.filter((c) => !mobile || c.code === 'GB').map((c) => ({ key: c.code, text: c.city, time: formatTime(c.tz, now), side: mobile ? undefined : SIDE[c.code], pos: toVec(c.lat, c.lng, 1.004) })),
    { key: 'hub', text: `Ahmedabad · ${hub.label}`, hub: true, side: SIDE.hub, pos: hubPos },
  ], [now, hub.label, hubPos, mobile]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    arcs.forEach((a) => (a.mat.uniforms.uTime.value = t));
    const sp = progress.current;
    if (!still) spin.current.rotation.y += dt * 0.018;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -0.78 + pointer.current.y * 0.03 + sp * 0.12, 0.06);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -0.06 + pointer.current.x * -0.025, 0.05);
    group.current.position.y = baseY + sp * viewport.height * 0.32;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, pointer.current.x * 0.05, 0.05);
    group.current.scale.setScalar(R * (1 + sp * 0.3));
    markerRefs.current.forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.6 + i * 0.3) % 1;
      m.scale.setScalar(1 + k * 2.4); (m.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - k);
    });
  });

  return (
    <group ref={group} position={[0, baseY, zc]} scale={R}>
      {/* initial spin: Europe ↔ India facing the viewer */}
      <group ref={spin} rotation={[0, mobile ? -0.5 : -0.75, 0]}>
        <mesh>
          <sphereGeometry args={[1, 128, 128]} />
          <shaderMaterial vertexShader={bodyVert} fragmentShader={bodyFrag} />
        </mesh>
        <points geometry={dots} material={dotMat} />
        {arcs.map((a, i) => (
          <group key={i}>
            <mesh geometry={a.geom} material={a.mat} />
            <mesh position={a.end.clone().multiplyScalar(1.004)} onUpdate={(m) => m.lookAt(a.end.clone().multiplyScalar(2))} ref={(m) => { if (m) markerRefs.current[i] = m; }}>
              <ringGeometry args={[0.005, 0.0075, 32]} />
              <meshBasicMaterial color="#9fd0ff" transparent depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={a.end.clone().multiplyScalar(1.004)}>
              <sphereGeometry args={[0.0045, 12, 12]} />
              <meshBasicMaterial color="#e6f3ff" toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={hubPos}>
          <sphereGeometry args={[0.0075, 16, 16]} />
          <meshBasicMaterial color={new THREE.Color(1.6, 2, 2.6)} toneMapped={false} />
        </mesh>
        <Labels items={labels} />
      </group>
      {/* atmosphere */}
      <mesh scale={1.03}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial vertexShader={bodyVert} fragmentShader={atmoFrag} side={THREE.BackSide} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Globe({ progress }: { progress: React.MutableRefObject<number> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas frameloop={visible ? 'always' : 'never'} dpr={[1, 1.75]} camera={{ position: [0, 0, 6], fov: 35 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <Stars radius={60} depth={30} count={1100} factor={2.2} saturation={0} fade speed={0.4} />
        <Planet progress={progress} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.4} luminanceThreshold={0.55} luminanceSmoothing={0.2} radius={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
