'use client'; // Keep this if you're mixing with Next.js or just for explicit client component in frameworks like Next.js App Router

import { useEffect, useRef, useState } from 'react';
// Remove the 'next/dynamic' import - it's not needed here
// import dynamic from 'next/dynamic'; // DELETE THIS LINE

// The MainGameScene *class* (your Phaser scene) is loaded directly
// within the useEffect, so no need for React.lazy or next/dynamic here.

export default function PhaserGame({ gameState, setGameState, onParticleEffect }) {
  const gameRef = useRef(null); // Ref for the DOM element where Phaser will render
  const phaserGameRef = useRef(null); // Ref to hold the Phaser.Game instance itself
  const [isClient, setIsClient] = useState(false); // State to ensure client-side execution

  // Effect to set isClient to true once the component mounts on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to initialize and manage the Phaser game instance
  useEffect(() => {
    // Only run this effect on the client-side
    if (!isClient) return;

    const initializeGame = async () => {
      // Dynamically import Phaser and your MainGameScene class
      // This ensures they are only loaded client-side and helps with bundle size.
      const Phaser = await import('phaser');
      // Ensure that '../scenes/MainGameScene' exports the Phaser.Scene class as default
      const { default: MainGameSceneClass } = await import('../scenes/MainGameScene');

      // Define the Phaser game configuration
      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: gameRef.current, // Attach Phaser's canvas to this DOM element
        backgroundColor: 'transparent',
        scene: [MainGameSceneClass], // Pass your Phaser Scene CLASS here
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        input: {
          mouse: {
            target: gameRef.current // Direct mouse input to the game container
          },
          touch: {
            target: gameRef.current // Direct touch input to the game container
          }
        },
        scale: {
          mode: Phaser.Scale.RESIZE, // Automatically resize the game when window resizes
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      // Initialize the Phaser game if the ref exists and no game is currently running
      if (gameRef.current && !phaserGameRef.current) {
        phaserGameRef.current = new Phaser.Game(config);

        // Once the Phaser game is ready, pass React props to the Phaser scene
        phaserGameRef.current.events.on('ready', () => {
          const scene = phaserGameRef.current.scene.getScene('MainGameScene'); // Get instance of your scene
          if (scene && typeof scene.setGameProps === 'function') {
            // Call a method on your Phaser scene to update its internal props
            scene.setGameProps({ gameState, setGameState, onParticleEffect });
          } else {
             console.warn("MainGameScene not found or setGameProps method is missing on scene.");
          }
        });
      }
    };

    // Call the async initialization function
    initializeGame();

    // Cleanup function: destroy the Phaser game when the component unmounts
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true); // true means destroy all associated DOM elements as well
        phaserGameRef.current = null;
      }
    };
  }, [isClient, gameState, setGameState, onParticleEffect]); // Dependencies: re-run if these props change

  // Effect for handling window resizing
  useEffect(() => {
    if (!isClient) return; // Only run on client

    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]); // Only depend on isClient

  // Render a loading state during server-side rendering (if applicable)
  // or before the client-side hydration.
  if (!isClient) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20">
        <div className="text-white text-xl">Loading Game...</div>
      </div>
    );
  }

  // Once client-side, render the div that will host the Phaser canvas
  return (
    <div
      ref={gameRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }} // Ensure it layers correctly
    />
  );
}