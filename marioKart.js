const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const positionElement = document.getElementById('position');
const lapElement = document.getElementById('lap');
const speedElement = document.getElementById('speed');
const coinsElement = document.getElementById('coins');
const timeElement = document.getElementById('time');
const turboElement = document.getElementById('turbo');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalPositionElement = document.getElementById('finalPosition');
const bestLapElement = document.getElementById('bestLap');
const totalTimeElement = document.getElementById('totalTime');
const finalCoinsElement = document.getElementById('finalCoins');
const raceResultElement = document.getElementById('raceResult');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const itemDisplay = document.getElementById('itemDisplay');
const itemIcon = document.getElementById('itemIcon');

// Game state
let gameState = 'start';
let raceTime = 0;
let lapTime = 0;
let bestLapTime = Infinity;
let currentLap = 1;
const totalLaps = 3;
let coins = 0;
let playerPosition = 1;
let totalRacers = 8;

// Player kart
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 60,
    angle: 0,
    speed: 0,
    maxSpeed: 8,
    acceleration: 0.15,
    deceleration: 0.1,
    turnSpeed: 0.05,
    color: '#FF0000',
    driftAngle: 0,
    isDrifting: false,
    turboActive: false,
    turboTimer: 0,
    turboCooldown: 0,
    turboBoost: 0
};

// Track
const track = {
    innerRadius: 150,
    outerRadius: 250,
    centerX: canvas.width / 2,
    centerY: canvas.height / 2,
    checkpoints: []
};

// AI Racers
let aiRacers = [];

// Items
let items = [];
let playerItem = null;

// Coins on track
let trackCoins = [];

// Particles
let particles = [];

// Initialize track checkpoints
function initTrack() {
    track.checkpoints = [];
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        track.checkpoints.push({
            angle: angle,
            passed: false,
            checkpointNumber: i
        });
    }
}

