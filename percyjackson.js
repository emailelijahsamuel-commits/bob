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
    
    // Scene with enhanced sky
    scene = new THREE.Scene();
    
    // Enhanced sky gradient
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        uniforms: {
            topColor: { value: new THREE.Color(0x87CEEB) },
            bottomColor: { value: new THREE.Color(0xfff8dc) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        },
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    // Renderer with enhanced settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    
    // Enhanced lighting system
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xfff8dc, 1.2);
    directionalLight.position.set(30, 40, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.radius = 8;
    scene.add(directionalLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-20, 20, -10);
    scene.add(fillLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffd700, 0.4);
    rimLight.position.set(-10, 10, -30);
    scene.add(rimLight);
    
    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xffd700, 0.5, 50);
    pointLight1.position.set(20, 5, 20);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00ffff, 0.3, 40);
    pointLight2.position.set(-20, 3, -20);
    scene.add(pointLight2);
    
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
    updateQuestDisplay();
}

// Create ground with enhanced graphics
function createGround() {
    // Main ground with better material
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a7c3f,
        roughness: 0.8,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    
    // Add vertex displacement for terrain variation
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 2; i < vertices.length; i += 3) {
        vertices[i] = Math.random() * 0.3 - 0.15;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    scene.add(ground);
    
    // Enhanced grass patches with better geometry
    for (let i = 0; i < 100; i++) {
        const grassGroup = new THREE.Group();
        const grassCount = 3 + Math.floor(Math.random() * 5);
        
        for (let j = 0; j < grassCount; j++) {
            const grass = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.3 + Math.random() * 0.2, 6),
                new THREE.MeshStandardMaterial({ 
                    color: new THREE.Color().setHSL(0.25, 0.7, 0.3 + Math.random() * 0.2),
                    roughness: 0.9
                })
            );
            grass.position.set(
                (Math.random() - 0.5) * 0.3,
                0.15 + Math.random() * 0.1,
                (Math.random() - 0.5) * 0.3
            );
            grass.rotation.z = (Math.random() - 0.5) * 0.2;
            grass.castShadow = true;
            grassGroup.add(grass);
        }
        
        grassGroup.position.set(
            (Math.random() - 0.5) * 180,
            0.15,
            (Math.random() - 0.5) * 180
        );
        scene.add(grassGroup);
    }
    
    // Add flowers
    for (let i = 0; i < 30; i++) {
        const flower = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.1, 6),
            new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
                roughness: 0.7
            })
        );
        flower.position.set(
            (Math.random() - 0.5) * 180,
            0.05,
            (Math.random() - 0.5) * 180
        );
        scene.add(flower);
    }
}

// Create player (Percy) with enhanced graphics
function createPlayer() {
    const playerGroup = new THREE.Group();
    
    // Body with better geometry and material
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.35, 1.5, 16);
    const playerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0066ff,
        roughness: 0.4,
        metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, playerMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    playerGroup.add(body);
    
    // Head with better geometry
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffdbac,
        roughness: 0.6
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    playerGroup.add(head);
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12);
    const leftArm = new THREE.Mesh(armGeometry, playerMaterial);
    leftArm.position.set(-0.5, 0.8, 0);
    leftArm.rotation.z = 0.3;
    leftArm.castShadow = true;
    playerGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, playerMaterial);
    rightArm.position.set(0.5, 0.8, 0);
    rightArm.rotation.z = -0.3;
    rightArm.castShadow = true;
    playerGroup.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12);
    const leftLeg = new THREE.Mesh(legGeometry, new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        roughness: 0.8
    }));
    leftLeg.position.set(-0.2, 0.4, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        roughness: 0.8
    }));
    rightLeg.position.set(0.2, 0.4, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);
    
    player = playerGroup;
    player.position.set(0, 1, 0);
    scene.add(player);
    
    // Enhanced sword (Riptide) with glow effect
    const swordGroup = new THREE.Group();
    
    // Blade
    const bladeGeometry = new THREE.BoxGeometry(0.08, 1.2, 0.08);
    const bladeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.9,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = 0.6;
    blade.castShadow = true;
    swordGroup.add(blade);
    
    // Hilt
    const hiltGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12);
    const hiltMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        roughness: 0.6,
        metalness: 0.2
    });
    const hilt = new THREE.Mesh(hiltGeometry, hiltMaterial);
    hilt.position.y = -0.15;
    swordGroup.add(hilt);
    
    // Guard
    const guardGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05);
    const guard = new THREE.Mesh(guardGeometry, hiltMaterial);
    guard.position.y = 0.1;
    swordGroup.add(guard);
    
    swordGroup.position.set(0.5, 0.5, 0);
    swordGroup.rotation.z = Math.PI / 4;
    player.add(swordGroup);
    
    // Add glow effect to sword
    const glowGeometry = new THREE.BoxGeometry(0.1, 1.3, 0.1);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0.6;
    swordGroup.add(glow);
}

