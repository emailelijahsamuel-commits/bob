// Basketball
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ball = { x: canvas.width / 2, y: canvas.height - 100, radius: 20, vx: 0, vy: 0 };
const hoop = { x: canvas.width / 2, y: 100, width: 100, height: 10 };
let score = 0;
let power = 0;
let aiming = false;

canvas.addEventListener('mousedown', () => {
    aiming = true;
    power = 0;
});

canvas.addEventListener('mousemove', (e) => {
    if (aiming) {
        const rect = canvas.getBoundingClientRect();
        const dx = e.clientX - rect.left - ball.x;
        const dy = e.clientY - rect.top - ball.y;
        power = Math.min(15, Math.sqrt(dx * dx + dy * dy) / 10);
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (aiming) {
        const rect = canvas.getBoundingClientRect();
        const dx = e.clientX - rect.left - ball.x;
        const dy = e.clientY - rect.top - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        ball.vx = (dx / dist) * power;
        ball.vy = (dy / dist) * power;
        aiming = false;
    }
});

function update() {
    ball.vy += 0.3; // gravity
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= 0.98;
    ball.vy *= 0.98;
    
    // Bounce off walls
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx = -ball.vx;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
    }
    
    // Check basket
    if (ball.y < hoop.y + hoop.height && ball.y > hoop.y &&
        ball.x > hoop.x && ball.x < hoop.x + hoop.width && ball.vy > 0) {
        score += 2;
        document.getElementById('score').textContent = score;
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 100;
        ball.vx = 0;
        ball.vy = 0;
    }
    
    // Reset if ball falls
    if (ball.y > canvas.height + 100) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 100;
        ball.vx = 0;
        ball.vy = 0;
    }
}

function draw() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Hoop
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(hoop.x, hoop.y, hoop.width, hoop.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hoop.x + hoop.width / 2, hoop.y, 30, 0, Math.PI);
    ctx.stroke();
    
    // Ball
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Power indicator
    if (aiming) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(ball.x + ball.vx * 5, ball.y + ball.vy * 5);
        ctx.stroke();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();