// Initialize AI racers
function initAIRacers() {
    aiRacers = [];
    for (let i = 0; i < totalRacers - 1; i++) {
        const colors = ['#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
        aiRacers.push({
            x: canvas.width / 2 + Math.cos(i * 0.5) * 200,
            y: canvas.height / 2 + Math.sin(i * 0.5) * 200,
            width: 40,
            height: 60,
            angle: Math.random() * Math.PI * 2,
            speed: 3 + Math.random() * 2,
            maxSpeed: 6 + Math.random() * 2,
            color: colors[i % colors.length],
            lap: 1,
            checkpoint: 0,
            progress: 0
        });
    }
}

// Initialize coins
function initCoins() {
    trackCoins = [];
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = track.innerRadius + (track.outerRadius - track.innerRadius) * 0.5 + (Math.random() - 0.5) * 50;
        trackCoins.push({
            x: track.centerX + Math.cos(angle) * radius,
            y: track.centerY + Math.sin(angle) * radius,
            collected: false,
            rotation: 0
        });
    }
}

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        if (playerItem) {
            useItem();
        } else {
            activateTurbo();
        }
    }
    if ((e.key === 't' || e.key === 'T') && gameState === 'playing') {
        e.preventDefault();
        activateTurbo();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mobile controls
document.getElementById('leftBtn').addEventListener('touchstart', () => keys['a'] = true);
document.getElementById('leftBtn').addEventListener('touchend', () => keys['a'] = false);
document.getElementById('rightBtn').addEventListener('touchstart', () => keys['d'] = true);
document.getElementById('rightBtn').addEventListener('touchend', () => keys['d'] = false);
document.getElementById('accelerateBtn').addEventListener('touchstart', () => keys['w'] = true);
document.getElementById('accelerateBtn').addEventListener('touchend', () => keys['w'] = false);
document.getElementById('brakeBtn').addEventListener('touchstart', () => keys['s'] = true);
document.getElementById('brakeBtn').addEventListener('touchend', () => keys['s'] = false);
document.getElementById('itemBtn').addEventListener('touchstart', () => {
    if (gameState === 'playing') {
        if (playerItem) {
            useItem();
        } else {
            activateTurbo();
        }
    }
});

// Activate turbo
function activateTurbo() {
    if (player.turboCooldown <= 0 && !player.turboActive) {
        player.turboActive = true;
        player.turboTimer = 120; // 2 seconds at 60fps
        player.turboCooldown = 300; // 5 second cooldown
        player.turboBoost = 5; // Extra speed boost
        createTurboParticles();
    }
}

// Update player
function updatePlayer() {
    // Update turbo
    if (player.turboActive) {
        player.turboTimer--;
        if (player.turboTimer <= 0) {
            player.turboActive = false;
            player.turboBoost = 0;
        }
    }
    if (player.turboCooldown > 0) {
        player.turboCooldown--;
    }
    
    // Update turbo display
    if (player.turboActive) {
        turboElement.textContent = '⚡ BOOST!';
        turboElement.style.color = '#FFD700';
    } else if (player.turboCooldown > 0) {
        const seconds = Math.ceil(player.turboCooldown / 60);
        turboElement.textContent = `⏳ ${seconds}s`;
        turboElement.style.color = '#FF6B6B';
    } else {
        turboElement.textContent = '⚡ READY';
        turboElement.style.color = '#4CAF50';
    }
    
    // Acceleration
    const currentMaxSpeed = player.maxSpeed + player.turboBoost;
    if (keys['w'] || keys['arrowup']) {
        const accel = player.turboActive ? player.acceleration * 1.5 : player.acceleration;
        player.speed = Math.min(player.speed + accel, currentMaxSpeed);
    } else if (keys['s'] || keys['arrowdown']) {
        player.speed = Math.max(player.speed - player.deceleration * 2, 0);
    } else {
        player.speed = Math.max(player.speed - player.deceleration, 0);
    }
    
    // Steering
    if (keys['a'] || keys['arrowleft']) {
        player.angle -= player.turnSpeed * (player.speed / player.maxSpeed);
        if (player.speed > 2) {
            player.isDrifting = true;
            player.driftAngle += 0.1;
        }
    } else if (keys['d'] || keys['arrowright']) {
        player.angle += player.turnSpeed * (player.speed / player.maxSpeed);
        if (player.speed > 2) {
            player.isDrifting = true;
            player.driftAngle += 0.1;
        }
    } else {
        player.isDrifting = false;
        player.driftAngle *= 0.9;
    }
    
    // Move player
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;
    
    // Keep player on track (simplified)
    const dx = player.x - track.centerX;
    const dy = player.y - track.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < track.innerRadius) {
        const angle = Math.atan2(dy, dx);
        player.x = track.centerX + Math.cos(angle) * track.innerRadius;
        player.y = track.centerY + Math.sin(angle) * track.innerRadius;
        player.speed *= 0.8; // Slow down when hitting wall
    } else if (dist > track.outerRadius) {
        const angle = Math.atan2(dy, dx);
        player.x = track.centerX + Math.cos(angle) * track.outerRadius;
        player.y = track.centerY + Math.sin(angle) * track.outerRadius;
        player.speed *= 0.8;
    }
    
    // Update speed display
    speedElement.textContent = Math.floor(player.speed * 10) + ' km/h';
}

// Update AI racers
function updateAIRacers() {
    for (let racer of aiRacers) {
        // Simple AI: follow track
        const targetAngle = racer.angle + 0.05;
        racer.angle = targetAngle;
        
        racer.speed = Math.min(racer.speed + 0.1, racer.maxSpeed);
        
        racer.x += Math.cos(racer.angle) * racer.speed;
        racer.y += Math.sin(racer.angle) * racer.speed;
        
        // Keep on track
        const dx = racer.x - track.centerX;
        const dy = racer.y - track.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < track.innerRadius || dist > track.outerRadius) {
            const angle = Math.atan2(dy, dx);
            racer.x = track.centerX + Math.cos(angle) * (track.innerRadius + track.outerRadius) / 2;
            racer.y = track.centerY + Math.sin(angle) * (track.innerRadius + track.outerRadius) / 2;
        }
    }
}

// Update coins
function updateCoins() {
    for (let coin of trackCoins) {
        coin.rotation += 0.1;
        
        const dx = coin.x - player.x;
        const dy = coin.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 30 && !coin.collected) {
            coin.collected = true;
            coins++;
            coinsElement.textContent = coins;
            createCoinParticles(coin.x, coin.y);
        }
    }
}

