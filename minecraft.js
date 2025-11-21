// Minecraft Clone
let scene, camera, renderer, controls;
let gameState = 'start';
let clock = new THREE.Clock();

// World
const WORLD_SIZE = 50;
const CHUNK_SIZE = 16;
let world = {};
let chunks = {};

// Player
let player = {
    position: new THREE.Vector3(0, 20, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    onGround: false,
    health: 20,
    maxHealth: 20,
    hunger: 20,
    maxHunger: 20,
    speed: 0.1,
    jumpPower: 0.15,
    gravity: -0.02,
    selectedSlot: 0
};

// Camera
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let PI_2 = Math.PI / 2;

// Input
let keys = {};
let mouse = { x: 0, y: 0 };
let isPointerLocked = false;

// Stats
let stats = {
    blocksPlaced: 0,
    blocksBroken: 0,
    startTime: Date.now()
};

// Block types
const BLOCKS = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    SAND: 6,
    GRAVEL: 7,
    COBBLESTONE: 8,
    PLANKS: 9,
    GLASS: 10,
    COAL_ORE: 11,
    IRON_ORE: 12,
    GOLD_ORE: 13,
    DIAMOND_ORE: 14,
    BEDROCK: 15
};

// Block colors
const BLOCK_COLORS = {
    [BLOCKS.GRASS]: 0x7cba3d,
    [BLOCKS.DIRT]: 0x8b6f47,
    [BLOCKS.STONE]: 0x808080,
    [BLOCKS.WOOD]: 0x8b4513,
    [BLOCKS.LEAVES]: 0x228b22,
    [BLOCKS.SAND]: 0xf4e4bc,
    [BLOCKS.GRAVEL]: 0x808080,
    [BLOCKS.COBBLESTONE]: 0x696969,
    [BLOCKS.PLANKS]: 0xdeb887,
    [BLOCKS.GLASS]: 0x87ceeb,
    [BLOCKS.COAL_ORE]: 0x2f2f2f,
    [BLOCKS.IRON_ORE]: 0xd8d8d8,
    [BLOCKS.GOLD_ORE]: 0xffd700,
    [BLOCKS.DIAMOND_ORE]: 0x00ffff,
    [BLOCKS.BEDROCK]: 0x1a1a1a
};

// Inventory
let inventory = {
    hotbar: Array(9).fill(null),
    items: Array(27).fill(null)
};

// Crafting recipes
const RECIPES = [
    { result: { type: BLOCKS.PLANKS, count: 4 }, ingredients: [{ type: BLOCKS.WOOD, count: 1 }] },
    { result: { type: BLOCKS.COBBLESTONE, count: 1 }, ingredients: [{ type: BLOCKS.STONE, count: 1 }] }
];

