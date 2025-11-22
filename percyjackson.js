// Percy Jackson 3D Adventure
let scene, camera, renderer, player;
let gameState = 'start';
let clock = new THREE.Clock();
let controls = { moveForward: false, moveBackward: false, moveLeft: false, moveRight: false };
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let PI_2 = Math.PI / 2;
let isPointerLocked = false;

// Player stats
let playerStats = {
    level: 1,
    xp: 0,
    xpToNext: 100,
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 10,
    kills: 0,
    questsCompleted: 0,
    waterPower: 100,
    maxWaterPower: 100,
    riptideCooldown: 0
};

// Quests
let quests = [
    { id: 1, name: 'Defeat Minotaur', desc: 'Defeat 3 monsters', target: 3, current: 0, reward: { xp: 100, gold: 50 }, completed: false },
    { id: 2, name: 'Water Mastery', desc: 'Use water powers 10 times', target: 10, current: 0, reward: { xp: 80, waterPower: 20 }, completed: false },
    { id: 3, name: 'Hero\'s Journey', desc: 'Reach level 3', target: 3, current: 1, reward: { xp: 150, attack: 5 }, completed: false }
];

// Enemies
let enemies = [];
let waterEffects = [];
let particles = [];

// UI Elements
const levelElement = document.getElementById('level');
const hpElement = document.getElementById('hp');
const xpElement = document.getElementById('xp');
const killsElement = document.getElementById('kills');
const questsElement = document.getElementById('quests');
const waterPowerElement = document.getElementById('waterPower');
const riptideElement = document.getElementById('riptide');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Initialize Three.js scene
function initScene() {
    const container = document.getElementById('gameContainer');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 200);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Create environment
    createGround();
    createPlayer();
    createEnemies();
    createStructures();
    createWater();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', () => {
        renderer.domElement.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', onPointerLockChange);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    
    updateUI();
}

// Create ground
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4a7c3f });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add some grass patches
    for (let i = 0; i < 50; i++) {
        const grass = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.1, 0.5),
            new THREE.MeshLambertMaterial({ color: 0x228b22 })
        );
        grass.position.set(
            (Math.random() - 0.5) * 180,
            0.05,
            (Math.random() - 0.5) * 180
        );
        scene.add(grass);
    }
}

// Create player (Percy)
function createPlayer() {
    const playerGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0066ff });
    const body = new THREE.Mesh(bodyGeometry, playerMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    playerGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const head = new THREE.Mesh(headGeometry, playerMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    playerGroup.add(head);
    
    player = playerGroup;
    player.position.set(0, 1, 0);
    scene.add(player);
    
    // Add sword (Riptide)
    const swordGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const swordMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const sword = new THREE.Mesh(swordGeometry, swordMaterial);
    sword.position.set(0.5, 0.5, 0);
    sword.rotation.z = Math.PI / 4;
    player.add(sword);
}

// Create enemies (monsters)
function createEnemies() {
    const enemyTypes = [
        { color: 0x8B4513, name: 'Minotaur', size: 1.5 },
        { color: 0x800080, name: 'Cyclops', size: 1.3 },
        { color: 0xFF0000, name: 'Hellhound', size: 1.0 }
    ];
    
    for (let i = 0; i < 10; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemyGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, type.size, 8);
        const enemyMaterial = new THREE.MeshLambertMaterial({ color: type.color });
        const body = new THREE.Mesh(bodyGeometry, enemyMaterial);
        body.position.y = type.size / 2;
        body.castShadow = true;
        enemyGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const head = new THREE.Mesh(headGeometry, enemyMaterial);
        head.position.y = type.size + 0.25;
        head.castShadow = true;
        enemyGroup.add(head);
        
        enemyGroup.position.set(
            (Math.random() - 0.5) * 150,
            type.size / 2,
            (Math.random() - 0.5) * 150
        );
        enemyGroup.userData = {
            type: type.name,
            hp: 30 + Math.random() * 20,
            maxHp: 30 + Math.random() * 20,
            speed: 0.02 + Math.random() * 0.02,
            attackCooldown: 0
        };
        enemies.push(enemyGroup);
        scene.add(enemyGroup);
    }
}

// Create structures (Greek temple, etc.)
function createStructures() {
    // Temple
    const templeGeometry = new THREE.BoxGeometry(10, 8, 10);
    const templeMaterial = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
    const temple = new THREE.Mesh(templeGeometry, templeMaterial);
    temple.position.set(-30, 4, -30);
    temple.castShadow = true;
    temple.receiveShadow = true;
    scene.add(temple);
    
    // Columns
    for (let i = 0; i < 4; i++) {
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0xd4a574 })
        );
        column.position.set(
            -30 + (i % 2) * 8,
            4,
            -30 + Math.floor(i / 2) * 8
        );
        column.castShadow = true;
        scene.add(column);
    }
    
    // Rocks
    for (let i = 0; i < 20; i++) {
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.5 + Math.random() * 1, 0),
            new THREE.MeshLambertMaterial({ color: 0x696969 })
        );
        rock.position.set(
            (Math.random() - 0.5) * 180,
            0.5,
            (Math.random() - 0.5) * 180
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        scene.add(rock);
    }
}

