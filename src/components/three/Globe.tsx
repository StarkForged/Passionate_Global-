/**
 * Hero planet — WebGL (react-three-fiber).
 * Dotted land on a dark sphere, fresnel rim + atmosphere glow, animated
 * connection arcs from the Ahmedabad delivery centre to every market,
 * an orbit ring with a satellite, star field and bloom.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import geo from '@/data/geo.json';
import { countries } from '@/data/content';

const D2R = Math.PI / 180;
const toVec = (lat: number, lng: number, r = 1) => {
  const la = lat * D2R, lo = lng * D2R;
  // three.js: y up; lng rotates around y. (-x so east goes right when facing +z)
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
};

/* ---------- shaders ---------- */
const bodyVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const bodyFrag = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = 1. - max(dot(vN, vV), 0.);
    vec3 core = vec3(0.004,0.03,0.08);
    vec3 edge = vec3(0.07,0.30,0.85);
    vec3 col = mix(core, edge, pow(f, 3.6));
    col += vec3(0.55,0.80,1.0) * pow(f, 12.0) * 0.9;
    gl_FragColor = vec4(col, 1.);
  }`;
const atmoFrag = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = pow(clamp(0.62 - dot(vN, vV), 0., 1.), 3.0);
    gl_FragColor = vec4(vec3(0.30,0.62,1.0) * f * 3.2, f);
  }`;
const dotVert = /* glsl */ `
  uniform float uSize; uniform float uTime; attribute float aRnd;
  varying float vA; varying float vTw;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position,1.);
    vec3 n = normalize(normalMatrix * normalize(position));
    float facing = dot(n, normalize(-mv.xyz));
    vA = smoothstep(0.02, 0.55, facing);
    vTw = 0.65 + 0.35 * sin(uTime * (1.2 + aRnd * 2.) + aRnd * 40.);
    gl_PointSize = uSize * (0.75 + 0.5 * facing);
    gl_Position = projectionMatrix * mv;
  }`;
const dotFrag = /* glsl */ `
  varying float vA; varying float vTw;
  void main(){
    vec2 c = gl_PointCoord - .5; float d = length(c);
    if (d > .5) discard;
    float a = smoothstep(.5, .15, d) * vA;
    vec3 col = mix(vec3(0.25,0.50,0.95), vec3(0.72,0.86,1.0), vA * vTw);
    gl_FragColor = vec4(col, a * (0.45 + 0.4 * vTw));
  }`;
const arcVert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const arcFrag = /* glsl */ `
  uniform float uTime; uniform float uOff; varying vec2 vUv;
  void main(){
    float h = fract(uTime * 0.22 + uOff);
    float head = exp(-pow((vUv.x - h) * 14., 2.));
    float tail = smoothstep(h - 0.28, h, vUv.x) * step(vUv.x, h) * 0.6;
    float base = 0.16;
    float a = base + head * 1.6 + tail * 0.5;
    vec3 col = mix(vec3(0.3,0.6,1.0), vec3(1.0), head);
    gl_FragColor = vec4(col * (1.0 + head * 2.0), a);
  }`;

