// Global variables
let currentScene = 1;
let isPlaying = true;
let scenes = {};
let timeline;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen after 3 seconds
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            startPresentation();
        }, 1000);
    }, 3000);

    // Initialize all scenes
    initializeScenes();
    
    // Setup navigation
    setupNavigation();
    
    // Setup custom cursor
    setupCustomCursor();
    
    // Create particle effects
    createParticleEffects();
    
    // Setup audio
    setupAudio();
}

function initializeScenes() {
    scenes.scene1 = new RealityTransitionScene();
    scenes.scene2 = new HeadsetShowcaseScene();
    scenes.scene3 = new MixedRealityScene();
    scenes.scene4 = new InteractiveBuildingScene();
    scenes.scene5 = new FinalScene();
}

// Scene 1: Reality Transition
class RealityTransitionScene {
    constructor() {
        this.canvas = document.getElementById('reality-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        this.setupScene();
        this.animate();
    }
    
    setupScene() {
        // Create a grid representing reality
        const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
        this.scene.add(gridHelper);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Create floating cubes that will transform
        this.cubes = [];
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshLambertMaterial({ 
                color: Math.random() * 0xffffff,
                transparent: true,
                opacity: 0.7
            });
            const cube = new THREE.Mesh(geometry, material);
            
            cube.position.set(
                (Math.random() - 0.5) * 30,
                Math.random() * 10,
                (Math.random() - 0.5) * 30
            );
            
            cube.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.cubes.push(cube);
            this.scene.add(cube);
        }
        
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate cubes
        this.cubes.forEach((cube, index) => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
        });
        