// Create water features
function createWater() {
    // Water pool
    const waterGeometry = new THREE.PlaneGeometry(15, 15);
    const waterMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x0066ff,
        transparent: true,
        opacity: 0.7
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(20, 0.1, 20);
    scene.add(water);
}

// Update enemies
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        if (!enemy.userData) return;
        
        // Move towards player
        const dx = player.position.x - enemy.position.x;
        const dz = player.position.z - enemy.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 0.5 && dist < 50) {
            enemy.position.x += (dx / dist) * enemy.userData.speed;
            enemy.position.z += (dz / dist) * enemy.userData.speed;
            // Face player
            const angle = Math.atan2(dx, dz);
            enemy.rotation.y = angle;
        }
        
        // Attack player if close
        if (dist < 2 && enemy.userData.attackCooldown <= 0) {
            playerStats.hp -= 5;
            enemy.userData.attackCooldown = 60;
            updateUI();
            
            if (playerStats.hp <= 0) {
                gameOver();
            }
        }
        
        if (enemy.userData.attackCooldown > 0) {
            enemy.userData.attackCooldown--;
        }
        
        // Remove if dead
        if (enemy.userData.hp <= 0) {
            scene.remove(enemy);
            enemies.splice(index, 1);
            playerStats.kills++;
            playerStats.xp += 20;
            checkLevelUp();
            updateUI();
            
            // Spawn new enemy
            if (enemies.length < 10) {
                createEnemies();
            }
        }
    });
}

// Water power attack
function useWaterPower() {
    if (playerStats.waterPower < 10) return;
    
    playerStats.waterPower -= 10;
    quests[1].current++;
    updateUI();
    
    // Create water blast
    const waterBlast = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 })
    );
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    waterBlast.position.copy(player.position);
    waterBlast.position.y += 1;
    
    waterBlast.userData = {
        velocity: direction.multiplyScalar(0.3),
        lifetime: 60
    };
    
    waterEffects.push(waterBlast);
    scene.add(waterBlast);
    
    // Damage nearby enemies
    enemies.forEach(enemy => {
        const dx = enemy.position.x - player.position.x;
        const dz = enemy.position.z - player.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 5) {
            enemy.userData.hp -= 15;
        }
    });
}

// Riptide attack
function useRiptide() {
    if (playerStats.riptideCooldown > 0) return;
    
    playerStats.riptideCooldown = 120;
    updateUI();
    
    // Damage all nearby enemies
    enemies.forEach(enemy => {
        const dx = enemy.position.x - player.position.x;
        const dz = enemy.position.z - player.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 8) {
            enemy.userData.hp -= 25;
        }
    });
}

// Update water effects
function updateWaterEffects() {
    waterEffects.forEach((effect, index) => {
        effect.position.add(effect.userData.velocity);
        effect.userData.lifetime--;
        
        // Check collision with enemies
        enemies.forEach(enemy => {
            const dx = effect.position.x - enemy.position.x;
            const dy = effect.position.y - enemy.position.y;
            const dz = effect.position.z - enemy.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < 1) {
                enemy.userData.hp -= 10;
            }
        });
        
        if (effect.userData.lifetime <= 0 || effect.position.y < 0) {
            scene.remove(effect);
            waterEffects.splice(index, 1);
        }
    });
}

// Check level up
function checkLevelUp() {
    if (playerStats.xp >= playerStats.xpToNext) {
        playerStats.level++;
        playerStats.xp -= playerStats.xpToNext;
        playerStats.xpToNext = Math.floor(playerStats.xpToNext * 1.5);
        playerStats.maxHp += 20;
        playerStats.hp = playerStats.maxHp;
        playerStats.attack += 3;
        
        quests[2].current = playerStats.level;
        checkQuests();
        updateUI();
    }
}

// Check quests
function checkQuests() {
    quests.forEach(quest => {
        if (!quest.completed) {
            if (quest.current >= quest.target) {
                quest.completed = true;
                playerStats.questsCompleted++;
                playerStats.xp += quest.reward.xp;
                if (quest.reward.waterPower) {
                    playerStats.maxWaterPower += quest.reward.waterPower;
                    playerStats.waterPower = playerStats.maxWaterPower;
                }
                if (quest.reward.attack) {
                    playerStats.attack += quest.reward.attack;
                }
                checkLevelUp();
                updateUI();
            }
        }
    });
}

