import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function MagicalParticles({ count = 1000 }) {
  const points = useRef();
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
    }
    
    return positions;
  }, [count]);
  
  const particlesColor = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const colorPalette = [
      new THREE.Color('#ff6b6b'),
      new THREE.Color('#4ecdc4'),
      new THREE.Color('#45b7d1'),
      new THREE.Color('#f9ca24'),
      new THREE.Color('#f0932b'),
      new THREE.Color('#eb4d4b'),
      new THREE.Color('#6c5ce7')
    ];
    
    for (let i = 0; i < count; i++) {
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return colors;
  }, [count]);
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      points.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      // Animate particles floating
      const positions = points.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <Points ref={points} positions={particlesPosition} colors={particlesColor}>
      <PointMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
      />
    </Points>
  );
}

function FloatingOrbs() {
  const orbsRef = useRef();
  
  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.children.forEach((orb, index) => {
        orb.position.y = Math.sin(state.clock.elapsedTime + index * 2) * 2;
        orb.rotation.x = state.clock.elapsedTime * 0.5;
        orb.rotation.z = state.clock.elapsedTime * 0.3;
      });
    }
  });
  
  const orbs = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      position: [
        Math.cos(i * 1.26) * 8,
        Math.sin(i * 1.26) * 8,
        Math.cos(i * 0.8) * 5
      ],
      color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#eb4d4b'][i]
    }));
  }, []);
  
  return (
    <group ref={orbsRef}>
      {orbs.map((orb, index) => (
        <mesh key={index} position={orb.position}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial 
            color={orb.color} 
            transparent 
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function MagicalBackground() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#4ecdc4" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#ff6b6b" />
      
      <MagicalParticles count={800} />
      <FloatingOrbs />
      
      {/* Magical fog effect */}
      <mesh position={[0, 0, -10]} scale={[50, 50, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          color="#1a1a2e"
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}