        // Camera movement
        this.camera.position.x = Math.sin(Date.now() * 0.0005) * 5;
        this.camera.position.z = 15 + Math.cos(Date.now() * 0.0005) * 3;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    enter() {
        gsap.fromTo(this.cubes, {
            scale: 0,
            opacity: 0
        }, {
            scale: 1,
            opacity: 0.7,
            duration: 2,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    }
}

// Scene 2: Headset Showcase
class HeadsetShowcaseScene {
    constructor() {
        this.canvas = document.getElementById('headset-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        this.setupScene();
        this.animate();
    }
    
    setupScene() {
        // Create VR headset model (simplified)
        const headsetGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(4, 2, 3);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        headsetGroup.add(body);
        
        // Lenses
        const lensGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
        const lensMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e });
        
        const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
        leftLens.position.set(-0.8, 0, 1.6);
        leftLens.rotation.x = Math.PI / 2;
        headsetGroup.add(leftLens);
        
        const rightLens = new THREE.Mesh(lensGeometry, lensMaterial);
        rightLens.position.set(0.8, 0, 1.6);
        rightLens.rotation.x = Math.PI / 2;
        headsetGroup.add(rightLens);
        
        // Strap
        const strapGeometry = new THREE.TorusGeometry(3, 0.2, 8, 16, Math.PI);
        const strapMaterial = new THREE.MeshLambertMaterial({ color: 0x1abc9c });
        const strap = new THREE.Mesh(strapGeometry, strapMaterial);
        strap.position.set(0, 0, -1);
        strap.rotation.y = Math.PI;
        headsetGroup.add(strap);
        
        this.headset = headsetGroup;
        this.scene.add(headsetGroup);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const spotLight = new THREE.SpotLight(0x00ffff, 1);
        spotLight.position.set(10, 10, 10);
        spotLight.target = headsetGroup;
        this.scene.add(spotLight);
        
        // Holographic effects
        this.createHolographicEffects();
        
        this.camera.position.set(0, 0, 10);
    }
    
    createHolographicEffects() {
        // Create floating UI elements
        this.uiElements = [];
        
        for (let i = 0; i < 8; i++) {
            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3
            });
            const ui = new THREE.Mesh(geometry, material);
            
            const angle = (i / 8) * Math.PI * 2;
            ui.position.set(
                Math.cos(angle) * 8,
                Math.sin(angle * 2) * 2,
                Math.sin(angle) * 8
            );
            
            ui.lookAt(this.camera.position);
            this.uiElements.push(ui);
            this.scene.add(ui);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate headset
        this.headset.rotation.y += 0.005;
        this.headset.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        
        // Animate UI elements
        this.uiElements.forEach((ui, index) => {
            const angle = (index / 8) * Math.PI * 2 + Date.now() * 0.001;
            ui.position.x = Math.cos(angle) * 8;
            ui.position.z = Math.sin(angle) * 8;
            ui.position.y = Math.sin(angle * 2 + Date.now() * 0.002) * 2;
            ui.lookAt(this.camera.position);
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    enter() {
        gsap.fromTo(this.headset.scale, {
            x: 0, y: 0, z: 0
        }, {
            x: 1, y: 1, z: 1,
            duration: 1.5,
            ease: "back.out(1.7)"
        });
        
        gsap.fromTo(this.uiElements, {
            scale: 0
        }, {
            scale: 1,
            duration: 1,
            stagger: 0.1,
            delay: 0.5
        });
    }
}

// Scene 3: Mixed Reality
class MixedRealityScene {
    constructor() {
        this.canvas = document.getElementById('mixed-reality-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        this.setupScene();
        this.animate();
    }
    
    setupScene() {
        // Create room environment
        this.createRoom();
        
        // Create Minecraft blocks appearing in the room
        this.createMinecraftBlocks();
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
        
        this.camera.position.set(0, 5, 15);
    }
    
    createRoom() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            transparent: true,
            opacity: 0.3
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);
        
        // Walls (wireframe)
        const wallGeometry = new THREE.PlaneGeometry(20, 10);
        const wallMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x666666,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.set(0, 5, -10);
        this.scene.add(backWall);
        
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-10, 5, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);
    }
    
    createMinecraftBlocks() {
        this.blocks = [];
        
        // Different block types
        const blockTypes = [
            { color: 0x4CAF50, name: 'grass' },
            { color: 0x8B4513, name: 'dirt' },
            { color: 0x808080, name: 'stone' },
            { color: 0xFFD700, name: 'gold' },
            { color: 0x0000FF, name: 'water' }
        ];
        
        for (let i = 0; i < 15; i++) {
            const blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshLambertMaterial({ 
                color: blockType.color,
                transparent: true,
                opacity: 0.8
            });
            const block = new THREE.Mesh(geometry, material);
            
            block.position.set(
                (Math.random() - 0.5) * 15,
                Math.random() * 8 + 1,
                (Math.random() - 0.5) * 15
            );
            
            block.userData = { 
                originalY: block.position.y,
                floatSpeed: Math.random() * 0.02 + 0.01
            };
            
            this.blocks.push(block);
            this.scene.add(block);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Animate blocks
        this.blocks.forEach((block, index) => {
            block.rotation.x += 0.01;
            block.rotation.y += 0.01;
            block.position.y = block.userData.originalY + 
                Math.sin(Date.now() * block.userData.floatSpeed + index) * 0.5;
        });
        
        // Camera movement
        this.camera.position.x = Math.sin(Date.now() * 0.0003) * 3;
        this.camera.lookAt(0, 3, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    enter() {
        gsap.fromTo(this.blocks, {
            scale: 0,
            y: -5
        }, {
            scale: 1,
            y: (index, target) => target.userData.originalY,
            duration: 1.5,
            stagger: 0.1,
            ease: "bounce.out"
        });
    }
}

// Scene 4: Interactive Building
class InteractiveBuildingScene {
    constructor() {
        this.canvas = document.getElementById('building-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        this.setupScene();
        this.animate();
    }
    
    setupScene() {
        // Create building animation
        this.createBuildingAnimation();
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);
    }
    
    createBuildingAnimation() {
        this.structure = [];
        this.buildingBlocks = [];
        
        // Create a simple house structure
        const houseBlocks = [
            // Foundation
            ...this.createLayer(0, 5, 5),
            // Walls
            ...this.createWalls(1, 5, 5, 3),
            // Roof
            ...this.createRoof(4, 5, 5)
        ];
        
        houseBlocks.forEach((blockData, index) => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshLambertMaterial({ 
                color: blockData.color,
                transparent: true,
                opacity: 0
            });
            const block = new THREE.Mesh(geometry, material);
            
            block.position.set(blockData.x, blockData.y, blockData.z);
            block.userData = { buildDelay: index * 0.1 };
            
            this.buildingBlocks.push(block);
            this.scene.add(block);
        });
        
        // Create hand/gesture indicator
        this.createGestureIndicator();
    }
    
    createLayer(y, width, depth) {
        const blocks = [];
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                blocks.push({
                    x: x - width/2,
                    y: y,
                    z: z - depth/2,
                    color: 0x8B4513 // Brown for foundation
                });
            }
        }
        return blocks;
    }
    
    createWalls(startY, width, depth, height) {
        const blocks = [];
        for (let y = startY; y < startY + height; y++) {
            for (let x = 0; x < width; x++) {
                for (let z = 0; z < depth; z++) {
                    // Only create blocks on the perimeter
                    if (x === 0 || x === width-1 || z === 0 || z === depth-1) {
                        // Skip some blocks for windows/doors
                        if (!(y === startY + 1 && x === Math.floor(width/2) && z === 0)) {
                            blocks.push({
                                x: x - width/2,
                                y: y,
                                z: z - depth/2,
                                color: 0x4CAF50 // Green for walls
                            });
                        }
                    }
                }
            }
        }
        return blocks;
    }
    
    createRoof(startY, width, depth) {
        const blocks = [];
        const roofHeight = 2;
        
        for (let y = 0; y < roofHeight; y++) {
            const currentWidth = width - y * 2;
            const currentDepth = depth - y * 2;
            
            if (currentWidth > 0 && currentDepth > 0) {
                for (let x = 0; x < currentWidth; x++) {
                    for (let z = 0; z < currentDepth; z++) {
                        blocks.push({
                            x: x - currentWidth/2,
                            y: startY + y,
                            z: z - currentDepth/2,
                            color: 0xFF0000 // Red for roof
                        });
                    }
                }
            }
        }
        return blocks;
    }
    
    createGestureIndicator() {
        // Create a simple hand model
        const handGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const handMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFDBB5,
            transparent: true,
            opacity: 0.8
        });
        this.hand = new THREE.Mesh(handGeometry, handMaterial);
        this.hand.position.set(3, 6, 3);
        this.scene.add(this.hand);
        
