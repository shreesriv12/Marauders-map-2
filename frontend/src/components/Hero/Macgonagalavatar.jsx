import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

// Define modelPath at the top-level scope for consistency
const modelPath = '/models/professor_mcgonagall.glb'; // Assuming your McGonagall GLB is in /public/models/

export function McGonagallModel(props) {
  const group = useRef(); // Use useRef for the main group, consistent with other character models
  const { nodes, materials } = useGLTF(modelPath);

  // Log nodes and materials to confirm exact names from gltfjsx output
  // This is very useful for debugging if the model doesn't appear correctly.
  console.log('Professor McGonagall Model loaded. Nodes:', nodes, 'Materials:', materials);

  // Optional: Add simple fallback if nodes/materials are unexpectedly empty or malformed
  if (!nodes || Object.keys(nodes).length === 0 || !materials || Object.keys(materials).length === 0) {
    console.warn("WARNING: McGonagall model loaded but no nodes or materials found. Rendering a placeholder cube.");
    return (
      <mesh {...props}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="green" /> {/* Gryffindor/McGonagall-like color */}
      </mesh>
    );
  }

  return (
    // The main parent group for this component.
    // Props passed from the parent component (e.g., position, rotation, scale) will apply here.
    <group ref={group} {...props} dispose={null}>
      {/* The structure below should mimic the 'Model' component you provided */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {nodes.Object_2 && materials.Mat_1 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_2.geometry}
            material={materials.Mat_1}
          />
        )}
        {nodes.Object_3 && materials.Mat_2 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_3.geometry}
            material={materials.Mat_2}
          />
        )}
        {nodes.Object_4 && materials.Mat_3 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_4.geometry}
            material={materials.Mat_3}
          />
        )}
        {nodes.Object_5 && materials.material && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_5.geometry}
            material={materials.material}
          />
        )}
      </group>
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload(modelPath);