// Create enemies (monsters) with enhanced graphics
function createEnemies() {
    const enemyTypes = [
        { color: 0x8B4513, name: 'Minotaur', size: 1.5, emissive: 0x4a2511 },
        { color: 0x800080, name: 'Cyclops', size: 1.3, emissive: 0x400040 },
        { color: 0xFF0000, name: 'Hellhound', size: 1.0, emissive: 0x800000 }
    ];
    
    for (let i = 0; i < 10; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemyGroup = new THREE.Group();
        
        // Body with better geometry
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, type.size, 16);
        const enemyMaterial = new THREE.MeshStandardMaterial({ 
            color: type.color,
            roughness: 0.7,
            metalness: 0.1,
            emissive: type.emissive,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, enemyMaterial);
        body.position.y = type.size / 2;
        body.castShadow = true;
        enemyGroup.add(body);
        
        // Head with better geometry
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const head = new THREE.Mesh(headGeometry, enemyMaterial);
        head.position.y = type.size + 0.25;
        head.castShadow = true;
        enemyGroup.add(head);
        
        // Add glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 1
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, type.size + 0.25, 0.2);
        enemyGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, type.size + 0.25, 0.2);
        enemyGroup.add(rightEye);
        
        // Add limbs
        const limbGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12);
        const limbMaterial = new THREE.MeshStandardMaterial({ 
            color: type.color,
            roughness: 0.7
        });
        
        // Arms
        const leftArm = new THREE.Mesh(limbGeometry, limbMaterial);
        leftArm.position.set(-0.4, type.size * 0.6, 0);
        leftArm.castShadow = true;
        enemyGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(limbGeometry, limbMaterial);
        rightArm.position.set(0.4, type.size * 0.6, 0);
        rightArm.castShadow = true;
        enemyGroup.add(rightArm);
        
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
            attackCooldown: 0,
            eyeGlow: 1
        };
        enemies.push(enemyGroup);
        scene.add(enemyGroup);
    }
}

// Create structures (Greek temple, etc.) with enhanced graphics
function createStructures() {
    // Temple with better materials
    const templeGeometry = new THREE.BoxGeometry(10, 8, 10);
    const templeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd4a574,
        roughness: 0.6,
        metalness: 0.1
    });
    const temple = new THREE.Mesh(templeGeometry, templeMaterial);
    temple.position.set(-30, 4, -30);
    temple.castShadow = true;
    temple.receiveShadow = true;
    scene.add(temple);
    
    // Temple roof
    const roofGeometry = new THREE.ConeGeometry(7, 3, 4);
    const roof = new THREE.Mesh(roofGeometry, new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        roughness: 0.8
    }));
    roof.position.set(-30, 9.5, -30);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
    
    // Enhanced columns with fluting
    for (let i = 0; i < 4; i++) {
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.6, 8, 16),
            new THREE.MeshStandardMaterial({ 
                color: 0xd4a574,
                roughness: 0.5,
                metalness: 0.1
            })
        );
        column.position.set(
            -30 + (i % 2) * 8,
            4,
            -30 + Math.floor(i / 2) * 8
        );
        column.castShadow = true;
        column.receiveShadow = true;
        scene.add(column);
        
        // Column capital
        const capital = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 0.5, 0.5, 16),
            new THREE.MeshStandardMaterial({ 
                color: 0xc9a574,
                roughness: 0.4
            })
        );
        capital.position.set(
            -30 + (i % 2) * 8,
            8.25,
            -30 + Math.floor(i / 2) * 8
        );
        scene.add(capital);
    }
    
    // Enhanced rocks with better geometry
    for (let i = 0; i < 30; i++) {
        const rockSize = 0.5 + Math.random() * 1.5;
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(rockSize, 1),
            new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.2),
                roughness: 0.9,
                metalness: 0.05
            })
        );
        rock.position.set(
            (Math.random() - 0.5) * 180,
            rockSize * 0.5,
            (Math.random() - 0.5) * 180
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
    
    // Add trees
    for (let i = 0; i < 15; i++) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 3, 12),
            new THREE.MeshStandardMaterial({ 
                color: 0x8b4513,
                roughness: 0.8
            })
        );
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Leaves
        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(2, 3, 8),
            new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(0.25, 0.7, 0.3),
                roughness: 0.9
            })
        );
        leaves.position.y = 3.5;
        leaves.castShadow = true;
        treeGroup.add(leaves);
        
        treeGroup.position.set(
            (Math.random() - 0.5) * 150,
            0,
            (Math.random() - 0.5) * 150
        );
        scene.add(treeGroup);
    }
}

