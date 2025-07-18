import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

// Define modelPath at the top-level scope
const hermioneModelPath = '/models/hermione_granger.glb';

export function HermioneGrangerModel(props) {
  useEffect(() => {
    console.log('HermioneGrangerModel component mounted in R3F scene.');
  }, []);

  const { nodes, materials } = useGLTF(hermioneModelPath);

  // Log nodes and materials to confirm exact names from gltfjsx output
  console.log('Hermione Granger Model loaded. Nodes:', nodes, 'Materials:', materials);

  // Optional: Add simple fallback if nodes/materials are unexpectedly empty
  if (!nodes || Object.keys(nodes).length === 0 || !materials || Object.keys(materials).length === 0) {
    console.warn("WARNING: Hermione model loaded but no nodes or materials found. Rendering a placeholder box.");
    return (
      <mesh {...props}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="green" />
      </mesh>
    );
  }

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Make sure these mesh names/materials match your glbjsx output exactly */}
        {nodes.Object_2 && materials.material_0 && <mesh castShadow receiveShadow geometry={nodes.Object_2.geometry} material={materials.material_0} />}
        {nodes.Object_3 && materials.material_1 && <mesh castShadow receiveShadow geometry={nodes.Object_3.geometry} material={materials.material_1} />}
        {nodes.Object_4 && materials.material_2 && <mesh castShadow receiveShadow geometry={nodes.Object_4.geometry} material={materials.material_2} />}
        {nodes.Object_5 && materials.material_3 && <mesh castShadow receiveShadow geometry={nodes.Object_5.geometry} material={materials.material_3} />}
        {nodes.Object_6 && materials.material_4 && <mesh castShadow receiveShadow geometry={nodes.Object_6.geometry} material={materials.material_4} />}
        {nodes.Object_7 && materials.material_5 && <mesh castShadow receiveShadow geometry={nodes.Object_7.geometry} material={materials.material_5} />}
        {nodes.Object_8 && materials.material_6 && <mesh castShadow receiveShadow geometry={nodes.Object_8.geometry} material={materials.material_6} />}
        {nodes.Object_9 && materials.material_7 && <mesh castShadow receiveShadow geometry={nodes.Object_9.geometry} material={materials.material_7} />}
        {nodes.Object_10 && materials.material_8 && <mesh castShadow receiveShadow geometry={nodes.Object_10.geometry} material={materials.material_8} />}
        {nodes.Object_11 && materials.material_9 && <mesh castShadow receiveShadow geometry={nodes.Object_11.geometry} material={materials.material_9} />}
      </group>
    </group>
  );
}

useGLTF.preload(hermioneModelPath);