        // Create gesture trail
        this.gestureTrail = [];
        for (let i = 0; i < 10; i++) {
            const trailGeometry = new THREE.SphereGeometry(0.1, 4, 4);
            const trailMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.5 - i * 0.05
            });
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            this.gestureTrail.push(trail);
            this.scene.add(trail);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Animate hand gesture
        const time = Date.now() * 0.002;
        this.hand.position.x = 3 + Math.sin(time) * 2;
        this.hand.position.y = 6 + Math.cos(time * 1.5) * 1;
        this.hand.position.z = 3 + Math.sin(time * 0.8) * 2;
        
        // Update gesture trail
        this.gestureTrail.forEach((trail, index) => {
            if (index === 0) {
                trail.position.copy(this.hand.position);
            } else {
                trail.position.lerp(this.gestureTrail[index - 1].position, 0.3);
            }
        });
        
        // Camera orbit
        this.camera.position.x = Math.cos(time * 0.3) * 15;
        this.camera.position.z = Math.sin(time * 0.3) * 15;
        this.camera.lookAt(0, 2, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    enter() {
        // Animate building blocks appearing
        this.buildingBlocks.forEach((block, index) => {
            gsap.to(block.material, {
                opacity: 0.8,
                duration: 0.5,
                delay: block.userData.buildDelay,
                ease: "power2.out"
            });
            
            gsap.fromTo(block.scale, {
                x: 0, y: 0, z: 0
            }, {
                x: 1, y: 1, z: 1,
                duration: 0.5,
                delay: block.userData.buildDelay,
                ease: "back.out(1.7)"
            });
        });
        
        // Animate hand appearing
        gsap.fromTo(this.hand.scale, {
            x: 0, y: 0, z: 0
        }, {
            x: 1, y: 1, z: 1,
            duration: 1,
            delay: 1,
            ease: "back.out(1.7)"
        });
    }
}

// Scene 5: Final Scene
class FinalScene {
    constructor() {
        this.canvas = document.getElementById('final-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        this.setupScene();
        this.animate();
    }
    
    setupScene() {
        // Create epic background with floating elements
        this.createBackground();
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const spotLight = new THREE.SpotLight(0x4CAF50, 2);
        spotLight.position.set(0, 20, 10);
        spotLight.target.position.set(0, 0, 0);
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
        
        this.camera.position.set(0, 0, 20);
    }
    
    createBackground() {
        this.backgroundElements = [];
        
        // Create floating Minecraft blocks
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.BoxGeometry(
                Math.random() * 2 + 0.5,
                Math.random() * 2 + 0.5,
                Math.random() * 2 + 0.5
            );
            const material = new THREE.MeshLambertMaterial({ 
                color: Math.random() * 0xffffff,
                transparent: true,
                opacity: 0.6
            });
            const block = new THREE.Mesh(geometry, material);
            
            block.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30
            );
            
            block.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                },
                floatSpeed: Math.random() * 0.01 + 0.005
            };
            
            this.backgroundElements.push(block);
            this.scene.add(block);
        }
        
        // Create energy rings
        this.energyRings = [];
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.TorusGeometry(5 + i * 3, 0.2, 8, 16);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.position.z = -10;
            ring.userData = { rotationSpeed: 0.01 + i * 0.002 };
            
            this.energyRings.push(ring);
            this.scene.add(ring);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Animate background elements
        this.backgroundElements.forEach((element, index) => {
            element.rotation.x += element.userData.rotationSpeed.x;
            element.rotation.y += element.userData.rotationSpeed.y;
            element.rotation.z += element.userData.rotationSpeed.z;
            
            element.position.y += Math.sin(Date.now() * element.userData.floatSpeed + index) * 0.02;
        });
        
        // Animate energy rings
        this.energyRings.forEach(ring => {
            ring.rotation.z += ring.userData.rotationSpeed;
        });
        
        // Camera subtle movement
        this.camera.position.x = Math.sin(Date.now() * 0.0002) * 2;
        this.camera.position.y = Math.cos(Date.now() * 0.0003) * 1;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    enter() {
        // Epic entrance animation
        gsap.fromTo(this.backgroundElements, {
            scale: 0,
            opacity: 0
        }, {
            scale: 1,
            opacity: 0.6,
            duration: 2,
            stagger: 0.05,
            ease: "back.out(1.7)"
        });
        
        gsap.fromTo(this.energyRings, {
            scale: 0,
            opacity: 0
        }, {
            scale: 1,
            opacity: 0.3,
            duration: 1.5,
            stagger: 0.2,
            delay: 0.5,
            ease: "power2.out"
        });
    }
}

