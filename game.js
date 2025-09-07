import * as THREE from './node_modules/three/build/three.module.js';
import AudioManager from './audio.js';
import EffectsManager from './effects.js';

// 游戏状态
let gameState = {
    isPlaying: false,
    difficulty: 'normal',
    score: 0,
    kills: 0,
    health: 100,
    maxHealth: 100,
    currentWeapon: 0, // 0: 手枪, 1: 步枪, 2: 狙击枪
    isReloading: false,
    isScopeActive: false
};

// 玩家物理状态
let playerPhysics = {
    velocity: new THREE.Vector3(0, 0, 0),
    isGrounded: false,
    jumpPower: 15,
    gravity: -30,
    groundHeight: 5
};

// 武器配置
const weapons = [
    {
        name: '手枪',
        damage: 25,
        ammo: 15,
        totalAmmo: 45,
        reloadTime: 1500,
        fireRate: 300,
        crosshairClass: 'crosshair-pistol',
        accuracy: 0.95
    },
    {
        name: '步枪',
        damage: 35,
        ammo: 30,
        totalAmmo: 90,
        reloadTime: 2000,
        fireRate: 150,
        crosshairClass: 'crosshair-rifle',
        accuracy: 0.85
    },
    {
        name: '狙击枪',
        damage: 80,
        ammo: 5,
        totalAmmo: 20,
        reloadTime: 3000,
        fireRate: 800,
        crosshairClass: 'crosshair-sniper',
        accuracy: 0.98
    }
];

// 当前武器状态
let currentWeaponState = {
    ammo: weapons[0].ammo,
    totalAmmo: weapons[0].totalAmmo,
    lastFire: 0
};

// Three.js 核心对象
let scene, camera, renderer, controls;
let clock = new THREE.Clock();

// 瞄准镜相关
let originalFOV = 75;
let scopeFOV = 7.5; // 10倍放大 (75/10)
let scopeTransitionSpeed = 5;

// 音效和特效管理器
let audioManager;
let effectsManager;

// 游戏对象
let buildings = [];
let enemies = [];
let targets = [];
let ammoBoxes = [];
let bullets = [];
let terrain = [];

// 纹理加载器
let textureLoader = new THREE.TextureLoader();
let enemyTextures = {
    stage1: null,
    stage2: null
};

// 控制相关
let keys = {};
let mouse = { x: 0, y: 0 };
let isPointerLocked = false;

// 难度设置
const difficultySettings = {
    easy: { enemySpeed: 0.5, enemyCount: 3, enemyHealth: 50, targetCount: 5 },
    normal: { enemySpeed: 1, enemyCount: 5, enemyHealth: 75, targetCount: 8 },
    hard: { enemySpeed: 1.5, enemyCount: 8, enemyHealth: 100, targetCount: 12 }
};

// 初始化游戏
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 0);

    // 创建渲染器
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x87CEEB);

    // 创建光照
    setupLighting();
    
    // 创建城市场景
    createCityScene();
    
    // 加载敌人纹理
    loadEnemyTextures();
    
    // 初始化音效和特效管理器
    audioManager = new AudioManager();
    effectsManager = new EffectsManager(scene);
    
    // 设置事件监听
    setupEventListeners();
    
    // 开始渲染循环
    animate();
}

// 设置光照
function setupLighting() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // 太阳光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
}

// 加载敌人纹理
function loadEnemyTextures() {
    enemyTextures.stage1 = textureLoader.load('./kenan.png');
    enemyTextures.stage2 = textureLoader.load('./kenan2.png');
}

// 创建城市场景
function createCityScene() {
    // 创建地面
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x555555,
        transparent: true,
        opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    // 创建地形高低起伏
    createTerrain();

    // 创建建筑物
    createBuildings();
    
    // 创建道路
    createRoads();
}

