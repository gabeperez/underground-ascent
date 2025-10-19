# Underground Ascent

A permadeath platformer where you play as a character trying to reach the surface after being born and raised underground. Each death spawns you at a random location, but you keep your discovered map and upgrades.

## Game Features

- **Procedural Underground World**: Each save file generates a unique interconnected world of rooms across multiple depth layers
- **Permadeath with Persistent Progression**: Death respawns you randomly, but discovered areas and upgrades carry over
- **Exploration Mapping**: Build a mental (and visual) map of the underground network as you explore
- **Upgrade System**: Bank shards to purchase permanent upgrades that persist across deaths
- **Vertical Progression**: Deeper areas are more dangerous but offer better rewards

## Controls

- **WASD** or **Arrow Keys**: Move left/right, navigate menus
- **Z** or **Space**: Jump
- **X**: Interact with objects
- **Escape**: Pause game / Return to menu

## Art Assets

This game uses the "Free Sci-Fi Platformer 1-Bit Pixel Art Game Kit" by CraftPix.net.
All art assets remain under their original license terms.

## Play Online

🎮 **Live Demo**: https://USERNAME.github.io/underground-ascent (after GitHub setup)

## Local Development

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/USERNAME/underground-ascent.git
   cd underground-ascent
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```
   
   Or manually:
   ```bash
   cd public
   python3 -m http.server 8000
   ```

3. **Open in browser**: http://localhost:8000

### Alternative Servers

- **Node.js**: `npm run serve` (requires: `npm install`)
- **Python**: `cd public && python3 -m http.server 8000`
- **Any static server**: Serve the `public` directory

## Game Architecture

- **ESM Modules**: Pure ES6 modules, no bundler required
- **Fixed Timestep**: 60 FPS simulation with variable rendering
- **Component System**: Simple entity-component organization
- **Seeded Generation**: Deterministic world generation for consistent experience
- **Local Storage**: Save system for persistent progression

## File Structure

```
src/
├── main.js              # Entry point and canvas setup
├── core/                # Engine systems
│   ├── loop.js         # Game loop with fixed timestep
│   ├── input.js        # Keyboard input with platformer helpers
│   ├── assets.js       # Asset loading and management
│   └── prng.js         # Seeded random number generation
└── game/               # Game-specific code
    ├── scenes/         # Scene management
    ├── world/          # Procedural world generation
    ├── entities/       # Game objects
    └── systems/        # Game logic systems
```

## License

Code: MIT License
Art Assets: CraftPix.net Free License (see included license files)