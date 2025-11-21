// Realistic Tiger RPG Simulator
let scene, camera, renderer, player;
let gameState = 'start';
let battleState = null;
let clock = new THREE.Clock();

// Player stats
let playerStats = {
    level: 1,
    xp: 0,
    xpToNext: 100,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    gold: 50,
    kills: 0,
    questsCompleted: 0,
    stamina: 100,
    maxStamina: 100
};

// Animation states
let playerAnimation = {
    state: 'idle',
    time: 0,
    speed: 0
};

// Inventory
let inventory = [];
let equipment = {
    weapon: null,
    armor: null,
    accessory: null
};

// Quests
let quests = [
    { id: 1, name: 'First Hunt', desc: 'Defeat 3 enemies', target: 3, current: 0, reward: { gold: 50, xp: 50 }, completed: false },
    { id: 2, name: 'Gather Resources', desc: 'Collect 5 items', target: 5, current: 0, reward: { gold: 30, xp: 30 }, completed: false },
    { id: 3, name: 'Level Up', desc: 'Reach level 3', target: 3, current: 1, reward: { gold: 100, xp: 100 }, completed: false }
];

// Enemies
let enemies = [];
let currentEnemy = null;

// Items
const itemDatabase = {
    healthPotion: { name: 'Health Potion', type: 'consumable', effect: 'heal', value: 30, price: 20, icon: '💊' },
    staminaPotion: { name: 'Stamina Potion', type: 'consumable', effect: 'stamina', value: 50, price: 25, icon: '⚡' },
    sword: { name: 'Iron Sword', type: 'weapon', attack: 5, price: 100, icon: '⚔️' },
    armor: { name: 'Leather Armor', type: 'armor', defense: 3, price: 80, icon: '🛡️' },
    ring: { name: 'Power Ring', type: 'accessory', attack: 2, defense: 1, price: 150, icon: '💍' }
};

// Shop items
const shopItems = [
    { id: 'healthPotion', ...itemDatabase.healthPotion },
    { id: 'staminaPotion', ...itemDatabase.staminaPotion },
    { id: 'sword', ...itemDatabase.sword },
    { id: 'armor', ...itemDatabase.armor },
    { id: 'ring', ...itemDatabase.ring }
];

// UI Elements
const levelElement = document.getElementById('level');
const hpElement = document.getElementById('hp');
const xpElement = document.getElementById('xp');
const goldElement = document.getElementById('gold');
const attackElement = document.getElementById('attack');
const defenseElement = document.getElementById('defense');
const staminaElement = document.getElementById('stamina');
const startScreen = document.getElementById('startScreen');
const inventoryScreen = document.getElementById('inventoryScreen');
const questScreen = document.getElementById('questScreen');
const shopScreen = document.getElementById('shopScreen');
const battleScreen = document.getElementById('battleScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const notification = document.getElementById('notification');

// Environment
let sun, moon, clouds = [];
let timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight

// Initialize Three.js scene
function initScene() {
    const container = document.getElementById('gameContainer');
    
    // Scene
    scene = new THREE.Scene();
    updateSky();
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Sun light
    sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(20, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    scene.add(sun);
    
    // Moon light (for night)
    moon = new THREE.DirectionalLight(0x87CEEB, 0.3);
    moon.position.set(-20, 20, -10);
    moon.castShadow = true;
    scene.add(moon);
    
    // Create environment
    createRealisticGround();
    createRealisticPlayer();
    createRealisticEnemies();
    createItems();
    createRealisticBuildings();
    createTrees();
    createRocks();
    createClouds();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('click', onMouseClick);
}

function updateSky() {
    const hour = timeOfDay * 24;
    let skyColor, fogColor, sunIntensity, moonIntensity;
    
    if (hour >= 6 && hour < 8) {
        // Dawn
        skyColor = 0xFFB347;
        fogColor = 0xFFB347;
        sunIntensity = 0.6;
        moonIntensity = 0.1;
    } else if (hour >= 8 && hour < 18) {
        // Day
        skyColor = 0x87CEEB;
        fogColor = 0x87CEEB;
        sunIntensity = 1.0;
        moonIntensity = 0;
    } else if (hour >= 18 && hour < 20) {
        // Dusk
        skyColor = 0xFF6347;
        fogColor = 0xFF6347;
        sunIntensity = 0.5;
        moonIntensity = 0.2;
    } else {
        // Night
        skyColor = 0x191970;
        fogColor = 0x000033;
        sunIntensity = 0.1;
        moonIntensity = 0.5;
    }
    
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.Fog(fogColor, 10, 80);
    sun.intensity = sunIntensity;
    moon.intensity = moonIntensity;
}

function createRealisticGround() {
    // Main ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x6b8e23 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add height variation for realism
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 2; i < vertices.length; i += 3) {
        vertices[i] = Math.random() * 0.3 - 0.15; // Random height variation
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    // Add realistic grass
    const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    for (let i = 0; i < 200; i++) {
        const grassHeight = 0.2 + Math.random() * 0.3;
        const grass = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.08, grassHeight, 6),
            grassMaterial
        );
        grass.position.set(
            (Math.random() - 0.5) * 180,
            grassHeight / 2,
            (Math.random() - 0.5) * 180
        );
        grass.rotation.y = Math.random() * Math.PI * 2;
        grass.castShadow = true;
        scene.add(grass);
    }
    
    // Add dirt patches
    for (let i = 0; i < 20; i++) {
        const dirt = new THREE.Mesh(
            new THREE.CircleGeometry(2 + Math.random() * 3, 16),
            new THREE.MeshLambertMaterial({ color: 0x8B4513 })
        );
        dirt.rotation.x = -Math.PI / 2;
        dirt.position.set(
            (Math.random() - 0.5) * 180,
            0.01,
            (Math.random() - 0.5) * 180
        );
        scene.add(dirt);
    }
}