// 创建地形高低起伏
function createTerrain() {
    // 创建小山丘
    const hillPositions = [
        { x: -70, z: -70, radius: 15, height: 8 },
        { x: 70, z: 70, radius: 20, height: 12 },
        { x: -50, z: 80, radius: 12, height: 6 },
        { x: 80, z: -50, radius: 18, height: 10 },
        { x: 0, z: -90, radius: 25, height: 15 }
    ];

    hillPositions.forEach(hill => {
        const geometry = new THREE.CylinderGeometry(hill.radius, hill.radius * 1.5, hill.height, 8);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x4a5d23 // 深绿色
        });
        const hillMesh = new THREE.Mesh(geometry, material);
        hillMesh.position.set(hill.x, hill.height / 2, hill.z);
        hillMesh.receiveShadow = true;
        hillMesh.castShadow = true;
        scene.add(hillMesh);
        terrain.push(hillMesh);
    });

    // 创建岩石
    for (let i = 0; i < 15; i++) {
        const geometry = new THREE.BoxGeometry(
            2 + Math.random() * 3,
            1 + Math.random() * 2,
            2 + Math.random() * 3
        );
        const material = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const rock = new THREE.Mesh(geometry, material);
        
        rock.position.set(
            (Math.random() - 0.5) * 180,
            geometry.parameters.height / 2,
            (Math.random() - 0.5) * 180
        );
        
        rock.rotation.y = Math.random() * Math.PI * 2;
        rock.receiveShadow = true;
        rock.castShadow = true;
        scene.add(rock);
        terrain.push(rock);
    }
}

// 创建建筑物
function createBuildings() {
    const buildingPositions = [
        { x: -40, z: -40, width: 15, height: 25, depth: 15 },
        { x: 40, z: -40, width: 12, height: 30, depth: 12 },
        { x: -40, z: 40, width: 18, height: 20, depth: 18 },
        { x: 40, z: 40, width: 10, height: 35, depth: 10 },
        { x: 0, z: -60, width: 20, height: 15, depth: 20 },
        { x: -60, z: 0, width: 14, height: 28, depth: 14 },
        { x: 60, z: 0, width: 16, height: 22, depth: 16 },
        { x: 0, z: 60, width: 22, height: 18, depth: 22 }
    ];

    buildingPositions.forEach((pos, index) => {
        const geometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
        const material = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.6, 0.2, 0.3 + Math.random() * 0.3)
        });
        const building = new THREE.Mesh(geometry, material);
        building.position.set(pos.x, pos.height / 2, pos.z);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
        buildings.push(building);
    });
}

// 创建道路
function createRoads() {
    // 主要道路
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    // 水平道路
    const hRoadGeometry = new THREE.PlaneGeometry(200, 8);
    const hRoad = new THREE.Mesh(hRoadGeometry, roadMaterial);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.y = 0.01;
    scene.add(hRoad);
    
    // 垂直道路
    const vRoadGeometry = new THREE.PlaneGeometry(8, 200);
    const vRoad = new THREE.Mesh(vRoadGeometry, roadMaterial);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.y = 0.01;
    scene.add(vRoad);
}

// 开始游戏
function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.kills = 0;
    gameState.health = 100;
    gameState.maxHealth = 100;
    gameState.currentWeapon = 0;
    
    // 重置玩家物理状态
    playerPhysics.velocity.set(0, 0, 0);
    playerPhysics.isGrounded = true;
    
    // 重置瞄准镜状态
    if (gameState.isScopeActive) {
        toggleScope();
    }
    
    // 重置武器状态
    currentWeaponState.ammo = weapons[0].ammo;
    currentWeaponState.totalAmmo = weapons[0].totalAmmo;
    
    // 隐藏菜单
    document.getElementById('startMenu').classList.add('hidden');
    document.getElementById('gameUI').classList.remove('hidden');
    
    // 重置相机位置
    camera.position.set(0, 5, 0);
    camera.rotation.set(0, 0, 0);
    
    // 清除现有游戏对象
    clearGameObjects();
    
    // 创建游戏对象
    createEnemies();
    createTargets();
    createAmmoBoxes();
    
    // 更新UI
    updateUI();
    
    // 开始背景音乐
    audioManager.startBackgroundMusic();
    
    // 请求指针锁定
    requestPointerLock();
}

