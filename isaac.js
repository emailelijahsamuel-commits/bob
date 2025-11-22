const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const itemScreen = document.getElementById('itemScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const takeItemBtn = document.getElementById('takeItemBtn');

// UI Elements
const healthElement = document.getElementById('health');
const tearsElement = document.getElementById('tears');
const coinsElement = document.getElementById('coins');
const roomElement = document.getElementById('room');
const damageElement = document.getElementById('damage');

// Game state
let gameState = 'start';
let currentRoom = 1;
let enemiesKilled = 0;
let totalCoins = 0;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    speed: 3,
    health: 3,
    maxHealth: 3,
    tears: 1,
    damage: 1,
    tearSpeed: 5,
    tearCooldown: 0,
    tearMaxCooldown: 20,
    color: '#8B0000',
    invincible: false,
    invincibleTimer: 0,
    items: []
};

// Arrays
let tears = [];
let enemies = [];
let items = [];
let pickups = [];
let particles = [];
let roomItems = [];

// Room system
const rooms = [];
let currentRoomIndex = 0;
const roomWidth = canvas.width;
const roomHeight = canvas.height;

// Input
const keys = {};
let mouseX = 0;
let mouseY = 0;
let shooting = false;

// Initialize rooms
function initRooms() {
    rooms.length = 0;
    for (let i = 0; i < 10; i++) {
        const enemyCount = 3 + Math.floor(i / 2);
        rooms.push({
            cleared: false,
            enemies: enemyCount,
            hasItem: i % 3 === 0 && i > 0,
            item: null
        });
    }
}

// Items database
const itemDatabase = [
    { name: 'Tears Up', icon: '💧', effect: 'tears', value: 0.5, color: '#4a90e2' },
    { name: 'Damage Up', icon: '⚔️', effect: 'damage', value: 1, color: '#e74c3c' },
    { name: 'Speed Up', icon: '👟', effect: 'speed', value: 0.5, color: '#2ecc71' },
    { name: 'Health Up', icon: '❤️', effect: 'health', value: 1, color: '#e91e63' },
    { name: 'Range Up', icon: '🎯', effect: 'range', value: 50, color: '#9b59b6' },
    { name: 'Shot Speed', icon: '⚡', effect: 'tearSpeed', value: 1, color: '#f39c12' }
];

// Input handlers
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        shooting = true;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === ' ') {
        shooting = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => {
    if (gameState === 'playing') {
        shooting = true;
    }
});

canvas.addEventListener('mouseup', () => {
    shooting = false;
});

// Spawn enemies
function spawnEnemies(count) {
    enemies = [];
    for (let i = 0; i < count; i++) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // Top
                x = Math.random() * canvas.width;
                y = 50;
                break;
            case 1: // Right
                x = canvas.width - 50;
                y = Math.random() * canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * canvas.width;
                y = canvas.height - 50;
                break;
            case 3: // Left
                x = 50;
                y = Math.random() * canvas.height;
                break;
        }
        
        enemies.push({
            x: x,
            y: y,
            radius: 12 + Math.random() * 8,
            speed: 1 + Math.random() * 1.5,
            health: 1 + Math.floor(currentRoom / 3),
            maxHealth: 1 + Math.floor(currentRoom / 3),
            color: '#8B0000',
            type: Math.random() < 0.3 ? 'shooter' : 'chaser',
            shootCooldown: 0,
            angle: 0
        });
    }
}

// Shoot tears
function shoot() {
    if (player.tearCooldown > 0) return;
    
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return;
    
    const angle = Math.atan2(dy, dx);
    
    // Multiple tears based on tears stat
    const tearCount = Math.floor(player.tears);
    for (let i = 0; i < tearCount; i++) {
        const spread = (i - (tearCount - 1) / 2) * 0.2;
        tears.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle + spread) * (player.tearSpeed + 2),
            vy: Math.sin(angle + spread) * (player.tearSpeed + 2),
            radius: 5,
            damage: player.damage,
            life: 60,
            color: '#4a90e2'
        });
    }
    
    player.tearCooldown = player.tearMaxCooldown / player.tears;
}

// Update player
function updatePlayer() {
    // Movement
    let moveX = 0;
    let moveY = 0;
    
    if (keys['w'] || keys['arrowup']) moveY -= 1;
    if (keys['s'] || keys['arrowdown']) moveY += 1;
    if (keys['a'] || keys['arrowleft']) moveX -= 1;
    if (keys['d'] || keys['arrowright']) moveX += 1;
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.707;
        moveY *= 0.707;
    }
    
    player.x += moveX * player.speed;
    player.y += moveY * player.speed;
    
    // Boundaries
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
    
    // Shooting
    if (shooting) {
        shoot();
    }
    
    if (player.tearCooldown > 0) {
        player.tearCooldown--;
    }
    
    // Invincibility
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
}