// Spawn items
function spawnItem() {
    if (Math.random() < 0.01 && !playerItem) {
        const itemTypes = ['mushroom', 'shell', 'banana', 'star'];
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        playerItem = { type: itemType };
        itemDisplay.classList.remove('hidden');
        updateItemIcon();
    }
}

// Update item icon
function updateItemIcon() {
    if (!playerItem) return;
    const icons = {
        mushroom: '🍄',
        shell: '🐢',
        banana: '🍌',
        star: '⭐'
    };
    itemIcon.textContent = icons[playerItem.type] || '❓';
}

// Use item
function useItem() {
    if (!playerItem) return;
    
    switch (playerItem.type) {
        case 'mushroom':
            player.speed = player.maxSpeed * 1.5;
            createBoostParticles();
            break;
        case 'shell':
            // Shoot shell forward
            items.push({
                x: player.x,
                y: player.y,
                angle: player.angle,
                speed: 10,
                type: 'shell',
                life: 100
            });
            break;
        case 'banana':
            // Drop banana behind
            items.push({
                x: player.x - Math.cos(player.angle) * 50,
                y: player.y - Math.sin(player.angle) * 50,
                angle: 0,
                speed: 0,
                type: 'banana',
                life: 600
            });
            break;
        case 'star':
            // Invincibility
            player.speed = player.maxSpeed * 1.2;
            createStarParticles();
            break;
    }
    
    playerItem = null;
    itemDisplay.classList.add('hidden');
}

// Update items
function updateItems() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        
        if (item.type === 'shell') {
            item.x += Math.cos(item.angle) * item.speed;
            item.y += Math.sin(item.angle) * item.speed;
            item.life--;
            
            // Check collision with AI racers
            for (let racer of aiRacers) {
                const dx = item.x - racer.x;
                const dy = item.y - racer.y;
                if (Math.sqrt(dx * dx + dy * dy) < 40) {
                    racer.speed = 0;
                    racer.angle += Math.PI;
                    items.splice(i, 1);
                    createExplosion(racer.x, racer.y);
                    break;
                }
            }
        }
        
        if (item.life <= 0) {
            items.splice(i, 1);
        }
    }
}

// Particles
function createCoinParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 20,
            color: '#FFD700'
        });
    }
}

function createBoostParticles() {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 15,
            color: '#FF6B6B'
        });
    }
}

function createStarParticles() {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 20,
            color: '#FFD700'
        });
    }
}

function createTurboParticles() {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 30,
            color: '#00FFFF'
        });
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 25,
            color: '#FF0000'
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

// Check lap completion
function checkLap() {
    // Simplified lap detection
    const dx = player.x - track.centerX;
    const dy = player.y - track.centerY;
    const angle = Math.atan2(dy, dx);
    
    // Check if passed start line
    if (angle > -0.2 && angle < 0.2 && player.y < track.centerY) {
        if (currentLap < totalLaps) {
            currentLap++;
            if (lapTime < bestLapTime) {
                bestLapTime = lapTime;
            }
            lapTime = 0;
            lapElement.textContent = `${currentLap}/${totalLaps}`;
        } else {
            finishRace();
        }
    }
}

// Finish race
function finishRace() {
    gameState = 'gameOver';
    finalPositionElement.textContent = playerPosition + getOrdinal(playerPosition);
    bestLapElement.textContent = formatTime(bestLapTime);
    totalTimeElement.textContent = formatTime(raceTime);
    finalCoinsElement.textContent = coins;
    
    if (playerPosition === 1) {
        raceResultElement.textContent = '🏆 Victory!';
    } else if (playerPosition <= 3) {
        raceResultElement.textContent = '🎉 Great Race!';
    } else {
        raceResultElement.textContent = 'Race Finished!';
    }
    
    gameOverScreen.classList.remove('hidden');
}

function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update position
function updatePosition() {
    // Simplified position calculation
    let ahead = 0;
    for (let racer of aiRacers) {
        if (racer.lap > currentLap || (racer.lap === currentLap && racer.progress > 0.5)) {
            ahead++;
        }
    }
    playerPosition = ahead + 1;
    positionElement.textContent = playerPosition + getOrdinal(playerPosition);
}