// 清除游戏对象
function clearGameObjects() {
    [...enemies, ...targets, ...ammoBoxes, ...bullets].forEach(obj => {
        scene.remove(obj);
    });
    enemies = [];
    targets = [];
    ammoBoxes = [];
    bullets = [];
}

// 创建敌人
function createEnemies() {
    const settings = difficultySettings[gameState.difficulty];
    
    for (let i = 0; i < settings.enemyCount; i++) {
        const geometry = new THREE.PlaneGeometry(3, 4);
        const material = new THREE.MeshLambertMaterial({ 
            map: enemyTextures.stage1,
            transparent: true,
            alphaTest: 0.5
        });
        const enemy = new THREE.Mesh(geometry, material);
        
        // 随机位置
        const angle = (i / settings.enemyCount) * Math.PI * 2;
        const radius = 30 + Math.random() * 40;
        enemy.position.set(
            Math.cos(angle) * radius,
            2.5,
            Math.sin(angle) * radius
        );
        
        enemy.castShadow = true;
        enemy.userData = {
            type: 'enemy',
            health: settings.enemyHealth,
            maxHealth: settings.enemyHealth,
            speed: settings.enemySpeed,
            stage: 1, // 敌人阶段
            direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            lastDamageTime: 0
        };
        
        // 创建血量条
        createEnemyHealthBar(enemy);
        
        scene.add(enemy);
        enemies.push(enemy);
    }
}

// 创建敌人血量条
function createEnemyHealthBar(enemy) {
    const barGeometry = new THREE.PlaneGeometry(3, 0.3);
    const barMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true });
    const healthBar = new THREE.Mesh(barGeometry, barMaterial);
    
    const backgroundGeometry = new THREE.PlaneGeometry(3.2, 0.4);
    const backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
    const healthBackground = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    
    healthBar.position.set(0, 3, 0.01);
    healthBackground.position.set(0, 3, 0);
    
    enemy.add(healthBar);
    enemy.add(healthBackground);
    
    enemy.userData.healthBar = healthBar;
    enemy.userData.healthBackground = healthBackground;
}

// 更新敌人血量条
function updateEnemyHealthBar(enemy) {
    if (enemy.userData.healthBar) {
        const healthPercent = enemy.userData.health / enemy.userData.maxHealth;
        enemy.userData.healthBar.scale.x = healthPercent;
        
        // 根据血量改变颜色
        if (healthPercent > 0.6) {
            enemy.userData.healthBar.material.color.setHex(0x00ff00); // 绿色
        } else if (healthPercent > 0.3) {
            enemy.userData.healthBar.material.color.setHex(0xffff00); // 黄色
        } else {
            enemy.userData.healthBar.material.color.setHex(0xff0000); // 红色
        }
        
        // 血量条始终面向相机
        enemy.userData.healthBar.lookAt(camera.position);
        enemy.userData.healthBackground.lookAt(camera.position);
    }
}

// 创建靶子
function createTargets() {
    const settings = difficultySettings[gameState.difficulty];
    
    for (let i = 0; i < settings.targetCount; i++) {
        const geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2);
        const material = new THREE.MeshLambertMaterial({ color: 0x44ff44 });
        const target = new THREE.Mesh(geometry, material);
        
        // 随机位置
        target.position.set(
            (Math.random() - 0.5) * 150,
            1 + Math.random() * 10,
            (Math.random() - 0.5) * 150
        );
        
        target.userData = {
            type: 'target',
            points: 10
        };
        
        scene.add(target);
        targets.push(target);
    }
}

