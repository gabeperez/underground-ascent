const SAVE_KEY = 'ua.save.v1';

// Default save structure
function createDefaultSave(worldSeed) {
  return {
    version: 1,
    worldSeed: worldSeed,
    discoveredRooms: {},
    upgrades: {
      maxHearts: 3,
      doubleJump: false,
      mapRadius: 0,
      damageReduction: 0
    },
    bankedShards: 0,
    deathCount: 0,
    stats: {
      timesSurfaceReached: 0,
      totalShardsCollected: 0,
      enemiesDefeated: 0
    }
  };
}

export function loadSave() {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return null;
    
    const parsed = JSON.parse(saveData);
    
    // Validate save structure and migrate if needed
    if (parsed.version !== 1) {
      console.log('Save version mismatch, creating new save');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load save:', error);
    return null;
  }
}

export function saveNow(saveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game:', error);
    // Handle storage quota errors gracefully
    if (error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Consider clearing browser data.');
    }
  }
}

export function resetSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to reset save:', error);
  }
}

export function getOrCreateSave(worldSeed = null) {
  let save = loadSave();
  
  if (!save) {
    if (!worldSeed) {
      worldSeed = Math.floor(Math.random() * 2147483647);
    }
    save = createDefaultSave(worldSeed);
    saveNow(save);
  }
  
  return save;
}