// Initialize
function init() {
    const container = document.getElementById('gameContainer');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 200);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.copy(player.position);
    camera.position.y += 1.6; // Eye height
    
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
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // Generate world
    generateWorld();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('click', () => {
        renderer.domElement.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Initialize inventory
    addToInventory(BLOCKS.GRASS, 64);
    addToInventory(BLOCKS.DIRT, 64);
    addToInventory(BLOCKS.STONE, 64);
    addToInventory(BLOCKS.WOOD, 64);
    addToInventory(BLOCKS.SAND, 64);
    updateHotbar();
    updateInventoryUI();
    
    // Start game loop
    animate();
}

// World generation
function generateWorld() {
    for (let x = -WORLD_SIZE; x < WORLD_SIZE; x += CHUNK_SIZE) {
        for (let z = -WORLD_SIZE; z < WORLD_SIZE; z += CHUNK_SIZE) {
            generateChunk(x, z);
        }
    }
}

function generateChunk(chunkX, chunkZ) {
    const chunkKey = `${chunkX},${chunkZ}`;
    const chunk = { blocks: {}, mesh: null };
    
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
            const worldX = chunkX + x;
            const worldZ = chunkZ + z;
            
            // Simple terrain generation
            const height = Math.floor(15 + Math.sin(worldX * 0.1) * 3 + Math.cos(worldZ * 0.1) * 3);
            
            for (let y = 0; y <= height; y++) {
                let blockType = BLOCKS.AIR;
                
                if (y === 0) {
                    blockType = BLOCKS.BEDROCK;
                } else if (y < height - 3) {
                    blockType = BLOCKS.STONE;
                } else if (y < height - 1) {
                    blockType = BLOCKS.DIRT;
                } else if (y === height - 1) {
                    blockType = BLOCKS.GRASS;
                } else {
                    blockType = BLOCKS.AIR;
                }
                
                // Add some trees
                if (y === height && Math.random() < 0.02) {
                    generateTree(worldX, y + 1, worldZ);
                }
                
                // Add ores
                if (y < height - 5 && Math.random() < 0.05) {
                    if (y < 5) {
                        blockType = BLOCKS.DIAMOND_ORE;
                    } else if (y < 10) {
                        blockType = Math.random() < 0.5 ? BLOCKS.GOLD_ORE : BLOCKS.IRON_ORE;
                    } else {
                        blockType = BLOCKS.COAL_ORE;
                    }
                }
                
                setBlock(worldX, y, worldZ, blockType);
            }
        }
    }
    
    chunks[chunkKey] = chunk;
    updateChunkMesh(chunkX, chunkZ);
}

function generateTree(x, y, z) {
    // Trunk
    for (let i = 0; i < 4; i++) {
        setBlock(x, y + i, z, BLOCKS.WOOD);
    }
    
    // Leaves
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            for (let dy = 3; dy <= 5; dy++) {
                if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy - 4) < 4) {
                    setBlock(x + dx, y + dy, z + dz, BLOCKS.LEAVES);
                }
            }
        }
    }
}

function setBlock(x, y, z, type) {
    const key = `${x},${y},${z}`;
    if (type === BLOCKS.AIR) {
        delete world[key];
    } else {
        world[key] = type;
    }
    
    // Update chunk
    const chunkX = Math.floor(x / CHUNK_SIZE) * CHUNK_SIZE;
    const chunkZ = Math.floor(z / CHUNK_SIZE) * CHUNK_SIZE;
    updateChunkMesh(chunkX, chunkZ);
}

function getBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    return world[key] || BLOCKS.AIR;
}

function updateChunkMesh(chunkX, chunkZ) {
    const chunkKey = `${chunkX},${chunkZ}`;
    const chunk = chunks[chunkKey];
    
    if (!chunk) return;
    
    // Remove old mesh
    if (chunk.mesh) {
        scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        chunk.mesh.material.dispose();
    }
    
    // Create new geometry
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const indices = [];
    let vertexOffset = 0;
    
    for (let x = chunkX; x < chunkX + CHUNK_SIZE; x++) {
        for (let z = chunkZ; z < chunkZ + CHUNK_SIZE; z++) {
            for (let y = 0; y < 64; y++) {
                const blockType = getBlock(x, y, z);
                if (blockType === BLOCKS.AIR) continue;
                
                const color = new THREE.Color(BLOCK_COLORS[blockType] || 0xffffff);
                
                // Check each face
                const faces = [
                    { dir: [0, 1, 0], corners: [[0,1,1], [1,1,1], [1,1,0], [0,1,0]] }, // Top
                    { dir: [0, -1, 0], corners: [[0,0,0], [1,0,0], [1,0,1], [0,0,1]] }, // Bottom
                    { dir: [0, 0, 1], corners: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]] }, // Front
                    { dir: [0, 0, -1], corners: [[1,0,0], [0,0,0], [0,1,0], [1,1,0]] }, // Back
                    { dir: [1, 0, 0], corners: [[1,0,0], [1,1,0], [1,1,1], [1,0,1]] }, // Right
                    { dir: [-1, 0, 0], corners: [[0,0,1], [0,1,1], [0,1,0], [0,0,0]] }  // Left
                ];
                
                faces.forEach(face => {
                    const neighborX = x + face.dir[0];
                    const neighborY = y + face.dir[1];
                    const neighborZ = z + face.dir[2];
                    const neighbor = getBlock(neighborX, neighborY, neighborZ);
                    
                    if (neighbor === BLOCKS.AIR || neighbor === BLOCKS.GLASS) {
                        face.corners.forEach(corner => {
                            positions.push(x + corner[0], y + corner[1], z + corner[2]);
                            colors.push(color.r, color.g, color.b);
                        });
                        
                        const base = vertexOffset;
                        indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
                        vertexOffset += 4;
                    }
                });
            }
        }
    }
    
    if (positions.length > 0) {
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshLambertMaterial({ 
            vertexColors: true,
            side: THREE.FrontSide
        });
        
        chunk.mesh = new THREE.Mesh(geometry, material);
        chunk.mesh.castShadow = true;
        chunk.mesh.receiveShadow = true;
        scene.add(chunk.mesh);
    }
}

