import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

// Define modelPath at the top-level scope
const logoModelPath = '/models/harry_potter_metal_logo_3d_free_hogwarts.glb';

export function HarryPotterLogoModel(props) {
  const { nodes, materials } = useGLTF(logoModelPath);

  // Log nodes and materials to confirm exact names from gltfjsx output
  console.log('Harry Potter Logo Model loaded. Nodes:', nodes, 'Materials:', materials);

  // Optional: Add simple fallback if nodes/materials are unexpectedly empty
  if (!nodes || Object.keys(nodes).length === 0 || !materials || Object.keys(materials).length === 0) {
    console.warn("WARNING: Logo model loaded but no nodes or materials found. Rendering a placeholder box.");
    return (
      <mesh {...props}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    );
  }

  return (
    // The main parent group for this component
    <group {...props} dispose={null}>
      {/* This is the first level of grouping for the model's parts, from gltfjsx output */}
      <group position={[0, 0.256, 0.256]} rotation={[Math.PI / 2, 0, 0]} scale={0.001}>
        {/*
          CRITICAL FIX: These two <group> elements below are siblings.
          They MUST be wrapped in a single parent element.
          We use a React Fragment (<>...</>) for this.
        */}
        <>
          {/* First inner group */}
          {nodes.Object_8 && materials.material && <mesh castShadow receiveShadow geometry={nodes.Object_8.geometry} material={materials.material} />}
          {nodes.Object_10 && materials.material_1 && <mesh castShadow receiveShadow geometry={nodes.Object_10.geometry} material={materials.material_1} />}
          {nodes.Object_12 && materials.material_2 && <mesh castShadow receiveShadow geometry={nodes.Object_12.geometry} material={materials.material_2} />}
          {nodes.Object_14 && materials.material_3 && <mesh castShadow receiveShadow geometry={nodes.Object_14.geometry} material={materials.material_3} />}
          {nodes.Object_16 && materials.material_4 && <mesh castShadow receiveShadow geometry={nodes.Object_16.geometry} material={materials.material_4} />}
          {nodes.Object_18 && materials.material_5 && <mesh castShadow receiveShadow geometry={nodes.Object_18.geometry} material={materials.material_5} />}
          {nodes.Object_20 && materials.material_6 && <mesh castShadow receiveShadow geometry={nodes.Object_20.geometry} material={materials.material_6} />}
          {nodes.Object_22 && materials.material_7 && <mesh castShadow receiveShadow geometry={nodes.Object_22.geometry} material={materials.material_7} />}
          {nodes.Object_24 && materials.material_8 && <mesh castShadow receiveShadow geometry={nodes.Object_24.geometry} material={materials.material_8} />}
          {nodes.Object_26 && materials.material_9 && <mesh castShadow receiveShadow geometry={nodes.Object_26.geometry} material={materials.material_9} />}
          {nodes.Object_28 && materials.material_10 && <mesh castShadow receiveShadow geometry={nodes.Object_28.geometry} material={materials.material_10} />}
          {nodes.Object_29 && materials.material_10 && <mesh castShadow receiveShadow geometry={nodes.Object_29.geometry} material={materials.material_10} />}
          {nodes.Object_30 && materials.material_10 && <mesh castShadow receiveShadow geometry={nodes.Object_30.geometry} material={materials.material_10} />}
          {nodes.Object_31 && materials.material_10 && <mesh castShadow receiveShadow geometry={nodes.Object_31.geometry} material={materials.material_10} />}
          {nodes.Object_32 && materials.material_10 && <mesh castShadow receiveShadow geometry={nodes.Object_32.geometry} material={materials.material_10} />}
          {nodes.Object_33 && materials.material_10 && <mesh castShadow receiveShadow geometry={nodes.Object_33.geometry} material={materials.material_10} />}
          {nodes.Object_34 && materials.material_10 && <mesh castShadow receiveShadow geometry={nodes.Object_34.geometry} material={materials.material_10} />}
          {nodes.Object_35 && materials.material_10 && <mesh castShadow receiveShadow geometry={nodes.Object_35.geometry} material={materials.material_10} />}

          {/* Second inner group, which was previously a direct sibling without a wrapper */}
          {nodes.Object_39 && materials.material_11 && <mesh castShadow receiveShadow geometry={nodes.Object_39.geometry} material={materials.material_11} />}
          {nodes.Object_41 && materials.material_12 && <mesh castShadow receiveShadow geometry={nodes.Object_41.geometry} material={materials.material_12} />}
          {nodes.Object_43 && materials.material_13 && <mesh castShadow receiveShadow geometry={nodes.Object_43.geometry} material={materials.material_13} />}
          {nodes.Object_45 && materials.material_14 && <mesh castShadow receiveShadow geometry={nodes.Object_45.geometry} material={materials.material_14} />}
          {nodes.Object_47 && materials.material_15 && <mesh castShadow receiveShadow geometry={nodes.Object_47.geometry} material={materials.material_15} />}
          {nodes.Object_49 && materials.material_16 && <mesh castShadow receiveShadow geometry={nodes.Object_49.geometry} material={materials.material_16} />}
          {nodes.Object_51 && materials.material_17 && <mesh castShadow receiveShadow geometry={nodes.Object_51.geometry} material={materials.material_17} />}
          {nodes.Object_53 && materials.material_18 && <mesh castShadow receiveShadow geometry={nodes.Object_53.geometry} material={materials.material_18} />}
          {nodes.Object_55 && materials.material_19 && <mesh castShadow receiveShadow geometry={nodes.Object_55.geometry} material={materials.material_19} />}
          {nodes.Object_56 && materials.material_19 && <mesh castShadow receiveShadow geometry={nodes.Object_56.geometry} material={materials.material_19} />}
        </> {/* CLOSING TAG for the inner React Fragment */}
      </group>
    </group>
  );
}

useGLTF.preload(logoModelPath);