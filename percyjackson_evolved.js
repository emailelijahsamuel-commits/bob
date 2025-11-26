// Percy Jackson: Demigod Quest - Premium Edition
// App Store Quality Game

// ==================== GAME STATE ====================
let scene, camera, renderer, player;
let gameState = 'menu'; // menu, playing, paused, gameover
let clock = new THREE.Clock();
let controls = { moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, jump: false };
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let PI_2 = Math.PI / 2;
let isPointerLocked = false;
let velocity = new THREE.Vector3();
let canJump = true;

// ==================== SAVE/LOAD SYSTEM ====================
const SAVE_KEY = 'percyjackson_save';

function saveGame() {
    const saveData = {
        version: '1.0',
        timestamp: Date.now(),
        playerStats: playerStats,
        quests: quests,
        inventory: inventory,
        equipment: equipment,
        achievements: achievements,
        settings: settings,
        currentArea: currentArea,
        playTime: totalPlayTime
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    showNotification('💾 Game Saved!');
}

function loadGame() {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return false;
    
    try {
        const data = JSON.parse(saveData);
        playerStats = data.playerStats || playerStats;
        quests = data.quests || quests;
        inventory = data.inventory || [];
        equipment = data.equipment || equipment;
        achievements = data.achievements || achievements;
        settings = { ...settings, ...(data.settings || {}) };
        currentArea = data.currentArea || 1;
        totalPlayTime = data.playTime || 0;
        return true;
    } catch (e) {
        console.error('Failed to load save:', e);
        return false;
    }
}

function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    showNotification('🗑️ Save Deleted');
}

// ==================== SETTINGS SYSTEM ====================
let settings = {
    masterVolume: 50,
    musicVolume: 50,
    sfxVolume: 50,
    graphicsQuality: 'medium', // low, medium, high, ultra
    shadows: true,
    vsync: true
};

function applySettings() {
    // Apply audio settings
    if (audioContext) {
        const masterGain = settings.masterVolume / 100;
        masterGainNode.gain.value = masterGain;
    }
    
    // Apply graphics settings
    const qualitySettings = {
        low: { shadowMapSize: 1024, pixelRatio: 1, antialias: false },
        medium: { shadowMapSize: 2048, pixelRatio: Math.min(window.devicePixelRatio, 1.5), antialias: true },
        high: { shadowMapSize: 4096, pixelRatio: Math.min(window.devicePixelRatio, 2), antialias: true },
        ultra: { shadowMapSize: 8192, pixelRatio: Math.min(window.devicePixelRatio, 2.5), antialias: true }
    };
    
    const quality = qualitySettings[settings.graphicsQuality] || qualitySettings.medium;
    
    if (renderer) {
        renderer.shadowMap.enabled = settings.shadows;
        if (settings.shadows && directionalLight) {
            directionalLight.shadow.mapSize.width = quality.shadowMapSize;
            directionalLight.shadow.mapSize.height = quality.shadowMapSize;
        }
        renderer.setPixelRatio(quality.pixelRatio);
    }
    
    // Save settings
    localStorage.setItem('percyjackson_settings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('percyjackson_settings');
    if (saved) {
        try {
            settings = { ...settings, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }
    applySettings();
    updateSettingsUI();
}

function updateSettingsUI() {
    const masterVol = document.getElementById('masterVolume');
    const musicVol = document.getElementById('musicVolume');
    const sfxVol = document.getElementById('sfxVolume');
    const graphics = document.getElementById('graphicsQuality');
    const shadows = document.getElementById('shadowsToggle');
    const vsync = document.getElementById('vsyncToggle');
    
    if (masterVol) {
        masterVol.value = settings.masterVolume;
        document.getElementById('masterVolumeValue').textContent = settings.masterVolume + '%';
    }
    if (musicVol) {
        musicVol.value = settings.musicVolume;
        document.getElementById('musicVolumeValue').textContent = settings.musicVolume + '%';
    }
    if (sfxVol) {
        sfxVol.value = settings.sfxVolume;
        document.getElementById('sfxVolumeValue').textContent = settings.sfxVolume + '%';
    }
    if (graphics) graphics.value = settings.graphicsQuality;
    if (shadows) shadows.textContent = settings.shadows ? 'ON' : 'OFF';
    if (vsync) vsync.textContent = settings.vsync ? 'ON' : 'OFF';
}

// ==================== AUDIO SYSTEM ====================
let audioContext;
let masterGainNode;
let musicSource;
let soundEffects = {};

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGainNode = audioContext.createGain();
        masterGainNode.connect(audioContext.destination);
        masterGainNode.gain.value = settings.masterVolume / 100;
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
    }
}

function playSound(name, volume = 1) {
    if (!audioContext) return;
    
    // Generate procedural sounds
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGainNode);
    
    const soundTypes = {
        attack: { type: 'square', freq: 200, duration: 0.1 },
        hit: { type: 'sawtooth', freq: 150, duration: 0.15 },
        levelup: { type: 'sine', freq: 400, duration: 0.5 },
        quest: { type: 'sine', freq: 600, duration: 0.3 },
        water: { type: 'sine', freq: 300, duration: 0.2 }
    };
    
    const sound = soundTypes[name] || soundTypes.attack;
    oscillator.type = sound.type;
    oscillator.frequency.value = sound.freq;
    gainNode.gain.setValueAtTime(volume * (settings.sfxVolume / 100), audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + sound.duration);
}