// Raycasting
function raycast() {
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    raycaster.set(camera.position, direction);
    
    // Check blocks
    const maxDistance = 5;
    const step = 0.1;
    let distance = 0;
    
    while (distance < maxDistance) {
        const point = camera.position.clone().add(direction.clone().multiplyScalar(distance));
        const blockX = Math.floor(point.x);
        const blockY = Math.floor(point.y);
        const blockZ = Math.floor(point.z);
        
        const block = getBlock(blockX, blockY, blockZ);
        if (block !== BLOCKS.AIR) {
            return {
                block: block,
                position: new THREE.Vector3(blockX, blockY, blockZ),
                distance: distance
            };
        }
        
        distance += step;
    }
    
    return null;
}

// Input handling
function onKeyDown(e) {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === 'e' && gameState === 'playing') {
        toggleInventory();
    }
    if (e.key === 'c' && gameState === 'playing') {
        toggleCrafting();
    }
    
    // Hotbar selection
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
        player.selectedSlot = num - 1;
        updateHotbar();
    }
}

function onKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
}

function onMouseMove(e) {
    if (!isPointerLocked) return;
    
    const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    camera.quaternion.setFromEuler(euler);
}

function onMouseClick(e) {
    if (gameState !== 'playing' || !isPointerLocked) return;
    
    const hit = raycast();
    if (!hit) return;
    
    if (e.button === 0) {
        // Left click - break block
        setBlock(hit.position.x, hit.position.y, hit.position.z, BLOCKS.AIR);
        const blockType = hit.block;
        if (blockType !== BLOCKS.AIR) {
            addToInventory(blockType, 1);
            stats.blocksBroken++;
            updateHotbar();
            updateInventoryUI();
        }
    } else if (e.button === 2) {
        // Right click - place block
        const selectedItem = inventory.hotbar[player.selectedSlot];
        if (selectedItem) {
            // Place block in front of hit position
            const placePos = hit.position.clone();
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            placePos.add(direction.multiplyScalar(0.5));
            
            const placeX = Math.floor(placePos.x);
            const placeY = Math.floor(placePos.y);
            const placeZ = Math.floor(placePos.z);
            
            // Check if position is valid (not inside player)
            const playerBlockX = Math.floor(player.position.x);
            const playerBlockY = Math.floor(player.position.y);
            const playerBlockZ = Math.floor(player.position.z);
            
            if (!(placeX === playerBlockX && placeY === playerBlockY && placeZ === playerBlockZ) &&
                !(placeX === playerBlockX && placeY === playerBlockY + 1 && placeZ === playerBlockZ)) {
                setBlock(placeX, placeY, placeZ, selectedItem.type);
                removeFromInventory(selectedItem.type, 1);
                stats.blocksPlaced++;
                updateHotbar();
                updateInventoryUI();
            }
        }
    }
}

