// Advanced 3D Cat Simulator
let scene, camera, renderer;
let cats = [];
let catStats = {
    happiness: 100,
    energy: 100,
    hunger: 0,
    hygiene: 100,
    health: 100,
    mood: 'happy'
};
let money = 100;
let day = 1;
let timeOfDay = 0; // 0-1, 0 = midnight, 0.5 = noon
let weather = 'sunny';
let currentRoom = 'main';
let roomSize = 25;
let achievements = [];
let inventory = { premiumToys: 0, premiumFood: 0 };
let gameState = 'start';
let playTime = 0;

// UI Elements
const happinessElement = document.getElementById('happiness');
const energyElement = document.getElementById('energy');
const hungerElement = document.getElementById('hunger');
const hygieneElement = document.getElementById('hygiene');
const healthElement = document.getElementById('health');
const moodElement = document.getElementById('mood');
const moneyElement = document.getElementById('money');
const dayElement = document.getElementById('day');
const startScreen = document.getElementById('startScreen');
const shopScreen = document.getElementById('shopScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const feedBtn = document.getElementById('feedBtn');
const playBtn = document.getElementById('playBtn');
const petBtn = document.getElementById('petBtn');
const bathBtn = document.getElementById('bathBtn');
const shopBtn = document.getElementById('shopBtn');
const roomBtn = document.getElementById('roomBtn');
const notification = document.getElementById('notification');

// Objects in scene
let floor, foodBowl, toyBall, bed, litterBox, scratchingPost, windowObj, catTree;
let particles = [];
let raycaster, mouse;
let keys = {};
let selectedCat = 0;

// Initialize Three.js scene
function initScene() {
    const container = document.getElementById('gameContainer');
    
    // Scene
    scene = new THREE.Scene();
    updateSceneLighting();
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 12, 15);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Create environment
    createFloor();
    createCat();
    createObjects();
    createWalls();
    createFurniture();
    
    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function updateSceneLighting() {
    const hour = timeOfDay * 24;
    let skyColor, fogColor, lightIntensity;
    
    if (hour >= 6 && hour < 8) {
        // Dawn
        skyColor = 0xFFB347;
        fogColor = 0xFFB347;
        lightIntensity = 0.6;
    } else if (hour >= 8 && hour < 18) {
        // Day
        skyColor = 0x87CEEB;
        fogColor = 0x87CEEB;
        lightIntensity = 1.0;
    } else if (hour >= 18 && hour < 20) {
        // Dusk
        skyColor = 0xFF6347;
        fogColor = 0xFF6347;
        lightIntensity = 0.7;
    } else {
        // Night
        skyColor = 0x191970;
        fogColor = 0x000033;
        lightIntensity = 0.3;
    }
    
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.Fog(fogColor, 5, 50);
}

function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(roomSize * 2, roomSize * 2);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Floor pattern
    for (let x = -roomSize; x < roomSize; x += 2) {
        for (let z = -roomSize; z < roomSize; z += 2) {
            if ((x + z) % 4 === 0) {
                const tile = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.8, 1.8),
                    new THREE.MeshLambertMaterial({ color: 0xC0C0C0 })
                );
                tile.rotation.x = -Math.PI / 2;
                tile.position.set(x, 0.01, z);
                scene.add(tile);
            }
        }
    }
}

function createCat() {
    const cat = createCatModel(0xFFA500, 0, 0, 0);
    cat.userData = {
        velocity: new THREE.Vector3(),
        state: 'idle',
        target: null,
        behaviorTimer: 0,
        personality: Math.random() > 0.5 ? 'playful' : 'lazy'
    };
    cats.push(cat);
    scene.add(cat);
}