// 创建弹药箱
function createAmmoBoxes() {
    for (let i = 0; i < 5; i++) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
        const ammoBox = new THREE.Mesh(geometry, material);
        
        ammoBox.position.set(
            (Math.random() - 0.5) * 120,
            1,
            (Math.random() - 0.5) * 120
        );
        
        ammoBox.userData = {
            type: 'ammoBox',
            ammo: 30
        };
        
        scene.add(ammoBox);
        ammoBoxes.push(ammoBox);
    }
}

// 设置事件监听
function setupEventListeners() {
    // 键盘事件
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // 鼠标事件
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    
    // 指针锁定事件
    document.addEventListener('pointerlockchange', onPointerLockChange);
    
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);
}

// 键盘按下
function onKeyDown(event) {
    keys[event.code] = true;
    
    if (!gameState.isPlaying) return;
    
    switch(event.code) {
        case 'Digit1':
            switchWeapon(0);
            break;
        case 'Digit2':
            switchWeapon(1);
            break;
        case 'Digit3':
            switchWeapon(2);
            break;
        case 'KeyR':
            reload();
            break;
        case 'Space':
            jump();
            event.preventDefault(); // 防止页面滚动
            break;
        case 'KeyE':
            toggleScope();
            break;
        case 'Escape':
            if (gameState.isScopeActive) {
                toggleScope(); // 如果瞄准镜开启，先关闭瞄准镜
            } else {
                exitPointerLock();
            }
            break;
    }
}

// 键盘释放
function onKeyUp(event) {
    keys[event.code] = false;
}

// 鼠标按下
function onMouseDown(event) {
    console.log('鼠标点击 - isPlaying:', gameState.isPlaying, 'isPointerLocked:', isPointerLocked);
    
    if (!gameState.isPlaying) {
        console.log('游戏未开始');
        return;
    }
    
    if (!isPointerLocked) {
        console.log('指针未锁定，尝试锁定');
        requestPointerLock();
        return;
    }
    
    if (event.button === 0) { // 左键射击
        console.log('尝试射击');
        shoot();
    }
}

// 鼠标移动
function onMouseMove(event) {
    if (!gameState.isPlaying) return;
    
    if (!isPointerLocked) {
        // 如果指针未锁定，不处理移动
        return;
    }
    
    // 瞄准镜时降低灵敏度
    const baseSensitivity = 0.002;
    const sensitivity = gameState.isScopeActive ? baseSensitivity * 0.3 : baseSensitivity;
    
    camera.rotation.y -= event.movementX * sensitivity;
    camera.rotation.x -= event.movementY * sensitivity;
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
}

// 切换武器
function switchWeapon(weaponIndex) {
    if (weaponIndex === gameState.currentWeapon || gameState.isReloading) return;
    
    gameState.currentWeapon = weaponIndex;
    const weapon = weapons[weaponIndex];
    
    currentWeaponState.ammo = weapon.ammo;
    currentWeaponState.totalAmmo = weapon.totalAmmo;
    
    // 更新瞄准镜
    const crosshair = document.getElementById('crosshair');
    crosshair.className = weapon.crosshairClass;
    
    updateUI();
}

// 射击
function shoot() {
    const now = Date.now();
    const weapon = weapons[gameState.currentWeapon];
    
    if (now - currentWeaponState.lastFire < weapon.fireRate || 
        currentWeaponState.ammo <= 0 || 
        gameState.isReloading) {
        return;
    }
    
    currentWeaponState.lastFire = now;
    currentWeaponState.ammo--;
    
    // 播放射击音效
    const weaponTypes = ['pistol', 'rifle', 'sniper'];
    audioManager.playShoot(weaponTypes[gameState.currentWeapon]);
    
    // 创建枪口火焰效果
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    effectsManager.createMuzzleFlash(camera.position.clone().add(direction.clone().multiplyScalar(2)), direction);
    
    // 创建子弹
    createBullet();
    
    // 射击检测
    performRaycast();
    
    updateUI();
}