function Planet({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const sat = useRef<THREE.Mesh>(null!);
  const markerRefs = useRef<THREE.Mesh[]>([]);
  const { viewport, size, gl } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const m = (e: PointerEvent) => { pointer.current.x = (e.clientX / innerWidth - 0.5) * 2; pointer.current.y = (e.clientY / innerHeight - 0.5) * 2; };
    addEventListener('pointermove', m, { passive: true });
    return () => removeEventListener('pointermove', m);
  }, []);

  const mobile = size.width < 768;
  // Planet size & placement. `horizon` = where the top of the planet sits, as a fraction of
  // the hero height measured from the bottom. Solved exactly for the perspective camera.
  const R = mobile ? viewport.width * 1.25 : Math.max(viewport.width * 0.78, viewport.height * 1.1);
  const zc = -R * 0.55;
  const horizon = mobile ? 0.2 : 0.25;
  const baseY = useMemo(() => {
    const camZ = 6, half = (35 / 2) * D2R;
    const top = Math.atan((-1 + 2 * horizon) * Math.tan(half));
    let yc = -R;
    for (let k = 0; k < 6; k++) { const d = Math.hypot(yc, camZ - zc); const alpha = Math.asin(Math.min(0.999, R / d)); yc = (camZ - zc) * Math.tan(top - alpha); }
    return yc;
  }, [R, zc, horizon]);

  const dots = useMemo(() => {
    const g = geo.globe as number[];
    const pos = new Float32Array((g.length / 2) * 3), rnd = new Float32Array(g.length / 2);
    for (let i = 0, j = 0; i < g.length; i += 2, j++) {
      const v = toVec(g[i], g[i + 1], 1.003);
      pos.set([v.x, v.y, v.z], j * 3); rnd[j] = Math.random();
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
    return geom;
  }, []);

  const dotMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: dotVert, fragmentShader: dotFrag, transparent: true, depthWrite: false,
    uniforms: { uSize: { value: 2 }, uTime: { value: 0 } },
  }), []);
  useEffect(() => { dotMat.uniforms.uSize.value = (mobile ? 2.2 : 2.6) * Math.min(gl.getPixelRatio(), 2) * Math.min(1.25, size.width / 1440 + 0.35); }, [mobile, gl, size.width, dotMat]);

  const hub = countries.hub;
  const arcs = useMemo(() => countries.items.map((c, i) => {
    const a = toVec(hub.lat, hub.lng), b = toVec(c.lat, c.lng);
    const dist = a.distanceTo(b);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1 + dist * 0.32);
    const c1 = a.clone().lerp(mid, 0.6).normalize().multiplyScalar(1 + dist * 0.26);
    const c2 = b.clone().lerp(mid, 0.6).normalize().multiplyScalar(1 + dist * 0.26);
    const curve = new THREE.CubicBezierCurve3(a, c1, c2, b);
    const geom = new THREE.TubeGeometry(curve, 120, 0.0032, 6, false);
    const mat = new THREE.ShaderMaterial({ vertexShader: arcVert, fragmentShader: arcFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uOff: { value: i * 0.17 } } });
    return { geom, mat, end: b };
  }), [hub.lat, hub.lng]);

  const hubPos = useMemo(() => toVec(hub.lat, hub.lng, 1.004), [hub.lat, hub.lng]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    dotMat.uniforms.uTime.value = t;
    arcs.forEach((a) => (a.mat.uniforms.uTime.value = t));
    const sp = scrollRef.current; // 0..1 over the hero
    // initial orientation: Europe/India facing the viewer, tilted so northern hemisphere sits on the horizon
    spin.current.rotation.y += dt * (0.035 + sp * 0.12);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.42 + pointer.current.y * 0.05 + sp * 0.2, 0.05);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -0.08 + pointer.current.x * -0.04, 0.05);
    group.current.position.y = baseY - sp * viewport.height * 0.18;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, pointer.current.x * 0.06, 0.05);
    if (sat.current) {
      const a = t * 0.18;
      sat.current.position.set(Math.cos(a) * 1.22, 0, Math.sin(a) * 1.22);
    }
    markerRefs.current.forEach((m, i) => { if (!m) return; const s = 1 + ((t * 0.8 + i * 0.3) % 1) * 2.4; m.scale.setScalar(s); (m.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - ((t * 0.8 + i * 0.3) % 1)); });
  });

  return (
    <group ref={group} position={[0, baseY, zc]} scale={R}>
      <group ref={spin} rotation={[0, -0.85, 0]}>
        <mesh>
          <sphereGeometry args={[1, 128, 128]} />
          <shaderMaterial vertexShader={bodyVert} fragmentShader={bodyFrag} />
        </mesh>
        <points geometry={dots} material={dotMat} />
        {arcs.map((a, i) => (
          <group key={i}>
            <mesh geometry={a.geom} material={a.mat} />
            <mesh position={a.end.clone().multiplyScalar(1.004)} onUpdate={(m) => m.lookAt(a.end.clone().multiplyScalar(2))} ref={(m) => { if (m) markerRefs.current[i] = m; }}>
              <ringGeometry args={[0.006, 0.009, 32]} />
              <meshBasicMaterial color="#9fd0ff" transparent depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={a.end.clone().multiplyScalar(1.004)}>
              <sphereGeometry args={[0.0055, 12, 12]} />
              <meshBasicMaterial color="#e6f3ff" toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={hubPos}>
          <sphereGeometry args={[0.009, 16, 16]} />
          <meshBasicMaterial color={new THREE.Color(2.2, 2.6, 3)} toneMapped={false} />
        </mesh>
      </group>
      {/* atmosphere */}
      <mesh scale={1.045}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial vertexShader={bodyVert} fragmentShader={atmoFrag} side={THREE.BackSide} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* orbit ring + satellite */}
      <group rotation={[1.25, 0.25, 0.35]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.22, 0.0011, 8, 256]} />
          <meshBasicMaterial color="#7fb6ff" transparent opacity={0.2} />
        </mesh>
        <mesh ref={sat}>
          <sphereGeometry args={[0.008, 16, 16]} />
          <meshBasicMaterial color={new THREE.Color(3, 3.4, 4)} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export default function Globe({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Stars radius={60} depth={30} count={1600} factor={2.6} saturation={0} fade speed={0.6} />
        <Planet scrollRef={scrollRef} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.32} luminanceSmoothing={0.25} radius={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