function createCatModel(color, x, y, z) {
    const catGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    catGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: color });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.2, 0.5);
    head.castShadow = true;
    catGroup.add(head);
    
    // Ears
    const earGeometry = new THREE.ConeGeometry(0.2, 0.3, 3);
    const earMaterial = new THREE.MeshLambertMaterial({ color: color * 0.8 });
    const ear1 = new THREE.Mesh(earGeometry, earMaterial);
    ear1.position.set(-0.3, 1.4, 0.3);
    ear1.rotation.z = -0.3;
    catGroup.add(ear1);
    const ear2 = new THREE.Mesh(earGeometry, earMaterial);
    ear2.position.set(0.3, 1.4, 0.3);
    ear2.rotation.z = 0.3;
    catGroup.add(ear2);
    
    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 8);
    const tailMaterial = new THREE.MeshLambertMaterial({ color: color });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.8, -0.8);
    tail.rotation.x = 0.5;
    tail.castShadow = true;
    tail.userData.isTail = true;
    catGroup.add(tail);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
    const legMaterial = new THREE.MeshLambertMaterial({ color: color * 0.8 });
    const positions = [[-0.3, 0.2, 0.3], [0.3, 0.2, 0.3], [-0.3, 0.2, -0.3], [0.3, 0.2, -0.3]];
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        catGroup.add(leg);
    });
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
    const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye1.position.set(-0.15, 1.25, 0.55);
    catGroup.add(eye1);
    const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye2.position.set(0.15, 1.25, 0.55);
    catGroup.add(eye2);
    
    catGroup.position.set(x, y, z);
    return catGroup;
}

function createObjects() {
    // Food Bowl
    const bowlGroup = new THREE.Group();
    const bowlGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.2, 16);
    const bowlMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
    bowl.position.y = 0.1;
    bowl.castShadow = true;
    bowlGroup.add(bowl);
    
    const foodGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const foodMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6347 });
    const food = new THREE.Mesh(foodGeometry, foodMaterial);
    food.position.y = 0.25;
    food.userData.isFood = true;
    bowlGroup.add(food);
    
    bowlGroup.position.set(-8, 0, -8);
    bowlGroup.userData.type = 'foodBowl';
    scene.add(bowlGroup);
    foodBowl = bowlGroup;
    
    // Toy Ball
    const ballGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(8, 0.3, -8);
    ball.castShadow = true;
    ball.userData.type = 'toy';
    ball.userData.velocity = new THREE.Vector3();
    scene.add(ball);
    toyBall = ball;
    
    // Bed
    const bedGroup = new THREE.Group();
    const bedGeometry = new THREE.BoxGeometry(2, 0.3, 2);
    const bedMaterial = new THREE.MeshLambertMaterial({ color: 0x8B008B });
    const bedBase = new THREE.Mesh(bedGeometry, bedMaterial);
    bedBase.position.y = 0.15;
    bedBase.castShadow = true;
    bedBase.receiveShadow = true;
    bedGroup.add(bedBase);
    
    const pillowGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.8);
    const pillowMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
    const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
    pillow.position.set(0, 0.35, -0.5);
    bedGroup.add(pillow);
    
    bedGroup.position.set(0, 0, 8);
    bedGroup.userData.type = 'bed';
    scene.add(bedGroup);
    bed = bedGroup;
}

function createFurniture() {
    // Litter Box
    const litterGroup = new THREE.Group();
    const litterGeometry = new THREE.BoxGeometry(1, 0.3, 1);
    const litterMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const litter = new THREE.Mesh(litterGeometry, litterMaterial);
    litter.position.y = 0.15;
    litter.castShadow = true;
    litterGroup.add(litter);
    litterGroup.position.set(8, 0, 8);
    litterGroup.userData.type = 'litterBox';
    scene.add(litterGroup);
    litterBox = litterGroup;
    
    // Scratching Post
    const postGroup = new THREE.Group();
    const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 1;
    post.castShadow = true;
    postGroup.add(post);
    
    const ropeGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 8);
    const ropeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
    rope.position.y = 1.5;
    postGroup.add(rope);
    
    postGroup.position.set(-8, 0, 8);
    postGroup.userData.type = 'scratchingPost';
    scene.add(postGroup);
    scratchingPost = postGroup;
    
    // Cat Tree
    const treeGroup = new THREE.Group();
    const treeBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 1, 8),
        new THREE.MeshLambertMaterial({ color: 0x654321 })
    );
    treeBase.position.y = 0.5;
    treeBase.castShadow = true;
    treeGroup.add(treeBase);
    
    const treePlatform = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 0.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    );
    treePlatform.position.y = 2;
    treePlatform.castShadow = true;
    treeGroup.add(treePlatform);
    
    treeGroup.position.set(0, 0, -8);
    treeGroup.userData.type = 'catTree';
    scene.add(treeGroup);
    catTree = treeGroup;
    
    // Window
    const windowGroup = new THREE.Group();
    const windowFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    );
    windowGroup.add(windowFrame);
    
    const windowGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 1.5),
        new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.3 })
    );
    windowGlass.position.z = 0.11;
    windowGroup.add(windowGlass);
    
    windowGroup.position.set(-roomSize + 1, 2, 0);
    windowGroup.userData.type = 'window';
    scene.add(windowGroup);
    windowObj = windowGroup;
}