// 创建子弹轨迹
function createBullet() {
    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(geometry, material);
    
    bullet.position.copy(camera.position);
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // 添加武器精度影响
    const weapon = weapons[gameState.currentWeapon];
    const spread = (1 - weapon.accuracy) * 0.1;
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.z += (Math.random() - 0.5) * spread;
    direction.normalize();
    
    bullet.userData = {
        direction: direction,
        speed: 100,
        life: 2000
    };
    
    scene.add(bullet);
    bullets.push(bullet);
}

// 射线检测
function performRaycast() {
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    raycaster.set(camera.position, direction);
    
    // 检测敌人
    const enemyIntersects = raycaster.intersectObjects(enemies);
    if (enemyIntersects.length > 0) {
        hitEnemy(enemyIntersects[0].object);
        return;
    }
    
    // 检测靶子
    const targetIntersects = raycaster.intersectObjects(targets);
    if (targetIntersects.length > 0) {
        hitTarget(targetIntersects[0].object);
        return;
    }
}

// 击中敌人
function hitEnemy(enemy) {
    const weapon = weapons[gameState.currentWeapon];
    enemy.userData.health -= weapon.damage;
    
    // 播放击中音效
    audioManager.playEnemyHit();
    
    // 创建击中效果
    effectsManager.createHitEffect(enemy.position, 0xff0000);
    
    // 检查是否需要进入第二阶段
    if (enemy.userData.stage === 1 && enemy.userData.health <= enemy.userData.maxHealth * 0.5) {
        enemy.userData.stage = 2;
        enemy.userData.speed *= 1.5; // 第二阶段速度更快
        enemy.material.map = enemyTextures.stage2; // 切换到第二阶段纹理
        enemy.material.needsUpdate = true;
        
        // 创建阶段转换效果
        effectsManager.createExplosion(enemy.position);
    }
    
    if (enemy.userData.health <= 0) {
        // 创建爆炸效果
        effectsManager.createExplosion(enemy.position);
        
        scene.remove(enemy);
        enemies.splice(enemies.indexOf(enemy), 1);
        gameState.kills++;
        gameState.score += (enemy.userData.stage === 2) ? 100 : 50; // 第二阶段敌人更多分数
        
        // 检查是否所有敌人被消灭
        if (enemies.length === 0) {
            spawnNewWave();
        }
    }
    
    updateUI();
}

// 击中靶子
function hitTarget(target) {
    // 播放击中音效
    audioManager.playHit();
    
    // 创建击中效果
    effectsManager.createHitEffect(target.position, 0x00ff00);
    
    scene.remove(target);
    targets.splice(targets.indexOf(target), 1);
    gameState.score += target.userData.points;
    
    updateUI();
}

// 这个函数已被effectsManager.createHitEffect替代，保留以防兼容性问题
function createHitEffect(position, color) {
    effectsManager.createHitEffect(position, color);
}

// 生成新一波敌人
function spawnNewWave() {
    setTimeout(() => {
        createEnemies();
        createTargets();
    }, 2000);
}

// 跳跃功能
function jump() {
    if (playerPhysics.isGrounded && gameState.isPlaying) {
        playerPhysics.velocity.y = playerPhysics.jumpPower;
        playerPhysics.isGrounded = false;
    }
}

// 瞄准镜切换
function toggleScope() {
    if (!gameState.isPlaying || !isPointerLocked) return;
    
    gameState.isScopeActive = !gameState.isScopeActive;
    
    const scopeOverlay = document.getElementById('scopeOverlay');
    const crosshair = document.getElementById('crosshair');
    
    console.log('瞄准镜状态切换:', gameState.isScopeActive ? '开启' : '关闭');
    
    if (gameState.isScopeActive) {
        // 开启瞄准镜
        scopeOverlay.style.display = 'block';
        crosshair.style.display = 'none';
        
        // 开始FOV过渡动画
        animateFOV(camera.fov, scopeFOV);
    } else {
        // 关闭瞄准镜
        scopeOverlay.style.display = 'none';
        crosshair.style.display = 'block';
        
        // 恢复FOV
        animateFOV(camera.fov, originalFOV);
    }
}

