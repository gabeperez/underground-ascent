import { loadAssets } from '../../core/assets.js';
import { getOrCreateSave } from '../world/persistence.js';
import { WorldGenerator } from '../world/generator.js';
import { MenuScene } from './menu.js';

export class BootScene {
  constructor({ canvas, ctx }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.loadingProgress = 0;
    this.loadingText = 'Initializing...';
    this.loadingComplete = false;
    this.fadeOut = 0;
    
    this.init();
  }
  
  async init() {
    const startTime = Date.now();
    
    try {
      // Load assets
      this.loadingText = 'Loading sprites...';
      this.loadingProgress = 0.2;
      await loadAssets();
      
      // Initialize save system
      this.loadingText = 'Loading save data...';
      this.loadingProgress = 0.4;
      const save = getOrCreateSave();
      console.log('Save data loaded:', save);
      
      // Generate or load world
      this.loadingText = 'Generating world...';
      this.loadingProgress = 0.6;
      const generator = new WorldGenerator(save.worldSeed);
      await generator.init();
      const world = generator.generate();
      
      this.loadingText = 'Preparing game...';
      this.loadingProgress = 0.8;
      
      // Store world and save data globally for other scenes
      window.gameData = {
        save: save,
        world: world,
        generator: generator
      };
      
      this.loadingProgress = 1.0;
      this.loadingText = 'Complete!';
      
      // Minimum loading time for visual feedback
      const elapsed = Date.now() - startTime;
      const minLoadTime = 1500;
      
      if (elapsed < minLoadTime) {
        setTimeout(() => {
          this.loadingComplete = true;
        }, minLoadTime - elapsed);
      } else {
        this.loadingComplete = true;
      }
      
    } catch (error) {
      console.error('Boot failed:', error);
      this.loadingText = 'Loading failed! Check console.';
    }
  }
  
  update(dt) {
    if (this.loadingComplete) {
      this.fadeOut += dt * 2;
      if (this.fadeOut >= 1) {
        // Switch to menu
        window.switchScene(new MenuScene({ 
          canvas: this.canvas, 
          ctx: this.ctx 
        }));
      }
    }
  }
  
  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw loading UI
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UNDERGROUND ASCENT', centerX, centerY - 40);
    
    // Loading text
    ctx.font = '12px monospace';
    ctx.fillText(this.loadingText, centerX, centerY - 10);
    
    // Progress bar
    const barWidth = 200;
    const barHeight = 8;
    const barX = centerX - barWidth / 2;
    const barY = centerY + 10;
    
    // Border
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Fill
    ctx.fillStyle = '#fff';
    ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * this.loadingProgress, barHeight - 2);
    
    // Attribution
    ctx.font = '8px monospace';
    ctx.fillText('Art by CraftPix.net', centerX, height - 20);
    
    // Fade out effect
    if (this.fadeOut > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  }
}