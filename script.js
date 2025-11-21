const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const comboElement = document.getElementById('combo');
const speedElement = document.getElementById('speed');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const finalCoinsElement = document.getElementById('finalCoins');
const finalComboElement = document.getElementById('finalCombo');
const finalDistanceElement = document.getElementById('finalDistance');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const shopBtn = document.getElementById('shopBtn');
const shopScreen = document.getElementById('shopScreen');
const closeShopBtn = document.getElementById('closeShopBtn');
const ammoElement = document.getElementById('ammo');

// Shop elements
const shopCoinsElement = document.getElementById('shopCoins');
const gunLevelElement = document.getElementById('gunLevel');
const gunLevelDescElement = document.getElementById('gunLevelDesc');
const gunCostElement = document.getElementById('gunCost');
const upgradeGunBtn = document.getElementById('upgradeGunBtn');

const fireRateLevelElement = document.getElementById('fireRateLevel');
const fireRateDescElement = document.getElementById('fireRateDesc');
const fireRateCostElement = document.getElementById('fireRateCost');
const upgradeFireRateBtn = document.getElementById('upgradeFireRateBtn');

const damageLevelElement = document.getElementById('damageLevel');
const damageDescElement = document.getElementById('damageDesc');
const damageCostElement = document.getElementById('damageCost');
const upgradeDamageBtn = document.getElementById('upgradeDamageBtn');

const bulletSpeedLevelElement = document.getElementById('bulletSpeedLevel');
const bulletSpeedDescElement = document.getElementById('bulletSpeedDesc');
const bulletSpeedCostElement = document.getElementById('bulletSpeedCost');
const upgradeBulletSpeedBtn = document.getElementById('upgradeBulletSpeedBtn');

// Power-up icons
const powerUp1 = document.getElementById('powerUp1');
const powerUp2 = document.getElementById('powerUp2');
const powerUp3 = document.getElementById('powerUp3');
const powerUp4 = document.getElementById('powerUp4');

// Game state
let gameState = 'start';
let score = 0;
let coins = 0;
let combo = 1;
let distance = 0;
let gameSpeed = 1;
let frameCount = 0;
let screenShake = 0;
let shootCooldown = 0;
let isShooting = false;

// Player
const player = {
    x: 150,
    y: 0,
    width: 50,
    height: 60,
    velocityY: 0,
    velocityX: 0,
    onGround: false,
    isSliding: false,
    slideTimer: 0,
    jumpCount: 0,
    maxJumps: 1,
    color: '#4CAF50',
    dashCooldown: 0,
    dashActive: false,
    dashTimer: 0
};

// Ground
const groundY = canvas.height - 100;
let groundOffset = 0;

// Arrays
let obstacles = [];
let flyingEnemies = [];
let coins_array = [];
let megaCoins = [];
let powerUps = [];
let particles = [];
let clouds = [];
let explosions = [];
let bullets = [];

// Upgrade system
let upgrades = {
    gunLevel: 1,
    fireRate: 1,
    damage: 1,
    bulletSpeed: 1,
    totalCoins: 0
};

// Load upgrades from localStorage
function loadUpgrades() {
    const saved = localStorage.getItem('runnerUpgrades');
    if (saved) {
        upgrades = { ...upgrades, ...JSON.parse(saved) };
    }
    upgrades.totalCoins = parseInt(localStorage.getItem('totalCoins') || '0');
    updateShopUI();
}

// Save upgrades to localStorage
function saveUpgrades() {
    localStorage.setItem('runnerUpgrades', JSON.stringify({
        gunLevel: upgrades.gunLevel,
        fireRate: upgrades.fireRate,
        damage: upgrades.damage,
        bulletSpeed: upgrades.bulletSpeed
    }));
    localStorage.setItem('totalCoins', upgrades.totalCoins.toString());
}

// Gun stats based on upgrades
function getGunStats() {
    return {
        fireRate: Math.max(5, 30 - upgrades.fireRate * 3), // Cooldown frames
        damage: upgrades.damage,
        bulletSpeed: 8 + upgrades.bulletSpeed * 2,
        bulletSize: 5 + upgrades.gunLevel,
        bulletColor: upgrades.gunLevel >= 3 ? '#ff6b6b' : upgrades.gunLevel >= 2 ? '#4ecdc4' : '#4a90e2'
    };
}

// Power-up states
let powerUpStates = {
    doubleJump: false,
    doubleJumpTimer: 0,
    speedBoost: false,
    speedBoostTimer: 0,
    invincibility: false,
    invincibilityTimer: 0,
    magnet: false,
    magnetTimer: 0
};

