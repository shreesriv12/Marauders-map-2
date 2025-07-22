'use client';
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import PhaserGame from '../components/potion_brew/game/PhaserGame.jsx';
import MagicalBackground from '../components/potion_brew/3d/Background';
import GameUI from '../components/potion_brew/game/GameUI.jsx';
import { ParticleOverlay } from '../components/potion_brew/effects/ParticleSystem.jsx';

export default function PotionBrewingGame() {
  const [gameState, setGameState] = useState({
    currentLevel: 1,
    score: 0,
    currentRecipe: null,
    brewingSequence: [],
    gamePhase: 'menu',
  });

  const [showParticles, setShowParticles] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-purple-900 via-blue-900 to-black">
      {/* 3D Magical Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <MagicalBackground />
        </Canvas>
      </div>

      {/* 2D Game Layer */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {gameState.gamePhase === 'menu' && (
            <MainMenu
              onStartGame={() => setGameState(prev => ({ ...prev, gamePhase: 'playing' }))}
            />
          )}

          {gameState.gamePhase === 'playing' && (
            <div className="w-full h-full">
              <GameUI gameState={gameState} setGameState={setGameState} />
              <PhaserGame
                gameState={gameState}
                setGameState={setGameState}
                onParticleEffect={() => setShowParticles(true)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Particle Effects Overlay */}
      <AnimatePresence>
        {showParticles && (
          <ParticleOverlay onComplete={() => setShowParticles(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Menu Component
function MainMenu({ onStartGame }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="flex flex-col items-center justify-center h-full text-white"
    >
      <motion.h1
        className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Potion Master
      </motion.h1>
      <motion.p className="text-xl mb-12 text-center max-w-2xl">
        Enter the magical world of potion brewing. Master the ancient arts of alchemy
        and progress from Apprentice to Master Potioneer!
      </motion.p>
      <motion.button
        onClick={onStartGame}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Begin Your Journey
      </motion.button>
    </motion.div>
  );
}
