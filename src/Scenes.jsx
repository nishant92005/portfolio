import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function NeuralField() {
  const points = useMemo(() => {
    const rows = window.innerWidth < 760 ? 6 : 8;
    const cols = window.innerWidth < 760 ? 8 : 12;
    return Array.from({ length: rows * cols }, (_, index) => {
      const x = (index % cols) - cols / 2;
      const y = Math.floor(index / cols) - rows / 2;
      return {
        base: new THREE.Vector3(x * 0.98, y * 0.84, (Math.random() - 0.5) * 2.2),
        velocity: Math.random() * 0.55 + 0.2,
      };
    });
  }, []);
  const groupRef = useRef(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  useEffect(() => {
    const move = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth - 0.5) * viewport.width;
      mouse.current.y = -(event.clientY / window.innerHeight - 0.5) * viewport.height;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, [viewport.height, viewport.width]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, index) => {
      const point = points[index];
      if (!point || !child.position) return;
      const dx = point.base.x - mouse.current.x;
      const dy = point.base.y - mouse.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const repel = Math.max(0, 0.9 - distance) * 0.55;
      child.position.x = point.base.x + Math.sin(time * point.velocity + index) * 0.06 + dx * repel;
      child.position.y = point.base.y + Math.cos(time * point.velocity + index) * 0.06 + dy * repel;
      child.position.z = point.base.z + Math.sin(time * 0.45 + index) * 0.18;
      child.material.opacity = 0.32 + Math.sin(time * 1.4 + index) * 0.12;
    });
  });

  const connectionLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      if (i % 3 !== 0) lines.push([points[i].base, points[i + 1].base]);
      if (i + 12 < points.length && i % 5 === 0) lines.push([points[i].base, points[i + 12].base]);
    }
    return lines;
  }, [points]);

  return (
    <>
      <group ref={groupRef}>
        {points.map((point, index) => (
          <mesh key={index} position={point.base}>
            <sphereGeometry args={[0.034, 8, 8]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.42} />
          </mesh>
        ))}
      </group>
      {connectionLines.map((line, index) => (
        <Line
          key={index}
          points={line}
          color="#00ff88"
          transparent
          opacity={index % 5 === 0 ? 0.24 : 0.1}
          lineWidth={0.6}
        />
      ))}
    </>
  );
}

export function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[0.75, 1]}
      frameloop="always"
      performance={{ min: 0.35 }}
      className="hero-canvas"
    >
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.65} />
      <pointLight position={[3, 3, 5]} color="#00ff88" intensity={1.7} />
      <Suspense fallback={null}>
        <NeuralField />
        <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.2}>
          <mesh position={[3.3, 0.4, -0.7]} rotation={[0.4, 0.7, 0.1]}>
            <icosahedronGeometry args={[0.95, 1]} />
            <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.52} />
          </mesh>
        </Float>
        <Float speed={0.9} rotationIntensity={0.7} floatIntensity={0.9}>
          <mesh position={[-3.6, -1.3, -1.2]} rotation={[1.1, 0.1, 0.9]}>
            <torusGeometry args={[0.78, 0.16, 8, 30]} />
            <meshBasicMaterial color="#7b61ff" wireframe transparent opacity={0.45} />
          </mesh>
        </Float>
      </Suspense>
    </Canvas>
  );
}

export function RotatingOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 45 }}
      dpr={[0.75, 1]}
      frameloop="always"
      performance={{ min: 0.35 }}
    >
      <ambientLight intensity={0.55} />
      <pointLight color="#00ff88" intensity={1.5} position={[2, 3, 3]} />
      <Float speed={1.1} floatIntensity={0.35} rotationIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[1.4, 24, 12]} />
          <meshStandardMaterial color="#0a0a0a" emissive="#003b20" wireframe roughness={0.35} />
        </mesh>
      </Float>
    </Canvas>
  );
}

export function GridPlane() {
  return (
    <Canvas
      camera={{ position: [0, 1.6, 5.8], rotation: [-0.4, 0, 0], fov: 55 }}
      dpr={[1, 1.2]}
      frameloop="demand"
      performance={{ min: 0.35 }}
    >
      <ambientLight intensity={0.8} />
      <gridHelper args={[16, 28, '#00ff88', '#163526']} position={[0, -1.15, 0]} />
      <Stars radius={7} depth={3} count={180} factor={2} saturation={0} fade speed={0.25} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.25} />
    </Canvas>
  );
}