function createRealisticPlayer() {
    const playerGroup = new THREE.Group();
    
    // Body - more realistic proportions
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.8, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFF8C00,
        shininess: 30,
        specular: 0x222222
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    body.receiveShadow = true;
    playerGroup.add(body);
    
    // Head - more detailed
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFF8C00,
        shininess: 30
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 2.2, 0.6);
    head.castShadow = true;
    playerGroup.add(head);
    
    // Realistic stripes
    for (let i = 0; i < 8; i++) {
        const stripe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.52, 0.15, 16),
            new THREE.MeshPhongMaterial({ color: 0x000000 })
        );
        stripe.position.set(0, 0.9 - i * 0.22, 0);
        stripe.rotation.z = Math.random() * 0.1 - 0.05;
        playerGroup.add(stripe);
    }
    
    // Ears
    const earGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
    const earMaterial = new THREE.MeshPhongMaterial({ color: 0xFF8C00 });
    const ear1 = new THREE.Mesh(earGeometry, earMaterial);
    ear1.position.set(-0.3, 2.4, 0.4);
    ear1.rotation.z = -0.3;
    ear1.castShadow = true;
    playerGroup.add(ear1);
    const ear2 = new THREE.Mesh(earGeometry, earMaterial);
    ear2.position.set(0.3, 2.4, 0.4);
    ear2.rotation.z = 0.3;
    ear2.castShadow = true;
    playerGroup.add(ear2);
    
    // Legs - more realistic
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 12);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0xFF8C00 });
    const positions = [[-0.35, 0.4, 0.5], [0.35, 0.4, 0.5], [-0.35, 0.4, -0.5], [0.35, 0.4, -0.5]];
    positions.forEach((pos, index) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        leg.userData.isLeg = true;
        leg.userData.legIndex = index;
        playerGroup.add(leg);
    });
    
    // Paws
    const pawGeometry = new THREE.SphereGeometry(0.15, 12, 12);
    const pawMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    positions.forEach(pos => {
        const paw = new THREE.Mesh(pawGeometry, pawMaterial);
        paw.position.set(pos[0], 0.05, pos[2]);
        paw.castShadow = true;
        playerGroup.add(paw);
    });
    
    // Tail - more realistic
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.8, 12);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xFF8C00 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 1.1, -1.1);
    tail.rotation.x = 0.4;
    tail.castShadow = true;
    tail.userData.isTail = true;
    playerGroup.add(tail);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00, emissive: 0x004400 });
    const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye1.position.set(-0.2, 2.25, 0.75);
    playerGroup.add(eye1);
    const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye2.position.set(0.2, 2.25, 0.75);
    playerGroup.add(eye2);
    
    // Nose
    const noseGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xFF69B4 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 2.1, 0.85);
    playerGroup.add(nose);
    
    playerGroup.position.set(0, 0, 0);
    playerGroup.userData.type = 'player';
    playerGroup.userData.animation = playerAnimation;
    scene.add(playerGroup);
    player = playerGroup;
}

