import * as Phaser from 'phaser';
import { RECIPES, LEVEL_REQUIREMENTS } from '../data/recipes';
import { INGREDIENTS } from '../data/ingredients';

export default class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
    this.currentRecipe = null;
    this.ingredientSequence = [];
    this.cauldron = null;
    this.ingredientSprites = [];
    this.draggedIngredient = null;
    
    // Props from React components
    this.gameState = null;
    this.setGameState = null;
    this.onParticleEffect = null;
    
    // Game-specific state
    this.availableIngredients = [];
    this.isBrewingComplete = false;
    this.particleEmitters = [];
    
    // Recipe completion tracking
    this.completedRecipes = new Map();
    this.isGameComplete = false;
    
    // UI elements
    this.quitButton = null;
    
    // Consistent sizing constants
    this.SIZES = {
      INGREDIENT: { width: 60, height: 60 },
      CAULDRON: { width: 200, height: 200 },
      EFFECT: { width: 32, height: 32 },
      PANEL_SPACING: 120,
      INGREDIENT_HOVER: 1.2
    };
  }

  // Method to receive props from React component
  setGameProps({ gameState, setGameState, onParticleEffect }) {
    this.gameState = gameState;
    this.setGameState = setGameState;
    this.onParticleEffect = onParticleEffect;
  }

  // Method to update game state when props change
  updateGameState({ gameState, setGameState, onParticleEffect }) {
    const previousLevel = this.gameState?.currentLevel;
    
    this.gameState = gameState;
    this.setGameState = setGameState;
    this.onParticleEffect = onParticleEffect;

    if (previousLevel && previousLevel !== gameState.currentLevel) {
      this.handleLevelChange();
    }
  }

  // Initialize completed recipes tracking
  initializeRecipeTracking() {
    for (let level = 1; level <= 4; level++) {
      if (!this.completedRecipes.has(level)) {
        this.completedRecipes.set(level, new Set());
      }
    }
  }

  preload() {
    // Load all ingredient images
    Object.keys(INGREDIENTS).forEach(key => {
      this.load.image(key, INGREDIENTS[key].image);
    });
    
    // Load game assets
    this.load.image('cauldron', '/potion_brew/images/cauldron/cauldron_main.png');
    this.load.image('cauldron_glow', '/potion_brew/images/cauldron/cauldron_glow.png');
    this.load.image('ingredient_panel', '/potion_brew/images/ui/ingredient_panel.png');
    this.load.image('recipe_scroll', '/potion_brew/images/ui/recipe_scroll.png');
    
    // Load particle effects
    this.load.image('spark', '/potion_brew/images/effects/spark.png');
    this.load.image('bubble', '/potion_brew/images/effects/bubble.png');
    this.load.image('magic_swirl', '/potion_brew/images/effects/magic_swirl.png');
    this.load.image('star_particle', '/potion_brew/images/effects/star.png');

    // Load audio files
    this.load.audio('ingredient_drop', '/audio/ingredient_drop.mp3');
    this.load.audio('brewing_sound', '/audio/brewing.mp3');
    this.load.audio('success_sound', '/audio/success.mp3');
    this.load.audio('fail_sound', '/audio/fail.mp3');
    this.load.audio('victory_sound', '/audio/victory.mp3');
  }

  create() {
    // Initialize recipe tracking
    this.initializeRecipeTracking();
    
    // Initialize game elements
    this.setupCauldron();
    this.setupIngredientPanels();
    this.setupCurrentRecipe();
    this.setupDragAndDrop();
    this.setupParticleEffects();
    this.setupAudio();
    this.setupUI(); // Add UI setup
    
    // Setup input handlers
    this.setupInputHandlers();
    
    // Handle responsive design
    this.scale.on('resize', this.handleResize, this);
  }

  // Setup UI elements including quit button
  setupUI() {
    // Create quit button
    this.quitButton = this.add.text(this.cameras.main.width / 2, 50, '❌ Quit Game', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fill: '#ffffff',
      backgroundColor: '#dc3545',
      padding: { x: 12, y: 8 },
      align: 'center'
    })
    .setOrigin(0, 0)
    .setInteractive({ useHandCursor: true })
    .setDepth(1000) // Ensure it's always on top
    .on('pointerover', () => {
      this.quitButton.setStyle({ backgroundColor: '#c82333' });
      this.quitButton.setScale(1.05);
    })
    .on('pointerout', () => {
      this.quitButton.setStyle({ backgroundColor: '#dc3545' });
      this.quitButton.setScale(1);
    })
    .on('pointerdown', () => {
      this.showQuitConfirmation();
    });
  }

  // Show quit confirmation dialog
  showQuitConfirmation() {
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    ).setOrigin(0.5).setDepth(2000);

    // Create confirmation dialog
    const dialogBg = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      400,
      250,
      0x2c2c54,
      0.95
    ).setOrigin(0.5).setDepth(2001).setStrokeStyle(3, 0xffd700);

    // Dialog title
    const dialogTitle = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 60,
      '🚪 Quit Game?',
      {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(2002);

    // Dialog message
    const dialogMessage = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 10,
      'Are you sure you want to quit?\nYour progress will be lost.',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        lineSpacing: 5
      }
    ).setOrigin(0.5).setDepth(2002);

    // Yes button
    const yesButton = this.add.text(
      this.cameras.main.width / 2 - 80,
      this.cameras.main.height / 2 + 60,
      '✓ Yes, Quit',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        backgroundColor: '#dc3545',
        padding: { x: 15, y: 10 }
      }
    ).setOrigin(0.5).setDepth(2002)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => {
      yesButton.setStyle({ backgroundColor: '#c82333' });
    })
    .on('pointerout', () => {
      yesButton.setStyle({ backgroundColor: '#dc3545' });
    })
    .on('pointerdown', () => {
      this.quitGame();
    });

    // No button
    const noButton = this.add.text(
      this.cameras.main.width / 2 + 80,
      this.cameras.main.height / 2 + 60,
      '✗ Cancel',
      {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        backgroundColor: '#28a745',
        padding: { x: 15, y: 10 }
      }
    ).setOrigin(0.5).setDepth(2002)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => {
      noButton.setStyle({ backgroundColor: '#218838' });
    })
    .on('pointerout', () => {
      noButton.setStyle({ backgroundColor: '#28a745' });
    })
    .on('pointerdown', () => {
      // Close dialog
      overlay.destroy();
      dialogBg.destroy();
      dialogTitle.destroy();
      dialogMessage.destroy();
      yesButton.destroy();
      noButton.destroy();
    });

    // Store dialog elements for cleanup
    this.quitDialog = {
      overlay,
      dialogBg,
      dialogTitle,
      dialogMessage,
      yesButton,
      noButton
    };
  }

  // Quit game function
  quitGame() {
    // Clean up all game resources
    this.isGameComplete = true;
    this.input.enabled = false;

    // Clean up particles
    this.particleEmitters.forEach(emitter => {
      if (emitter && emitter.destroy) {
        emitter.destroy();
      }
    });
    this.particleEmitters = [];

    // Stop all tweens
    this.tweens.killAll();

    // Update React state to return to menu
    if (this.setGameState) {
      this.setGameState(prev => ({
        ...prev,
        gamePhase: 'menu', // Return to main menu
        currentLevel: 1,
        score: 0,
        currentRecipe: null,
        brewingSequence: []
      }));
    }

    // Optionally restart the scene or destroy it
    this.scene.stop();
  }

  // Toggle pause function
  togglePause() {
    if (this.scene.isPaused()) {
      this.scene.resume();
      this.pauseButton.setText('⏸️ Pause');
    } else {
      this.scene.pause();
      this.pauseButton.setText('▶️ Resume');
    }
  }

  // Scaling methods
  scaleToFit(sprite, maxWidth, maxHeight, padding = 0) {
    const availableWidth = maxWidth - (padding * 2);
    const availableHeight = maxHeight - (padding * 2);
    
    const scaleX = availableWidth / sprite.width;
    const scaleY = availableHeight / sprite.height;
    const scale = Math.min(scaleX, scaleY);
    
    sprite.setScale(scale);
    sprite.setOrigin(0.5, 0.5);
    
    return scale;
  }

  smartScale(sprite, type = 'ingredient', context = 'normal') {
    let targetSize = this.SIZES.INGREDIENT;
    
    switch (type) {
      case 'cauldron':
        targetSize = this.SIZES.CAULDRON;
        break;
      case 'effect':
        targetSize = this.SIZES.EFFECT;
        break;
      case 'ingredient':
      default:
        targetSize = this.SIZES.INGREDIENT;
        break;
    }
    
    if (context === 'hover') {
      targetSize = {
        width: targetSize.width * this.SIZES.INGREDIENT_HOVER,
        height: targetSize.height * this.SIZES.INGREDIENT_HOVER
      };
    }
    
    return this.scaleToFit(sprite, targetSize.width, targetSize.height, 4);
  }

  setupCauldron() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2 + 50;
    
    this.cauldron = this.add.image(centerX, centerY, 'cauldron')
      .setInteractive(new Phaser.Geom.Circle(0, 0, 100), Phaser.Geom.Circle.Contains);
    
    this.smartScale(this.cauldron, 'cauldron');
    
    this.cauldronGlow = this.add.image(centerX, centerY, 'cauldron_glow')
      .setAlpha(0)
      .setBlendMode(Phaser.BlendModes.ADD);
    
    this.cauldronGlow.setScale(this.cauldron.scaleX);
    
    this.cauldronDropZone = this.add.zone(centerX, centerY, 200, 200)
      .setRectangleDropZone(200, 200);
    
    this.dropZoneGraphics = this.add.graphics();
    
    this.brewingText = this.add.text(centerX, centerY + 120, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 10, y: 5 },
      align: 'center'
    }).setOrigin(0.5).setVisible(false);
  }

  setupIngredientPanels() {
    if (!this.gameState || this.isGameComplete) return;
    
    const currentLevelRecipes = RECIPES[this.gameState.currentLevel];
    const availableIngredients = new Set();
    
    currentLevelRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        availableIngredients.add(ingredient);
      });
    });
    
    this.availableIngredients = Array.from(availableIngredients);
    
    this.ingredientSprites.forEach(sprite => sprite.destroy());
    this.ingredientSprites = [];
    
    const panelStartX = 100;
    const panelStartY = 150;
    const maxPerRow = Math.floor((this.cameras.main.width - 200) / this.SIZES.PANEL_SPACING);
    
    this.availableIngredients.forEach((ingredientKey, index) => {
      const ingredientData = INGREDIENTS[ingredientKey];
      if (!ingredientData) {
        console.warn(`Missing ingredient data for: ${ingredientKey}`);
        return;
      }

      const row = Math.floor(index / maxPerRow);
      const col = index % maxPerRow;
      const x = panelStartX + col * this.SIZES.PANEL_SPACING;
      const y = panelStartY + row * this.SIZES.PANEL_SPACING;
      
      const container = this.add.rectangle(x, y, 
        this.SIZES.INGREDIENT.width + 10, 
        this.SIZES.INGREDIENT.height + 10, 
        0x000000, 0.3
      ).setStrokeStyle(2, 0x444444);
      
      const ingredient = this.add.image(x, y, ingredientKey)
        .setInteractive({ draggable: true })
        .setData('ingredientType', ingredientKey)
        .setData('originalX', x)
        .setData('originalY', y)
        .setData('container', container);
      
      const originalScale = this.smartScale(ingredient, 'ingredient');
      ingredient.setData('originalScale', originalScale);
      
      ingredient.on('pointerover', () => {
        this.smartScale(ingredient, 'ingredient', 'hover');
        container.setStrokeStyle(3, 0x00ff00);
        this.tweens.add({
          targets: container,
          alpha: 0.5,
          duration: 200
        });
      });
      
      ingredient.on('pointerout', () => {
        ingredient.setScale(ingredient.getData('originalScale'));
        container.setStrokeStyle(2, 0x444444);
        this.tweens.add({
          targets: container,
          alpha: 0.3,
          duration: 200
        });
      });
      
      const nameText = this.add.text(x, y + 50, ingredientData.name, {
        fontSize: '12px',
        fill: '#ffffff',
        align: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 5, y: 2 },
        wordWrap: { width: 80, useAdvancedWrap: true },
        stroke: '#880808',
        strokeThickness: 3,
      }).setOrigin(0.5);
      
      const rarityColors = {
        common: '#ffffff',
        uncommon: '#00ff00',
        rare: '#0080ff',
        legendary: '#ff8000'
      };
      
      const rarityIndicator = this.add.circle(
        x + (this.SIZES.INGREDIENT.width / 2) - 5, 
        y - (this.SIZES.INGREDIENT.height / 2) + 5, 
        6, 
        Phaser.Display.Color.HexStringToColor(rarityColors[ingredientData.rarity]).color
      ).setStrokeStyle(2, 0x000000);
      
      this.ingredientSprites.push(ingredient, nameText, rarityIndicator, container);
    });
  }

  setupCurrentRecipe() {
    if (!this.gameState || this.isGameComplete) return;
    
    const recipes = RECIPES[this.gameState.currentLevel];
    const completedInLevel = this.completedRecipes.get(this.gameState.currentLevel) || new Set();
    
    const remainingRecipes = recipes.filter(recipe => !completedInLevel.has(recipe.name));
    
    if (remainingRecipes.length === 0) {
      if (this.gameState.currentLevel === 4) {
        this.endGame();
        return;
      } else {
        this.autoAdvanceLevel();
        return;
      }
    }
    
    if (!this.currentRecipe || !remainingRecipes.find(r => r.name === this.currentRecipe.name)) {
      this.currentRecipe = remainingRecipes[Math.floor(Math.random() * remainingRecipes.length)];
    }
    
    if (this.brewingText) {
      const progressText = this.ingredientSequence.length > 0 
        ? `\nProgress: ${this.ingredientSequence.join(' → ')}`
        : '';
      
      const completionText = `\nCompleted: ${completedInLevel.size}/${recipes.length} recipes`;
      
      this.brewingText.setText(
        `🧪 ${this.currentRecipe.name}\n` +
        `Required: ${this.currentRecipe.ingredients.join(' → ')}${progressText}${completionText}`
      ).setVisible(true);
    }
  }

  autoAdvanceLevel() {
    if (this.setGameState && this.gameState && this.gameState.currentLevel < 4) {
      this.setGameState(prev => ({
        ...prev,
        currentLevel: prev.currentLevel + 1
      }));
    }
  }

  setupDragAndDrop() {
    this.input.on('dragstart', (pointer, gameObject) => {
      if (!gameObject.getData || this.isGameComplete) return;
      
      this.draggedIngredient = gameObject;
      gameObject.setTint(0x00ff00);
      this.smartScale(gameObject, 'ingredient', 'hover');
      this.showDropZone(true);
      
      if (this.sounds?.ingredient_drop) {
        this.sounds.ingredient_drop.play();
      }
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (this.isGameComplete) return;
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      if (dropZone === this.cauldronDropZone && !this.isGameComplete) {
        const ingredientType = gameObject.getData('ingredientType');
        this.addIngredientToCauldron(ingredientType);
        this.createFallingIngredient(gameObject, ingredientType);
        gameObject.setPosition(
          gameObject.getData('originalX'),
          gameObject.getData('originalY')
        );
      }
    });

    this.input.on('dragend', (pointer, gameObject, dropped) => {
      if (gameObject.scene) {
        gameObject.clearTint();
        const originalScale = gameObject.getData('originalScale');
        if (originalScale) {
          gameObject.setScale(originalScale);
        }
        
        if (!dropped) {
          gameObject.setPosition(
            gameObject.getData('originalX'),
            gameObject.getData('originalY')
          );
        }
      }
      
      this.showDropZone(false);
      this.draggedIngredient = null;
    });
  }

  showDropZone(visible) {
    this.dropZoneGraphics.clear();
    if (visible && !this.isGameComplete) {
      this.dropZoneGraphics.lineStyle(3, 0x00ff00, 0.8);
      this.dropZoneGraphics.strokeRect(
        this.cauldron.x - 100, 
        this.cauldron.y - 100, 
        200, 200
      );
    }
  }

  createFallingIngredient(originalSprite, ingredientType) {
    const fallingSprite = this.add.image(originalSprite.x, originalSprite.y, ingredientType);
    this.smartScale(fallingSprite, 'ingredient');
    
    this.tweens.add({
      targets: fallingSprite,
      x: this.cauldron.x,
      y: this.cauldron.y,
      scale: fallingSprite.scaleX * 0.5,
      alpha: 0.5,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        fallingSprite.destroy();
      }
    });
  }

  addIngredientToCauldron(ingredientType) {
    if (this.isGameComplete) return;
    
    this.ingredientSequence.push(ingredientType);
    this.createBrewingEffect();
    this.updateCauldronState();
    this.setupCurrentRecipe();
    
    if (this.sounds?.brewing_sound) {
      this.sounds.brewing_sound.play();
    }
    
    if (this.ingredientSequence.length === this.currentRecipe.ingredients.length) {
      this.time.delayedCall(1000, () => {
        this.checkRecipeCompletion();
      });
    }
  }

  createBrewingEffect() {
    const bubbleEmitter = this.add.particles(
      this.cauldron.x, 
      this.cauldron.y - 30, 
      'bubble', 
      {
        speed: { min: 20, max: 60 },
        scale: { 
          start: 0.1 * this.cauldron.scaleX, 
          end: 0.4 * this.cauldron.scaleX 
        },
        alpha: { start: 1, end: 0 },
        lifespan: 1500,
        quantity: 5,
        blendMode: 'ADD'
      }
    );
    
    const sparkEmitter = this.add.particles(this.cauldron.x, this.cauldron.y, 'spark', {
      speed: { min: 50, max: 150 },
      scale: { 
        start: 0.2 * this.cauldron.scaleX, 
        end: 0 
      },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 8,
      tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]
    });
    
    this.particleEmitters.push(bubbleEmitter, sparkEmitter);
    
    this.time.delayedCall(1500, () => {
      bubbleEmitter.destroy();
      sparkEmitter.destroy();
      this.particleEmitters = this.particleEmitters.filter(e => 
        e !== bubbleEmitter && e !== sparkEmitter
      );
    });
  }

  updateCauldronState() {
    if (!this.currentRecipe) return;
    
    const progress = this.ingredientSequence.length / this.currentRecipe.ingredients.length;
    this.cauldronGlow.setAlpha(progress * 0.9);
    
    const recipeColor = Phaser.Display.Color.HexStringToColor(this.currentRecipe.color);
    this.cauldronGlow.setTint(recipeColor.color);
    
    this.tweens.add({
      targets: this.cauldronGlow,
      scaleX: this.cauldron.scaleX * 0.95,
      scaleY: this.cauldron.scaleY * 0.95,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  checkRecipeCompletion() {
    if (this.isGameComplete) return;
    
    const isCorrect = this.ingredientSequence.every((ingredient, index) => 
      ingredient === this.currentRecipe.ingredients[index]
    );
    
    if (isCorrect) {
      this.completePotion();
    } else {
      this.failPotion();
    }
  }

  completePotion() {
    if (this.isGameComplete) return;
    
    this.isBrewingComplete = true;
    
    if (this.currentRecipe && this.gameState) {
      const completedInLevel = this.completedRecipes.get(this.gameState.currentLevel) || new Set();
      completedInLevel.add(this.currentRecipe.name);
      this.completedRecipes.set(this.gameState.currentLevel, completedInLevel);
    }
    
    this.createSuccessEffect();
    
    if (this.onParticleEffect) {
      this.onParticleEffect();
    }
    
    if (this.sounds?.success_sound) {
      this.sounds.success_sound.play();
    }
    
    if (this.setGameState && this.gameState) {
      const newScore = this.gameState.score + this.currentRecipe.points;
      const currentLevelReq = LEVEL_REQUIREMENTS[this.gameState.currentLevel];
      const shouldLevelUp = newScore >= currentLevelReq.target && this.gameState.currentLevel < 4;
      
      this.setGameState(prev => ({
        ...prev,
        score: newScore,
        currentLevel: shouldLevelUp ? prev.currentLevel + 1 : prev.currentLevel
      }));
    }
    
    if (this.checkGameCompletion()) {
      this.time.delayedCall(3000, () => {
        this.endGame();
      });
    } else {
      this.time.delayedCall(3000, () => {
        this.nextPotion();
      });
    }
  }

  checkGameCompletion() {
    const completedInLevel4 = this.completedRecipes.get(4) || new Set();
    return this.gameState?.currentLevel === 4 && completedInLevel4.size >= RECIPES[4].length;
  }

  createSuccessEffect() {
    const explosionEmitter = this.add.particles(this.cauldron.x, this.cauldron.y, 'star_particle', {
      speed: { min: 100, max: 300 },
      scale: { 
        start: 0.3 * this.cauldron.scaleX, 
        end: 0 
      },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      quantity: 30,
      tint: [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24],
      blendMode: 'ADD'
    });
    
    this.particleEmitters.push(explosionEmitter);
    
    const successText = this.add.text(this.cameras.main.width / 2, 200, '🏆 PERFECT BREW!', {
      fontSize: '36px',
      fill: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: successText,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      ease: 'Back.easeOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        successText.destroy();
      }
    });
    
    const pointsText = this.add.text(this.cameras.main.width / 2, 250, `+${this.currentRecipe.points} Points!`, {
      fontSize: '24px',
      fill: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: pointsText,
      y: 200,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.5 },
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        pointsText.destroy();
      }
    });
    
    this.time.delayedCall(2500, () => {
      explosionEmitter.destroy();
      this.particleEmitters = this.particleEmitters.filter(e => e !== explosionEmitter);
    });
  }

  failPotion() {
    if (this.isGameComplete) return;
    
    const smokeEmitter = this.add.particles(this.cauldron.x, this.cauldron.y - 20, 'bubble', {
      speed: { min: 30, max: 80 },
      scale: { 
        start: 0.3 * this.cauldron.scaleX, 
        end: 0.8 * this.cauldron.scaleX 
      },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2000,
      quantity: 15,
      tint: 0x666666
    });
    
    this.particleEmitters.push(smokeEmitter);
    
    if (this.sounds?.fail_sound) {
      this.sounds.fail_sound.play();
    }
    
    const failText = this.add.text(this.cameras.main.width / 2, 200, '💥 Recipe Failed!', {
      fontSize: '28px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.cameras.main.shake(500, 0.02);
    
    this.tweens.add({
      targets: failText,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 0.5 },
      duration: 2000,
      onComplete: () => {
        failText.destroy();
      }
    });
    
    this.time.delayedCall(2000, () => {
      smokeEmitter.destroy();
      this.particleEmitters = this.particleEmitters.filter(e => e !== smokeEmitter);
      this.resetCauldron();
    });
  }

  resetCauldron() {
    if (this.isGameComplete) return;
    
    this.ingredientSequence = [];
    this.cauldronGlow.setAlpha(0);
    this.isBrewingComplete = false;
    
    this.tweens.killTweensOf(this.cauldronGlow);
    this.cauldronGlow.setScale(this.cauldron.scaleX);
    
    this.setupCurrentRecipe();
  }

  nextPotion() {
    if (this.isGameComplete) return;
    this.resetCauldron();
  }

  handleLevelChange() {
    if (this.isGameComplete) return;
    
    this.resetCauldron();
    this.handleResize();
    this.setupIngredientPanels();
    
    const levelUpText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      `🎉 LEVEL ${this.gameState.currentLevel}! 🎉\n${LEVEL_REQUIREMENTS[this.gameState.currentLevel].title}`, {
      fontSize: '32px',
      fill: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: levelUpText,
      alpha: 1,
      scale: { from: 0.3, to: 1 },
      duration: 1000,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: levelUpText,
            alpha: 0,
            scale: 0.5,
            duration: 500,
            onComplete: () => levelUpText.destroy()
          });
        });
      }
    });
  }

  handleResize() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    if (width < 768) {
      this.SIZES.INGREDIENT = { width: 50, height: 50 };
      this.SIZES.CAULDRON = { width: 150, height: 150 };
      this.SIZES.PANEL_SPACING = 90;
    } else if (width < 1024) {
      this.SIZES.INGREDIENT = { width: 55, height: 55 };
      this.SIZES.CAULDRON = { width: 175, height: 175 };
      this.SIZES.PANEL_SPACING = 100;
    } else {
      this.SIZES.INGREDIENT = { width: 60, height: 60 };
      this.SIZES.CAULDRON = { width: 200, height: 200 };
      this.SIZES.PANEL_SPACING = 120;
    }
    
    if (!this.isGameComplete) {
      this.setupIngredientPanels();
      if (this.cauldron) {
        this.smartScale(this.cauldron, 'cauldron');
        this.cauldronGlow.setScale(this.cauldron.scaleX);
      }
    }
  }

  endGame() {
    this.isGameComplete = true;
    this.input.enabled = false;
    
    this.particleEmitters.forEach(emitter => {
      if (emitter && emitter.destroy) {
        emitter.destroy();
      }
    });
    this.particleEmitters = [];
    
    if (this.sounds?.victory_sound) {
      this.sounds.victory_sound.play();
    }
    
    const grandFinaleEmitter = this.add.particles(this.cameras.main.width / 2, this.cameras.main.height / 2, 'star_particle', {
      speed: { min: 200, max: 400 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 3000,
      quantity: 50,
      tint: [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xff8000, 0x9400d3],
      blendMode: 'ADD'
    });
    
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2, 
      this.cameras.main.height / 2, 
      this.cameras.main.width, 
      this.cameras.main.height, 
      0x000000, 
      0.8
    ).setOrigin(0.5);
    
    const victoryContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    const victoryBg = this.add.rectangle(0, 0, 600, 400, 0x1a1a2e, 0.95)
      .setStrokeStyle(4, 0xffd700);
    
    const victoryTitle = this.add.text(0, -120, '🏆 CONGRATULATIONS! 🏆', {
      fontSize: '42px',
      fontFamily: 'Georgia, serif',
      fill: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    
    const victorySubtitle = this.add.text(0, -60, 'Master Potioneer Achieved!', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5);
    
    const achievementText = this.add.text(0, -10, 
      'You have successfully brewed all magical potions\nand mastered the ancient art of alchemy!', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      fill: '#cccccc',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);
    
    const finalScore = this.add.text(0, 40, `Final Score: ${this.gameState?.score || 0}`, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      fill: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5);
    
    const restartButton = this.add.text(-80, 120, '🔄 Play Again', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      fill: '#ffffff',
      backgroundColor: '#4a90e2',
      padding: { x: 20, y: 10 },
      align: 'center'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        restartButton.setStyle({ backgroundColor: '#357abd' });
      })
      .on('pointerout', () => {
        restartButton.setStyle({ backgroundColor: '#4a90e2' });
      })
      .on('pointerdown', () => {
        this.restartGame();
      });

    const quitButton = this.add.text(80, 120, '🚪 Quit', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      fill: '#ffffff',
      backgroundColor: '#dc3545',
      padding: { x: 20, y: 10 },
      align: 'center'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        quitButton.setStyle({ backgroundColor: '#c82333' });
      })
      .on('pointerout', () => {
        quitButton.setStyle({ backgroundColor: '#dc3545' });
      })
      .on('pointerdown', () => {
        this.quitGame();
      });
    
    victoryContainer.add([
      victoryBg, 
      victoryTitle, 
      victorySubtitle, 
      achievementText, 
      finalScore, 
      restartButton,
      quitButton
    ]);
    
    victoryContainer.setScale(0).setAlpha(0);
    this.tweens.add({
      targets: victoryContainer,
      scale: 1,
      alpha: 1,
      duration: 1000,
      ease: 'Back.easeOut'
    });
    
    this.time.delayedCall(5000, () => {
      grandFinaleEmitter.destroy();
    });
    
    if (this.setGameState) {
      this.setGameState(prev => ({
        ...prev,
        gamePhase: 'completed'
      }));
    }
  }

  restartGame() {
    this.isGameComplete = false;
    this.completedRecipes.clear();
    this.initializeRecipeTracking();
    this.currentRecipe = null;
    this.ingredientSequence = [];
    this.isBrewingComplete = false;
    
    this.input.enabled = true;
    
    if (this.setGameState) {
      this.setGameState({
        currentLevel: 1,
        score: 0,
        currentRecipe: null,
        brewingSequence: [],
        gamePhase: 'playing'
      });
    }
    
    this.scene.restart();
  }

  setupParticleEffects() {
    this.particleEmitters = [];
  }

  setupAudio() {
    this.sounds = {
      ingredient_drop: this.sound.add('ingredient_drop', { volume: 0.3 }),
      brewing_sound: this.sound.add('brewing_sound', { volume: 0.2 }),
      success_sound: this.sound.add('success_sound', { volume: 0.4 }),
      fail_sound: this.sound.add('fail_sound', { volume: 0.3 }),
      victory_sound: this.sound.add('victory_sound', { volume: 0.5 })
    };
  }

  setupInputHandlers() {
    this.input.keyboard.on('keydown-R', () => {
      if (!this.isGameComplete) {
        this.resetCauldron();
      }
    });
    
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.ingredientSequence.length > 0 && !this.isBrewingComplete && !this.isGameComplete) {
        this.resetCauldron();
      }
    });
    
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.isGameComplete) {
        this.restartGame();
      } else {
        this.showQuitConfirmation();
      }
    });

    this.input.keyboard.on('keydown-P', () => {
      if (!this.isGameComplete) {
        this.togglePause();
      }
    });
  }

  update() {
    // Update any continuous animations or game logic here
  }

  destroy() {
    this.particleEmitters.forEach(emitter => {
      if (emitter && emitter.destroy) {
        emitter.destroy();
      }
    });
    this.particleEmitters = [];
    
    this.tweens.killAll();
    
    super.destroy();
  }
}