// Navigation and Timeline
function setupNavigation() {
    const dots = document.querySelectorAll('.dot');
    const playPauseBtn = document.getElementById('play-pause');
    const restartBtn = document.getElementById('restart');
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToScene(index + 1);
        });
    });
    
    playPauseBtn.addEventListener('click', togglePlayPause);
    restartBtn.addEventListener('click', restartPresentation);
    
    // Auto-advance timeline
    createTimeline();
}

function createTimeline() {
    timeline = gsap.timeline({ repeat: -1, paused: false });
    
    timeline
        .call(() => goToScene(1))
        .to({}, { duration: 5 })
        .call(() => goToScene(2))
        .to({}, { duration: 5 })
        .call(() => goToScene(3))
        .to({}, { duration: 5 })
        .call(() => goToScene(4))
        .to({}, { duration: 5 })
        .call(() => goToScene(5))
        .to({}, { duration: 8 });
}

function goToScene(sceneNumber) {
    if (sceneNumber === currentScene) return;
    
    // Hide current scene
    document.querySelector(`#scene${currentScene}`).classList.remove('active');
    
    // Show new scene
    currentScene = sceneNumber;
    document.querySelector(`#scene${currentScene}`).classList.add('active');
    
    // Update navigation dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === currentScene);
    });
    
    // Trigger scene entrance animation
    if (scenes[`scene${currentScene}`] && scenes[`scene${currentScene}`].enter) {
        scenes[`scene${currentScene}`].enter();
    }
    
    // Update text animations
    animateSceneText(currentScene);
}

function animateSceneText(sceneNumber) {
    const scene = document.querySelector(`#scene${sceneNumber}`);
    const textElements = scene.querySelectorAll('h1, h2, p, .feature, .stat, .gesture');
    
    gsap.fromTo(textElements, {
        opacity: 0,
        y: 30
    }, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out"
    });
}

function togglePlayPause() {
    const btn = document.getElementById('play-pause');
    if (isPlaying) {
        timeline.pause();
        btn.textContent = '▶️';
        isPlaying = false;
    } else {
        timeline.play();
        btn.textContent = '⏸️';
        isPlaying = true;
    }
}

function restartPresentation() {
    timeline.restart();
    goToScene(1);
    isPlaying = true;
    document.getElementById('play-pause').textContent = '⏸️';
}

function startPresentation() {
    goToScene(1);
    if (timeline) {
        timeline.play();
    }
}

// Custom Cursor
function setupCustomCursor() {
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function updateCursor() {
        document.body.style.setProperty('--mouse-x', mouseX + 'px');
        document.body.style.setProperty('--mouse-y', mouseY + 'px');
        requestAnimationFrame(updateCursor);
    }
    updateCursor();
}

// Particle Effects
function createParticleEffects() {
    setInterval(() => {
        if (Math.random() < 0.3) {
            createParticle();
        }
    }, 200);
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 5000);
}

// Audio Setup
function setupAudio() {
    const audio = document.getElementById('ambient-audio');
    
    // Create audio context for better control
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const AudioContextClass = AudioContext || webkitAudioContext;
        const audioContext = new AudioContextClass();
        
        // Auto-play with user interaction
        document.addEventListener('click', () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            if (audio.paused) {
                audio.volume = 0.3;
                audio.play().catch(e => console.log('Audio play failed:', e));
            }
        }, { once: true });
    }
}

// Responsive handling
window.addEventListener('resize', () => {
    Object.values(scenes).forEach(scene => {
        if (scene.camera && scene.renderer) {
            scene.camera.aspect = window.innerWidth / window.innerHeight;
            scene.camera.updateProjectionMatrix();
            scene.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            if (currentScene > 1) goToScene(currentScene - 1);
            break;
        case 'ArrowRight':
            if (currentScene < 5) goToScene(currentScene + 1);
            break;
        case ' ':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'r':
            restartPresentation();
            break;
    }
});