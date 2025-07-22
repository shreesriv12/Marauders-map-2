export const RECIPES = {
    1: [
      {
        name: "Healing Potion",
        ingredients: ["leaf", "crystal"],
        points: 100,
        color: "#ff6b6b",
        description: "A simple restorative brew"
      },
      {
        name: "Time Crystal",
        ingredients: ["temporal_flower", "crystal"],
        points: 100,
        color: "#ff6b6b",
        description: "Time manipulation brew"
      }
    ],
    2: [
      {
        name: "Strength Potion",
        ingredients: ["dragon_scale", "iron_ore", "fire_flower"],
        points: 200,
        color: "#ffa500",
        description: "Increases physical prowess"
      },
      {
        name: "Wisdom Potion",
        ingredients: ["owl_feather", "moonstone", "sage"],
        points: 200,
        color: "#4169e1",
        description: "Enhances mental clarity"
      }
    ],
    3: [
      {
        name: "Invisibility Potion",
        ingredients: ["ghost_essence", "shadow_herb", "fairy_dust", "void_crystal"],
        points: 400,
        color: "#9400d3",
        description: "Grants temporary invisibility"
      },
      {
        name: "Dragon Breath Potion",
        ingredients: ["dragon_heart", "flame_berry", "sulfur", "phoenix_ash"],
        points: 400,
        color: "#dc143c",
        description: "Breathe fire like a dragon"
      }
    ],
    4: [
      {
        name: "Philosopher's Stone",
        ingredients: ["mercury", "sulfur", "salt", "gold_essence", "philosopher_crystal"],
        points: 800,
        color: "#ffd700",
        description: "The legendary transmutation stone"
      },
      {
        name: "Time Turner Potion",
        ingredients: ["chronos_sand", "temporal_flower", "hourglass_dust", "time_crystal", "eternity_essence"],
        points: 800,
        color: "#40e0d0",
        description: "Manipulate the flow of time"
      }
    ]
  };
  
  export const LEVEL_REQUIREMENTS = {
    1: { target: 200, title: "Apprentice Brewer" },
    2: { target: 600, title: "Skilled Mixer" },
    3: { target: 1200, title: "Expert Alchemist" },
    4: { target: 2000, title: "Master Potioneer" }
  };
  

export { INGREDIENTS } from './Ingredients';