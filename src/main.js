import { createLoop } from './core/loop.js';
import { initInput } from './core/input.js';
import { BootScene } from './game/scenes/boot.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Scale canvas to fit window while maintaining aspect ratio
function scaleCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scaleX = window.innerWidth / 320;
  const scaleY = window.innerHeight / 180;
  const scale = Math.floor(Math.min(scaleX, scaleY));
  
  canvas.style.width = (320 * scale) + 'px';
  canvas.style.height = (180 * scale) + 'px';
}

window.addEventListener('resize', scaleCanvas);
scaleCanvas();

let currentScene = new BootScene({ canvas, ctx });
initInput(window);

// Global scene switching
window.switchScene = (newScene) => {
  if (currentScene.cleanup) currentScene.cleanup();
  currentScene = newScene;
};

createLoop(
  dt => currentScene.update(dt),
  alpha => currentScene.render(alpha)
);

console.log('Underground Ascent - Started');