export class AudioManager {
    constructor() {
      this.sounds = {};
      this.enabled = true;
    }
    
    loadSounds() {
      this.sounds = {
        drop: new Audio('/audio/ingredient_drop.mp3'),
        brew: new Audio('/audio/brewing.mp3'),
        success: new Audio('/audio/potion_complete.mp3'),
        fail: new Audio('/audio/potion_fail.mp3'),
        level_up: new Audio('/audio/level_up.mp3')
      };
      
      // Set volumes
      Object.values(this.sounds).forEach(sound => {
        sound.volume = 0.3;
      });
    }
    
    play(soundName) {
      if (this.enabled && this.sounds[soundName]) {
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch(e => console.log('Audio play failed:', e));
      }
    }
    
    toggle() {
      this.enabled = !this.enabled;
    }
  }
  
  export const audioManager = new AudioManager();
  