function createRealisticEnemies() {
    const enemyTypes = [
        { name: 'Wild Boar', hp: 30, attack: 5, defense: 2, xp: 20, gold: 15, color: 0x8B4513, size: 0.8 },
        { name: 'Wolf', hp: 40, attack: 8, defense: 3, xp: 30, gold: 25, color: 0x808080, size: 1.0 },
        { name: 'Bear', hp: 60, attack: 12, defense: 5, xp: 50, gold: 40, color: 0x654321, size: 1.5 },
        { name: 'Dragon', hp: 100, attack: 20, defense: 8, xp: 100, gold: 100, color: 0xFF0000, size: 2.0 }
    ];
    
    for (let i = 0; i < 10; i++) {
        const type = enemyTypes[Math.min(Math.floor(playerStats.level / 2), enemyTypes.length - 1)];
        const enemy = createRealisticEnemyModel(type);
        enemy.position.set(
            (Math.random() - 0.5) * 80,
            0,
            (Math.random() - 0.5) * 80
        );
        enemy.userData = {
            type: 'enemy',
            name: type.name,
            hp: type.hp,
            maxHp: type.hp,
            attack: type.attack,
            defense: type.defense,
            xp: type.xp,
            gold: type.gold,
            animationTime: Math.random() * Math.PI * 2,
            state: 'idle'
        };
        enemies.push(enemy);
        scene.add(enemy);
    }
}

function createRealisticEnemyModel(type) {
    const enemyGroup = new THREE.Group();
    const size = type.size;
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.4 * size, 0.5 * size, 1.2 * size, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: type.color,
        shininess: 20
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6 * size;
    body.castShadow = true;
    body.receiveShadow = true;
    enemyGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.4 * size, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 1.2 * size, 0.5 * size);
    head.castShadow = true;
    enemyGroup.add(head);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.1 * size, 0.12 * size, 0.6 * size, 12);
    const positions = [[-0.3 * size, 0.3 * size, 0.4 * size], [0.3 * size, 0.3 * size, 0.4 * size], 
                      [-0.3 * size, 0.3 * size, -0.4 * size], [0.3 * size, 0.3 * size, -0.4 * size]];
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, bodyMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        leg.userData.isLeg = true;
        enemyGroup.add(leg);
    });
    
    return enemyGroup;
}

function createTrees() {
    for (let i = 0; i < 30; i++) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkHeight = 3 + Math.random() * 2;
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 12);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        // Leaves
        const leavesGeometry = new THREE.ConeGeometry(1.5, 2, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = trunkHeight + 1;
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        treeGroup.add(leaves);
        
        treeGroup.position.set(
            (Math.random() - 0.5) * 150,
            0,
            (Math.random() - 0.5) * 150
        );
        scene.add(treeGroup);
    }
}

function createRocks() {
    for (let i = 0; i < 20; i++) {
        const rockSize = 0.5 + Math.random() * 0.5;
        const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
        const rockMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x696969,
            shininess: 10
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
            (Math.random() - 0.5) * 150,
            rockSize / 2,
            (Math.random() - 0.5) * 150
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
}

function createClouds() {
    for (let i = 0; i < 10; i++) {
        const cloudGroup = new THREE.Group();
        const cloudMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        for (let j = 0; j < 5; j++) {
            const cloudPart = new THREE.Mesh(
                new THREE.SphereGeometry(2 + Math.random() * 2, 16, 16),
                cloudMaterial
            );
            cloudPart.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 6
            );
            cloudGroup.add(cloudPart);
        }
        
        cloudGroup.position.set(
            (Math.random() - 0.5) * 200,
            15 + Math.random() * 10,
            (Math.random() - 0.5) * 200
        );
        cloudGroup.userData.speed = 0.01 + Math.random() * 0.02;
        clouds.push(cloudGroup);
        scene.add(cloudGroup);
    }
}

function createItems() {
    // Health potions
    for (let i = 0; i < 15; i++) {
        const potion = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.2, 0.5, 16),
            new THREE.MeshPhongMaterial({ 
                color: 0xFF0000,
                shininess: 100,
                emissive: 0x330000
            })
        );
        potion.position.set(
            (Math.random() - 0.5) * 100,
            0.25,
            (Math.random() - 0.5) * 100
        );
        potion.userData = { type: 'item', itemId: 'healthPotion', rotationSpeed: 0.02 };
        potion.castShadow = true;
        scene.add(potion);
    }
}

