## 🤖 Assistant

Okay, here's the English version of your README.md. I've kept the structure and meaning of each section intact.

---

# 🎯 City Shooter Game

A first-person 3D shooter game developed with Three.js, featuring a full weapon system, enemy AI, particle effects, and a sound effect system.

![Game Screenshot](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=City+Shooter+Game)

## 🎮 Game Features

### 🔫 Weapon System
- **Three Weapon Types**: Pistol, Rifle, Sniper Rifle
- **Realistic Ballistics**: Different weapons have varying accuracy and damage.
- **Ammo Management**: Limited ammunition, requiring players to find ammo boxes.

### 👾 Enemy System
- **Custom Textures**: Uses "kenan" character models as enemies.
- **Two-Stage Combat**: Enemies become stronger when their health is low.
- **Intelligent AI**: Enemies will track the player's position.

### 🎯 Aiming System
- **Multiple Reticles**: Each weapon features a unique scope.
- **10x Scope**: Press 'E' to activate a high-power scope (In Development).
- **Distance Display**: Real-time display of distance to targets.

### 🌆 City Environment
- **3D City**: A complete urban environment.
- **Varied Terrain**: Features like hills and rocks.
- **Dynamic Lighting**: Realistic light and shadow effects.

## 🎮 Game Controls

| Key | Function |
|------|------|
| **WASD** | Move |
| **Spacebar** | Jump |
| **Mouse** | Aim/Look Around |
| **Left Click** | Shoot |
| **1, 2, 3** | Switch Weapons |
| **R** | Reload |
| **E** | Aim Scope |
| **ESC** | Menu |

## 🚀 Quick Start

### Environment Requirements
- Node.js (for local HTTP server)
- Modern Browser (WebGL compatible)

### Installation and Running
```bash
# 1. Clone or download the project
cd cherry/code

# 2. Install dependencies
npm install

# 3. Start local server
npx http-server . -p 8080

# 4. Access in browser
# http://localhost:8080
```

### Game Start
1. Choose a difficulty (Easy/Normal/Hard).
2. Click the screen to lock the mouse cursor.
3. Start shooting!

## 🎯 Game Objectives

- 🎯 **Shoot Targets**: Green circular targets for scoring.
- 👾 **Eliminate Enemies**: Red "kenan" characters for higher scores.
- 📦 **Collect Ammo**: Orange ammo boxes to replenish ammunition.
- 💪 **Survival Challenge**: Avoid enemy attacks and maintain health.

## 🛠️ Technical Architecture

### Core Technologies
- **Three.js** - 3D Graphics Rendering Engine
- **Web Audio API** - Sound Effect System
- **HTML5 Canvas** - Game Canvas
- **ES6 Modules** - Modular Development

### File Structure
```
├── index.html          # Main game page
├── game.js            # Core game logic
├── audio.js           # Sound management
├── effects.js         # Particle effects
├── debug.js           # Debugging tools
├── kenan.png          # Enemy texture 1
├── kenan2.png         # Enemy texture 2
└── package.json       # Project configuration
```

## 🎨 Game Effects

### Visual Effects
- ✨ **Muzzle Flash** - Fire effect when shooting.
- 💥 **Explosion Effects** - Enemy death explosions.
- 🎯 **Hit Feedback** - Particle effects on hitting targets.
- 💨 **Smoke Effects** - Environmental smoke.

### Sound Effects System
- 🔫 **Shooting Sounds** - Different sounds for different weapons.
- 💥 **Hit Sounds** - Feedback sounds for hits.
- 🔄 **Reload Sounds** - Sound for reloading.
- 🎵 **Background Music** - Looping background music.

## 🐛 Known Issues

### Current Bugs
- ❌ **Mouse View Control Malfunction** - Inability to rotate view.
- ❌ **Unstable Pointer Lock** - Issues with the mouse locking mechanism.
- ❌ **Scope Functionality Abnormal** - 'E' key scope not working correctly.

### Debugging Tools
- Press **F1** to view game status.
- Open browser console for error logs.
- Use `test.html` to test individual features.

## 🔮 Future Plans

### Short-Term Goals
- 🔧 Fix mouse control issues.
- 🎯 Improve the scope system.
- 🎨 Optimize enemy texture display.

### Long-Term Goals
- 🏆 Add an achievement system.
- 🗺️ Multiple level maps.
- 🔫 More weapon types.
- 👥 Multiplayer mode.

## 📄 License

This project is for learning and demonstration purposes only.

## 🤝 Contribution

Issues and Pull Requests are welcome to improve the game!

---

**Enjoy the game!** 🎮✨
