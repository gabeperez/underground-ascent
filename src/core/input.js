class InputManager {
  constructor() {
    this.keys = new Set();
    this.keysPressed = new Set();
    this.keysReleased = new Set();
    this.jumpBuffer = 0;
    this.jumpBufferTime = 0.1; // 100ms jump buffer
  }
  
  update(dt) {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
  }
  
  isDown(key) {
    return this.keys.has(key);
  }
  
  wasPressed(key) {
    return this.keysPressed.has(key);
  }
  
  wasReleased(key) {
    return this.keysReleased.has(key);
  }
  
  getAxis(negKey, posKey) {
    let axis = 0;
    if (this.isDown(negKey)) axis -= 1;
    if (this.isDown(posKey)) axis += 1;
    return axis;
  }
  
  // Platform-specific jump handling
  isJumpPressed() {
    return this.wasPressed('Space') || this.wasPressed('KeyZ') || this.jumpBuffer > 0;
  }
  
  bufferJump() {
    this.jumpBuffer = this.jumpBufferTime;
  }
  
  clearJumpBuffer() {
    this.jumpBuffer = 0;
  }
  
  onKeyDown(event) {
    const key = event.code;
    
    if (!this.keys.has(key)) {
      this.keysPressed.add(key);
      
      // Buffer jump inputs
      if (key === 'Space' || key === 'KeyZ') {
        this.bufferJump();
      }
    }
    
    this.keys.add(key);
    
    // Prevent scrolling with space
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }
  
  onKeyUp(event) {
    const key = event.code;
    this.keys.delete(key);
    this.keysReleased.add(key);
  }
}

let inputManager = null;

export function initInput(window) {
  inputManager = new InputManager();
  
  window.addEventListener('keydown', e => inputManager.onKeyDown(e));
  window.addEventListener('keyup', e => inputManager.onKeyUp(e));
  
  return inputManager;
}

export function getInput() {
  return inputManager;
}