// Physics
const gravity = 0.8;
const jumpPower = -18;
const friction = 0.9;
const playerSpeed = 6;

// Initialize clouds
function initClouds() {
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 200 + 50,
            width: 80 + Math.random() * 60,
            height: 40 + Math.random() * 30,
            speed: 0.5 + Math.random() * 0.5
        });
    }
}

// Input handling
const keys = {};
let jumpPressed = false;
let slidePressed = false;
let dashPressed = false;

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if ((e.key === ' ' || e.key === 'ArrowUp') && gameState === 'playing') {
        e.preventDefault();
        if (!jumpPressed) {
            jump();
            jumpPressed = true;
        }
    }
    if (e.key === 'ArrowDown' && gameState === 'playing') {
        e.preventDefault();
        slide();
    }
    if ((e.key === 'Shift' || e.key === 'ShiftLeft') && gameState === 'playing') {
        e.preventDefault();
        if (!dashPressed && player.dashCooldown === 0) {
            dash();
            dashPressed = true;
        }
    }
    if ((e.key === 'x' || e.key === 'X') && gameState === 'playing') {
        e.preventDefault();
        if (shootCooldown === 0) {
            isShooting = true;
        }
    }
});

canvas.addEventListener('click', (e) => {
    if (gameState === 'playing') {
        isShooting = true;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === ' ' || e.key === 'ArrowUp') {
        jumpPressed = false;
    }
    if (e.key === 'ArrowDown') {
        player.isSliding = false;
        slidePressed = false;
    }
    if (e.key === 'Shift' || e.key === 'ShiftLeft') {
        dashPressed = false;
    }
});

// Mobile controls
document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing' && !jumpPressed) {
        jump();
        jumpPressed = true;
    }
});

document.getElementById('jumpBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    jumpPressed = false;
});

document.getElementById('slideBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing') {
        slide();
        slidePressed = true;
    }
});

document.getElementById('slideBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    player.isSliding = false;
    slidePressed = false;
});

document.getElementById('dashBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing' && player.dashCooldown === 0) {
        dash();
    }
});

document.getElementById('leftBtn').addEventListener('touchstart', () => keys['a'] = true);
document.getElementById('leftBtn').addEventListener('touchend', () => keys['a'] = false);
document.getElementById('rightBtn').addEventListener('touchstart', () => keys['d'] = true);
document.getElementById('rightBtn').addEventListener('touchend', () => keys['d'] = false);
document.getElementById('shootBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing') {
        isShooting = true;
    }
});
document.getElementById('shootBtn').addEventListener('touchend', (e) => {
    e.preventDefault();
    isShooting = false;
});

// Jump function
function jump() {
    if (player.jumpCount < player.maxJumps) {
        player.velocityY = jumpPower;
        player.jumpCount++;
        player.onGround = false;
        createJumpParticles();
    }
}

// Slide function
function slide() {
    if (player.onGround && !player.isSliding) {
        player.isSliding = true;
        player.slideTimer = 30;
    }
}

// Dash function
function dash() {
    if (player.dashCooldown === 0) {
        player.dashActive = true;
        player.dashTimer = 10;
        player.dashCooldown = 60;
        
        // Dash direction based on movement
        let dashX = 0;
        if (keys['a'] || keys['arrowleft']) dashX = -1;
        if (keys['d'] || keys['arrowright']) dashX = 1;
        
        player.velocityX = dashX * 20;
        if (!player.onGround) {
            player.velocityY *= 0.5; // Reduce vertical velocity during air dash
        }
        
        createDashParticles();
        addScreenShake(5);
    }
}

