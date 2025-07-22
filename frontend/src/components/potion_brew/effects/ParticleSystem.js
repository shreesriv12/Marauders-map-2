import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ParticleOverlay({ onComplete, effectType = 'success' }) {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      color: effectType === 'success' 
        ? ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 4)]
        : '#ff4757',
      size: Math.random() * 10 + 5,
      duration: Math.random() * 2 + 1
    }));
    
    setParticles(newParticles);
    
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [effectType, onComplete]);
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-80"
          style={{
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
          }}
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: particle.x + (Math.random() - 0.5) * 400,
            y: particle.y + (Math.random() - 0.5) * 400,
            scale: [0, 1, 0],
            opacity: [1, 0.8, 0]
          }}
          transition={{
            duration: particle.duration,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}
