const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Players
const player1 = {
    x: 200,
    y: 300,
    radius: 20,
    health: 100,
    maxHealth: 100,
    color: '#ff0000',
    speed: 3,
    cooldown: 0
};

const player2 = {
    x: 600,
    y: 300,
    radius: 20,
    health: 100,
    maxHealth: 100,
    color: '#0066ff',
    speed: 3,
    cooldown: 0
};

// Bullets
const bullets = [];

// Input
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        shoot(player1, player2);
    }
    if (e.key === 'Enter') {
        shoot(player2, player1);
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Shoot
function shoot(shooter, target) {
    if (shooter.cooldown > 0) return;
    
    const dx = target.x - shooter.x;
    const dy = target.y - shooter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const bullet = {
        x: shooter.x,
        y: shooter.y,
        vx: (dx / dist) * 8,
        vy: (dy / dist) * 8,
        owner: shooter
    };
    
    bullets.push(bullet);
    shooter.cooldown = 20;
}

// Update player
function updatePlayer(player, up, down, left, right) {
    if (up && player.y > player.radius) {
        player.y -= player.speed;
    }
    if (down && player.y < canvas.height - player.radius) {
        player.y += player.speed;
    }
    if (left && player.x > player.radius) {
        player.x -= player.speed;
    }
    if (right && player.x < canvas.width - player.radius) {
        player.x += player.speed;
    }
    
    if (player.cooldown > 0) player.cooldown--;
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        
        // Remove if out of bounds
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check collision with target
        const target = bullet.owner === player1 ? player2 : player1;
        const dx = bullet.x - target.x;
        const dy = bullet.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < target.radius) {
            target.health -= 5;
            document.getElementById(target === player1 ? 'health1' : 'health2').textContent = target.health;
            bullets.splice(i, 1);
            
            if (target.health <= 0) {
                const winner = bullet.owner === player1 ? 'Player 1' : 'Player 2';
                alert(`${winner} Wins!`);
                resetGame();
            }
        }
    }
}

// Update
function update() {
    updatePlayer(player1, keys['w'], keys['s'], keys['a'], keys['d']);
    updatePlayer(player2, keys['arrowup'], keys['arrowdown'], keys['arrowleft'], keys['arrowright']);
    updateBullets();
}

// Draw player
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Health bar
    const barWidth = 40;
    const barHeight = 5;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x - barWidth / 2, player.y - player.radius - 10, barWidth, barHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x - barWidth / 2, player.y - player.radius - 10, barWidth * (player.health / player.maxHealth), barHeight);
}

// Draw
function draw() {
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawPlayer(player1);
    drawPlayer(player2);
}

// Reset
function resetGame() {
    player1.x = 200;
    player1.y = 300;
    player1.health = 100;
    player1.cooldown = 0;
    
    player2.x = 600;
    player2.y = 300;
    player2.health = 100;
    player2.cooldown = 0;
    
    bullets.length = 0;
    document.getElementById('health1').textContent = '100';
    document.getElementById('health2').textContent = '100';
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();