// Shoot function
function shoot() {
    if (shootCooldown > 0) {
        isShooting = false;
        return;
    }
    
    const gunStats = getGunStats();
    shootCooldown = gunStats.fireRate;
    isShooting = false; // Reset after shooting
    
    bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2,
        vx: gunStats.bulletSpeed,
        vy: 0,
        size: gunStats.bulletSize,
        color: gunStats.bulletColor,
        damage: gunStats.damage
    });
    
    // Muzzle flash particles
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: player.x + player.width,
            y: player.y + player.height / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 10,
            color: gunStats.bulletColor
        });
    }
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vx;
        
        // Check collision with obstacles
        let hit = false;
        for (let j = obstacles.length - 1; j >= 0; j--) {
            const obstacle = obstacles[j];
            if (bullet.x > obstacle.x && bullet.x < obstacle.x + obstacle.width &&
                bullet.y > obstacle.y && bullet.y < obstacle.y + obstacle.height) {
                
                // Destroy obstacle
                score += obstacle.points * combo;
                createExplosion(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.color);
                addScreenShake(2);
                obstacles.splice(j, 1);
                bullets.splice(i, 1);
                hit = true;
                break;
            }
        }
        
        if (hit) continue;
        
        // Check collision with flying enemies
        for (let j = flyingEnemies.length - 1; j >= 0; j--) {
            const enemy = flyingEnemies[j];
            if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                
                score += enemy.points * combo;
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                addScreenShake(2);
                flyingEnemies.splice(j, 1);
                bullets.splice(i, 1);
                hit = true;
                break;
            }
        }
        
        if (hit) continue;
        
        // Remove if off screen
        if (bullet.x > canvas.width || bullet.x < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Update player
function updatePlayer() {
    // Horizontal movement
    if (keys['a'] || keys['arrowleft']) {
        player.velocityX = -playerSpeed;
    } else if (keys['d'] || keys['arrowright']) {
        player.velocityX = playerSpeed;
    } else {
        player.velocityX *= 0.8; // Friction
    }
    
    // Apply gravity
    if (!player.onGround) {
        player.velocityY += gravity;
    }
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Boundaries
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    
    // Ground collision
    const playerBottom = player.y + (player.isSliding ? player.height * 0.6 : player.height);
    if (playerBottom >= groundY) {
        player.y = groundY - (player.isSliding ? player.height * 0.6 : player.height);
        player.velocityY = 0;
        if (!player.onGround) {
            player.onGround = true;
            player.jumpCount = 0;
            createLandParticles();
        }
    } else {
        player.onGround = false;
    }
    
    // Update slide
    if (player.isSliding) {
        player.slideTimer--;
        if (player.slideTimer <= 0) {
            player.isSliding = false;
        }
    }
    
    // Update dash
    if (player.dashActive) {
        player.dashTimer--;
        if (player.dashTimer <= 0) {
            player.dashActive = false;
        }
    }
    if (player.dashCooldown > 0) {
        player.dashCooldown--;
    }
}

// Spawn obstacles
function spawnObstacle() {
    const types = [
        { width: 40, height: 60, y: groundY - 60, color: '#e74c3c', points: 20, breakable: false },
        { width: 50, height: 80, y: groundY - 80, color: '#c0392b', points: 30, breakable: false },
        { width: 30, height: 40, y: groundY - 40, color: '#f39c12', points: 15, breakable: true },
        { width: 60, height: 100, y: groundY - 100, color: '#8e44ad', points: 50, breakable: false },
        { width: 35, height: 50, y: groundY - 50, color: '#16a085', points: 25, breakable: true }
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    obstacles.push({
        x: canvas.width,
        y: type.y,
        width: type.width,
        height: type.height,
        color: type.color,
        points: type.points,
        breakable: type.breakable,
        moving: Math.random() < 0.3,
        moveSpeed: (Math.random() - 0.5) * 2,
        moveRange: 50
    });
}

// Spawn flying enemies
function spawnFlyingEnemy() {
    flyingEnemies.push({
        x: canvas.width,
        y: groundY - 150 - Math.random() * 200,
        width: 40,
        height: 30,
        speed: 3 + Math.random() * 2,
        color: '#e74c3c',
        points: 40,
        movePattern: Math.random() < 0.5 ? 'sine' : 'straight',
        angle: 0
    });
}

// Spawn coins
function spawnCoin() {
    coins_array.push({
        x: canvas.width + Math.random() * 200,
        y: groundY - 80 - Math.random() * 100,
        radius: 15,
        collected: false,
        rotation: 0,
        magnetPull: 0
    });
}

// Spawn mega coins
function spawnMegaCoin() {
    megaCoins.push({
        x: canvas.width + Math.random() * 300,
        y: groundY - 100 - Math.random() * 150,
        radius: 25,
        collected: false,
        rotation: 0,
        magnetPull: 0,
        pulse: 0
    });
}

// Spawn power-ups
function spawnPowerUp() {
    const types = ['doubleJump', 'speedBoost', 'invincibility', 'magnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUps.push({
        x: canvas.width + Math.random() * 300,
        y: groundY - 100,
        width: 40,
        height: 40,
        type: type,
        color: type === 'doubleJump' ? '#3498db' : type === 'speedBoost' ? '#e67e22' : type === 'invincibility' ? '#9b59b6' : '#f1c40f',
        rotation: 0
    });
}

// Update obstacles
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= 5 * gameSpeed;
        
        // Moving obstacles
        if (obstacle.moving) {
            obstacle.y += obstacle.moveSpeed;
            if (obstacle.y < groundY - obstacle.height - obstacle.moveRange || 
                obstacle.y > groundY - obstacle.height) {
                obstacle.moveSpeed *= -1;
            }
        }
        
        // Check collision
        if (!powerUpStates.invincibility) {
            const playerHeight = player.isSliding ? player.height * 0.6 : player.height;
            const playerY = player.isSliding ? player.y + player.height * 0.4 : player.y;
            
            if (player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                playerY < obstacle.y + obstacle.height &&
                playerY + playerHeight > obstacle.y) {
                
                // Breakable obstacles can be destroyed with dash
                if (obstacle.breakable && player.dashActive) {
                    score += obstacle.points * combo;
                    createExplosion(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.color);
                    addScreenShake(3);
                    obstacles.splice(i, 1);
                    continue;
                } else if (!obstacle.breakable) {
                    gameOver();
                    return;
                }
            }
        }
        
        // Remove if off screen
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            combo = Math.min(combo + 0.1, 5);
            comboElement.textContent = `x${combo.toFixed(1)}`;
        }
    }
}

