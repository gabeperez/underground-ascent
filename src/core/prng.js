// Fast, seeded PRNG using mulberry32 algorithm
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}

// Generate a random seed
export function generateSeed() {
  return Math.floor(Math.random() * 2147483647);
}

// Utility functions for common random operations
export function createRandom(seed) {
  const rnd = mulberry32(seed);
  
  return {
    // Get next random float [0, 1)
    next: rnd,
    
    // Random float in range [min, max)
    range: (min, max) => min + rnd() * (max - min),
    
    // Random integer in range [min, max] (inclusive)
    int: (min, max) => Math.floor(min + rnd() * (max - min + 1)),
    
    // Pick random element from array
    pick: (array) => array[Math.floor(rnd() * array.length)],
    
    // Random boolean with given probability
    bool: (probability = 0.5) => rnd() < probability,
    
    // Shuffle array in place
    shuffle: (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  };
}