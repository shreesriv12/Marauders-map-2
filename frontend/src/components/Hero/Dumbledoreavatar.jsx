// src/components/Hero/Dumbledoreavatar.jsx
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

const dumbledoreModelPath = '/models/albus_dumbledore.glb'; // Adjust path if it's in /models/

// *** THIS LINE IS CRUCIAL: Ensure it's 'export function DumbledoreModel(props)' ***
export function DumbledoreModel(props) {
  const { nodes, materials } = useGLTF(dumbledoreModelPath);
  // Optional: Add basic fallback if model doesn't load
  if (!nodes || Object.keys(nodes).length === 0 || !materials || Object.keys(materials).length === 0) {
    console.warn("WARNING: Dumbledore model loaded but no nodes or materials found. Rendering a placeholder octahedron.");
    return (
      <mesh {...props}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    );
  }
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {nodes.Object_2 && materials.None && <mesh castShadow receiveShadow geometry={nodes.Object_2.geometry} material={materials.None} />}
        {nodes.Object_3 && materials.material_0 && <mesh castShadow receiveShadow geometry={nodes.Object_3.geometry} material={materials.material_0} />}
        {nodes.Object_4 && materials.material_1 && <mesh castShadow receiveShadow geometry={nodes.Object_4.geometry} material={materials.material_1} />}
        {nodes.Object_5 && materials.material_2 && <mesh castShadow receiveShadow geometry={nodes.Object_5.geometry} material={materials.material_2} />}
        {nodes.Object_6 && materials.material_3 && <mesh castShadow receiveShadow geometry={nodes.Object_6.geometry} material={materials.material_3} />}
        {nodes.Object_7 && materials.material_4 && <mesh castShadow receiveShadow geometry={nodes.Object_7.geometry} material={materials.material_4} />}
        {nodes.Object_8 && materials.material_6 && <mesh castShadow receiveShadow geometry={nodes.Object_8.geometry} material={materials.material_6} />}
        {nodes.Object_9 && materials.material_7 && <mesh castShadow receiveShadow geometry={nodes.Object_9.geometry} material={materials.material_7} />}
      </group>
    </group>
  );
}

useGLTF.preload(dumbledoreModelPath);