// Update flying enemies
function updateFlyingEnemies() {
    for (let i = flyingEnemies.length - 1; i >= 0; i--) {
        const enemy = flyingEnemies[i];
        enemy.x -= enemy.speed * gameSpeed;
        
        if (enemy.movePattern === 'sine') {
            enemy.angle += 0.1;
            enemy.y += Math.sin(enemy.angle) * 2;
        }
        
        // Check collision
        if (!powerUpStates.invincibility) {
            const playerHeight = player.isSliding ? player.height * 0.6 : player.height;
            const playerY = player.isSliding ? player.y + player.height * 0.4 : player.y;
            
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                playerY < enemy.y + enemy.height &&
                playerY + playerHeight > enemy.y) {
                
                // Can destroy with dash
                if (player.dashActive) {
                    score += enemy.points * combo;
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    addScreenShake(3);
                    flyingEnemies.splice(i, 1);
                    continue;
                } else {
                    gameOver();
                    return;
                }
            }
        }
        
        // Remove if off screen
        if (enemy.x + enemy.width < 0) {
            flyingEnemies.splice(i, 1);
        }
    }
}

// Update coins
function updateCoins() {
    for (let i = coins_array.length - 1; i >= 0; i--) {
        const coin = coins_array[i];
        coin.x -= 5 * gameSpeed;
        coin.rotation += 0.1;
        
        // Magnet effect
        if (powerUpStates.magnet) {
            const dx = (player.x + player.width / 2) - coin.x;
            const dy = (player.y + player.height / 2) - coin.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                coin.magnetPull += 0.3;
                const pull = Math.min(coin.magnetPull, 8);
                coin.x += (dx / dist) * pull;
                coin.y += (dy / dist) * pull;
            }
        }
        
        // Check collection
        const dx = coin.x - (player.x + player.width / 2);
        const dy = coin.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < coin.radius + player.width / 2 && !coin.collected) {
            coin.collected = true;
            coins++;
            upgrades.totalCoins++;
            score += 10 * combo;
            coinsElement.textContent = coins;
            scoreElement.textContent = Math.floor(score);
            createCoinParticles(coin.x, coin.y);
            coins_array.splice(i, 1);
            continue;
        }
        
        // Remove if off screen
        if (coin.x + coin.radius < 0) {
            coins_array.splice(i, 1);
        }
    }
}

// Update mega coins
function updateMegaCoins() {
    for (let i = megaCoins.length - 1; i >= 0; i--) {
        const coin = megaCoins[i];
        coin.x -= 5 * gameSpeed;
        coin.rotation += 0.15;
        coin.pulse += 0.2;
        
        // Magnet effect
        if (powerUpStates.magnet) {
            const dx = (player.x + player.width / 2) - coin.x;
            const dy = (player.y + player.height / 2) - coin.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250) {
                coin.magnetPull += 0.4;
                const pull = Math.min(coin.magnetPull, 10);
                coin.x += (dx / dist) * pull;
                coin.y += (dy / dist) * pull;
            }
        }
        
        // Check collection
        const dx = coin.x - (player.x + player.width / 2);
        const dy = coin.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < coin.radius + player.width / 2 && !coin.collected) {
            coin.collected = true;
            coins += 5;
            upgrades.totalCoins += 5;
            score += 100 * combo;
            coinsElement.textContent = coins;
            scoreElement.textContent = Math.floor(score);
            createMegaCoinParticles(coin.x, coin.y);
            addScreenShake(2);
            megaCoins.splice(i, 1);
            continue;
        }
        
        // Remove if off screen
        if (coin.x + coin.radius < 0) {
            megaCoins.splice(i, 1);
        }
    }
}