function createRealisticBuildings() {
    // Shop - more detailed
    const shopGroup = new THREE.Group();
    
    // Base
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.5, 6),
        new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    base.position.y = 0.25;
    base.castShadow = true;
    base.receiveShadow = true;
    shopGroup.add(base);
    
    // Walls
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), wallMaterial);
    frontWall.position.set(0, 2, 3);
    frontWall.rotation.y = Math.PI;
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    shopGroup.add(frontWall);
    
    // Roof
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(4.5, 2, 4),
        new THREE.MeshPhongMaterial({ color: 0x8B0000 })
    );
    roof.position.y = 4.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    shopGroup.add(roof);
    
    // Door
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 2.5),
        new THREE.MeshPhongMaterial({ color: 0x654321 })
    );
    door.position.set(0, 1.25, 3.01);
    shopGroup.add(door);
    
    shopGroup.position.set(-20, 0, -20);
    shopGroup.userData = { type: 'building', buildingType: 'shop' };
    scene.add(shopGroup);
    
    // Quest board - more detailed
    const boardGroup = new THREE.Group();
    const boardPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3, 8),
        new THREE.MeshPhongMaterial({ color: 0x8B4513 })
    );
    boardPost.position.y = 1.5;
    boardPost.castShadow = true;
    boardGroup.add(boardPost);
    
    const board = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 1.5),
        new THREE.MeshPhongMaterial({ color: 0xD2691E })
    );
    board.position.set(0, 2.5, 0);
    board.rotation.y = Math.PI / 4;
    board.castShadow = true;
    boardGroup.add(board);
    
    boardGroup.position.set(20, 0, -20);
    boardGroup.userData = { type: 'building', buildingType: 'questBoard' };
    scene.add(boardGroup);
}

// Input handling
function onKeyDown(e) {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        attack();
    }
    if (e.key === 'e' && gameState === 'playing') {
        toggleInventory();
    }
    if (e.key === 'q' && gameState === 'playing') {
        toggleQuests();
    }
    if ((e.key === 'shift' || e.key === 'Shift') && gameState === 'playing') {
        playerAnimation.state = 'running';
    }
}

function onKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
    if ((e.key === 'shift' || e.key === 'Shift') && gameState === 'playing') {
        if (playerAnimation.speed > 0) {
            playerAnimation.state = 'walking';
        } else {
            playerAnimation.state = 'idle';
        }
    }
}

function onMouseClick(event) {
    if (gameState === 'playing') {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const interactables = [...enemies, ...scene.children.filter(obj => 
            obj.userData.type === 'item' || 
            (obj.userData && obj.userData.buildingType)
        )];
        const intersects = raycaster.intersectObjects(interactables, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            let target = object;
            while (target.parent && target.parent !== scene) {
                target = target.parent;
            }
            
            if (target.userData.type === 'enemy') {
                startBattle(target);
            } else if (target.userData.type === 'item') {
                collectItem(target);
            } else if (target.userData.buildingType === 'shop') {
                openShop();
            } else if (target.userData.buildingType === 'questBoard') {
                toggleQuests();
            }
        }
    }
}

// Player movement with realistic animations
function updatePlayer() {
    if (!player || gameState !== 'playing') return;
    
    const delta = clock.getDelta();
    playerAnimation.time += delta;
    
    const direction = new THREE.Vector3();
    let moveSpeed = 0.15;
    
    if (keys['w'] || keys['arrowup']) {
        direction.z -= 1;
    }
    if (keys['s'] || keys['arrowdown']) {
        direction.z += 1;
    }
    if (keys['a'] || keys['arrowleft']) {
        direction.x -= 1;
    }
    if (keys['d'] || keys['arrowright']) {
        direction.x += 1;
    }
    
    if (playerAnimation.state === 'running' && playerStats.stamina > 0) {
        moveSpeed = 0.3;
        playerStats.stamina = Math.max(0, playerStats.stamina - 0.5);
    } else if (playerAnimation.state === 'running') {
        playerAnimation.state = 'walking';
    }
    
    // Regenerate stamina
    if (playerAnimation.state !== 'running') {
        playerStats.stamina = Math.min(playerStats.maxStamina, playerStats.stamina + 0.2);
    }
    
    direction.normalize();
    direction.multiplyScalar(moveSpeed);
    
    player.position.x += direction.x;
    player.position.z += direction.z;
    
    // Update animation state
    if (direction.length() > 0) {
        playerAnimation.speed = direction.length();
        if (playerAnimation.state === 'idle') {
            playerAnimation.state = 'walking';
        }
        const angle = Math.atan2(direction.x, direction.z);
        player.rotation.y = angle;
    } else {
        playerAnimation.speed = 0;
        playerAnimation.state = 'idle';
    }
    
    // Animate player
    animatePlayer();
    
    // Update camera with smooth following
    const targetX = player.position.x;
    const targetZ = player.position.z;
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.z += (targetZ + 12 - camera.position.z) * 0.1;
    camera.lookAt(player.position);
}