// Update UI
function updateUI() {
    levelElement.textContent = playerStats.level;
    hpElement.textContent = `${Math.max(0, Math.floor(playerStats.hp))}/${playerStats.maxHp}`;
    xpElement.textContent = `${Math.floor(playerStats.xp)}/${playerStats.xpToNext}`;
    killsElement.textContent = playerStats.kills;
    questsElement.textContent = `${playerStats.questsCompleted}/3`;
    waterPowerElement.textContent = `${Math.floor((playerStats.waterPower / playerStats.maxWaterPower) * 100)}%`;
    riptideElement.textContent = playerStats.riptideCooldown > 0 ? `${Math.ceil(playerStats.riptideCooldown / 60)}s` : 'Yes';
    
    // Regenerate water power
    if (playerStats.waterPower < playerStats.maxWaterPower) {
        playerStats.waterPower = Math.min(playerStats.maxWaterPower, playerStats.waterPower + 0.1);
    }
    
    if (playerStats.riptideCooldown > 0) {
        playerStats.riptideCooldown--;
    }
}

// Game loop
function animate() {
    if (gameState !== 'playing') return;
    
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    // Update player movement
    const speed = 0.1;
    if (controls.moveForward) {
        player.position.x -= Math.sin(euler.y) * speed;
        player.position.z -= Math.cos(euler.y) * speed;
    }
    if (controls.moveBackward) {
        player.position.x += Math.sin(euler.y) * speed;
        player.position.z += Math.cos(euler.y) * speed;
    }
    if (controls.moveLeft) {
        player.position.x -= Math.cos(euler.y) * speed;
        player.position.z += Math.sin(euler.y) * speed;
    }
    if (controls.moveRight) {
        player.position.x += Math.cos(euler.y) * speed;
        player.position.z -= Math.sin(euler.y) * speed;
    }
    
    // Keep player on ground
    player.position.y = 1.5;
    
    // Update camera to follow player
    const cameraOffset = new THREE.Vector3(
        Math.sin(euler.y) * 3,
        2,
        Math.cos(euler.y) * 3
    );
    camera.position.copy(player.position).add(cameraOffset);
    camera.lookAt(player.position);
    
    // Update enemies
    updateEnemies();
    updateWaterEffects();
    updateUI();
    
    renderer.render(scene, camera);
}

// Event handlers
function onKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case 'w': controls.moveForward = true; break;
        case 's': controls.moveBackward = true; break;
        case 'a': controls.moveLeft = true; break;
        case 'd': controls.moveRight = true; break;
        case ' ': // Space for jump (future feature)
            break;
    }
}

function onKeyUp(event) {
    switch (event.key.toLowerCase()) {
        case 'w': controls.moveForward = false; break;
        case 's': controls.moveBackward = false; break;
        case 'a': controls.moveLeft = false; break;
        case 'd': controls.moveRight = false; break;
    }
}

function onMouseMove(event) {
    if (!isPointerLocked) return;
    
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    
    camera.quaternion.setFromEuler(euler);
}

function onMouseDown(event) {
    if (!isPointerLocked) return;
    
    if (event.button === 0) { // Left click - Riptide
        useRiptide();
    } else if (event.button === 2) { // Right click - Water power
        useWaterPower();
    }
}

function onPointerLockChange() {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
}

function onWindowResize() {
    const container = document.getElementById('gameContainer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function startGame() {
    gameState = 'playing';
    startScreen.classList.add('hidden');
    renderer.domElement.requestPointerLock();
    animate();
}

function gameOver() {
    gameState = 'over';
    document.getElementById('finalKills').textContent = playerStats.kills;
    document.getElementById('finalQuests').textContent = playerStats.questsCompleted;
    document.getElementById('finalLevel').textContent = playerStats.level;
    gameOverScreen.classList.remove('hidden');
    document.exitPointerLock();
}

function resetGame() {
    // Reset stats
    playerStats = {
        level: 1,
        xp: 0,
        xpToNext: 100,
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 10,
        kills: 0,
        questsCompleted: 0,
        waterPower: 100,
        maxWaterPower: 100,
        riptideCooldown: 0
    };
    
    // Reset quests
    quests.forEach(quest => {
        quest.current = quest.id === 3 ? 1 : 0;
        quest.completed = false;
    });
    
    // Clear enemies and effects
    enemies.forEach(enemy => scene.remove(enemy));
    enemies = [];
    waterEffects.forEach(effect => scene.remove(effect));
    waterEffects = [];
    
    // Reset player position
    player.position.set(0, 1.5, 0);
    
    // Create new enemies
    createEnemies();
    
    gameOverScreen.classList.add('hidden');
    startGame();
}

// Initialize
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
initScene();