// Update tears
function updateTears() {
    for (let i = tears.length - 1; i >= 0; i--) {
        const tear = tears[i];
        tear.x += tear.vx;
        tear.y += tear.vy;
        tear.life--;
        
        // Check collision with enemies
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = tear.x - enemy.x;
            const dy = tear.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < tear.radius + enemy.radius) {
                enemy.health -= tear.damage;
                hit = true;
                
                if (enemy.health <= 0) {
                    // Enemy killed
                    enemiesKilled++;
                    createExplosion(enemy.x, enemy.y, enemy.color);
                    
                    // Drop pickup
                    if (Math.random() < 0.3) {
                        pickups.push({
                            x: enemy.x,
                            y: enemy.y,
                            type: Math.random() < 0.5 ? 'coin' : 'heart',
                            life: 300
                        });
                    }
                    
                    enemies.splice(j, 1);
                }
                
                tears.splice(i, 1);
                break;
            }
        }
        
        if (hit) continue;
        
        // Remove if off screen or expired
        if (tear.x < 0 || tear.x > canvas.width || 
            tear.y < 0 || tear.y > canvas.height || 
            tear.life <= 0) {
            tears.splice(i, 1);
        }
    }
}

// Update enemies
function updateEnemies() {
    for (let enemy of enemies) {
        // Movement
        if (enemy.type === 'chaser') {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * enemy.speed;
                enemy.y += (dy / dist) * enemy.speed;
            }
        } else {
            // Shooter enemy
            enemy.angle += 0.05;
            const radius = 100;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            enemy.x = centerX + Math.cos(enemy.angle) * radius;
            enemy.y = centerY + Math.sin(enemy.angle) * radius;
            
            // Shoot at player
            if (enemy.shootCooldown <= 0) {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                    tears.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: (dx / dist) * 3,
                        vy: (dy / dist) * 3,
                        radius: 4,
                        damage: 1,
                        life: 90,
                        color: '#8B0000',
                        enemy: true
                    });
                }
                
                enemy.shootCooldown = 60;
            }
            
            enemy.shootCooldown--;
        }
        
        // Check collision with player
        if (!player.invincible) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < player.radius + enemy.radius) {
                player.health--;
                player.invincible = true;
                player.invincibleTimer = 60;
                
                if (player.health <= 0) {
                    gameOver();
                }
            }
        }
    }
}

// Update pickups
function updatePickups() {
    for (let i = pickups.length - 1; i >= 0; i--) {
        const pickup = pickups[i];
        pickup.life--;
        
        // Check collection
        const dx = player.x - pickup.x;
        const dy = player.y - pickup.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.radius + 15) {
            if (pickup.type === 'coin') {
                totalCoins++;
            } else if (pickup.type === 'heart') {
                player.health = Math.min(player.maxHealth, player.health + 1);
            }
            pickups.splice(i, 1);
            continue;
        }
        
        if (pickup.life <= 0) {
            pickups.splice(i, 1);
        }
    }
}

// Update enemy tears (check collision with player)
function updateEnemyTears() {
    for (let i = tears.length - 1; i >= 0; i--) {
        const tear = tears[i];
        if (!tear.enemy) continue;
        
        // Check collision with player
        if (!player.invincible) {
            const dx = player.x - tear.x;
            const dy = player.y - tear.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < player.radius + tear.radius) {
                player.health--;
                player.invincible = true;
                player.invincibleTimer = 60;
                tears.splice(i, 1);
                
                if (player.health <= 0) {
                    gameOver();
                }
                continue;
            }
        }
        
        // Remove if off screen
        if (tear.x < 0 || tear.x > canvas.width || 
            tear.y < 0 || tear.y > canvas.height) {
            tears.splice(i, 1);
        }
    }
}