// Update power-ups
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.x -= 5 * gameSpeed;
        powerUp.rotation += 0.05;
        
        // Check collection
        const dx = powerUp.x - (player.x + player.width / 2);
        const dy = powerUp.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < powerUp.width / 2 + player.width / 2) {
            activatePowerUp(powerUp.type);
            powerUps.splice(i, 1);
            continue;
        }
        
        // Remove if off screen
        if (powerUp.x + powerUp.width < 0) {
            powerUps.splice(i, 1);
        }
    }
}

// Activate power-up
function activatePowerUp(type) {
    const duration = 600;
    
    if (type === 'doubleJump') {
        powerUpStates.doubleJump = true;
        powerUpStates.doubleJumpTimer = duration;
        player.maxJumps = 2;
        powerUp1.classList.remove('hidden');
        powerUp1.classList.add('active');
        powerUp1.textContent = '🔄';
    } else if (type === 'speedBoost') {
        powerUpStates.speedBoost = true;
        powerUpStates.speedBoostTimer = duration;
        gameSpeed = 1.5;
        powerUp2.classList.remove('hidden');
        powerUp2.classList.add('active');
        powerUp2.textContent = '⚡';
    } else if (type === 'invincibility') {
        powerUpStates.invincibility = true;
        powerUpStates.invincibilityTimer = duration;
        powerUp3.classList.remove('hidden');
        powerUp3.classList.add('active');
        powerUp3.textContent = '🛡️';
    } else if (type === 'magnet') {
        powerUpStates.magnet = true;
        powerUpStates.magnetTimer = duration;
        powerUp4.classList.remove('hidden');
        powerUp4.classList.add('active');
        powerUp4.textContent = '🧲';
    }
}

// Update power-up timers
function updatePowerUpTimers() {
    if (powerUpStates.doubleJumpTimer > 0) {
        powerUpStates.doubleJumpTimer--;
        if (powerUpStates.doubleJumpTimer === 0) {
            powerUpStates.doubleJump = false;
            player.maxJumps = 1;
            powerUp1.classList.add('hidden');
            powerUp1.classList.remove('active');
        }
    }
    
    if (powerUpStates.speedBoostTimer > 0) {
        powerUpStates.speedBoostTimer--;
        if (powerUpStates.speedBoostTimer === 0) {
            powerUpStates.speedBoost = false;
            gameSpeed = 1;
            powerUp2.classList.add('hidden');
            powerUp2.classList.remove('active');
        }
    }
    
    if (powerUpStates.invincibilityTimer > 0) {
        powerUpStates.invincibilityTimer--;
        if (powerUpStates.invincibilityTimer === 0) {
            powerUpStates.invincibility = false;
            powerUp3.classList.add('hidden');
            powerUp3.classList.remove('active');
        }
    }
    
    if (powerUpStates.magnetTimer > 0) {
        powerUpStates.magnetTimer--;
        if (powerUpStates.magnetTimer === 0) {
            powerUpStates.magnet = false;
            powerUp4.classList.add('hidden');
            powerUp4.classList.remove('active');
        }
    }
    
    // Update speed display
    speedElement.textContent = `${gameSpeed.toFixed(1)}x`;
}

// Screen shake
function addScreenShake(intensity) {
    screenShake = Math.max(screenShake, intensity);
}

// Particles
function createJumpParticles() {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2,
            life: 20,
            color: '#4CAF50'
        });
    }
}

function createDashParticles() {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 15,
            color: '#e91e63'
        });
    }
}

function createLandParticles() {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: player.x + player.width / 2,
            y: groundY,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3,
            life: 25,
            color: '#8B4513'
        });
    }
}

function createCoinParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: '#FFD700'
        });
    }
}

function createMegaCoinParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 40,
            color: '#FFD700',
            size: 5
        });
    }
}

function createExplosion(x, y, color) {
    explosions.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: 50,
        life: 20,
        color: color
    });
    
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            color: color
        });
    }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.radius += 2;
        exp.life--;
        
        if (exp.life <= 0 || exp.radius >= exp.maxRadius) {
            explosions.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Update clouds
function updateClouds() {
    for (let cloud of clouds) {
        cloud.x -= cloud.speed * gameSpeed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width;
            cloud.y = Math.random() * 200 + 50;
        }
    }
}

// Update ground
function updateGround() {
    groundOffset += 5 * gameSpeed;
    if (groundOffset > 50) {
        groundOffset = 0;
    }
}

// Update screen shake
function updateScreenShake() {
    if (screenShake > 0) {
        screenShake *= 0.9;
        if (screenShake < 0.1) screenShake = 0;
    }
}

