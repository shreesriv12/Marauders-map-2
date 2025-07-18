import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

// Define modelPath here, at the top-level scope, accessible by useGLTF.preload
const modelPath = '/models/harry_potter.glb'; // Ensure this path is correct relative to your public folder

export function HarryPotterModel(props) {
  useEffect(() => {
    console.log('HarryPotterModel component mounted in R3F scene.');
  }, []);

  // useGLTF will throw a Promise to suspend the component until loaded.
  // DO NOT wrap this in a try...catch for normal suspension behavior.
  const { nodes, materials } = useGLTF(modelPath);

  // THIS LOG IS CRUCIAL FOR DEBUGGING NODE/MATERIAL NAMES!
  console.log('useGLTF successful! Nodes:', nodes, 'Materials:', materials);

  // Optional: Add simple fallback if nodes/materials are unexpectedly empty
  if (!nodes || Object.keys(nodes).length === 0 || !materials || Object.keys(materials).length === 0) {
    console.warn("WARNING: GLTF model loaded but no nodes or materials found. Rendering a placeholder box.");
    return (
      <mesh {...props}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  return (
    <group {...props} dispose={null}>
      {/*
        This rotation is common for GLTF models exported from some software (e.g., Blender)
        where Z is up, but Three.js expects Y to be up.
        If your model appears on its side or upside down, keep this.
        If it looks fine without it, or this makes it wrong, remove or adjust it.
      */}
      <group rotation={[-Math.PI / 2, 0, 0]}>

        {/*
          IMPORTANT:
          Compare the 'nodes' and 'materials' objects logged in your console
          (from the console.log above) with the names used below.
          They MUST match exactly.
          If your gltfjsx output used different names, update these.
        */}

        {nodes.Object_2 && materials.None && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_2.geometry}
            material={materials.None}
          />
        )}
        {nodes.Object_3 && materials.material_0 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_3.geometry}
            material={materials.material_0}
          />
        )}
        {nodes.Object_4 && materials.material_1 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_4.geometry}
            material={materials.material_1}
          />
        )}
        {nodes.Object_5 && materials.material_2 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_5.geometry}
            material={materials.material_2}
          />
        )}
        {nodes.Object_6 && materials.material_3 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_6.geometry}
            material={materials.material_3}
          />
        )}
        {nodes.Object_7 && materials.material_4 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_7.geometry}
            material={materials.material_4}
          />
        )}
        {nodes.Object_8 && materials.material_5 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_8.geometry}
            material={materials.material_5}
          />
        )}
        {nodes.Object_9 && materials.material_6 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_9.geometry}
            material={materials.material_6}
          />
        )}
        {nodes.Object_10 && materials.material_7 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_10.geometry}
            material={materials.material_7}
          />
        )}
        {nodes.Object_11 && materials.material_8 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_11.geometry}
            material={materials.material_8}
          />
        )}
      </group>
    </group>
  );
}

// Preload the model to make it available instantly when the component mounts
useGLTF.preload(modelPath);