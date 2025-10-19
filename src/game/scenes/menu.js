import { getInput } from '../../core/input.js';
import { RunScene } from './run.js';

export class MenuScene {
  constructor({ canvas, ctx }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.selectedOption = 0;
    this.options = ['Start New Life', 'View Map', 'Reset Save'];
    this.fade = 1;
    this.fadeDirection = -1;
  }
  
  update(dt) {
    const input = getInput();
    input.update(dt);
    
    // Fade in
    this.fade += this.fadeDirection * dt * 2;
    this.fade = Math.max(0, Math.min(1, this.fade));
    
    // Navigation
    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW')) {
      this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
    }
    
    if (input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      this.selectedOption = (this.selectedOption + 1) % this.options.length;
    }
    
    // Selection
    if (input.wasPressed('Space') || input.wasPressed('Enter')) {
      this.handleSelection();
    }
  }
  
  handleSelection() {
    const { save, world } = window.gameData;
    
    switch (this.selectedOption) {
      case 0: // Start New Life
        this.startGame();
        break;
        
      case 1: // View Map
        console.log('Discovered rooms:', Object.keys(save.discoveredRooms));
        break;
        
      case 2: // Reset Save
        if (confirm('Reset all progress? This cannot be undone.')) {
          localStorage.removeItem('ua.save.v1');
          location.reload();
        }
        break;
    }
  }
  
  startGame() {
    // Switch to game scene
    window.switchScene(new RunScene({ 
      canvas: this.canvas, 
      ctx: this.ctx 
    }));
  }
  
  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    let y = 50;
    
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UNDERGROUND ASCENT', centerX, y);
    
    y += 30;
    ctx.font = '10px monospace';
    ctx.fillText('Escape to the Surface', centerX, y);
    
    // Show save info
    const { save } = window.gameData;
    y += 25;
    ctx.font = '8px monospace';
    ctx.fillText(`Seed: ${save.worldSeed}`, centerX, y);
    y += 12;
    ctx.fillText(`Deaths: ${save.deathCount} | Rooms Found: ${Object.keys(save.discoveredRooms).length}`, centerX, y);
    
    // Menu options
    y = height / 2;
    ctx.font = '12px monospace';
    
    this.options.forEach((option, index) => {
      if (index === this.selectedOption) {
        ctx.fillStyle = '#fff';
        ctx.fillText('> ' + option + ' <', centerX, y);
      } else {
        ctx.fillStyle = '#888';
        ctx.fillText(option, centerX, y);
      }
      y += 20;
    });
    
    // Controls
    y = height - 40;
    ctx.font = '8px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('WASD/Arrows: Move | Space/Enter: Select | Z: Jump | X: Interact', centerX, y);
    
    // Fade effect
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fade})`;
      ctx.fillRect(0, 0, width, height);
    }
  }
}
