// Asteroids Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    vx: 0,
    vy: 0,
    rotation: 0,
    thrusting: false
};

const bullets = [];
const asteroids = [];
let score = 0;
let keys = {};

// Create asteroids
for (let i = 0; i < 5; i++) {
    asteroids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 30 + Math.random() * 20,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1
    });
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        bullets.push({
            x: ship.x,
            y: ship.y,
            vx: Math.cos(ship.angle) * 5,
            vy: Math.sin(ship.angle) * 5,
            life: 60
        });
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function update() {
    // Rotate ship
    if (keys['ArrowLeft']) ship.rotation = -0.1;
    if (keys['ArrowRight']) ship.rotation = 0.1;
    if (!keys['ArrowLeft'] && !keys['ArrowRight']) ship.rotation = 0;
    ship.angle += ship.rotation;
    
    // Thrust
    ship.thrusting = keys['ArrowUp'];
    if (ship.thrusting) {
        ship.vx += Math.cos(ship.angle) * 0.1;
        ship.vy += Math.sin(ship.angle) * 0.1;
    }
    
    // Update ship
    ship.x += ship.vx;
    ship.y += ship.vy;
    ship.vx *= 0.99;
    ship.vy *= 0.99;
    
    // Wrap ship
    if (ship.x < 0) ship.x = canvas.width;
    if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    if (ship.y > canvas.height) ship.y = 0;
    
    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
        
        if (bullet.life <= 0) {
            bullets.splice(index, 1);
        }
        
        // Wrap bullets
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
    
    // Update asteroids
    asteroids.forEach((asteroid, index) => {
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Wrap asteroids
        if (asteroid.x < 0) asteroid.x = canvas.width;
        if (asteroid.x > canvas.width) asteroid.x = 0;
        if (asteroid.y < 0) asteroid.y = canvas.height;
        if (asteroid.y > canvas.height) asteroid.y = 0;
        
        // Check collision with bullets
        bullets.forEach((bullet, bIndex) => {
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < asteroid.size) {
                asteroids.splice(index, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                document.getElementById('score').textContent = score;
                
                // Create new asteroids
                if (asteroids.length < 10) {
                    asteroids.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        size: 20 + Math.random() * 15,
                        rotation: 0,
                        rotationSpeed: (Math.random() - 0.5) * 0.1
                    });
                }
            }
        });
        
        // Check collision with ship
        const dx = ship.x - asteroid.x;
        const dy = ship.y - asteroid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < asteroid.size + 10) {
            ship.x = canvas.width / 2;
            ship.y = canvas.height / 2;
            ship.vx = 0;
            ship.vy = 0;
            score = Math.max(0, score - 50);
            document.getElementById('score').textContent = score;
        }
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw asteroids
    ctx.strokeStyle = '#fff';
    asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = asteroid.size / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    });
    
    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
    });
    
    // Draw ship
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.stroke();
    if (ship.thrusting) {
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-10, 5);
        ctx.stroke();
    }
    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