// Shop functions
function updateShopUI() {
    shopCoinsElement.textContent = upgrades.totalCoins;
    
    // Gun Level
    gunLevelElement.textContent = upgrades.gunLevel;
    const gunDescs = ['Basic Gun', 'Improved Gun', 'Advanced Gun', 'Elite Gun', 'Master Gun'];
    gunLevelDescElement.textContent = gunDescs[Math.min(upgrades.gunLevel - 1, gunDescs.length - 1)] || 'Max Level';
    const gunCost = 50 * Math.pow(2, upgrades.gunLevel - 1);
    gunCostElement.textContent = upgrades.gunLevel >= 5 ? 'MAX' : gunCost;
    upgradeGunBtn.disabled = upgrades.gunLevel >= 5 || upgrades.totalCoins < gunCost;
    
    // Fire Rate
    fireRateLevelElement.textContent = upgrades.fireRate;
    const fireRateDescs = ['Normal Speed', 'Fast', 'Very Fast', 'Rapid', 'Ultra Rapid'];
    fireRateDescElement.textContent = fireRateDescs[Math.min(upgrades.fireRate - 1, fireRateDescs.length - 1)] || 'Max Level';
    const fireRateCost = 75 * Math.pow(2, upgrades.fireRate - 1);
    fireRateCostElement.textContent = upgrades.fireRate >= 5 ? 'MAX' : fireRateCost;
    upgradeFireRateBtn.disabled = upgrades.fireRate >= 5 || upgrades.totalCoins < fireRateCost;
    
    // Damage
    damageLevelElement.textContent = upgrades.damage;
    const damageDescs = ['Standard', 'Strong', 'Very Strong', 'Powerful', 'Devastating'];
    damageDescElement.textContent = damageDescs[Math.min(upgrades.damage - 1, damageDescs.length - 1)] || 'Max Level';
    const damageCost = 100 * Math.pow(2, upgrades.damage - 1);
    damageCostElement.textContent = upgrades.damage >= 5 ? 'MAX' : damageCost;
    upgradeDamageBtn.disabled = upgrades.damage >= 5 || upgrades.totalCoins < damageCost;
    
    // Bullet Speed
    bulletSpeedLevelElement.textContent = upgrades.bulletSpeed;
    const bulletSpeedDescs = ['Normal', 'Fast', 'Very Fast', 'Lightning', 'Ultra'];
    bulletSpeedDescElement.textContent = bulletSpeedDescs[Math.min(upgrades.bulletSpeed - 1, bulletSpeedDescs.length - 1)] || 'Max Level';
    const bulletSpeedCost = 60 * Math.pow(2, upgrades.bulletSpeed - 1);
    bulletSpeedCostElement.textContent = upgrades.bulletSpeed >= 5 ? 'MAX' : bulletSpeedCost;
    upgradeBulletSpeedBtn.disabled = upgrades.bulletSpeed >= 5 || upgrades.totalCoins < bulletSpeedCost;
}

function purchaseUpgrade(type) {
    let cost = 0;
    let maxLevel = 5;
    
    if (type === 'gunLevel' && upgrades.gunLevel < maxLevel) {
        cost = 50 * Math.pow(2, upgrades.gunLevel - 1);
        if (upgrades.totalCoins >= cost) {
            upgrades.totalCoins -= cost;
            upgrades.gunLevel++;
            saveUpgrades();
            updateShopUI();
        }
    } else if (type === 'fireRate' && upgrades.fireRate < maxLevel) {
        cost = 75 * Math.pow(2, upgrades.fireRate - 1);
        if (upgrades.totalCoins >= cost) {
            upgrades.totalCoins -= cost;
            upgrades.fireRate++;
            saveUpgrades();
            updateShopUI();
        }
    } else if (type === 'damage' && upgrades.damage < maxLevel) {
        cost = 100 * Math.pow(2, upgrades.damage - 1);
        if (upgrades.totalCoins >= cost) {
            upgrades.totalCoins -= cost;
            upgrades.damage++;
            saveUpgrades();
            updateShopUI();
        }
    } else if (type === 'bulletSpeed' && upgrades.bulletSpeed < maxLevel) {
        cost = 60 * Math.pow(2, upgrades.bulletSpeed - 1);
        if (upgrades.totalCoins >= cost) {
            upgrades.totalCoins -= cost;
            upgrades.bulletSpeed++;
            saveUpgrades();
            updateShopUI();
        }
    }
}

