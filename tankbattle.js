const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tanks
const tank1 = {
    x: 100,
    y: 100,
    angle: 0,
    health: 100,
    color: '#ff0000',
    cooldown: 0
};

const tank2 = {
    x: 700,
    y: 500,
    angle: Math.PI,
    health: 100,
    color: '#0066ff',
    cooldown: 0
};

// Bullets
const bullets = [];

// Input
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        shoot(tank1);
    }
    if (e.key === 'Enter') {
        shoot(tank2);
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Shoot
function shoot(tank) {
    if (tank.cooldown > 0) return;
    
    const bullet = {
        x: tank.x + Math.cos(tank.angle) * 30,
        y: tank.y + Math.sin(tank.angle) * 30,
        vx: Math.cos(tank.angle) * 8,
        vy: Math.sin(tank.angle) * 8,
        owner: tank
    };
    
    bullets.push(bullet);
    tank.cooldown = 30;
}

// Update tank
function updateTank(tank, up, down, left, right) {
    if (up) {
        tank.x += Math.cos(tank.angle) * 2;
        tank.y += Math.sin(tank.angle) * 2;
    }
    if (down) {
        tank.x -= Math.cos(tank.angle) * 2;
        tank.y -= Math.sin(tank.angle) * 2;
    }
    if (left) {
        tank.angle -= 0.05;
    }
    if (right) {
        tank.angle += 0.05;
    }
    
    // Keep in bounds
    tank.x = Math.max(20, Math.min(canvas.width - 20, tank.x));
    tank.y = Math.max(20, Math.min(canvas.height - 20, tank.y));
    
    if (tank.cooldown > 0) tank.cooldown--;
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
        
        // Check collision with tanks
        const otherTank = bullet.owner === tank1 ? tank2 : tank1;
        const dx = bullet.x - otherTank.x;
        const dy = bullet.y - otherTank.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 25) {
            otherTank.health -= 10;
            document.getElementById(otherTank === tank1 ? 'health1' : 'health2').textContent = otherTank.health;
            bullets.splice(i, 1);
            
            if (otherTank.health <= 0) {
                const winner = bullet.owner === tank1 ? 'Player 1' : 'Player 2';
                alert(`${winner} Wins!`);
                resetGame();
            }
        }
    }
}

// Update
function update() {
    updateTank(tank1, keys['w'], keys['s'], keys['a'], keys['d']);
    updateTank(tank2, keys['arrowup'], keys['arrowdown'], keys['arrowleft'], keys['arrowright']);
    updateBullets();
}

// Draw tank
function drawTank(tank) {
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.angle);
    
    // Body
    ctx.fillStyle = tank.color;
    ctx.fillRect(-20, -15, 40, 30);
    
    // Turret
    ctx.fillRect(0, -5, 30, 10);
    
    // Health bar
    ctx.restore();
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(tank.x - 30, tank.y - 40, 60, 5);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(tank.x - 30, tank.y - 40, 60 * (tank.health / 100), 5);
}

// Draw
function draw() {
    // Clear
    ctx.fillStyle = '#4a7c3f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    drawTank(tank1);
    drawTank(tank2);
}

// Reset
function resetGame() {
    tank1.x = 100;
    tank1.y = 100;
    tank1.angle = 0;
    tank1.health = 100;
    tank1.cooldown = 0;
    
    tank2.x = 700;
    tank2.y = 500;
    tank2.angle = Math.PI;
    tank2.health = 100;
    tank2.cooldown = 0;
    
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