// ==================== INVENTORY SYSTEM ====================
let inventory = [];
let equipment = {
    weapon: null,
    armor: null,
    accessory: null
};

const itemDatabase = {
    healthPotion: { name: 'Health Potion', icon: '💊', type: 'consumable', effect: { heal: 50 }, price: 25 },
    manaPotion: { name: 'Mana Potion', icon: '🔵', type: 'consumable', effect: { waterPower: 50 }, price: 30 },
    riptide: { name: 'Riptide', icon: '⚔️', type: 'weapon', stats: { attack: 20 }, price: 0, equipped: true },
    demigodArmor: { name: 'Demigod Armor', icon: '🛡️', type: 'armor', stats: { defense: 15, maxHp: 20 }, price: 200 },
    trident: { name: 'Poseidon\'s Trident', icon: '🔱', type: 'weapon', stats: { attack: 35, waterPower: 30 }, price: 500 },
    goldenFleece: { name: 'Golden Fleece', icon: '🐑', type: 'accessory', stats: { defense: 10, maxHp: 50 }, price: 1000 }
};

function addItem(itemId, quantity = 1) {
    const item = itemDatabase[itemId];
    if (!item) return;
    
    const existing = inventory.find(i => i.id === itemId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        inventory.push({ id: itemId, quantity, ...item });
    }
    updateInventoryUI();
}

function useItem(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.quantity <= 0) return;
    
    if (item.type === 'consumable') {
        if (item.effect.heal) {
            playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + item.effect.heal);
            playSound('hit');
        }
        if (item.effect.waterPower) {
            playerStats.waterPower = Math.min(playerStats.maxWaterPower, playerStats.waterPower + item.effect.waterPower);
        }
        item.quantity--;
        if (item.quantity <= 0) {
            inventory = inventory.filter(i => i.id !== itemId);
        }
        updateUI();
        updateInventoryUI();
    }
}

function equipItem(itemId) {
    const item = inventory.find(i => i.id === itemId) || itemDatabase[itemId];
    if (!item || item.type === 'consumable') return;
    
    if (equipment[item.type]) {
        addItem(equipment[item.type].id, 1);
    }
    
    equipment[item.type] = { id: itemId, ...item };
    applyEquipmentStats();
    updateInventoryUI();
}

function applyEquipmentStats() {
    let bonusAttack = 0, bonusDefense = 0, bonusMaxHp = 0, bonusWaterPower = 0;
    
    Object.values(equipment).forEach(item => {
        if (item && item.stats) {
            bonusAttack += item.stats.attack || 0;
            bonusDefense += item.stats.defense || 0;
            bonusMaxHp += item.stats.maxHp || 0;
            bonusWaterPower += item.stats.waterPower || 0;
        }
    });
    
    playerStats.baseAttack = 15;
    playerStats.baseDefense = 10;
    playerStats.baseMaxHp = 100;
    playerStats.attack = playerStats.baseAttack + bonusAttack;
    playerStats.defense = playerStats.baseDefense + bonusDefense;
    playerStats.maxHp = playerStats.baseMaxHp + bonusMaxHp;
    playerStats.maxWaterPower = 100 + bonusWaterPower;
    if (playerStats.hp > playerStats.maxHp) playerStats.hp = playerStats.maxHp;
    if (playerStats.waterPower > playerStats.maxWaterPower) playerStats.waterPower = playerStats.maxWaterPower;
}

