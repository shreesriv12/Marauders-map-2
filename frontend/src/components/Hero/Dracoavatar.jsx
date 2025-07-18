import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

// Define modelPath at the top-level scope for consistency
const modelPath = '/models/draco_malfoy.glb'; // Assuming your Draco Malfoy GLB is in /public/models/

export function DracoMalfoyModel(props) {
  const group = useRef(); // Use useRef for the main group, consistent with other character models
  const { nodes, materials } = useGLTF(modelPath);

  // Log nodes and materials to confirm exact names from gltfjsx output
  // This is very useful for debugging if the model doesn't appear correctly.
  console.log('Draco Malfoy Model loaded. Nodes:', nodes, 'Materials:', materials);

  // Optional: Add simple fallback if nodes/materials are unexpectedly empty or malformed
  if (!nodes || Object.keys(nodes).length === 0 || !materials || Object.keys(materials).length === 0) {
    console.warn("WARNING: Draco Malfoy model loaded but no nodes or materials found. Rendering a placeholder cone.");
    return (
      <mesh {...props}>
        <coneGeometry args={[0.3, 0.6, 32]} /> {/* A bit sharp, like Draco */}
        <meshStandardMaterial color="silver" /> {/* Slytherin-like color */}
      </mesh>
    );
  }

  return (
    // The main parent group for this component.
    // Props passed from the parent component (e.g., position, rotation, scale) will apply here.
    <group ref={group} {...props} dispose={null}>
      {/* The structure below should mimic the 'Model' component you provided */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Ensure material names match exactly what gltfjsx outputs */}
        {nodes.Object_2 && materials.Mat_2 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_2.geometry}
            material={materials.Mat_2}
          />
        )}
        {nodes.Object_3 && materials.Mat_3 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_3.geometry}
            material={materials.Mat_3}
          />
        )}
        {nodes.Object_4 && materials.Mat_4 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_4.geometry}
            material={materials.Mat_4}
          />
        )}
        {nodes.Object_5 && materials.Mat_5 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_5.geometry}
            material={materials.Mat_5}
          />
        )}
        {nodes.Object_6 && materials.material && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_6.geometry}
            material={materials.material}
          />
        )}
        {nodes.Object_7 && materials.Mat_1 && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_7.geometry}
            material={materials.Mat_1}
          />
        )}
      </group>
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload(modelPath);