function onPointerLockChange() {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
}

// Player movement
function updatePlayer() {
    if (gameState !== 'playing') return;
    
    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    
    let speed = player.speed;
    if (keys['shift']) {
        speed *= 1.5;
    }
    
    if (keys['w']) {
        direction.add(forward);
    }
    if (keys['s']) {
        direction.sub(forward);
    }
    if (keys['a']) {
        direction.sub(right);
    }
    if (keys['d']) {
        direction.add(right);
    }
    
    direction.normalize();
    direction.multiplyScalar(speed);
    
    player.velocity.x = direction.x;
    player.velocity.z = direction.z;
    
    // Gravity
    player.velocity.y += player.gravity;
    
    // Jump
    if (keys[' '] && player.onGround) {
        player.velocity.y = player.jumpPower;
        player.onGround = false;
    }
    
    // Collision detection
    const newPos = player.position.clone().add(player.velocity);
    const blockX = Math.floor(newPos.x);
    const blockY = Math.floor(newPos.y);
    const blockZ = Math.floor(newPos.z);
    
    // Check collision
    player.onGround = false;
    
    // X collision
    if (getBlock(blockX, Math.floor(player.position.y), Math.floor(player.position.z)) !== BLOCKS.AIR ||
        getBlock(blockX, Math.floor(player.position.y + 1.6), Math.floor(player.position.z)) !== BLOCKS.AIR) {
        player.velocity.x = 0;
    } else {
        player.position.x = newPos.x;
    }
    
    // Z collision
    if (getBlock(Math.floor(player.position.x), Math.floor(player.position.y), blockZ) !== BLOCKS.AIR ||
        getBlock(Math.floor(player.position.x), Math.floor(player.position.y + 1.6), blockZ) !== BLOCKS.AIR) {
        player.velocity.z = 0;
    } else {
        player.position.z = newPos.z;
    }
    
    // Y collision
    if (player.velocity.y < 0) {
        if (getBlock(Math.floor(player.position.x), blockY, Math.floor(player.position.z)) !== BLOCKS.AIR) {
            player.velocity.y = 0;
            player.position.y = blockY + 1;
            player.onGround = true;
        } else {
            player.position.y = newPos.y;
        }
    } else if (player.velocity.y > 0) {
        if (getBlock(Math.floor(player.position.x), Math.floor(player.position.y + 1.6), Math.floor(player.position.z)) !== BLOCKS.AIR) {
            player.velocity.y = 0;
        } else {
            player.position.y = newPos.y;
        }
    }
    
    // Update camera
    camera.position.copy(player.position);
    camera.position.y += 1.6;
    
    // Update time
    updateTime();
    
    // Update health/hunger
    updateSurvival();
}

// Time system
let gameTime = 0;
function updateTime() {
    gameTime += 0.001;
    if (gameTime >= 1) gameTime = 0;
    
    const hour = Math.floor(gameTime * 24);
    const minute = Math.floor((gameTime * 24 - hour) * 60);
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    document.getElementById('time').textContent = timeString;
    
    // Update lighting based on time
    const sunAngle = (gameTime - 0.25) * Math.PI * 2;
    const sunIntensity = Math.max(0.3, Math.sin(sunAngle));
    scene.children.forEach(child => {
        if (child instanceof THREE.DirectionalLight) {
            child.intensity = sunIntensity;
        }
    });
}

// Survival mechanics
function updateSurvival() {
    // Hunger decreases over time
    if (Math.random() < 0.0001) {
        player.hunger = Math.max(0, player.hunger - 1);
    }
    
    // Health regenerates if hunger is full
    if (player.hunger >= 18 && player.health < player.maxHealth && Math.random() < 0.01) {
        player.health = Math.min(player.maxHealth, player.health + 1);
    }
    
    // Die if health reaches 0
    if (player.health <= 0) {
        gameOver();
    }
    
    updateStats();
}