function updateInventoryUI() {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.slot = i;
        
        const item = inventory[i];
        if (item) {
            slot.classList.add('filled');
            slot.textContent = item.icon;
            slot.title = `${item.name} x${item.quantity}`;
            slot.onclick = () => {
                if (item.type === 'consumable') {
                    useItem(item.id);
                } else {
                    equipItem(item.id);
                }
            };
        }
        
        grid.appendChild(slot);
    }
}

// ==================== ACHIEVEMENTS SYSTEM ====================
let achievements = {};

const achievementList = {
    firstKill: { name: 'First Blood', desc: 'Defeat your first monster', icon: '⚔️', unlocked: false },
    level5: { name: 'Rising Hero', desc: 'Reach level 5', icon: '⭐', unlocked: false },
    level10: { name: 'Legendary Demigod', desc: 'Reach level 10', icon: '👑', unlocked: false },
    questMaster: { name: 'Quest Master', desc: 'Complete 10 quests', icon: '📜', unlocked: false },
    waterMaster: { name: 'Water Master', desc: 'Use water powers 100 times', icon: '💧', unlocked: false },
    slayer: { name: 'Monster Slayer', desc: 'Defeat 100 monsters', icon: '💀', unlocked: false }
};

function checkAchievements() {
    if (playerStats.kills >= 1 && !achievements.firstKill) {
        unlockAchievement('firstKill');
    }
    if (playerStats.level >= 5 && !achievements.level5) {
        unlockAchievement('level5');
    }
    if (playerStats.level >= 10 && !achievements.level10) {
        unlockAchievement('level10');
    }
    if (playerStats.questsCompleted >= 10 && !achievements.questMaster) {
        unlockAchievement('questMaster');
    }
    if (playerStats.waterPowerUsed >= 100 && !achievements.waterMaster) {
        unlockAchievement('waterMaster');
    }
    if (playerStats.kills >= 100 && !achievements.slayer) {
        unlockAchievement('slayer');
    }
}