// Drawing functions
function drawTrack() {
    // Outer track
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(track.centerX, track.centerY, track.outerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner track
    ctx.beginPath();
    ctx.arc(track.centerX, track.centerY, track.innerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Track surface
    ctx.fillStyle = '#2d5016';
    ctx.beginPath();
    ctx.arc(track.centerX, track.centerY, track.outerRadius - 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(track.centerX, track.centerY, track.innerRadius + 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Start/finish line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(track.centerX, track.centerY - track.outerRadius);
    ctx.lineTo(track.centerX, track.centerY - track.innerRadius);
    ctx.stroke();
}

function drawKart(x, y, angle, color, isPlayer = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Turbo boost effect
    if (isPlayer && player.turboActive) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Turbo flames
        ctx.fillStyle = '#FF6B00';
        ctx.beginPath();
        ctx.moveTo(-15, 35);
        ctx.lineTo(-10, 50);
        ctx.lineTo(0, 45);
        ctx.lineTo(10, 50);
        ctx.lineTo(15, 35);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(-10, 38);
        ctx.lineTo(-5, 48);
        ctx.lineTo(0, 43);
        ctx.lineTo(5, 48);
        ctx.lineTo(10, 38);
        ctx.closePath();
        ctx.fill();
    }
    
    // Kart body
    ctx.fillStyle = color;
    ctx.fillRect(-20, -30, 40, 60);
    
    // Windows
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(-15, -25, 30, 20);
    
    // Wheels
    ctx.fillStyle = '#000000';
    ctx.fillRect(-25, -20, 10, 15);
    ctx.fillRect(15, -20, 10, 15);
    ctx.fillRect(-25, 5, 10, 15);
    ctx.fillRect(15, 5, 10, 15);
    
    if (isPlayer && player.isDrifting) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawCoins() {
    for (let coin of trackCoins) {
        if (coin.collected) continue;
        
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        
        ctx.restore();
    }
}

function drawItems() {
    for (let item of items) {
        ctx.save();
        ctx.translate(item.x, item.y);
        
        if (item.type === 'shell') {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.type === 'banana') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

function drawParticles() {
    for (let p of particles) {
        const alpha = p.life / 25;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// Game loop
function gameLoop() {
    if (gameState !== 'playing') return;
    
    raceTime += 1/60;
    lapTime += 1/60;
    timeElement.textContent = formatTime(raceTime);
    
    // Update
    updatePlayer();
    updateAIRacers();
    updateCoins();
    updateItems();
    updateParticles();
    updatePosition();
    checkLap();
    spawnItem();
    
    // Draw
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawTrack();
    drawCoins();
    drawItems();
    
    // Draw AI racers
    for (let racer of aiRacers) {
        drawKart(racer.x, racer.y, racer.angle, racer.color);
    }
    
    // Draw player
    drawKart(player.x, player.y, player.angle, player.color, true);
    
    drawParticles();
}

// Reset game
function resetGame() {
    gameState = 'playing';
    raceTime = 0;
    lapTime = 0;
    bestLapTime = Infinity;
    currentLap = 1;
    coins = 0;
    playerPosition = 1;
    playerItem = null;
    
    player.x = canvas.width / 2;
    player.y = track.centerY - track.outerRadius + 50;
    player.angle = Math.PI / 2;
    player.speed = 0;
    player.isDrifting = false;
    player.turboActive = false;
    player.turboTimer = 0;
    player.turboCooldown = 0;
    player.turboBoost = 0;
    
    items = [];
    particles = [];
    
    initTrack();
    initAIRacers();
    initCoins();
    
    itemDisplay.classList.add('hidden');
    
    lapElement.textContent = `${currentLap}/${totalLaps}`;
    coinsElement.textContent = coins;
    positionElement.textContent = '1st';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

// Event listeners
startBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);
menuBtn.addEventListener('click', () => {
    gameState = 'start';
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

// Initialize
initTrack();
initAIRacers();
initCoins();

// Start game loop
setInterval(gameLoop, 1000 / 60);

