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
        // Continue without audio
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
            slot.title = `${item.name} x${item.quantity}\n${item.type === 'consumable' ? 'Click to use' : 'Click to equip'}`;
            slot.onclick = () => {
                if (item.type === 'consumable') {
                    useItem(item.id);
                    showNotification(`Used ${item.name}!`);
                } else {
                    equipItem(item.id);
                    showNotification(`Equipped ${item.name}!`);
                }
            };
            slot.oncontextmenu = (e) => {
                e.preventDefault();
                // Right click to drop item
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    inventory.splice(i, 1);
                }
                updateInventoryUI();
                showNotification(`Dropped ${item.name}`);
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
let elements = {};

// ==================== PASSWORD PROTECTION ====================
const GAME_PASSWORD = '123456789'; // Change this to your desired password

function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const passwordScreen = document.getElementById('passwordScreen');
    const mainMenu = document.getElementById('mainMenu');
    
    if (!passwordInput) return;
    
    const enteredPassword = passwordInput.value;
    
    if (enteredPassword === GAME_PASSWORD) {
        // Correct password - show main menu
        if (passwordScreen) passwordScreen.classList.add('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (passwordError) passwordError.style.display = 'none';
        
        // Store session
        sessionStorage.setItem('percyjackson_unlocked', 'true');
    } else {
        // Wrong password
        if (passwordError) {
            passwordError.style.display = 'block';
            passwordError.textContent = '❌ Incorrect Password';
        }
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

// ==================== INITIALIZATION ====================
function init() {
    try {
        // Initialize elements after DOM is ready
        elements = {
            mainMenu: document.getElementById('mainMenu'),
            gameScreen: document.getElementById('gameScreen'),
            loadingScreen: document.getElementById('loadingScreen'),
            pauseMenu: document.getElementById('pauseMenu'),
            settingsPanel: document.getElementById('settingsPanel'),
            inventoryPanel: document.getElementById('inventoryPanel'),
            questPanel: document.getElementById('questPanel'),
            notification: document.getElementById('notification')
        };
        
        // Check if already unlocked in this session
        const isUnlocked = sessionStorage.getItem('percyjackson_unlocked') === 'true';
        
        if (!isUnlocked) {
            // Show password screen
            const passwordScreen = document.getElementById('passwordScreen');
            const mainMenu = document.getElementById('mainMenu');
            if (passwordScreen) passwordScreen.classList.remove('hidden');
            if (mainMenu) mainMenu.classList.add('hidden');
            
            // Setup password input
            const passwordInput = document.getElementById('passwordInput');
            const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
            
            if (passwordInput) {
                passwordInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        checkPassword();
                    }
                });
            }
            
            if (passwordSubmitBtn) {
                passwordSubmitBtn.addEventListener('click', checkPassword);
            }
        } else {
            // Already unlocked - show main menu
            const passwordScreen = document.getElementById('passwordScreen');
            const mainMenu = document.getElementById('mainMenu');
            if (passwordScreen) passwordScreen.classList.add('hidden');
            if (mainMenu) mainMenu.classList.remove('hidden');
        }
        
        loadSettings();
        initAudio();
        setupEventListeners();
        
        // Hide loading screen after a moment
        setTimeout(() => {
            const loadingScreen = elements.loadingScreen || document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 500);
        
        // Check for save file
        const hasSave = loadGame();
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.style.display = hasSave ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        // Hide loading screen even on error
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
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
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background as fallback
    
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

// ==================== GAME WORLD FUNCTIONS ====================
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
            const damage = Math.max(1, 5 - playerStats.defense / 5);
            playerStats.hp -= damage;
            enemy.userData.attackCooldown = 60;
            playSound('hit');
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
            // Drop items before removing enemy (clone position to avoid reference issues)
            const dropChance = Math.random();
            const dropPosition = enemy.position.clone();
            if (dropChance < 0.3) {
                // 30% chance to drop health potion
                dropItem(dropPosition, 'healthPotion');
            } else if (dropChance < 0.5) {
                // 20% chance to drop mana potion
                dropItem(dropPosition, 'manaPotion');
            } else if (dropChance < 0.6 && playerStats.level >= 5) {
                // 10% chance to drop armor (level 5+)
                dropItem(dropPosition, 'demigodArmor');
            } else if (dropChance < 0.65 && playerStats.level >= 10) {
                // 5% chance to drop trident (level 10+)
                dropItem(dropPosition, 'trident');
            }
            
            scene.remove(enemy);
            enemies.splice(index, 1);
            playerStats.kills++;
            playerStats.xp += 20;
            playerStats.gold += 5 + Math.floor(Math.random() * 10);
            
            // Update quest progress
            quests[0].current = playerStats.kills;
            quests[4].current = playerStats.kills;
            quests[3].current = playerStats.gold;
            checkQuests();
            
            checkLevelUp();
            updateUI();
            playSound('attack');
            
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
    playerStats.waterPowerUsed++;
    quests[1].current++;
    playSound('water');
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
    playSound('attack');
    updateUI();
    
    // Damage all nearby enemies
    enemies.forEach(enemy => {
        const dx = enemy.position.x - player.position.x;
        const dz = enemy.position.z - player.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 8) {
            enemy.userData.hp -= playerStats.attack;
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

// ==================== EVENT HANDLERS ====================
function onKeyDown(event) {
    if (gameState !== 'playing') return;
    
    switch (event.key.toLowerCase()) {
        case 'w': controls.moveForward = true; break;
        case 's': controls.moveBackward = true; break;
        case 'a': controls.moveLeft = true; break;
        case 'd': controls.moveRight = true; break;
        case ' ': 
            controls.jump = true;
            if (isGrounded && canJump) {
                jumpRequested = true;
            }
            break;
    }
}

function onKeyUp(event) {
    if (gameState !== 'playing') return;
    
    switch (event.key.toLowerCase()) {
        case 'w': controls.moveForward = false; break;
        case 's': controls.moveBackward = false; break;
        case 'a': controls.moveLeft = false; break;
        case 'd': controls.moveRight = false; break;
        case ' ': controls.jump = false; break;
    }
}

function onMouseMove(event) {
    if (!isPointerLocked || gameState !== 'playing') return;
    
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    
    camera.quaternion.setFromEuler(euler);
}

function onMouseDown(event) {
    if (!isPointerLocked || gameState !== 'playing') return;
    
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
    if (!container || !camera || !renderer) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// ==================== GAME LOOP ====================
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState !== 'playing') {
        // Still render the scene even when paused/menu to avoid black screen
        if (scene && camera && renderer) {
            renderer.render(scene, camera);
        }
        return;
    }
    
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
    
    // Jumping mechanics
    if (jumpRequested && isGrounded && canJump) {
        jumpVelocity = 0.15;
        isGrounded = false;
        canJump = false;
        jumpRequested = false;
        playSound('attack');
    }
    
    // Apply gravity and jumping
    jumpVelocity += gravity;
    player.position.y += jumpVelocity;
    
    // Ground collision
    if (player.position.y <= 1.5) {
        player.position.y = 1.5;
        jumpVelocity = 0;
        isGrounded = true;
        canJump = true;
    }
    
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
    updateItems();
    updateUI();
    
    // Always render, even if something goes wrong
    if (scene && camera && renderer) {
        renderer.render(scene, camera);
    }
}

// Drop item on the ground
function dropItem(position, itemId) {
    const item = itemDatabase[itemId];
    if (!item) return;
    
    const itemMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: 0xffd700,
            emissiveIntensity: 0.5
        })
    );
    itemMesh.position.copy(position);
    itemMesh.position.y = 1;
    itemMesh.userData = {
        itemId: itemId,
        rotationSpeed: 0.05,
        bobSpeed: 0.02,
        bobOffset: Math.random() * Math.PI * 2,
        lifetime: 300 // 5 seconds at 60fps
    };
    
    // Add glow effect
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0xffd700,
            transparent: true,
            opacity: 0.3
        })
    );
    itemMesh.add(glow);
    
    items.push(itemMesh);
    scene.add(itemMesh);
}