function unlockAchievement(id) {
    if (achievements[id]) return;
    achievements[id] = true;
    const achievement = achievementList[id];
    showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`);
    playSound('quest');
}

// ==================== ENHANCED PLAYER STATS ====================
let playerStats = {
    level: 1,
    xp: 0,
    xpToNext: 100,
    hp: 100,
    maxHp: 100,
    baseAttack: 15,
    attack: 15,
    baseDefense: 10,
    defense: 10,
    kills: 0,
    questsCompleted: 0,
    waterPower: 100,
    maxWaterPower: 100,
    waterPowerUsed: 0,
    riptideCooldown: 0,
    gold: 0,
    totalPlayTime: 0
};

let totalPlayTime = 0;
let playTimeStart = 0;

// ==================== ENHANCED QUESTS ====================
let quests = [
    { id: 1, name: 'First Steps', desc: 'Defeat 3 monsters', target: 3, current: 0, reward: { xp: 100, gold: 50 }, completed: false },
    { id: 2, name: 'Water Mastery', desc: 'Use water powers 10 times', target: 10, current: 0, reward: { xp: 80, waterPower: 20 }, completed: false },
    { id: 3, name: 'Hero\'s Journey', desc: 'Reach level 3', target: 3, current: 1, reward: { xp: 150, attack: 5 }, completed: false },
    { id: 4, name: 'Treasure Hunter', desc: 'Collect 500 gold', target: 500, current: 0, reward: { xp: 200, gold: 100 }, completed: false },
    { id: 5, name: 'Monster Slayer', desc: 'Defeat 20 monsters', target: 20, current: 0, reward: { xp: 300, attack: 10 }, completed: false }
];

// ==================== GAME OBJECTS ====================
let enemies = [];
let waterEffects = [];
let particles = [];
let items = [];
let currentArea = 1;
let directionalLight;

// ==================== UI ELEMENTS ====================
const elements = {
    mainMenu: document.getElementById('mainMenu'),
    gameScreen: document.getElementById('gameScreen'),
    loadingScreen: document.getElementById('loadingScreen'),
    pauseMenu: document.getElementById('pauseMenu'),
    settingsPanel: document.getElementById('settingsPanel'),
    inventoryPanel: document.getElementById('inventoryPanel'),
    questPanel: document.getElementById('questPanel'),
    notification: document.getElementById('notification')
};

// ==================== INITIALIZATION ====================
function init() {
    loadSettings();
    initAudio();
    setupEventListeners();
    
    // Hide loading screen after a moment
    setTimeout(() => {
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('hidden');
        }
    }, 1000);
    
    // Check for save file
    const hasSave = loadGame();
    if (hasSave && elements.mainMenu) {
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) continueBtn.style.display = 'block';
    }
}

function setupEventListeners() {
    // Menu buttons
    const newGameBtn = document.getElementById('newGameBtn');
    const continueBtn = document.getElementById('continueBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const tutorialBtn = document.getElementById('tutorialBtn');
    
    if (newGameBtn) newGameBtn.addEventListener('click', startNewGame);
    if (continueBtn) continueBtn.addEventListener('click', continueGame);
    if (settingsBtn) settingsBtn.addEventListener('click', () => showSettings());
    if (tutorialBtn) tutorialBtn.addEventListener('click', showTutorial);
    
    // Pause menu
    const resumeBtn = document.getElementById('resumeBtn');
    const pauseSettingsBtn = document.getElementById('pauseSettingsBtn');
    const saveBtn = document.getElementById('saveBtn');
    const quitBtn = document.getElementById('quitBtn');
    
    if (resumeBtn) resumeBtn.addEventListener('click', resumeGame);
    if (pauseSettingsBtn) pauseSettingsBtn.addEventListener('click', () => showSettings());
    if (saveBtn) saveBtn.addEventListener('click', saveGame);
    if (quitBtn) quitBtn.addEventListener('click', quitToMenu);
    
    // Settings
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => hideSettings());
    
    const masterVol = document.getElementById('masterVolume');
    const musicVol = document.getElementById('musicVolume');
    const sfxVol = document.getElementById('sfxVolume');
    const graphics = document.getElementById('graphicsQuality');
    const shadows = document.getElementById('shadowsToggle');
    const vsync = document.getElementById('vsyncToggle');
    
    if (masterVol) masterVol.addEventListener('input', (e) => {
        settings.masterVolume = parseInt(e.target.value);
        document.getElementById('masterVolumeValue').textContent = settings.masterVolume + '%';
        applySettings();
    });
    
    if (musicVol) musicVol.addEventListener('input', (e) => {
        settings.musicVolume = parseInt(e.target.value);
        document.getElementById('musicVolumeValue').textContent = settings.musicVolume + '%';
    });
    
    if (sfxVol) sfxVol.addEventListener('input', (e) => {
        settings.sfxVolume = parseInt(e.target.value);
        document.getElementById('sfxVolumeValue').textContent = settings.sfxVolume + '%';
    });
    
    if (graphics) graphics.addEventListener('change', (e) => {
        settings.graphicsQuality = e.target.value;
        applySettings();
    });
    
    if (shadows) shadows.addEventListener('click', () => {
        settings.shadows = !settings.shadows;
        shadows.textContent = settings.shadows ? 'ON' : 'OFF';
        applySettings();
    });
    
    if (vsync) vsync.addEventListener('click', () => {
        settings.vsync = !settings.vsync;
        vsync.textContent = settings.vsync ? 'ON' : 'OFF';
    });
    
    // Keyboard
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('keypress', (e) => {
        if (e.key === 'e' || e.key === 'E') {
            toggleInventory();
        }
        if (e.key === 'Escape') {
            if (gameState === 'playing') {
                pauseGame();
            } else if (gameState === 'paused') {
                resumeGame();
            } else if (elements.settingsPanel && elements.settingsPanel.classList.contains('visible')) {
                hideSettings();
            }
        }
    });
}

// ==================== GAME FLOW ====================
function startNewGame() {
    // Reset game state
    playerStats = {
        level: 1,
        xp: 0,
        xpToNext: 100,
        hp: 100,
        maxHp: 100,
        baseAttack: 15,
        attack: 15,
        baseDefense: 10,
        defense: 10,
        kills: 0,
        questsCompleted: 0,
        waterPower: 100,
        maxWaterPower: 100,
        waterPowerUsed: 0,
        riptideCooldown: 0,
        gold: 0,
        totalPlayTime: 0
    };
    
    quests = [
        { id: 1, name: 'First Steps', desc: 'Defeat 3 monsters', target: 3, current: 0, reward: { xp: 100, gold: 50 }, completed: false },
        { id: 2, name: 'Water Mastery', desc: 'Use water powers 10 times', target: 10, current: 0, reward: { xp: 80, waterPower: 20 }, completed: false },
        { id: 3, name: 'Hero\'s Journey', desc: 'Reach level 3', target: 3, current: 1, reward: { xp: 150, attack: 5 }, completed: false },
        { id: 4, name: 'Treasure Hunter', desc: 'Collect 500 gold', target: 500, current: 0, reward: { xp: 200, gold: 100 }, completed: false },
        { id: 5, name: 'Monster Slayer', desc: 'Defeat 20 monsters', target: 20, current: 0, reward: { xp: 300, attack: 10 }, completed: false }
    ];
    
    inventory = [];
    achievements = {};
    currentArea = 1;
    
    // Give starting items
    addItem('riptide');
    addItem('healthPotion', 3);
    
    startGame();
}

function continueGame() {
    if (loadGame()) {
        startGame();
    } else {
        showNotification('❌ No save file found');
    }
}

function startGame() {
    gameState = 'playing';
    playTimeStart = Date.now();
    
    if (elements.mainMenu) elements.mainMenu.classList.add('hidden');
    if (elements.gameScreen) elements.gameScreen.classList.remove('hidden');
    
    initScene();
    animate();
}

function pauseGame() {
    if (gameState !== 'playing') return;
    gameState = 'paused';
    document.exitPointerLock();
    if (elements.pauseMenu) elements.pauseMenu.classList.add('visible');
}

function resumeGame() {
    if (gameState !== 'paused') return;
    gameState = 'playing';
    if (elements.pauseMenu) elements.pauseMenu.classList.remove('visible');
    renderer.domElement.requestPointerLock();
}

function quitToMenu() {
    gameState = 'menu';
    totalPlayTime += (Date.now() - playTimeStart) / 1000;
    playerStats.totalPlayTime = totalPlayTime;
    saveGame();
    
    if (elements.pauseMenu) elements.pauseMenu.classList.remove('visible');
    if (elements.gameScreen) elements.gameScreen.classList.add('hidden');
    if (elements.mainMenu) elements.mainMenu.classList.remove('hidden');
    
    // Clean up scene
    if (scene) {
        while(scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
    }
}

// ==================== SCENE INITIALIZATION ====================
function initScene() {
    const container = document.getElementById('gameContainer');
    if (!container) return;
    
    // Scene
    scene = new THREE.Scene();
    
    // Sky
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
    
    // Renderer
    const qualitySettings = {
        low: { pixelRatio: 1, antialias: false },
        medium: { pixelRatio: Math.min(window.devicePixelRatio, 1.5), antialias: true },
        high: { pixelRatio: Math.min(window.devicePixelRatio, 2), antialias: true },
        ultra: { pixelRatio: Math.min(window.devicePixelRatio, 2.5), antialias: true }
    };
    const quality = qualitySettings[settings.graphicsQuality] || qualitySettings.medium;
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: quality.antialias,
        powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(quality.pixelRatio);
    renderer.shadowMap.enabled = settings.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    directionalLight = new THREE.DirectionalLight(0xfff8dc, 1.2);
    directionalLight.position.set(30, 40, 20);
    directionalLight.castShadow = settings.shadows;
    if (settings.shadows) {
        const shadowSize = quality.shadowMapSize || 2048;
        directionalLight.shadow.mapSize.width = shadowSize;
        directionalLight.shadow.mapSize.height = shadowSize;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.bias = -0.0001;
        directionalLight.shadow.radius = 8;
    }
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-20, 20, -10);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffd700, 0.4);
    rimLight.position.set(-10, 10, -30);
    scene.add(rimLight);
    
    // Create world
    createGround();
    createPlayer();
    createEnemies();
    createStructures();
    createWater();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', () => {
        renderer.domElement.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', onPointerLockChange);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    
    applyEquipmentStats();
    updateUI();
    updateQuestDisplay();
    updateInventoryUI();
}

// ==================== HELPER FUNCTIONS ====================
function showNotification(text) {
    const notification = elements.notification;
    if (!notification) return;
    
    notification.textContent = text;
    notification.classList.add('visible');
    
    setTimeout(() => {
        notification.classList.remove('visible');
    }, 3000);
}

function showSettings() {
    if (elements.settingsPanel) {
        elements.settingsPanel.classList.add('visible');
        updateSettingsUI();
    }
}

function hideSettings() {
    if (elements.settingsPanel) {
        elements.settingsPanel.classList.remove('visible');
        saveSettings();
    }
}

function saveSettings() {
    localStorage.setItem('percyjackson_settings', JSON.stringify(settings));
}

function toggleInventory() {
    if (elements.inventoryPanel) {
        elements.inventoryPanel.classList.toggle('visible');
    }
}

function showTutorial() {
    showNotification('📖 Tutorial:\nWASD - Move\nMouse - Look\nLeft Click - Attack\nRight Click - Water Power\nE - Inventory\nESC - Pause');
}

// ==================== UI UPDATE FUNCTIONS ====================
function updateUI() {
    const levelEl = document.getElementById('level');
    const hpEl = document.getElementById('hp');
    const xpEl = document.getElementById('xp');
    const goldEl = document.getElementById('gold');
    const killsEl = document.getElementById('kills');
    const waterPowerEl = document.getElementById('waterPower');
    const healthBar = document.getElementById('healthBar');
    const xpBar = document.getElementById('xpBar');
    
    if (levelEl) levelEl.textContent = playerStats.level;
    if (hpEl) hpEl.textContent = `${Math.max(0, Math.floor(playerStats.hp))}/${playerStats.maxHp}`;
    if (xpEl) xpEl.textContent = `${Math.floor(playerStats.xp)}/${playerStats.xpToNext}`;
    if (goldEl) goldEl.textContent = playerStats.gold || 0;
    if (killsEl) killsEl.textContent = playerStats.kills;
    if (waterPowerEl) {
        const percent = Math.floor((playerStats.waterPower / playerStats.maxWaterPower) * 100);
        waterPowerEl.textContent = percent + '%';
    }
    
    if (healthBar) {
        const percent = (playerStats.hp / playerStats.maxHp) * 100;
        healthBar.style.width = percent + '%';
        healthBar.textContent = `${Math.floor(playerStats.hp)}/${playerStats.maxHp}`;
    }
    
    if (xpBar) {
        const percent = (playerStats.xp / playerStats.xpToNext) * 100;
        xpBar.style.width = percent + '%';
    }
    
    // Regenerate water power
    if (playerStats.waterPower < playerStats.maxWaterPower) {
        playerStats.waterPower = Math.min(playerStats.maxWaterPower, playerStats.waterPower + 0.1);
    }
    
    if (playerStats.riptideCooldown > 0) {
        playerStats.riptideCooldown--;
    }
    
    updateQuestDisplay();
    checkAchievements();
}

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

// ==================== GAME MECHANICS ====================
function checkLevelUp() {
    if (playerStats.xp >= playerStats.xpToNext) {
        playerStats.level++;
        playerStats.xp -= playerStats.xpToNext;
        playerStats.xpToNext = Math.floor(playerStats.xpToNext * 1.5);
        playerStats.maxHp += 20;
        playerStats.hp = playerStats.maxHp;
        playerStats.baseAttack += 3;
        playerStats.baseDefense += 2;
        applyEquipmentStats();
        
        showNotification(`⭐ Level Up! You are now level ${playerStats.level}!`);
        playSound('levelup');
        checkQuests();
        updateUI();
    }
}

function checkQuests() {
    quests.forEach(quest => {
        if (!quest.completed) {
            if (quest.current >= quest.target) {
                quest.completed = true;
                playerStats.questsCompleted++;
                playerStats.xp += quest.reward.xp || 0;
                playerStats.gold += quest.reward.gold || 0;
                if (quest.reward.waterPower) {
                    playerStats.maxWaterPower += quest.reward.waterPower;
                    playerStats.waterPower = playerStats.maxWaterPower;
                }
                if (quest.reward.attack) {
                    playerStats.baseAttack += quest.reward.attack;
                    applyEquipmentStats();
                }
                showNotification(`✅ Quest Completed: ${quest.name}!`);
                playSound('quest');
                checkLevelUp();
                updateUI();
            }
        }
    });
}

// Import/create game world functions from existing percyjackson.js
// These would be copied from the existing file:
// - createGround()
// - createPlayer()
// - createEnemies()
// - createStructures()
// - createWater()
// - updateEnemies()
// - useWaterPower()
// - useRiptide()
// - updateWaterEffects()
// - animate()
// - onKeyDown/onKeyUp/onMouseMove/onMouseDown handlers
// - onWindowResize/onPointerLockChange handlers

// For now, we'll need to copy these from percyjackson.js or reference them
// Since the file is very long, let's create a wrapper that loads both

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

