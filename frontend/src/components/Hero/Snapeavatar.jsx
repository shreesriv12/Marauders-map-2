import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

// Define modelPath at the top-level scope for consistency
const modelPath = '/models/severus_snape.glb'; // Assuming your Snape GLB is in /public/models/

export function SnapeModel(props) {
  const group = useRef(); // Use useRef for the main group, consistent with other character models
  const { nodes, materials } = useGLTF(modelPath);

  // Log nodes and materials to confirm exact names from gltfjsx output
  // This is very useful for debugging if the model doesn't appear correctly.
  console.log('Severus Snape Model loaded. Nodes:', nodes, 'Materials:', materials);

  // Optional: Add simple fallback if nodes/materials are unexpectedly empty or malformed
  if (!nodes || Object.keys(nodes).length === 0 || !materials || Object.keys(materials).length === 0) {
    console.warn("WARNING: Snape model loaded but no nodes or materials found. Rendering a placeholder sphere.");
    return (
      <mesh {...props}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="darkpurple" /> {/* Snape-like color */}
      </mesh>
    );
  }

  return (
    // The main parent group for this component.
    // Props passed from the parent component (e.g., position, rotation, scale) will apply here.
    <group ref={group} {...props} dispose={null}>
      {/*
        The structure below should mimic the 'Model' component you provided
        from your gltfjsx output. It typically has nested groups and then meshes.
        Ensure 'castShadow' and 'receiveShadow' are added to the <mesh> elements.
      */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]} scale={0.025}>
          <group scale={39.37}>
            {nodes['005-0-5_02_-_Default_0'] && materials['02_-_Default'] && (
              <mesh
                castShadow
                receiveShadow
                geometry={nodes['005-0-5_02_-_Default_0'].geometry}
                material={materials['02_-_Default']}
              />
            )}
            {nodes['004-0-4_03_-_Default_0'] && materials['03_-_Default'] && (
              <mesh
                castShadow
                receiveShadow
                geometry={nodes['004-0-4_03_-_Default_0'].geometry}
                material={materials['03_-_Default']}
              />
            )}
            {nodes['003-0-3_Material_#25_0'] && materials.Material_25 && (
              <mesh
                castShadow
                receiveShadow
                geometry={nodes['003-0-3_Material_#25_0'].geometry}
                material={materials.Material_25}
              />
            )}
            {nodes['002-0-2_05_-_Default_0'] && materials['05_-_Default'] && (
              <mesh
                castShadow
                receiveShadow
                geometry={nodes['002-0-2_05_-_Default_0'].geometry}
                material={materials['05_-_Default']}
              />
            )}
            {nodes['001-0-1_04_-_Default_0'] && materials['04_-_Default'] && (
              <mesh
                castShadow
                receiveShadow
                geometry={nodes['001-0-1_04_-_Default_0'].geometry}
                material={materials['04_-_Default']}
              />
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload(modelPath);