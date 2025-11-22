// Breakout Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddle = { x: canvas.width / 2 - 50, y: canvas.height - 30, width: 100, height: 15, speed: 5 };
const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10, vx: 3, vy: -3 };
const bricks = [];
let score = 0;
let keys = {};

// Create bricks
for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
        bricks.push({
            x: col * 100 + 10,
            y: row * 30 + 50,
            width: 90,
            height: 25,
            active: true
        });
    }
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function update() {
    // Move paddle
    if (keys['ArrowLeft'] && paddle.x > 0) paddle.x -= paddle.speed;
    if (keys['ArrowRight'] && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;
    
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Ball collision with walls
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) ball.vx = -ball.vx;
    if (ball.y - ball.radius <= 0) ball.vy = -ball.vy;
    
    // Ball collision with paddle
    if (ball.y + ball.radius >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
        ball.vy = -Math.abs(ball.vy);
        ball.vx = ((ball.x - (paddle.x + paddle.width / 2)) / paddle.width) * 5;
    }
    
    // Ball collision with bricks
    bricks.forEach(brick => {
        if (brick.active && ball.x >= brick.x && ball.x <= brick.x + brick.width &&
            ball.y >= brick.y && ball.y <= brick.y + brick.height) {
            brick.active = false;
            ball.vy = -ball.vy;
            score += 10;
            document.getElementById('score').textContent = score;
        }
    });
    
    // Reset if ball falls
    if (ball.y > canvas.height) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.vx = 3;
        ball.vy = -3;
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bricks
    bricks.forEach(brick => {
        if (brick.active) {
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
    
    // Draw paddle
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
