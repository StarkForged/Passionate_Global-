/** Glass "data centre" cube for the Security section (ref5 bottom slide). */
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Environment, Float, Lightformer, RoundedBox } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function Core() {
  const cube = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  useFrame((s, dt) => {
    cube.current.rotation.y += dt * 0.25;
    inner.current.rotation.x += dt * 0.6; inner.current.rotation.y += dt * 0.4;
    ring1.current.rotation.z += dt * 0.5; ring2.current.rotation.z -= dt * 0.35;
    const p = 1 + Math.sin(s.clock.elapsedTime * 2) * 0.06; inner.current.scale.setScalar(p);
  });
  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group ref={cube} rotation={[0.42, 0.6, 0]}>
        {/* blue glass shell */}
        <RoundedBox args={[1.6, 1.6, 1.6]} radius={0.16} smoothness={6}>
          <meshPhysicalMaterial color="#4d9bff" emissive="#0b4dc9" emissiveIntensity={0.55} roughness={0.12} metalness={0.15} clearcoat={1} clearcoatRoughness={0.05}
            transparent opacity={0.62} envMapIntensity={1.6} side={THREE.DoubleSide} depthWrite={false} />
        </RoundedBox>
        <mesh>
          <boxGeometry args={[1.62, 1.62, 1.62]} />
          <meshBasicMaterial transparent opacity={0} />
          <Edges threshold={15} color={new THREE.Color(1.2, 2.0, 3.4)} />
        </mesh>
        <RoundedBox args={[1.1, 1.1, 1.1]} radius={0.12} smoothness={4}>
          <meshPhysicalMaterial color="#9fd0ff" emissive="#2f7ff0" emissiveIntensity={0.35} roughness={0.2} transparent opacity={0.22} depthWrite={false} />
        </RoundedBox>
        <mesh ref={inner}>
          <icosahedronGeometry args={[0.32, 1]} />
          <meshBasicMaterial color={new THREE.Color(1.6, 2.6, 4.2)} toneMapped={false} wireframe />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshBasicMaterial color={new THREE.Color(2.2, 3.2, 5)} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={ring1} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[1.55, 0.006, 8, 200]} />
        <meshBasicMaterial color={new THREE.Color(0.8, 1.4, 2.6)} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 1.8, 0.3, 0]}>
        <torusGeometry args={[1.85, 0.004, 8, 200]} />
        <meshBasicMaterial color="#5aa5ff" transparent opacity={0.35} />
      </mesh>
    </Float>
  );
}

export default function SecureCube() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { rootMargin: '200px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="h-full w-full">
      <Canvas frameloop={vis ? 'always' : 'never'} dpr={[1, 1.75]} camera={{ position: [0, 0, 5.4], fov: 38 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.4} />
        <Core />
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
            <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} color="#5aa5ff" />
            <Lightformer form="ring" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} color="#1679e0" />
            <Lightformer form="rect" intensity={1.5} position={[0, -4, 4]} scale={[10, 2, 1]} color="#ffffff" />
          </group>
        </Environment>

      </Canvas>
    </div>
  );
}
