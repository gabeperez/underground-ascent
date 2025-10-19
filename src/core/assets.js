class AssetManager {
  constructor() {
    this.images = new Map();
    this.data = new Map();
    this.loadPromises = [];
  }
  
  loadImage(name, url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(name, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }
  
  loadJSON(name, url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load JSON: ${url}`);
        return response.json();
      })
      .then(data => {
        this.data.set(name, data);
        return data;
      });
  }
  
  getImage(name) {
    return this.images.get(name);
  }
  
  getData(name) {
    return this.data.get(name);
  }
  
  // Load all core game assets
  async loadAll() {
    const baseUrl = 'assets/craftpix/1bit-sci-fi';
    
    const loadPromises = [
      // Character sprites
      this.loadImage('player', `${baseUrl}/Main_Characters/Char_Boy.png`),
      
      // Tilesets
      this.loadImage('tileset', `${baseUrl}/Tileset/Tileset.png`),
      this.loadImage('background', `${baseUrl}/Tileset/Background_n_details.png`),
      this.loadImage('details', `${baseUrl}/Tileset/Tileset_details.png`),
      
      // Enemies
      this.loadImage('alien1', `${baseUrl}/Enemies/Alien1.png`),
      this.loadImage('alien2', `${baseUrl}/Enemies/Alien2.png`),
      this.loadImage('alien3', `${baseUrl}/Enemies/Alien3.png`),
      
      // Objects and items
      this.loadImage('items', `${baseUrl}/Objects/Items.png`),
      this.loadImage('boxes', `${baseUrl}/Objects/Boxes.png`),
      this.loadImage('door', `${baseUrl}/Objects/Door.png`),
      
      // Traps
      this.loadImage('trap1', `${baseUrl}/Traps/Trap1.png`),
      this.loadImage('trap2', `${baseUrl}/Traps/Trap2.png`),
      
      // GUI
      this.loadImage('gui', `${baseUrl}/GUI/GUI_Elements.png`),
      this.loadImage('icons', `${baseUrl}/GUI/Icons.png`),
    ];
    
    await Promise.all(loadPromises);
    console.log('All assets loaded successfully');
  }
}

const assetManager = new AssetManager();
export { assetManager as assets };

export async function loadAssets() {
  return assetManager.loadAll();
}