function animatePlayer() {
    if (!player) return;
    
    const anim = playerAnimation;
    const time = anim.time;
    
    // Animate legs
    player.children.forEach(child => {
        if (child.userData && child.userData.isLeg) {
            if (anim.state === 'walking' || anim.state === 'running') {
                const legIndex = child.userData.legIndex;
                const phase = (legIndex % 2 === 0 ? 1 : -1) * time * (anim.state === 'running' ? 8 : 4);
                child.rotation.x = Math.sin(phase) * 0.5;
            } else {
                child.rotation.x = 0;
            }
        }
        
        // Animate tail
        if (child.userData && child.userData.isTail) {
            if (anim.state === 'idle') {
                child.rotation.x = 0.4 + Math.sin(time * 2) * 0.1;
                child.rotation.y = Math.sin(time * 1.5) * 0.2;
            } else {
                child.rotation.x = 0.4 + Math.sin(time * 4) * 0.2;
                child.rotation.y = Math.sin(time * 3) * 0.3;
            }
        }
    });
    
    // Body bob when moving
    if (anim.state === 'walking' || anim.state === 'running') {
        const bobAmount = anim.state === 'running' ? 0.1 : 0.05;
        player.position.y = Math.sin(time * (anim.state === 'running' ? 8 : 4)) * bobAmount;
    } else {
        player.position.y = 0;
    }
}

// Update enemies with realistic animations
function updateEnemies() {
    enemies.forEach(enemy => {
        const data = enemy.userData;
        data.animationTime += 0.02;
        
        // Idle animation
        enemy.rotation.y = Math.sin(data.animationTime * 0.5) * 0.1;
        enemy.position.y = Math.sin(data.animationTime) * 0.05;
        
        // Animate legs
        enemy.children.forEach(child => {
            if (child.userData && child.userData.isLeg) {
                child.rotation.x = Math.sin(data.animationTime * 2 + child.position.x) * 0.3;
            }
        });
    });
}

// Update environment
function updateEnvironment() {
    // Update time of day
    timeOfDay += 0.00005;
    if (timeOfDay >= 1) {
        timeOfDay = 0;
    }
    updateSky();
    
    // Update sun position
    const hour = timeOfDay * 24;
    const sunAngle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
    sun.position.x = Math.cos(sunAngle) * 30;
    sun.position.y = Math.sin(sunAngle) * 30 + 20;
    sun.position.z = Math.sin(sunAngle) * 10;
    
    // Update clouds
    clouds.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > 100) {
            cloud.position.x = -100;
        }
    });
    
    // Rotate items
    scene.children.forEach(obj => {
        if (obj.userData && obj.userData.rotationSpeed) {
            obj.rotation.y += obj.userData.rotationSpeed;
        }
    });
}

// Combat system
function startBattle(enemy) {
    if (gameState === 'battle') return;
    
    gameState = 'battle';
    battleState = {
        enemy: enemy,
        enemyHp: enemy.userData.hp,
        playerHp: playerStats.hp,
        turn: 'player',
        defending: false,
        attackAnimation: false
    };
    
    currentEnemy = enemy;
    battleScreen.classList.remove('hidden');
    updateBattleUI();
    addBattleLog(`A wild ${enemy.userData.name} appears!`);
    
    // Battle animation
    animateBattleStart();
}

function animateBattleStart() {
    if (!currentEnemy) return;
    
    // Enemy approaches
    const startPos = currentEnemy.position.clone();
    const targetPos = player.position.clone();
    targetPos.y = 0;
    targetPos.z += 3;
    
    let progress = 0;
    const animate = () => {
        if (progress < 1) {
            progress += 0.05;
            currentEnemy.position.lerpVectors(startPos, targetPos, progress);
            currentEnemy.rotation.y = Math.atan2(
                player.position.x - currentEnemy.position.x,
                player.position.z - currentEnemy.position.z
            );
            requestAnimationFrame(animate);
        }
    };
    animate();
}

function attackEnemy() {
    if (battleState.turn !== 'player' || battleState.attackAnimation) return;
    
    battleState.attackAnimation = true;
    
    // Attack animation
    const originalPos = player.position.clone();
    const attackPos = originalPos.clone();
    attackPos.z -= 1;
    
    let progress = 0;
    const animate = () => {
        if (progress < 1) {
            progress += 0.2;
            if (progress < 0.5) {
                player.position.lerpVectors(originalPos, attackPos, progress * 2);
            } else {
                player.position.lerpVectors(attackPos, originalPos, (progress - 0.5) * 2);
            }
            requestAnimationFrame(animate);
        } else {
            battleState.attackAnimation = false;
            
            const baseAttack = playerStats.attack;
            const weaponBonus = equipment.weapon ? equipment.weapon.attack : 0;
            const damage = Math.max(1, baseAttack + weaponBonus - battleState.enemy.userData.defense + Math.floor(Math.random() * 5));
            
            battleState.enemyHp = Math.max(0, battleState.enemyHp - damage);
            addBattleLog(`You attack for ${damage} damage!`);
            
            if (battleState.enemyHp <= 0) {
                winBattle();
            } else {
                battleState.turn = 'enemy';
                setTimeout(enemyTurn, 1000);
            }
            
            updateBattleUI();
        }
    };
    animate();
}