function createWalls() {
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
    const wallHeight = 6;
    const wallLength = roomSize;
    
    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(wallLength * 2, wallHeight),
        wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -wallLength);
    backWall.rotation.y = Math.PI;
    backWall.receiveShadow = true;
    scene.add(backWall);
    
    // Side walls
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(wallLength * 2, wallHeight),
        wallMaterial
    );
    leftWall.position.set(-wallLength, wallHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(wallLength * 2, wallHeight),
        wallMaterial
    );
    rightWall.position.set(wallLength, wallHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
}

// Input handling
function onKeyDown(e) {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        if (cats[selectedCat]) {
            jumpCat(cats[selectedCat]);
        }
    }
    if (e.key === 'e' && gameState === 'playing') {
        toggleRoom();
    }
    if (e.key === 'r' && gameState === 'playing') {
        changeRoom();
    }
}

function onKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
}

function onMouseMove(event) {
    if (gameState !== 'playing') return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseClick(event) {
    if (gameState !== 'playing') return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const interactables = [foodBowl, toyBall, bed, litterBox, scratchingPost, catTree, windowObj, ...cats];
    const intersects = raycaster.intersectObjects(interactables, true);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        let target = object;
        while (target.parent && target.parent !== scene) {
            target = target.parent;
        }
        
        if (target.userData.type === 'foodBowl' || target === foodBowl) {
            feedCat();
        } else if (target.userData.type === 'toy' || target === toyBall) {
            playWithToy();
        } else if (target.userData.type === 'bed' || target === bed) {
            sleep();
        } else if (target.userData.type === 'litterBox' || target === litterBox) {
            useLitterBox();
        } else if (target.userData.type === 'scratchingPost' || target === scratchingPost) {
            scratch();
        } else if (target.userData.type === 'catTree' || target === catTree) {
            climbTree();
        } else if (target.userData.type === 'window' || target === windowObj) {
            lookOutWindow();
        } else if (cats.includes(target)) {
            selectCat(target);
        }
    }
}

// Cat actions
function feedCat() {
    const foodValue = inventory.premiumFood > 0 ? 40 : 30;
    catStats.hunger = Math.max(0, catStats.hunger - foodValue);
    catStats.happiness = Math.min(100, catStats.happiness + 5);
    if (inventory.premiumFood > 0) {
        inventory.premiumFood--;
        catStats.health = Math.min(100, catStats.health + 2);
    }
    createHeartParticles();
    showNotification('Cat fed! 🍽️');
    updateStats();
}

function playWithToy() {
    const toyValue = inventory.premiumToys > 0 ? 15 : 10;
    catStats.happiness = Math.min(100, catStats.happiness + toyValue);
    catStats.energy = Math.max(0, catStats.energy - 5);
    
    // Move toy ball
    toyBall.userData.velocity.x = (Math.random() - 0.5) * 0.3;
    toyBall.userData.velocity.z = (Math.random() - 0.5) * 0.3;
    
    createSparkleParticles(toyBall.position);
    showNotification('Playing with toy! 🎾');
    updateStats();
}

function petCat() {
    catStats.happiness = Math.min(100, catStats.happiness + 15);
    catStats.hygiene = Math.min(100, catStats.hygiene + 2);
    createHeartParticles();
    showNotification('Cat petted! ❤️');
    updateStats();
}

function useLitterBox() {
    catStats.hygiene = Math.min(100, catStats.hygiene + 20);
    catStats.happiness = Math.min(100, catStats.happiness + 5);
    showNotification('Cat used litter box! 🚽');
    updateStats();
}

function scratch() {
    catStats.hygiene = Math.min(100, catStats.hygiene + 10);
    catStats.happiness = Math.min(100, catStats.happiness + 8);
    catStats.energy = Math.max(0, catStats.energy - 3);
    createSparkleParticles(scratchingPost.position);
    showNotification('Cat scratched post! ✨');
    updateStats();
}

function climbTree() {
    if (cats[selectedCat] && cats[selectedCat].position.y < 0.5) {
        cats[selectedCat].position.y = 2.5;
        catStats.happiness = Math.min(100, catStats.happiness + 12);
        catStats.energy = Math.max(0, catStats.energy - 8);
        showNotification('Cat climbed tree! 🌳');
        updateStats();
    }
}

