'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const MainGameScene = dynamic(() => import('../scenes/MainGameScene'), {
  ssr: false
});

export default function PhaserGame({ gameState, setGameState, onParticleEffect }) {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

  
    const initializeGame = async () => {
      const Phaser = await import('phaser');
      const { default: MainGameSceneClass } = await import('../scenes/MainGameScene');

      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: gameRef.current,
        backgroundColor: 'transparent',
        scene: [MainGameSceneClass],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        input: {
          mouse: {
            target: gameRef.current
          },
          touch: {
            target: gameRef.current
          }
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      if (gameRef.current && !phaserGameRef.current) {
        phaserGameRef.current = new Phaser.Game(config);
        
        phaserGameRef.current.events.on('ready', () => {
          const scene = phaserGameRef.current.scene.getScene('MainGameScene');
          if (scene) {
            scene.setGameProps({ gameState, setGameState, onParticleEffect });
          }
        });
      }
    };

    initializeGame();

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [isClient, gameState, setGameState, onParticleEffect]);

  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20">
        <div className="text-white text-xl">Loading Game...</div>
      </div>
    );
  }

  return (
    <div 
      ref={gameRef} 
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}
