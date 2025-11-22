// Bubble Shooter
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bubbles = [];
const shooter = { x: canvas.width / 2, y: canvas.height - 50, angle: -Math.PI / 2 };
const bullets = [];
let score = 0;

for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 10; j++) {
        bubbles.push({
            x: j * 70 + 50,
            y: i * 50 + 50,
            radius: 25,
            color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][Math.floor(Math.random() * 4)],
            active: true
        });
    }
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    shooter.angle = Math.atan2(e.clientY - rect.top - shooter.y, e.clientX - rect.left - shooter.x);
});

canvas.addEventListener('click', () => {
    bullets.push({
        x: shooter.x,
        y: shooter.y,
        vx: Math.cos(shooter.angle) * 5,
        vy: Math.sin(shooter.angle) * 5,
        color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][Math.floor(Math.random() * 4)]
    });
});

function update() {
    bullets.forEach((bullet, bIndex) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        
        bubbles.forEach((bubble, index) => {
            if (bubble.active) {
                const dx = bullet.x - bubble.x;
                const dy = bullet.y - bubble.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < bubble.radius + 10 && bullet.color === bubble.color) {
                    bubble.active = false;
                    bullets.splice(bIndex, 1);
                    score += 10;
                    document.getElementById('score').textContent = score;
                }
            }
        });
        
        if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(bIndex, 1);
        }
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    bubbles.forEach(bubble => {
        if (bubble.active) {
            ctx.fillStyle = bubble.color;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(shooter.x + Math.cos(shooter.angle) * 30, shooter.y + Math.sin(shooter.angle) * 30);
    ctx.stroke();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();