function lookOutWindow() {
    catStats.happiness = Math.min(100, catStats.happiness + 10);
    showNotification('Cat looking out window! 🪟');
    updateStats();
}

function sleep() {
    catStats.energy = Math.min(100, catStats.energy + 25);
    catStats.hunger = Math.min(100, catStats.hunger + 5);
    catStats.health = Math.min(100, catStats.health + 3);
    showNotification('Cat sleeping! 😴');
    updateStats();
}

function jumpCat(cat) {
    if (cat.position.y < 0.5) {
        cat.userData.velocity.y = 0.4;
    }
}

function selectCat(cat) {
    const index = cats.indexOf(cat);
    if (index !== -1) {
        selectedCat = index;
        showNotification(`Selected cat ${index + 1}! 🐱`);
    }
}

// Update cat AI
function updateCatAI(cat, index) {
    const data = cat.userData;
    data.behaviorTimer--;
    
    if (data.behaviorTimer <= 0) {
        data.behaviorTimer = 60 + Math.random() * 120;
        
        // AI behavior based on stats
        if (catStats.hunger > 60) {
            data.state = 'seekingFood';
            data.target = foodBowl;
        } else if (catStats.energy < 30) {
            data.state = 'seekingBed';
            data.target = bed;
        } else if (catStats.hygiene < 40) {
            data.state = 'seekingLitter';
            data.target = litterBox;
        } else if (data.personality === 'playful' && Math.random() > 0.5) {
            data.state = 'playing';
            data.target = toyBall;
        } else {
            data.state = 'wandering';
            data.target = null;
        }
    }
    
    // Move towards target
    if (data.target && data.state !== 'wandering') {
        const targetPos = data.target.position;
        const direction = new THREE.Vector3(
            targetPos.x - cat.position.x,
            0,
            targetPos.z - cat.position.z
        );
        const distance = direction.length();
        
        if (distance > 1) {
            direction.normalize();
            direction.multiplyScalar(0.05);
            cat.position.add(direction);
            
            const angle = Math.atan2(direction.x, direction.z);
            cat.rotation.y = angle;
        } else {
            // Reached target, perform action
            if (data.target === foodBowl && catStats.hunger > 20) {
                feedCat();
                data.behaviorTimer = 0;
            } else if (data.target === bed && catStats.energy < 50) {
                sleep();
                data.behaviorTimer = 0;
            } else if (data.target === litterBox && catStats.hygiene < 60) {
                useLitterBox();
                data.behaviorTimer = 0;
            }
        }
    } else if (data.state === 'wandering') {
        // Random wandering
        if (Math.random() < 0.02) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.1;
            cat.position.x += Math.cos(angle) * distance;
            cat.position.z += Math.sin(angle) * distance;
            cat.rotation.y = angle;
        }
    }
    
    // Apply gravity
    data.velocity.y -= 0.015;
    cat.position.y += data.velocity.y;
    
    if (cat.position.y < 0) {
        cat.position.y = 0;
        data.velocity.y = 0;
    }
    
    // Animate tail
    const tail = cat.children.find(child => child.userData && child.userData.isTail);
    if (tail) {
        tail.rotation.x = Math.sin(Date.now() * 0.005 + index) * 0.3 + 0.5;
    }
}

// Update player-controlled cat
function updatePlayerCat() {
    if (!cats[selectedCat]) return;
    const cat = cats[selectedCat];
    const data = cat.userData;
    
    const direction = new THREE.Vector3();
    
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
    
    direction.normalize();
    direction.multiplyScalar(0.15);
    
    cat.position.x += direction.x;
    cat.position.z += direction.z;
    
    if (direction.length() > 0) {
        const angle = Math.atan2(direction.x, direction.z);
        cat.rotation.y = angle;
    }
    
    // Gravity
    data.velocity.y -= 0.015;
    cat.position.y += data.velocity.y;
    
    if (cat.position.y < 0) {
        cat.position.y = 0;
        data.velocity.y = 0;
    }
}

// Update toy ball physics
function updateToyBall() {
    if (!toyBall) return;
    
    toyBall.position.add(toyBall.userData.velocity);
    toyBall.userData.velocity.multiplyScalar(0.95);
    
    if (toyBall.position.y > 0.3) {
        toyBall.userData.velocity.y -= 0.02;
    } else {
        toyBall.position.y = 0.3;
        toyBall.userData.velocity.y *= -0.5;
    }
    
    // Bounce off walls
    if (Math.abs(toyBall.position.x) > roomSize - 1) {
        toyBall.userData.velocity.x *= -0.8;
    }
    if (Math.abs(toyBall.position.z) > roomSize - 1) {
        toyBall.userData.velocity.z *= -0.8;
    }
}

