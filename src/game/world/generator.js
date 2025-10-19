import { createRandom } from '../../core/prng.js';
import { assets } from '../../core/assets.js';

export class WorldGenerator {
  constructor(seed) {
    this.seed = seed;
    this.rng = createRandom(seed);
    this.templates = null;
    this.rooms = new Map();
    this.connections = [];
    this.spawnPoints = [];
    this.depthBands = 8;
    this.roomsPerBand = 8;
  }

  async init() {
    // Load room templates
    await assets.loadJSON('rooms', '../src/game/world/templates/rooms.json');
    this.templates = assets.getData('rooms');
  }

  generate() {
    console.log('Generating world with seed:', this.seed);
    
    this.rooms.clear();
    this.connections = [];
    this.spawnPoints = [];
    
    // Generate room graph
    this.generateRoomGraph();
    
    // Assign templates to rooms
    this.assignRoomTemplates();
    
    // Validate connectivity
    this.validateConnectivity();
    
    // Collect spawn points
    this.collectSpawnPoints();
    
    return {
      seed: this.seed,
      rooms: Array.from(this.rooms.values()),
      connections: this.connections,
      spawnPoints: this.spawnPoints,
      surfaceY: 0,
      depthBands: this.depthBands,
      roomsPerBand: this.roomsPerBand
    };
  }

  generateRoomGraph() {
    // Generate rooms in vertical bands (depths)
    for (let depth = 0; depth < this.depthBands; depth++) {
      for (let roomIndex = 0; roomIndex < this.roomsPerBand; roomIndex++) {
        const roomId = `d${depth}r${roomIndex}`;
        const room = {
          id: roomId,
          depth: depth,
          index: roomIndex,
          x: roomIndex * 20, // Room width in tiles
          y: depth * 12,     // Room height in tiles
          connections: new Set(),
          doors: [],
          template: null,
          isSpawnable: false
        };
        
        this.rooms.set(roomId, room);
      }
    }
    
    // Connect rooms horizontally within each band
    for (let depth = 0; depth < this.depthBands; depth++) {
      for (let roomIndex = 0; roomIndex < this.roomsPerBand - 1; roomIndex++) {
        if (this.rng.bool(0.7)) { // 70% chance of horizontal connection
          const room1Id = `d${depth}r${roomIndex}`;
          const room2Id = `d${depth}r${roomIndex + 1}`;
          this.connectRooms(room1Id, room2Id, 'E', 'W');
        }
      }
    }
    
    // Connect rooms vertically between bands
    for (let depth = 0; depth < this.depthBands - 1; depth++) {
      for (let roomIndex = 0; roomIndex < this.roomsPerBand; roomIndex++) {
        if (this.rng.bool(0.6)) { // 60% chance of vertical connection
          const upperRoomId = `d${depth}r${roomIndex}`;
          const lowerRoomId = `d${depth + 1}r${roomIndex}`;
          this.connectRooms(upperRoomId, lowerRoomId, 'S', 'N');
        }
      }
    }
    
    // Ensure at least one path to surface
    this.ensurePathToSurface();
  }

  connectRooms(roomId1, roomId2, door1, door2) {
    const room1 = this.rooms.get(roomId1);
    const room2 = this.rooms.get(roomId2);
    
    if (!room1 || !room2) return;
    
    room1.connections.add(roomId2);
    room2.connections.add(roomId1);
    
    if (!room1.doors.includes(door1)) room1.doors.push(door1);
    if (!room2.doors.includes(door2)) room2.doors.push(door2);
    
    this.connections.push({
      from: roomId1,
      to: roomId2,
      door1: door1,
      door2: door2
    });
  }

  ensurePathToSurface() {
    // Use BFS to ensure connectivity from bottom to top
    const bottomRooms = [];
    const topRooms = [];
    
    for (let roomIndex = 0; roomIndex < this.roomsPerBand; roomIndex++) {
      topRooms.push(`d0r${roomIndex}`);
      bottomRooms.push(`d${this.depthBands - 1}r${roomIndex}`);
    }
    
    // Check if any bottom room can reach any top room
    for (const bottomRoom of bottomRooms) {
      if (this.canReachAny(bottomRoom, topRooms)) {
        return; // Path already exists
      }
    }
    
    // Force a connection path if none exists
    this.forceConnectionPath();
  }

