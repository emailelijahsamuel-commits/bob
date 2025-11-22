// Space Invaders Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = { x: canvas.width / 2, y: canvas.height - 50, width: 50, height: 30, speed: 5 };
const bullets = [];
const enemies = [];
let score = 0;
let keys = {};
let enemyDirection = 1;

// Create enemies
for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
        enemies.push({
            x: col * 80 + 50,
            y: row * 50 + 50,
            width: 40,
            height: 30,
            active: true
        });
    }
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        bullets.push({ x: player.x + player.width / 2, y: player.y, speed: 5 });
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function update() {
    // Move player
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
    
    // Move bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(index, 1);
        
        // Check collision with enemies
        enemies.forEach(enemy => {
            if (enemy.active && bullet.x >= enemy.x && bullet.x <= enemy.x + enemy.width &&
                bullet.y >= enemy.y && bullet.y <= enemy.y + enemy.height) {
                enemy.active = false;
                bullets.splice(index, 1);
                score += 10;
                document.getElementById('score').textContent = score;
            }
        });
    });
    
    // Move enemies
    let moveDown = false;
    enemies.forEach(enemy => {
        if (enemy.active) {
            enemy.x += enemyDirection * 0.5;
            if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) moveDown = true;
        }
    });
    
    if (moveDown) {
        enemyDirection = -enemyDirection;
        enemies.forEach(enemy => {
            if (enemy.active) enemy.y += 20;
        });
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw enemies
    ctx.fillStyle = '#00ff00';
    enemies.forEach(enemy => {
        if (enemy.active) {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });
    
    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
    });
    
    // Draw player
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