// Update camera
function updateCamera() {
    if (!cats[selectedCat]) return;
    const cat = cats[selectedCat];
    
    const targetX = cat.position.x;
    const targetZ = cat.position.z;
    const angle = cameraAngle || 0;
    
    camera.position.x = targetX + Math.sin(angle) * 12;
    camera.position.z = targetZ + Math.cos(angle) * 12;
    camera.position.y = 8;
    camera.lookAt(cat.position);
}

// Particles
function createHeartParticles() {
    if (!cats[selectedCat]) return;
    const cat = cats[selectedCat];
    for (let i = 0; i < 10; i++) {
        particles.push({
            position: new THREE.Vector3(
                cat.position.x + (Math.random() - 0.5) * 2,
                cat.position.y + 1 + Math.random() * 2,
                cat.position.z + (Math.random() - 0.5) * 2
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.1
            ),
            life: 60,
            type: 'heart'
        });
    }
}

function createSparkleParticles(pos) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            position: new THREE.Vector3(pos.x, pos.y, pos.z),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.2
            ),
            life: 40,
            type: 'sparkle'
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.add(p.velocity);
        p.velocity.y -= 0.01;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: p.type === 'heart' ? 0xFF69B4 : 0xFFD700,
            transparent: true,
            opacity: p.life / 60
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(p.position);
        scene.add(particle);
        setTimeout(() => scene.remove(particle), 0);
    });
}

// Shop functions
function openShop() {
    shopScreen.classList.remove('hidden');
    document.getElementById('shopMoney').textContent = '$' + money;
}

function closeShop() {
    shopScreen.classList.add('hidden');
}

function buyCat() {
    if (money >= 50 && cats.length < 5) {
        money -= 50;
        const colors = [0xFFA500, 0x0000FF, 0x00FF00, 0xFF00FF, 0x00FFFF];
        const color = colors[cats.length % colors.length];
        const cat = createCatModel(color, (cats.length - 2) * 2, 0, (cats.length - 2) * 2);
        cat.userData = {
            velocity: new THREE.Vector3(),
            state: 'idle',
            target: null,
            behaviorTimer: 0,
            personality: Math.random() > 0.5 ? 'playful' : 'lazy'
        };
        cats.push(cat);
        scene.add(cat);
        showNotification('New cat adopted! 🐱');
        updateStats();
        checkAchievement('catCollector');
    }
}

function buyToy() {
    if (money >= 30) {
        money -= 30;
        inventory.premiumToys++;
        showNotification('Premium toy purchased! 🎾');
        updateStats();
    }
}

function buyFood() {
    if (money >= 20) {
        money -= 20;
        inventory.premiumFood += 5;
        showNotification('Premium food purchased! 🍖');
        updateStats();
    }
}

function expandRoom() {
    if (money >= 100) {
        money -= 100;
        roomSize += 5;
        showNotification('Room expanded! 🏠');
        // Recreate floor and walls
        scene.remove(floor);
        createFloor();
        createWalls();
        updateStats();
    }
}

// Room functions
function toggleRoom() {
    // Toggle between rooms
    showNotification('Room changed! 🏠');
}

function changeRoom() {
    // Cycle through rooms
    const rooms = ['main', 'bedroom', 'garden'];
    const currentIndex = rooms.indexOf(currentRoom);
    currentRoom = rooms[(currentIndex + 1) % rooms.length];
    showNotification(`Entered ${currentRoom}! 🏠`);
}

// Achievements
function checkAchievement(id) {
    if (achievements.includes(id)) return;
    
    const achievementList = {
        catCollector: { name: 'Cat Collector', desc: 'Adopt 2 cats' },
        millionaire: { name: 'Millionaire', desc: 'Earn $500' },
        happyCat: { name: 'Happy Cat', desc: 'Keep happiness at 100% for 1 day' }
    };
    
    if (achievementList[id]) {
        achievements.push(id);
        showNotification(`Achievement: ${achievementList[id].name}! 🏆`);
    }
}