  canReachAny(startRoom, targetRooms) {
    const visited = new Set();
    const queue = [startRoom];
    
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      
      if (targetRooms.includes(current)) {
        return true;
      }
      
      const room = this.rooms.get(current);
      for (const connected of room.connections) {
        if (!visited.has(connected)) {
          queue.push(connected);
        }
      }
    }
    
    return false;
  }

  forceConnectionPath() {
    // Create a simple vertical spine through the center
    const centerIndex = Math.floor(this.roomsPerBand / 2);
    
    for (let depth = 0; depth < this.depthBands - 1; depth++) {
      const upperRoomId = `d${depth}r${centerIndex}`;
      const lowerRoomId = `d${depth + 1}r${centerIndex}`;
      this.connectRooms(upperRoomId, lowerRoomId, 'S', 'N');
    }
  }

  assignRoomTemplates() {
    const templates = this.templates.templates;
    
    for (const room of this.rooms.values()) {
      const doorConfig = room.doors.sort().join('');
      
      // Find compatible templates
      const compatible = templates.filter(template => {
        const templateDoors = template.doors.sort().join('');
        return templateDoors === doorConfig;
      });
      
      if (compatible.length > 0) {
        // Weighted random selection
        const totalWeight = compatible.reduce((sum, t) => sum + (t.weight || 1), 0);
        let randomWeight = this.rng.range(0, totalWeight);
        
        for (const template of compatible) {
          randomWeight -= (template.weight || 1);
          if (randomWeight <= 0) {
            room.template = template;
            break;
          }
        }
      }
      
      if (!room.template) {
        // Fallback to a simple empty room
        room.template = this.createEmptyRoomTemplate(room.doors);
      }
    }
  }

  createEmptyRoomTemplate(doors) {
    const tiles = [];
    for (let y = 0; y < 12; y++) {
      let row = '';
      for (let x = 0; x < 20; x++) {
        if (y === 0 || y === 11 || x === 0 || x === 19) {
          // Check for door openings
          let isDoor = false;
          if (doors.includes('N') && y === 0 && x >= 9 && x <= 10) isDoor = true;
          if (doors.includes('S') && y === 11 && x >= 9 && x <= 10) isDoor = true;
          if (doors.includes('W') && x === 0 && y >= 5 && y <= 6) isDoor = true;
          if (doors.includes('E') && x === 19 && y >= 5 && y <= 6) isDoor = true;
          
          row += isDoor ? '.' : '#';
        } else {
          row += '.';
        }
      }
      tiles.push(row);
    }
    
    return {
      id: 'empty',
      doors: doors,
      tiles: tiles,
      entities: {
        enemies: [],
        pickups: [],
        spawns: [{ x: 10, y: 6 }]
      }
    };
  }

  validateConnectivity() {
    // Ensure all rooms are reachable
    const startRoom = this.rooms.values().next().value;
    const reachable = new Set();
    const queue = [startRoom.id];
    
    while (queue.length > 0) {
      const current = queue.shift();
      if (reachable.has(current)) continue;
      reachable.add(current);
      
      const room = this.rooms.get(current);
      for (const connected of room.connections) {
        if (!reachable.has(connected)) {
          queue.push(connected);
        }
      }
    }
    
    console.log(`Generated ${this.rooms.size} rooms, ${reachable.size} reachable`);
  }

  collectSpawnPoints() {
    for (const room of this.rooms.values()) {
      if (room.template && room.template.entities && room.template.entities.spawns) {
        for (const spawn of room.template.entities.spawns) {
          this.spawnPoints.push({
            roomId: room.id,
            x: room.x + spawn.x,
            y: room.y + spawn.y,
            depth: room.depth,
            isSafe: room.template.entities.enemies.length === 0
          });
        }
      }
    }
    
    console.log(`Collected ${this.spawnPoints.length} spawn points`);
  }
}