function defend() {
    if (battleState.turn !== 'player') return;
    
    battleState.defending = true;
    addBattleLog('You defend!');
    battleState.turn = 'enemy';
    setTimeout(enemyTurn, 1000);
    updateBattleUI();
}

function useItemInBattle() {
    const potion = inventory.find(item => item.id === 'healthPotion');
    if (potion) {
        const healAmount = 30;
        battleState.playerHp = Math.min(playerStats.maxHp, battleState.playerHp + healAmount);
        playerStats.hp = battleState.playerHp;
        removeFromInventory('healthPotion');
        addBattleLog(`You use Health Potion! +${healAmount} HP`);
        updateBattleUI();
        updateStats();
    } else {
        addBattleLog('No items available!');
    }
}

function flee() {
    addBattleLog('You fled from battle!');
    endBattle();
}

function enemyTurn() {
    if (battleState.enemyHp <= 0) return;
    
    // Enemy attack animation
    const enemy = battleState.enemy;
    const originalPos = enemy.position.clone();
    const attackPos = originalPos.clone();
    attackPos.z -= 0.5;
    
    let progress = 0;
    const animate = () => {
        if (progress < 1) {
            progress += 0.2;
            if (progress < 0.5) {
                enemy.position.lerpVectors(originalPos, attackPos, progress * 2);
            } else {
                enemy.position.lerpVectors(attackPos, originalPos, (progress - 0.5) * 2);
            }
            requestAnimationFrame(animate);
        } else {
            const damage = Math.max(1, battleState.enemy.userData.attack - (battleState.defending ? playerStats.defense * 2 : playerStats.defense) + Math.floor(Math.random() * 3));
            battleState.playerHp = Math.max(0, battleState.playerHp - damage);
            playerStats.hp = battleState.playerHp;
            battleState.defending = false;
            
            addBattleLog(`${battleState.enemy.userData.name} attacks for ${damage} damage!`);
            
            if (battleState.playerHp <= 0) {
                gameOver();
            } else {
                battleState.turn = 'player';
            }
            
            updateBattleUI();
            updateStats();
        }
    };
    animate();
}

function winBattle() {
    const enemy = battleState.enemy;
    const xpGain = enemy.userData.xp;
    const goldGain = enemy.userData.gold;
    
    playerStats.xp += xpGain;
    playerStats.gold += goldGain;
    playerStats.kills++;
    
    addBattleLog(`Victory! Gained ${xpGain} XP and ${goldGain} gold!`);
    
    // Death animation
    let scale = 1;
    const shrink = setInterval(() => {
        scale -= 0.05;
        enemy.scale.set(scale, scale, scale);
        if (scale <= 0) {
            clearInterval(shrink);
            scene.remove(enemy);
            enemies = enemies.filter(e => e !== enemy);
        }
    }, 50);
    
    checkLevelUp();
    updateQuest('First Hunt', 1);
    
    setTimeout(() => {
        endBattle();
        showNotification(`+${xpGain} XP, +${goldGain} Gold!`);
    }, 2000);
}

function endBattle() {
    gameState = 'playing';
    battleScreen.classList.add('hidden');
    battleState = null;
    currentEnemy = null;
    
    if (enemies.length < 5) {
        createRealisticEnemies();
    }
}

function updateBattleUI() {
    if (!battleState) return;
    
    document.getElementById('enemyName').textContent = battleState.enemy.userData.name;
    document.getElementById('enemyHp').textContent = `HP: ${Math.floor(battleState.enemyHp)}/${battleState.enemy.userData.maxHp}`;
    document.getElementById('battlePlayerHp').textContent = `${Math.floor(battleState.playerHp)}/${playerStats.maxHp}`;
}

function addBattleLog(text) {
    const log = document.getElementById('battleLog');
    log.innerHTML += `<p>${text}</p>`;
    log.scrollTop = log.scrollHeight;
}

// Level system
function checkLevelUp() {
    if (playerStats.xp >= playerStats.xpToNext) {
        playerStats.level++;
        playerStats.xp -= playerStats.xpToNext;
        playerStats.xpToNext = Math.floor(playerStats.xpToNext * 1.5);
        playerStats.maxHp += 20;
        playerStats.hp = playerStats.maxHp;
        playerStats.maxStamina += 10;
        playerStats.stamina = playerStats.maxStamina;
        playerStats.attack += 3;
        playerStats.defense += 2;
        
        showNotification(`Level Up! You are now level ${playerStats.level}!`);
        updateQuest('Level Up', playerStats.level);
        updateStats();
    }
}