// Draw bullets
function drawBullets() {
    for (let bullet of bullets) {
        ctx.fillStyle = bullet.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail effect
        ctx.fillStyle = bullet.color + '80';
        ctx.beginPath();
        ctx.arc(bullet.x - 5, bullet.y, bullet.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

// Game logic
function gameOver() {
    gameState = 'gameOver';
    finalScoreElement.textContent = Math.floor(score);
    finalCoinsElement.textContent = coins;
    finalComboElement.textContent = `x${combo.toFixed(1)}`;
    finalDistanceElement.textContent = Math.floor(distance);
    saveUpgrades(); // Save coins when game ends
    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    gameState = 'playing';
    score = 0;
    coins = 0;
    combo = 1;
    distance = 0;
    gameSpeed = 1;
    frameCount = 0;
    screenShake = 0;
    shootCooldown = 0;
    isShooting = false;
    
    obstacles = [];
    flyingEnemies = [];
    coins_array = [];
    megaCoins = [];
    powerUps = [];
    particles = [];
    explosions = [];
    bullets = [];
    
    powerUpStates = {
        doubleJump: false,
        doubleJumpTimer: 0,
        speedBoost: false,
        speedBoostTimer: 0,
        invincibility: false,
        invincibilityTimer: 0,
        magnet: false,
        magnetTimer: 0
    };
    
    player.x = 150;
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.velocityX = 0;
    player.onGround = true;
    player.isSliding = false;
    player.jumpCount = 0;
    player.maxJumps = 1;
    player.dashCooldown = 0;
    player.dashActive = false;
    
    powerUp1.classList.add('hidden');
    powerUp2.classList.add('hidden');
    powerUp3.classList.add('hidden');
    powerUp4.classList.add('hidden');
    
    scoreElement.textContent = score;
    coinsElement.textContent = coins;
    comboElement.textContent = `x${combo}`;
    speedElement.textContent = `${gameSpeed}x`;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

// Drawing functions
function drawBackground() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8C8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let cloud of clouds) {
        drawCloud(cloud.x, cloud.y, cloud.width, cloud.height);
    }
    
    ctx.restore();
}

function drawCloud(x, y, width, height) {
    ctx.beginPath();
    ctx.arc(x, y, height / 2, 0, Math.PI * 2);
    ctx.arc(x + width / 3, y, height / 2, 0, Math.PI * 2);
    ctx.arc(x + width * 2 / 3, y, height / 2, 0, Math.PI * 2);
    ctx.arc(x + width / 2, y - height / 3, height / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawGround() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, groundY, canvas.width, 10);
    
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let x = -groundOffset; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawPlayer() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    if (powerUpStates.invincibility) {
        const flash = Math.sin(frameCount * 0.5) > 0;
        if (!flash) {
            ctx.globalAlpha = 0.5;
        }
    }
    
    const playerHeight = player.isSliding ? player.height * 0.6 : player.height;
    const playerY = player.isSliding ? player.y + player.height * 0.4 : player.y;
    
    // Dash trail
    if (player.dashActive) {
        ctx.fillStyle = 'rgba(233, 30, 99, 0.3)';
        ctx.fillRect(player.x - 20, playerY, player.width + 40, playerHeight);
    }
    
    // Body
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, playerY, player.width, playerHeight);
    
    // Head
    ctx.fillStyle = '#FFDBAC';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, playerY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - 5, playerY - 2, 3, 0, Math.PI * 2);
    ctx.arc(player.x + player.width / 2 + 5, playerY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Power-up effects
    if (powerUpStates.invincibility) {
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, playerY + playerHeight / 2, player.width / 2 + 10, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    if (powerUpStates.magnet) {
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, playerY + playerHeight / 2, 200, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    ctx.restore();
}

function drawObstacles() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    for (let obstacle of obstacles) {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        if (obstacle.breakable) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, 10);
    }
    
    ctx.restore();
}

function drawFlyingEnemies() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    for (let enemy of flyingEnemies) {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y);
        ctx.lineTo(enemy.x, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

function drawCoins() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    for (let coin of coins_array) {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFED4E';
        ctx.beginPath();
        ctx.arc(-coin.radius / 3, -coin.radius / 3, coin.radius / 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        
        ctx.restore();
    }
    
    ctx.restore();
}

function drawMegaCoins() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    for (let coin of megaCoins) {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);
        
        const pulseSize = coin.radius + Math.sin(coin.pulse) * 3;
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = '#FFED4E';
        ctx.beginPath();
        ctx.arc(-pulseSize / 3, -pulseSize / 3, pulseSize / 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$$', 0, 0);
        
        ctx.restore();
    }
    
    ctx.restore();
}

function drawPowerUps() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
    
    for (let powerUp of powerUps) {
        ctx.save();
        ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        ctx.rotate(powerUp.rotation);
        
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icon = powerUp.type === 'doubleJump' ? '🔄' : powerUp.type === 'speedBoost' ? '⚡' : powerUp.type === 'invincibility' ? '🛡️' : '🧲';
        ctx.fillText(icon, 0, 0);
        
        ctx.restore();
    }
    
    ctx.restore();
}