// Update items on the ground
function updateItems() {
    // Iterate backwards to safely remove items
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (!item || !item.userData) {
            items.splice(i, 1);
            continue;
        }
        
        // Rotate and bob
        item.rotation.y += item.userData.rotationSpeed;
        const bobTime = clock.getElapsedTime() * item.userData.bobSpeed;
        item.position.y = 1 + Math.sin(item.userData.bobOffset + bobTime) * 0.2;
        
        // Check if player picks it up
        const dx = player.position.x - item.position.x;
        const dz = player.position.z - item.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 1.5) {
            // Player picked up item
            const itemData = itemDatabase[item.userData.itemId];
            if (itemData) {
                addItem(item.userData.itemId, 1);
                showNotification(`Picked up ${itemData.name}!`);
                playSound('quest');
            }
            scene.remove(item);
            items.splice(i, 1);
            continue;
        }
        
        // Remove after lifetime
        item.userData.lifetime--;
        if (item.userData.lifetime <= 0) {
            scene.remove(item);
            items.splice(i, 1);
        }
    }
}

function gameOver() {
    gameState = 'over';
    totalPlayTime += (Date.now() - playTimeStart) / 1000;
    playerStats.totalPlayTime = totalPlayTime;
    saveGame();
    
    showNotification('💀 Quest Failed! Press Restart to try again.');
    document.exitPointerLock();
    
    // Show game over screen if it exists
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) {
        gameOverScreen.classList.remove('hidden');
        document.getElementById('finalKills').textContent = playerStats.kills;
        document.getElementById('finalQuests').textContent = playerStats.questsCompleted;
        document.getElementById('finalLevel').textContent = playerStats.level;
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