// Particles
function createExplosion(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 20,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Apply item effect
function applyItem(item) {
    player.items.push(item);
    
    switch(item.effect) {
        case 'tears':
            player.tears += item.value;
            player.tearMaxCooldown = Math.max(5, 20 / player.tears);
            break;
        case 'damage':
            player.damage += item.value;
            break;
        case 'speed':
            player.speed += item.value;
            break;
        case 'health':
            player.maxHealth += item.value;
            player.health += item.value;
            break;
        case 'range':
            // Increase tear range (life)
            break;
        case 'tearSpeed':
            player.tearSpeed += item.value;
            break;
    }
}

// Check room clear
function checkRoomClear() {
    if (enemies.length === 0 && !rooms[currentRoomIndex].cleared) {
        rooms[currentRoomIndex].cleared = true;
        
        // Spawn room item if available
        if (rooms[currentRoomIndex].hasItem && !rooms[currentRoomIndex].item) {
            const item = itemDatabase[Math.floor(Math.random() * itemDatabase.length)];
            rooms[currentRoomIndex].item = item;
            
            // Show item screen
            showItemScreen(item);
        } else {
            // Move to next room
            setTimeout(() => {
                nextRoom();
            }, 1000);
        }
    }
}

// Next room
function nextRoom() {
    currentRoomIndex++;
    currentRoom++;
    
    if (currentRoomIndex >= rooms.length) {
        // Victory!
        alert('You cleared all rooms! Victory!');
        gameOver();
        return;
    }
    
    // Reset player position
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    // Spawn enemies for new room
    spawnEnemies(rooms[currentRoomIndex].enemies);
    
    tears = [];
}

// Show item screen
function showItemScreen(item) {
    gameState = 'item';
    itemScreen.classList.remove('hidden');
    document.getElementById('itemDisplay').innerHTML = `
        <div style="font-size: 64px; margin: 20px;">${item.icon}</div>
        <h3>${item.name}</h3>
        <p style="color: #fff;">${item.effect === 'tears' ? 'Increases tear rate' : 
          item.effect === 'damage' ? 'Increases damage' :
          item.effect === 'speed' ? 'Increases movement speed' :
          item.effect === 'health' ? 'Increases max health' :
          item.effect === 'tearSpeed' ? 'Increases tear speed' : 'Power up!'}</p>
    `;
    
    takeItemBtn.onclick = () => {
        applyItem(item);
        itemScreen.classList.add('hidden');
        gameState = 'playing';
        setTimeout(() => {
            nextRoom();
        }, 500);
    };
}

// Game functions
function resetGame() {
    gameState = 'playing';
    currentRoom = 1;
    currentRoomIndex = 0;
    enemiesKilled = 0;
    totalCoins = 0;
    
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = 3;
    player.maxHealth = 3;
    player.tears = 1;
    player.damage = 1;
    player.speed = 3;
    player.tearSpeed = 5;
    player.tearMaxCooldown = 20;
    player.items = [];
    
    tears = [];
    enemies = [];
    items = [];
    pickups = [];
    particles = [];
    
    initRooms();
    spawnEnemies(rooms[0].enemies);
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalRooms').textContent = currentRoom;
    document.getElementById('finalKills').textContent = enemiesKilled;
    document.getElementById('finalCoins').textContent = totalCoins;
    gameOverScreen.classList.remove('hidden');
}

// Drawing functions
function drawRoom() {
    // Dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Room border
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Floor pattern
    ctx.fillStyle = '#2a2a2a';
    for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
            if ((x + y) % 80 === 0) {
                ctx.fillRect(x, y, 20, 20);
            }
        }
    }
}

function drawPlayer() {
    ctx.save();
    
    // Invincibility flash
    if (player.invincible && Math.floor(player.invincibleTimer / 5) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    // Player body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const angle = Math.atan2(dy, dx);
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x + Math.cos(angle) * 5, player.y + Math.sin(angle) * 5, 3, 0, Math.PI * 2);
    ctx.arc(player.x + Math.cos(angle) * 5 - 8, player.y + Math.sin(angle) * 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawTears() {
    for (let tear of tears) {
        ctx.fillStyle = tear.color;
        ctx.beginPath();
        ctx.arc(tear.x, tear.y, tear.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = tear.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        // Health bar
        if (enemy.maxHealth > 1) {
            const barWidth = 30;
            const barHeight = 4;
            ctx.fillStyle = '#333';
            ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.radius - 10, barWidth, barHeight);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.radius - 10, 
                        barWidth * (enemy.health / enemy.maxHealth), barHeight);
        }
        
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(enemy.x - 4, enemy.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(enemy.x + 4, enemy.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPickups() {
    for (let pickup of pickups) {
        ctx.save();
        ctx.globalAlpha = pickup.life / 300;
        
        if (pickup.type === 'coin') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(pickup.x, pickup.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFA500';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('$', pickup.x, pickup.y + 4);
        } else if (pickup.type === 'heart') {
            ctx.fillStyle = '#e91e63';
            ctx.beginPath();
            ctx.arc(pickup.x, pickup.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', pickup.x, pickup.y + 4);
        }
        
        ctx.restore();
    }
}

function drawParticles() {
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function updateUI() {
    healthElement.textContent = player.health;
    tearsElement.textContent = player.tears.toFixed(1);
    coinsElement.textContent = totalCoins;
    roomElement.textContent = currentRoom;
    damageElement.textContent = player.damage.toFixed(1);
}

// Game loop
function gameLoop() {
    if (gameState !== 'playing') return;
    
    // Update
    updatePlayer();
    updateTears();
    updateEnemyTears();
    updateEnemies();
    updatePickups();
    updateParticles();
    checkRoomClear();
    updateUI();
    
    // Draw
    drawRoom();
    drawPickups();
    drawTears();
    drawEnemies();
    drawParticles();
    drawPlayer();
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
    window.location.href = 'index.html';
});

// Game loop control
let gameLoopInterval = null;

function startGameLoop() {
    if (gameLoopInterval) return;
    gameLoopInterval = setInterval(gameLoop, 1000 / 60);
}

function stopGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
}

// Initialize
initRooms();