// Inventory system
function collectItem(item) {
    const itemId = item.userData.itemId;
    if (itemId) {
        addToInventory(itemId);
        scene.remove(item);
        showNotification(`Collected ${itemDatabase[itemId].name}!`);
        updateQuest('Gather Resources', 1);
    }
}

function addToInventory(itemId) {
    const item = { ...itemDatabase[itemId], id: itemId };
    inventory.push(item);
    updateInventoryUI();
}

function removeFromInventory(itemId) {
    const index = inventory.findIndex(item => item.id === itemId);
    if (index !== -1) {
        inventory.splice(index, 1);
        updateInventoryUI();
    }
}

function updateInventoryUI() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    
    inventory.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `${item.icon || '📦'} ${item.name}`;
        slot.addEventListener('click', () => useItem(item));
        grid.appendChild(slot);
    });
    
    document.getElementById('equippedWeapon').textContent = equipment.weapon ? equipment.weapon.name : 'None';
    document.getElementById('equippedArmor').textContent = equipment.armor ? equipment.armor.name : 'None';
    document.getElementById('equippedAccessory').textContent = equipment.accessory ? equipment.accessory.name : 'None';
}

function useItem(item) {
    if (item.type === 'consumable') {
        if (item.effect === 'heal') {
            playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + item.value);
            removeFromInventory(item.id);
            showNotification(`Used ${item.name}! +${item.value} HP`);
            updateStats();
        } else if (item.effect === 'stamina') {
            playerStats.stamina = Math.min(playerStats.maxStamina, playerStats.stamina + item.value);
            removeFromInventory(item.id);
            showNotification(`Used ${item.name}! +${item.value} Stamina`);
            updateStats();
        }
    } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
        const slot = item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : 'accessory';
        if (equipment[slot]) {
            addToInventory(equipment[slot].id);
        }
        equipment[slot] = item;
        removeFromInventory(item.id);
        showNotification(`Equipped ${item.name}!`);
        updateStats();
    }
}

// Quest system
function updateQuest(questName, amount) {
    const quest = quests.find(q => q.name === questName);
    if (quest && !quest.completed) {
        quest.current += amount;
        if (quest.current >= quest.target) {
            completeQuest(quest);
        }
    }
}

function completeQuest(quest) {
    quest.completed = true;
    playerStats.gold += quest.reward.gold;
    playerStats.xp += quest.reward.xp;
    playerStats.questsCompleted++;
    showNotification(`Quest completed: ${quest.name}! +${quest.reward.xp} XP, +${quest.reward.gold} Gold`);
    checkLevelUp();
    updateStats();
    updateQuestUI();
}

function updateQuestUI() {
    const content = document.getElementById('questContent');
    content.innerHTML = '';
    
    quests.forEach(quest => {
        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item';
        questDiv.innerHTML = `
            <h3>${quest.name} ${quest.completed ? '✅' : ''}</h3>
            <p>${quest.desc}</p>
            <p>Progress: ${quest.current}/${quest.target}</p>
            <p>Reward: ${quest.reward.gold} Gold, ${quest.reward.xp} XP</p>
        `;
        content.appendChild(questDiv);
    });
}

// Shop system
function openShop() {
    shopScreen.classList.remove('hidden');
    document.getElementById('shopGold').textContent = playerStats.gold;
    updateShopUI();
}

function closeShop() {
    shopScreen.classList.add('hidden');
}

function updateShopUI() {
    const shopItemsDiv = document.getElementById('shopItems');
    shopItemsDiv.innerHTML = '';
    
    shopItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.innerHTML = `
            <div class="shop-item-info">
                <h3>${item.icon || '📦'} ${item.name}</h3>
                <p>${item.type === 'weapon' ? `Attack: +${item.attack}` : item.type === 'armor' ? `Defense: +${item.defense}` : item.type === 'accessory' ? `Attack: +${item.attack}, Defense: +${item.defense}` : item.effect === 'heal' ? 'Heals 30 HP' : 'Restores 50 Stamina'}</p>
                <p>Price: ${item.price} Gold</p>
            </div>
            <button class="buy-btn" data-item="${item.id}">Buy</button>
        `;
        shopItemsDiv.appendChild(itemDiv);
    });
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.item;
            buyItem(itemId);
        });
    });
}