function drawExplosions() {
    for (let exp of explosions) {
        ctx.fillStyle = exp.color;
        ctx.globalAlpha = 1 - (exp.radius / exp.maxRadius);
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawParticles() {
    for (let p of particles) {
        const alpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        const size = p.size || 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Game loop
function gameLoop() {
    if (gameState !== 'playing') return;
    
    frameCount++;
    distance += 0.1 * gameSpeed;
    
    // Progressive difficulty
    gameSpeed = 1 + Math.floor(distance / 100) * 0.1;
    if (powerUpStates.speedBoost) {
        gameSpeed = 1.5 + Math.floor(distance / 100) * 0.1;
    }
    
    // Spawn objects
    if (frameCount % Math.max(60 - Math.floor(distance / 50), 20) === 0) {
        spawnObstacle();
    }
    if (frameCount % 80 === 0) {
        spawnFlyingEnemy();
    }
    if (frameCount % 45 === 0) {
        spawnCoin();
    }
    if (frameCount % 120 === 0) {
        spawnMegaCoin();
    }
    if (frameCount % 300 === 0) {
        spawnPowerUp();
    }
    
    // Shooting (auto-fire when key held or button pressed)
    if (isShooting || keys['x']) {
        shoot();
    }
    if (shootCooldown > 0) {
        shootCooldown--;
    }
    
    // Update
    updateClouds();
    updateGround();
    updatePlayer();
    updateBullets();
    updateObstacles();
    updateFlyingEnemies();
    updateCoins();
    updateMegaCoins();
    updatePowerUps();
    updatePowerUpTimers();
    updateParticles();
    updateExplosions();
    updateScreenShake();
    
    // Update score
    score += 0.1 * gameSpeed * combo;
    scoreElement.textContent = Math.floor(score);
    
    // Update ammo display
    const gunStats = getGunStats();
    ammoElement.textContent = shootCooldown > 0 ? '⏳' : '∞';
    
    // Draw
    drawBackground();
    drawGround();
    drawObstacles();
    drawFlyingEnemies();
    drawCoins();
    drawMegaCoins();
    drawPowerUps();
    drawBullets();
    drawParticles();
    drawExplosions();
    drawPlayer();
}

// Return to menu function
function returnToMenu() {
    gameState = 'start';
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    saveUpgrades();
}

// Return to game selector
function returnToSelector() {
    if (gameManager) {
        gameManager.showGameSelector();
    }
}

// Event listeners
startBtn.addEventListener('click', () => {
    resetGame();
    startGameLoop();
});
restartBtn.addEventListener('click', () => {
    resetGame();
    startGameLoop();
});
menuBtn.addEventListener('click', () => {
    returnToMenu();
    stopGameLoop();
});

shopBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    updateShopUI();
});

closeShopBtn.addEventListener('click', () => {
    shopScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    saveUpgrades();
});

upgradeGunBtn.addEventListener('click', () => purchaseUpgrade('gunLevel'));
upgradeFireRateBtn.addEventListener('click', () => purchaseUpgrade('fireRate'));
upgradeDamageBtn.addEventListener('click', () => purchaseUpgrade('damage'));
upgradeBulletSpeedBtn.addEventListener('click', () => purchaseUpgrade('bulletSpeed'));

// Initialize
let gameLoopInterval = null;

function startGameLoop() {
    if (gameLoopInterval) return;
    gameLoopInterval = setInterval(() => {
        if (gameState === 'playing') {
            gameLoop();
        }
    }, 1000 / 60);
}

function stopGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
}

// Initialize on page load
function initializeGame() {
    // Initialize game manager after all scripts are loaded
    if (typeof GameManager !== 'undefined') {
        gameManager = new GameManager();
        console.log('Game Manager initialized');
    } else {
        console.error('GameManager class not found!');
    }
    
    initClouds();
    loadUpgrades();
    
    // Start game loop (will only run when gameState === 'playing')
    startGameLoop();
    
    // Show game selector by default
    if (gameManager) {
        gameManager.showGameSelector();
        console.log('Game selector shown');
    } else {
        console.error('Game manager not initialized!');
    }
}

// Wait for DOM and all scripts to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM is already ready, but wait a bit for scripts to load
    setTimeout(initializeGame, 100);
}
