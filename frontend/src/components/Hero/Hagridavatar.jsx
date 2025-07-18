import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

// Define modelPath at the top-level scope for consistency
const modelPath = '/models/rubeus_hagrid.glb'; // Assuming your Hagrid GLB is in /public/models/

export function HagridModel(props) {
  const group = useRef(); // Use useRef for the main group, consistent with other character models
  const { nodes, materials } = useGLTF(modelPath);

  // Log nodes and materials to confirm exact names from gltfjsx output
  // This is very useful for debugging if the model doesn't appear correctly.
  console.log('Rubeus Hagrid Model loaded. Nodes:', nodes, 'Materials:', materials);

  // Optional: Add simple fallback if nodes/materials are unexpectedly empty or malformed
  if (!nodes || Object.keys(nodes).length === 0 || !materials || Object.keys(materials).length === 0) {
    console.warn("WARNING: Hagrid model loaded but no nodes or materials found. Rendering a placeholder cylinder.");
    return (
      <mesh {...props}>
        <cylinderGeometry args={[0.3, 2.4, 1.0, 32]} /> {/* Tall, sturdy placeholder */}
        <meshStandardMaterial color="brown" /> {/* Hagrid-like color */}
      </mesh>
    );
  }

  return (
    // The main parent group for this component.
    // Props passed from the parent component (e.g., position, rotation, scale) will apply here.
    <group ref={group} {...props} dispose={null}>
      {/* The structure below should mimic the 'Model' component you provided */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/*
          CRITICAL: Ensure the material names match exactly what gltfjsx outputs.
          In your provided code, you have `materials.None`, `materials.material_0`, etc.
          Make sure these are correct based on your actual GLTF file.
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
      </group>
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload(modelPath);