function buyItem(itemId) {
    const item = itemDatabase[itemId];
    if (!item) return;
    
    if (playerStats.gold >= item.price) {
        playerStats.gold -= item.price;
        addToInventory(itemId);
        showNotification(`Bought ${item.name}!`);
        updateShopUI();
        updateStats();
    } else {
        showNotification('Not enough gold!');
    }
}

// UI functions
function toggleInventory() {
    if (inventoryScreen.classList.contains('hidden')) {
        inventoryScreen.classList.remove('hidden');
        updateInventoryUI();
    } else {
        inventoryScreen.classList.add('hidden');
    }
}

function toggleQuests() {
    if (questScreen.classList.contains('hidden')) {
        questScreen.classList.remove('hidden');
        updateQuestUI();
    } else {
        questScreen.classList.add('hidden');
    }
}

function attack() {
    if (gameState === 'battle') {
        attackEnemy();
    }
}

function showNotification(text) {
    notification.textContent = text;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function updateStats() {
    const totalAttack = playerStats.attack + (equipment.weapon ? equipment.weapon.attack : 0) + (equipment.accessory ? equipment.accessory.attack : 0);
    const totalDefense = playerStats.defense + (equipment.armor ? equipment.armor.defense : 0) + (equipment.accessory ? equipment.accessory.defense : 0);
    
    levelElement.textContent = playerStats.level;
    hpElement.textContent = `${Math.floor(playerStats.hp)}/${playerStats.maxHp}`;
    xpElement.textContent = `${Math.floor(playerStats.xp)}/${playerStats.xpToNext}`;
    goldElement.textContent = playerStats.gold;
    attackElement.textContent = totalAttack;
    defenseElement.textContent = totalDefense;
    staminaElement.textContent = `${Math.floor(playerStats.stamina)}/${playerStats.maxStamina}`;
}

// Game functions
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalLevel').textContent = playerStats.level;
    document.getElementById('finalGold').textContent = playerStats.gold;
    document.getElementById('finalKills').textContent = playerStats.kills;
    document.getElementById('finalQuests').textContent = playerStats.questsCompleted;
    gameOverScreen.classList.remove('hidden');
    battleScreen.classList.add('hidden');
}

function resetGame() {
    gameState = 'playing';
    playerStats = {
        level: 1,
        xp: 0,
        xpToNext: 100,
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        gold: 50,
        kills: 0,
        questsCompleted: 0,
        stamina: 100,
        maxStamina: 100
    };
    playerAnimation = { state: 'idle', time: 0, speed: 0 };
    inventory = [];
    equipment = { weapon: null, armor: null, accessory: null };
    quests = [
        { id: 1, name: 'First Hunt', desc: 'Defeat 3 enemies', target: 3, current: 0, reward: { gold: 50, xp: 50 }, completed: false },
        { id: 2, name: 'Gather Resources', desc: 'Collect 5 items', target: 5, current: 0, reward: { gold: 30, xp: 30 }, completed: false },
        { id: 3, name: 'Level Up', desc: 'Reach level 3', target: 3, current: 1, reward: { gold: 100, xp: 100 }, completed: false }
    ];
    timeOfDay = 0.5;
    clouds = [];
    
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    enemies = [];
    clock = new THREE.Clock();
    
    initScene();
    
    updateStats();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    inventoryScreen.classList.add('hidden');
    questScreen.classList.add('hidden');
    shopScreen.classList.add('hidden');
    battleScreen.classList.add('hidden');
}

function onWindowResize() {
    const container = document.getElementById('gameContainer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (gameState === 'playing') {
        updatePlayer();
        updateEnemies();
        updateEnvironment();
    }
    
    renderer.render(scene, camera);
}

// Event listeners
startBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);
menuBtn.addEventListener('click', () => {
    gameState = 'start';
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

document.getElementById('closeInventoryBtn').addEventListener('click', () => inventoryScreen.classList.add('hidden'));
document.getElementById('closeQuestBtn').addEventListener('click', () => questScreen.classList.add('hidden'));
document.getElementById('closeShopBtn').addEventListener('click', closeShop);

document.getElementById('attackBtn').addEventListener('click', attackEnemy);
document.getElementById('defendBtn').addEventListener('click', defend);
document.getElementById('itemBtn').addEventListener('click', useItemInBattle);
document.getElementById('fleeBtn').addEventListener('click', flee);

document.getElementById('attackBtn2').addEventListener('click', attack);
document.getElementById('inventoryBtn').addEventListener('click', toggleInventory);
document.getElementById('questBtn').addEventListener('click', toggleQuests);
document.getElementById('shopBtn').addEventListener('click', openShop);

// Initialize
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let keys = {};

initScene();
animate();
updateStats();
