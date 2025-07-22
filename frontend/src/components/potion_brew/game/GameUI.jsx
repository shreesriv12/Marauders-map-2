import { motion } from 'framer-motion';
import { LEVEL_REQUIREMENTS } from '../data/recipes';
import { RECIPES } from '../data/recipes';

export default function GameUI({ gameState, setGameState }) {
  const currentLevel = gameState.currentLevel;
  const levelInfo = LEVEL_REQUIREMENTS[currentLevel];
  const progress = (gameState.score / levelInfo.target) * 100;
  
  return (
    <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
      {/* Header UI */}
      <div className="flex justify-between items-start p-6">
        {/* Level and Title */}
        <motion.div 
          className="bg-black/50 backdrop-blur-md rounded-lg p-4 text-white pointer-events-auto"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h2 className="text-2xl font-bold text-yellow-400">Level {currentLevel}</h2>
          <p className="text-lg">{levelInfo.title}</p>
        </motion.div>
        
        {/* Score Display */}
        <motion.div 
          className="bg-black/50 backdrop-blur-md rounded-lg p-4 text-white pointer-events-auto"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="text-right">
            <p className="text-lg font-semibold">Score: {gameState.score}</p>
            <p className="text-sm text-gray-300">Target: {levelInfo.target}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-48 bg-gray-700 rounded-full h-2 mt-2">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Recipe Book */}
      <RecipeBook currentLevel={currentLevel} />
    </div>
  );
}

function RecipeBook({ currentLevel }) {
  return (
    <motion.div
      className="absolute right-6 top-32 bg-black/70 backdrop-blur-md rounded-lg p-4 text-white pointer-events-auto max-w-sm"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-3 text-yellow-400">📜 Recipe Book</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {RECIPES[currentLevel].map((recipe, index) => (
          <div key={index} className="border-b border-gray-600 pb-2">
            <h4 className="font-semibold" style={{ color: recipe.color }}>
              {recipe.name}
            </h4>
            <p className="text-sm text-gray-300">{recipe.description}</p>
            <p className="text-xs text-yellow-300">
              {recipe.ingredients.join(' → ')}
            </p>
            <p className="text-xs text-green-400">Points: {recipe.points}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