// FOV动画
function animateFOV(fromFOV, toFOV) {
    const startTime = Date.now();
    const duration = 300; // 300ms过渡时间
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.fov = fromFOV + (toFOV - fromFOV) * easeProgress;
        camera.updateProjectionMatrix();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// 重新装弹
function reload() {
    if (gameState.isReloading || currentWeaponState.totalAmmo <= 0) return;
    
    const weapon = weapons[gameState.currentWeapon];
    const needed = weapon.ammo - currentWeaponState.ammo;
    const available = Math.min(needed, currentWeaponState.totalAmmo);
    
    if (available <= 0) return;
    
    gameState.isReloading = true;
    
    // 播放装弹音效
    audioManager.playReload();
    
    setTimeout(() => {
        currentWeaponState.ammo += available;
        currentWeaponState.totalAmmo -= available;
        gameState.isReloading = false;
        updateUI();
    }, weapon.reloadTime);
    
    updateUI();
}

// 更新游戏逻辑
function updateGame(deltaTime) {
    if (!gameState.isPlaying) return;
    
    // 更新玩家移动
    updatePlayerMovement(deltaTime);
    
    // 更新敌人
    updateEnemies(deltaTime);
    
    // 更新子弹
    updateBullets(deltaTime);
    
    // 更新瞄准镜距离显示
    if (gameState.isScopeActive) {
        updateScopeDistance();
    }
    
    // 检查弹药箱碰撞
    checkAmmoBoxCollisions();
    
    // 检查游戏结束条件
    checkGameOver();
}

// 更新玩家移动
function updatePlayerMovement(deltaTime) {
    const speed = 20;
    const direction = new THREE.Vector3();
    
    // 水平移动
    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;
    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;
    
    if (direction.length() > 0) {
        direction.normalize();
        direction.applyQuaternion(camera.quaternion);
        direction.y = 0;
        direction.normalize();
        
        camera.position.add(direction.multiplyScalar(speed * deltaTime));
    }
    
    // 重力和跳跃物理
    if (!playerPhysics.isGrounded) {
        playerPhysics.velocity.y += playerPhysics.gravity * deltaTime;
    }
    
    camera.position.y += playerPhysics.velocity.y * deltaTime;
    
    // 地面碰撞检测
    if (camera.position.y <= playerPhysics.groundHeight) {
        camera.position.y = playerPhysics.groundHeight;
        playerPhysics.velocity.y = 0;
        playerPhysics.isGrounded = true;
    }
    
    // 限制移动范围
    camera.position.x = Math.max(-90, Math.min(90, camera.position.x));
    camera.position.z = Math.max(-90, Math.min(90, camera.position.z));
    camera.position.y = Math.max(playerPhysics.groundHeight, Math.min(50, camera.position.y));
}

// 更新敌人
function updateEnemies(deltaTime) {
    enemies.forEach(enemy => {
        // 简单AI：朝玩家移动
        const playerPos = camera.position.clone();
        const enemyPos = enemy.position.clone();
        const direction = playerPos.sub(enemyPos).normalize();
        
        enemy.position.add(direction.multiplyScalar(enemy.userData.speed * deltaTime));
        
        // 敌人始终面向玩家
        enemy.lookAt(camera.position);
        
        // 更新血量条
        updateEnemyHealthBar(enemy);
        
        // 检查是否接触玩家
        const distance = enemy.position.distanceTo(camera.position);
        if (distance < 3) {
            const now = Date.now();
            if (now - enemy.userData.lastDamageTime > 1000) { // 每秒最多造成一次伤害
                gameState.health -= 10;
                enemy.userData.lastDamageTime = now;
                // 将敌人推开
                enemy.position.add(direction.multiplyScalar(-5));
                updateUI();
            }
        }
    });
}

// 更新子弹
function updateBullets(deltaTime) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.position.add(bullet.userData.direction.clone().multiplyScalar(bullet.userData.speed * deltaTime));
        
        bullet.userData.life -= deltaTime * 1000;
        if (bullet.userData.life <= 0) {
            scene.remove(bullet);
            bullets.splice(i, 1);
        }
    }
}