// Inventory
function addToInventory(type, count) {
    // Try hotbar first
    for (let i = 0; i < inventory.hotbar.length; i++) {
        if (inventory.hotbar[i] && inventory.hotbar[i].type === type) {
            inventory.hotbar[i].count += count;
            return;
        }
    }
    
    // Add to empty hotbar slot
    for (let i = 0; i < inventory.hotbar.length; i++) {
        if (!inventory.hotbar[i]) {
            inventory.hotbar[i] = { type: type, count: count };
            return;
        }
    }
    
    // Try inventory
    for (let i = 0; i < inventory.items.length; i++) {
        if (inventory.items[i] && inventory.items[i].type === type) {
            inventory.items[i].count += count;
            return;
        }
    }
    
    // Add to empty inventory slot
    for (let i = 0; i < inventory.items.length; i++) {
        if (!inventory.items[i]) {
            inventory.items[i] = { type: type, count: count };
            return;
        }
    }
}

function removeFromInventory(type, count) {
    // Try hotbar
    for (let i = 0; i < inventory.hotbar.length; i++) {
        if (inventory.hotbar[i] && inventory.hotbar[i].type === type) {
            inventory.hotbar[i].count -= count;
            if (inventory.hotbar[i].count <= 0) {
                inventory.hotbar[i] = null;
            }
            return;
        }
    }
    
    // Try inventory
    for (let i = 0; i < inventory.items.length; i++) {
        if (inventory.items[i] && inventory.items[i].type === type) {
            inventory.items[i].count -= count;
            if (inventory.items[i].count <= 0) {
                inventory.items[i] = null;
            }
            return;
        }
    }
}

function updateHotbar() {
    const hotbar = document.getElementById('hotbar');
    hotbar.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'hotbar-slot';
        if (i === player.selectedSlot) {
            slot.classList.add('selected');
        }
        
        const item = inventory.hotbar[i];
        if (item) {
            const blockName = Object.keys(BLOCKS).find(key => BLOCKS[key] === item.type);
            slot.innerHTML = `<div class="block-preview" style="background-color: ${getColorHex(BLOCK_COLORS[item.type])}"></div><span>${item.count}</span>`;
        }
        
        slot.addEventListener('click', () => {
            player.selectedSlot = i;
            updateHotbar();
        });
        
        hotbar.appendChild(slot);
    }
}

function updateInventoryUI() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 27; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        
        const item = inventory.items[i];
        if (item) {
            const blockName = Object.keys(BLOCKS).find(key => BLOCKS[key] === item.type);
            slot.innerHTML = `<div class="block-preview" style="background-color: ${getColorHex(BLOCK_COLORS[item.type])}"></div><span>${item.count}</span>`;
        }
        
        grid.appendChild(slot);
    }
}

function getColorHex(color) {
    return '#' + color.toString(16).padStart(6, '0');
}

// Crafting
function updateCraftingUI() {
    const recipesDiv = document.getElementById('craftingRecipes');
    recipesDiv.innerHTML = '';
    
    RECIPES.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe-item';
        
        let ingredientsHTML = recipe.ingredients.map(ing => {
            const blockName = Object.keys(BLOCKS).find(key => BLOCKS[key] === ing.type);
            return `${ing.count}x <span style="color: ${getColorHex(BLOCK_COLORS[ing.type])}">${blockName}</span>`;
        }).join(' + ');
        
        const resultName = Object.keys(BLOCKS).find(key => BLOCKS[key] === recipe.result.type);
        
        recipeDiv.innerHTML = `
            <div class="recipe-ingredients">${ingredientsHTML}</div>
            <div class="recipe-arrow">→</div>
            <div class="recipe-result">
                ${recipe.result.count}x <span style="color: ${getColorHex(BLOCK_COLORS[recipe.result.type])}">${resultName}</span>
            </div>
            <button class="craft-btn" data-recipe="${RECIPES.indexOf(recipe)}">Craft</button>
        `;
        
        const craftBtn = recipeDiv.querySelector('.craft-btn');
        craftBtn.addEventListener('click', () => craft(recipe));
        
        recipesDiv.appendChild(recipeDiv);
    });
}