// Create water features with enhanced graphics
function createWater() {
    // Water pool with better material and geometry
    const waterGeometry = new THREE.PlaneGeometry(15, 15, 32, 32);
    const waterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0066ff,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.3,
        emissive: 0x001144,
        emissiveIntensity: 0.2
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(20, 0.1, 20);
    water.receiveShadow = true;
    scene.add(water);
    
    // Animate water
    water.userData = { time: 0 };
    
    // Add water particles/ripples
    for (let i = 0; i < 5; i++) {
        const ripple = new THREE.Mesh(
            new THREE.RingGeometry(0.5, 1, 16),
            new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            })
        );
        ripple.rotation.x = -Math.PI / 2;
        ripple.position.set(
            20 + (Math.random() - 0.5) * 10,
            0.11,
            20 + (Math.random() - 0.5) * 10
        );
        ripple.userData = { 
            scale: 0.5 + Math.random() * 0.5,
            speed: 0.01 + Math.random() * 0.01
        };
        scene.add(ripple);
    }
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
            
            // Update quest progress
            quests[0].current = playerStats.kills;
            checkQuests();
            
            checkLevelUp();
            updateUI();
            
            // Spawn new enemy
            if (enemies.length < 10) {
                createEnemies();
            }
        }
    });
}

// Water power attack with enhanced graphics
function useWaterPower() {
    if (playerStats.waterPower < 10) return;
    
    playerStats.waterPower -= 10;
    quests[1].current++;
    updateUI();
    
    // Create enhanced water blast with particles
    const waterBlast = new THREE.Group();
    
    // Main blast
    const blastGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const blastMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.9,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.3
    });
    const waterBlastMesh = new THREE.Mesh(blastGeometry, blastMaterial);
    waterBlast.add(waterBlastMesh);
    
    // Outer glow
    const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    waterBlast.add(glow);
    
    // Add particle trail
    for (let i = 0; i < 10; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0x00ffff,
                transparent: true,
                opacity: 0.6
            })
        );
        particle.position.set(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        waterBlast.add(particle);
    }
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    waterBlast.position.copy(player.position);
    waterBlast.position.y += 1;
    
    waterBlast.userData = {
        velocity: direction.multiplyScalar(0.3),
        lifetime: 60,
        rotationSpeed: 0.1
    };
    
    waterEffects.push(waterBlast);
    scene.add(waterBlast);
    
    // Damage nearby enemies with visual feedback
    enemies.forEach(enemy => {
        const dx = enemy.position.x - player.position.x;
        const dz = enemy.position.z - player.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 5) {
            enemy.userData.hp -= 15;
            // Flash effect
            enemy.children.forEach(child => {
                if (child.material) {
                    const originalEmissive = child.material.emissive.clone();
                    child.material.emissive.setHex(0xffffff);
                    setTimeout(() => {
                        if (child.material) {
                            child.material.emissive.copy(originalEmissive);
                        }
                    }, 100);
                }
            });
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

// Update water effects with enhanced visuals
function updateWaterEffects() {
    waterEffects.forEach((effect, index) => {
        effect.position.add(effect.userData.velocity);
        effect.userData.lifetime--;
        
        // Rotate effect
        if (effect.userData.rotationSpeed) {
            effect.rotation.x += effect.userData.rotationSpeed;
            effect.rotation.y += effect.userData.rotationSpeed;
        }
        
        // Fade out
        if (effect.children) {
            effect.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = Math.max(0, effect.userData.lifetime / 60);
                }
            });
        }
        
        // Check collision with enemies
        enemies.forEach(enemy => {
            const dx = effect.position.x - enemy.position.x;
            const dy = effect.position.y - enemy.position.y;
            const dz = effect.position.z - enemy.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < 1) {
                enemy.userData.hp -= 10;
                // Create impact particles
                for (let i = 0; i < 5; i++) {
                    const particle = new THREE.Mesh(
                        new THREE.SphereGeometry(0.05, 6, 6),
                        new THREE.MeshBasicMaterial({ 
                            color: 0x00ffff,
                            transparent: true,
                            opacity: 0.8
                        })
                    );
                    particle.position.copy(effect.position);
                    particle.userData = {
                        velocity: new THREE.Vector3(
                            (Math.random() - 0.5) * 0.2,
                            Math.random() * 0.2,
                            (Math.random() - 0.5) * 0.2
                        ),
                        lifetime: 20
                    };
                    particles.push(particle);
                    scene.add(particle);
                }
            }
        });
        
        if (effect.userData.lifetime <= 0 || effect.position.y < 0) {
            scene.remove(effect);
            waterEffects.splice(index, 1);
        }
    });
    
    // Update particles
    particles.forEach((particle, index) => {
        if (particle.userData) {
            particle.position.add(particle.userData.velocity);
            particle.userData.lifetime--;
            if (particle.material) {
                particle.material.opacity = Math.max(0, particle.userData.lifetime / 20);
            }
            if (particle.userData.lifetime <= 0) {
                scene.remove(particle);
                particles.splice(index, 1);
            }
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

// Update Quest Display
function updateQuestDisplay() {
    const questList = document.getElementById('questList');
    if (!questList) return;
    
    questList.innerHTML = '';
    
    quests.forEach(quest => {
        const questItem = document.createElement('div');
        questItem.className = `quest-item ${quest.completed ? 'completed' : ''}`;
        
        const questName = document.createElement('div');
        questName.className = 'quest-name';
        questName.textContent = quest.completed ? '✓ ' + quest.name : quest.name;
        questItem.appendChild(questName);
        
        const questDesc = document.createElement('div');
        questDesc.className = 'quest-desc';
        questDesc.textContent = quest.desc;
        questItem.appendChild(questDesc);
        
        const questProgress = document.createElement('div');
        questProgress.className = 'quest-progress';
        questProgress.textContent = `Progress: ${Math.min(quest.current, quest.target)}/${quest.target}`;
        questItem.appendChild(questProgress);
        
        const questReward = document.createElement('div');
        questReward.className = 'quest-reward';
        const rewardText = [];
        if (quest.reward.xp) rewardText.push(`${quest.reward.xp} XP`);
        if (quest.reward.gold) rewardText.push(`${quest.reward.gold} Gold`);
        if (quest.reward.waterPower) rewardText.push(`+${quest.reward.waterPower} Water Power`);
        if (quest.reward.attack) rewardText.push(`+${quest.reward.attack} Attack`);
        questReward.textContent = `Reward: ${rewardText.join(', ')}`;
        questItem.appendChild(questReward);
        
        questList.appendChild(questItem);
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
    
    // Update quest display
    updateQuestDisplay();
    
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
    
    // Update enemies with eye glow animation
    enemies.forEach(enemy => {
        if (enemy.userData && enemy.userData.eyeGlow !== undefined) {
            enemy.userData.eyeGlow += 0.1;
            const intensity = 0.8 + Math.sin(enemy.userData.eyeGlow) * 0.2;
            enemy.children.forEach(child => {
                if (child.material && child.material.emissiveIntensity !== undefined) {
                    child.material.emissiveIntensity = intensity;
                }
            });
        }
    });
    
    // Animate water
    scene.children.forEach(child => {
        if (child.userData && child.userData.time !== undefined) {
            child.userData.time += 0.01;
            if (child.geometry && child.geometry.attributes && child.geometry.attributes.position) {
                const positions = child.geometry.attributes.position.array;
                for (let i = 2; i < positions.length; i += 3) {
                    positions[i] = Math.sin(child.userData.time + i * 0.1) * 0.1;
                }
                child.geometry.attributes.position.needsUpdate = true;
            }
        }
    });
    
    // Animate ripples
    scene.children.forEach(child => {
        if (child.userData && child.userData.scale !== undefined) {
            child.userData.scale += child.userData.speed;
            child.scale.setScalar(child.userData.scale);
            if (child.material) {
                child.material.opacity = Math.max(0, 0.3 - (child.userData.scale - 0.5) * 0.1);
            }
            if (child.userData.scale > 2) {
                child.userData.scale = 0.5 + Math.random() * 0.5;
                child.position.set(
                    20 + (Math.random() - 0.5) * 10,
                    0.11,
                    20 + (Math.random() - 0.5) * 10
                );
            }
        }
    });
    
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
    const questPanel = document.getElementById('questPanel');
    if (questPanel) questPanel.classList.add('hidden');
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