// Update stats
function updateStats() {
    // Natural decay
    catStats.hunger = Math.min(100, catStats.hunger + 0.02);
    catStats.hygiene = Math.max(0, catStats.hygiene - 0.01);
    catStats.energy = Math.max(0, catStats.energy - 0.01);
    
    if (catStats.hunger > 70) {
        catStats.health = Math.max(0, catStats.health - 0.05);
        catStats.happiness = Math.max(0, catStats.happiness - 0.03);
    }
    if (catStats.hygiene < 30) {
        catStats.health = Math.max(0, catStats.health - 0.02);
        catStats.happiness = Math.max(0, catStats.happiness - 0.02);
    }
    if (catStats.energy < 20) {
        catStats.happiness = Math.max(0, catStats.happiness - 0.01);
    }
    
    // Update mood
    if (catStats.happiness > 80 && catStats.health > 80) {
        catStats.mood = 'happy';
    } else if (catStats.happiness < 30 || catStats.health < 30) {
        catStats.mood = 'sad';
    } else if (catStats.energy < 30) {
        catStats.mood = 'tired';
    } else {
        catStats.mood = 'neutral';
    }
    
    // Earn money over time
    money += 0.1;
    
    // Day cycle
    timeOfDay += 0.0001;
    if (timeOfDay >= 1) {
        timeOfDay = 0;
        day++;
        dayElement.textContent = day;
        updateSceneLighting();
        
        // Daily money bonus
        money += 10 * cats.length;
        showNotification(`New day! Earned $${10 * cats.length}! 💰`);
    }
    
    happinessElement.textContent = Math.floor(catStats.happiness) + '%';
    energyElement.textContent = Math.floor(catStats.energy) + '%';
    hungerElement.textContent = Math.floor(catStats.hunger) + '%';
    hygieneElement.textContent = Math.floor(catStats.hygiene) + '%';
    healthElement.textContent = Math.floor(catStats.health) + '%';
    moneyElement.textContent = '$' + Math.floor(money);
    
    const moodEmojis = {
        happy: '😊 Happy',
        sad: '😢 Sad',
        tired: '😴 Tired',
        neutral: '😐 Neutral'
    };
    moodElement.textContent = moodEmojis[catStats.mood] || '😐 Neutral';
    
    // Game over
    if (catStats.health <= 0 && gameState === 'playing') {
        gameOver();
    }
}

function showNotification(text) {
    notification.textContent = text;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Game functions
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalDay').textContent = day;
    document.getElementById('finalHappiness').textContent = Math.floor(catStats.happiness) + '%';
    document.getElementById('totalMoney').textContent = '$' + Math.floor(money);
    document.getElementById('finalCats').textContent = cats.length;
    document.getElementById('achievements').textContent = achievements.length;
    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    gameState = 'playing';
    catStats = {
        happiness: 100,
        energy: 100,
        hunger: 0,
        hygiene: 100,
        health: 100,
        mood: 'happy'
    };
    money = 100;
    day = 1;
    timeOfDay = 0.5;
    playTime = 0;
    achievements = [];
    inventory = { premiumToys: 0, premiumFood: 0 };
    currentRoom = 'main';
    roomSize = 25;
    selectedCat = 0;
    
    // Clear scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    // Reinitialize
    initScene();
    
    updateStats();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    shopScreen.classList.add('hidden');
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
        playTime += 1/60;
        
        // Update player cat
        updatePlayerCat();
        
        // Update AI cats
        cats.forEach((cat, index) => {
            if (index !== selectedCat) {
                updateCatAI(cat, index);
            }
        });
        
        // Update toy ball
        updateToyBall();
        
        // Update camera
        updateCamera();
        
        // Update particles
        updateParticles();
        drawParticles();
        
        // Update stats
        updateStats();
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

feedBtn.addEventListener('click', feedCat);
playBtn.addEventListener('click', playWithToy);
petBtn.addEventListener('click', petCat);
bathBtn.addEventListener('click', () => {
    catStats.hygiene = Math.min(100, catStats.hygiene + 30);
    catStats.happiness = Math.min(100, catStats.happiness + 5);
    showNotification('Cat bathed! 🛁');
    updateStats();
});
shopBtn.addEventListener('click', openShop);
roomBtn.addEventListener('click', changeRoom);

document.getElementById('closeShopBtn').addEventListener('click', closeShop);
document.getElementById('buyCatBtn').addEventListener('click', buyCat);
document.getElementById('buyToyBtn').addEventListener('click', buyToy);
document.getElementById('buyFoodBtn').addEventListener('click', buyFood);
document.getElementById('expandRoomBtn').addEventListener('click', expandRoom);

// Initialize
initScene();
animate();