function craft(recipe) {
    // Check if player has ingredients
    for (const ingredient of recipe.ingredients) {
        let total = 0;
        [...inventory.hotbar, ...inventory.items].forEach(item => {
            if (item && item.type === ingredient.type) {
                total += item.count;
            }
        });
        if (total < ingredient.count) {
            showNotification('Not enough materials!');
            return;
        }
    }
    
    // Remove ingredients
    for (const ingredient of recipe.ingredients) {
        removeFromInventory(ingredient.type, ingredient.count);
    }
    
    // Add result
    addToInventory(recipe.result.type, recipe.result.count);
    
    updateHotbar();
    updateInventoryUI();
    showNotification('Crafted!');
}

// UI functions
function toggleInventory() {
    const screen = document.getElementById('inventoryScreen');
    if (screen.classList.contains('hidden')) {
        screen.classList.remove('hidden');
        document.exitPointerLock();
    } else {
        screen.classList.add('hidden');
        renderer.domElement.requestPointerLock();
    }
}

function toggleCrafting() {
    const screen = document.getElementById('craftingScreen');
    if (screen.classList.contains('hidden')) {
        screen.classList.remove('hidden');
        updateCraftingUI();
        document.exitPointerLock();
    } else {
        screen.classList.add('hidden');
        renderer.domElement.requestPointerLock();
    }
}

function updateStats() {
    document.getElementById('health').textContent = `${player.health}/${player.maxHealth}`;
    document.getElementById('hunger').textContent = `${player.hunger}/${player.maxHunger}`;
}

function showNotification(text) {
    // Simple notification (you can enhance this)
    console.log(text);
}

function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalPlaced').textContent = stats.blocksPlaced;
    document.getElementById('finalBroken').textContent = stats.blocksBroken;
    const minutes = Math.floor((Date.now() - stats.startTime) / 60000);
    document.getElementById('finalTime').textContent = minutes;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.exitPointerLock();
}

function resetGame() {
    gameState = 'playing';
    player = {
        position: new THREE.Vector3(0, 20, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        onGround: false,
        health: 20,
        maxHealth: 20,
        hunger: 20,
        maxHunger: 20,
        speed: 0.1,
        jumpPower: 0.15,
        gravity: -0.02,
        selectedSlot: 0
    };
    
    stats = {
        blocksPlaced: 0,
        blocksBroken: 0,
        startTime: Date.now()
    };
    
    inventory = {
        hotbar: Array(9).fill(null),
        items: Array(27).fill(null)
    };
    
    addToInventory(BLOCKS.GRASS, 64);
    addToInventory(BLOCKS.DIRT, 64);
    addToInventory(BLOCKS.STONE, 64);
    addToInventory(BLOCKS.WOOD, 64);
    addToInventory(BLOCKS.SAND, 64);
    
    updateHotbar();
    updateInventoryUI();
    updateStats();
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('inventoryScreen').classList.add('hidden');
    document.getElementById('craftingScreen').classList.add('hidden');
    
    renderer.domElement.requestPointerLock();
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
    
    if (gameState === 'playing') {
        updatePlayer();
        
        // Update block info
        const hit = raycast();
        if (hit) {
            const blockName = Object.keys(BLOCKS).find(key => BLOCKS[key] === hit.block);
            document.getElementById('blockInfo').textContent = blockName || 'Air';
        } else {
            document.getElementById('blockInfo').textContent = '';
        }
    }
    
    renderer.render(scene, camera);
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', resetGame);
document.getElementById('restartBtn').addEventListener('click', resetGame);
document.getElementById('closeInventoryBtn').addEventListener('click', toggleInventory);
document.getElementById('closeCraftingBtn').addEventListener('click', toggleCrafting);

// Initialize
init();