// 检查弹药箱碰撞
function checkAmmoBoxCollisions() {
    for (let i = ammoBoxes.length - 1; i >= 0; i--) {
        const ammoBox = ammoBoxes[i];
        const distance = ammoBox.position.distanceTo(camera.position);
        
        if (distance < 3) {
            // 播放拾取音效
            audioManager.playPickup();
            
            // 创建拾取效果
            effectsManager.createPickupEffect(ammoBox.position);
            
            currentWeaponState.totalAmmo += ammoBox.userData.ammo;
            scene.remove(ammoBox);
            ammoBoxes.splice(i, 1);
            updateUI();
        }
    }
}

// 更新瞄准镜距离显示
function updateScopeDistance() {
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    raycaster.set(camera.position, direction);
    
    // 检测所有可能的目标
    const allTargets = [...enemies, ...targets, ...buildings, ...terrain];
    const intersects = raycaster.intersectObjects(allTargets);
    
    let distance = 0;
    if (intersects.length > 0) {
        distance = Math.round(intersects[0].distance);
    } else {
        // 如果没有击中任何物体，检测地面
        const groundIntersects = raycaster.intersectObjects([scene.getObjectByName('ground')]);
        if (groundIntersects.length > 0) {
            distance = Math.round(groundIntersects[0].distance);
        } else {
            distance = 999; // 最大显示距离
        }
    }
    
    document.getElementById('scopeDistance').textContent = `距离: ${distance}m`;
}

// 检查游戏结束
function checkGameOver() {
    if (gameState.health <= 0) {
        endGame();
    }
}

// 结束游戏
function endGame() {
    gameState.isPlaying = false;
    document.getElementById('finalScore').textContent = `最终得分: ${gameState.score}`;
    document.getElementById('gameOver').style.display = 'flex';
    exitPointerLock();
}

// 重新开始游戏
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame(gameState.difficulty);
}

// 返回菜单
function backToMenu() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameUI').classList.add('hidden');
    document.getElementById('startMenu').classList.remove('hidden');
    gameState.isPlaying = false;
}

// 更新UI
function updateUI() {
    // 更新血量条
    const healthPercent = (gameState.health / gameState.maxHealth) * 100;
    document.getElementById('healthFill').style.width = healthPercent + '%';
    document.getElementById('healthText').textContent = `${gameState.health}/${gameState.maxHealth}`;
    
    // 更新其他UI元素
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('kills').textContent = gameState.kills;
    document.getElementById('currentWeapon').textContent = weapons[gameState.currentWeapon].name;
    document.getElementById('ammo').textContent = currentWeaponState.ammo;
    document.getElementById('totalAmmo').textContent = currentWeaponState.totalAmmo;
}

// 指针锁定相关
function requestPointerLock() {
    const canvas = document.getElementById('gameCanvas');
    canvas.requestPointerLock();
}

function exitPointerLock() {
    document.exitPointerLock();
}

function onPointerLockChange() {
    isPointerLocked = document.pointerLockElement === document.getElementById('gameCanvas');
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 渲染循环
function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    updateGame(deltaTime);
    
    renderer.render(scene, camera);
}

// 全局函数（供HTML调用）
window.startGame = startGame;
window.restartGame = restartGame;
window.backToMenu = backToMenu;

// 初始化游戏
init();