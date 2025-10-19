import { getInput } from '../../core/input.js';
import { assets } from '../../core/assets.js';
import { createRandom } from '../../core/prng.js';
import { saveNow } from '../world/persistence.js';

export class RunScene {
  constructor({ canvas, ctx }) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Get global game data
    const { save, world } = window.gameData;
    this.save = save;
    this.world = world;
    
    // Player state
    this.player = {
      x: 160, // Center of screen initially
      y: 80,
      vx: 0,
      vy: 0,
      width: 16,
      height: 16,
      grounded: false,
      hearts: save.upgrades.maxHearts,
      shards: 0,
      invulnerable: 0,
      currentRoom: null
    };
    
    // Camera
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    };
    
    // Game state
    this.paused = false;
    this.currentTilemap = null;
    this.tileSize = 16;
    
    // Initialize player at random spawn point
    this.respawnPlayer();
    
    console.log('Game started at spawn point:', this.player.currentRoom);
  }
  
  respawnPlayer() {
    const rng = createRandom(this.save.worldSeed + this.save.deathCount);
    const spawnPoint = rng.pick(this.world.spawnPoints);
    
    this.player.x = spawnPoint.x * this.tileSize;
    this.player.y = spawnPoint.y * this.tileSize;
    this.player.currentRoom = spawnPoint.roomId;
    
    // Find and load current room
    this.loadRoom(spawnPoint.roomId);
  }
  
  loadRoom(roomId) {
    const room = this.world.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    // Convert room template to tilemap
    this.currentTilemap = this.convertRoomToTilemap(room);
    
    // Mark room as discovered
    this.save.discoveredRooms[roomId] = true;
    
    console.log('Loaded room:', roomId, room.template.id);
  }
  
  convertRoomToTilemap(room) {
    const template = room.template;
    const tilemap = {
      width: 20,
      height: 12,
      tiles: [],
      offsetX: room.x * this.tileSize,
      offsetY: room.y * this.tileSize
    };
    
    // Convert tile characters to tile IDs
    for (let y = 0; y < template.tiles.length; y++) {
      const row = template.tiles[y];
      tilemap.tiles[y] = [];
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        let tileId = 0; // Empty by default
        
        switch (char) {
          case '#': tileId = 1; break; // Solid wall
          case '^': tileId = 2; break; // Spikes
          case '~': tileId = 3; break; // Acid
          case '=': tileId = 4; break; // Platform
          case '[': tileId = 5; break; // Box/crate
          case ']': tileId = 6; break; // Box/crate
          default: tileId = 0; break; // Empty
        }
        
        tilemap.tiles[y][x] = tileId;
      }
    }
    
    return tilemap;
  }
  
  update(dt) {
    const input = getInput();
    input.update(dt);
    
    if (input.wasPressed('Escape')) {
      this.paused = !this.paused;
    }
    
    if (this.paused) return;
    
    // Update player
    this.updatePlayer(dt, input);
    
    // Update camera
    this.updateCamera(dt);
    
    // Update invulnerability
    if (this.player.invulnerable > 0) {
      this.player.invulnerable -= dt;
    }
  }
  
  updatePlayer(dt, input) {
    const moveSpeed = 100; // pixels per second
    const gravity = 400;
    const jumpVel = -200;
    
    // Horizontal movement
    const moveAxis = input.getAxis('KeyA', 'KeyD') || input.getAxis('ArrowLeft', 'ArrowRight');
    this.player.vx = moveAxis * moveSpeed;
    
    // Jumping
    if (input.isJumpPressed() && this.player.grounded) {
      this.player.vy = jumpVel;
      this.player.grounded = false;
      input.clearJumpBuffer();
    }
    
    // Gravity
    this.player.vy += gravity * dt;
    
    // Movement and collision
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;
    
    // Simple ground collision (just keep player above ground)
    const groundY = 11 * this.tileSize; // Bottom of room minus player height
    if (this.player.y >= groundY) {
      this.player.y = groundY;
      this.player.vy = 0;
      this.player.grounded = true;
    } else {
      this.player.grounded = false;
    }
    
    // Keep player in bounds horizontally
    this.player.x = Math.max(this.tileSize, Math.min(this.player.x, 19 * this.tileSize - this.player.width));
  }
  
  updateCamera(dt) {
    // Follow player
    this.camera.targetX = this.player.x - this.canvas.width / 2;
    this.camera.targetY = this.player.y - this.canvas.height / 2;
    
    // Smooth camera movement
    const lerpSpeed = 5;
    this.camera.x += (this.camera.targetX - this.camera.x) * lerpSpeed * dt;
    this.camera.y += (this.camera.targetY - this.camera.y) * lerpSpeed * dt;
    
    // Round to prevent subpixel rendering
    this.camera.x = Math.round(this.camera.x);
    this.camera.y = Math.round(this.camera.y);
  }
  
  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear screen
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, width, height);
    
    // Save context for camera transform
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    
    // Draw current room
    this.drawTilemap();
    
    // Draw player
    this.drawPlayer();
    
    // Restore context
    ctx.restore();
    
    // Draw UI
    this.drawUI();
    
    // Draw pause overlay
    if (this.paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width / 2, height / 2);
      ctx.font = '10px monospace';
      ctx.fillText('Press ESC to continue', width / 2, height / 2 + 20);
    }
  }
  
  drawTilemap() {
    if (!this.currentTilemap) return;
    
    const tilemap = this.currentTilemap;
    const tilesetImg = assets.getImage('tileset');
    
    if (!tilesetImg) return;
    
    // Draw tiles
    for (let y = 0; y < tilemap.height; y++) {
      for (let x = 0; x < tilemap.width; x++) {
        const tileId = tilemap.tiles[y][x];
        if (tileId === 0) continue; // Skip empty tiles
        
        const drawX = x * this.tileSize;
        const drawY = y * this.tileSize;
        
        // Simple tile mapping - use first few tiles from tileset
        const srcX = (tileId - 1) * 16;
        const srcY = 0;
        
        this.ctx.drawImage(
          tilesetImg,
          srcX, srcY, 16, 16,
          drawX, drawY, this.tileSize, this.tileSize
        );
      }
    }
  }
  
  drawPlayer() {
    const playerImg = assets.getImage('player');
    if (!playerImg) {
      // Draw simple rectangle as fallback
      this.ctx.fillStyle = this.player.invulnerable > 0 ? '#f88' : '#8f8';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      return;
    }
    
    // Draw player sprite (using first frame for now)
    const opacity = this.player.invulnerable > 0 ? 0.5 : 1.0;
    this.ctx.globalAlpha = opacity;
    
    this.ctx.drawImage(
      playerImg,
      0, 0, 16, 16, // Source
      this.player.x, this.player.y, this.player.width, this.player.height // Destination
    );
    
    this.ctx.globalAlpha = 1.0;
  }
  
  drawUI() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    
    // Hearts
    ctx.fillStyle = '#f44';
    for (let i = 0; i < this.player.hearts; i++) {
      ctx.fillRect(10 + i * 20, 10, 16, 16);
    }
    
    // Shards
    ctx.fillStyle = '#4af';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Shards: ${this.player.shards}`, 10, height - 20);
    
    // Current room info
    ctx.fillStyle = '#888';
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Room: ${this.player.currentRoom}`, width - 10, height - 20);
  }
}
