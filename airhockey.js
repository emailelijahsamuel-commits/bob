const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Paddles
const paddle1 = {
    x: canvas.width / 2,
    y: 50,
    radius: 25,
    speed: 5,
    color: '#ff0000',
    score: 0
};

const paddle2 = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 25,
    speed: 5,
    color: '#0066ff',
    score: 0
};

// Puck
const puck = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    vx: 4,
    vy: 4
};

// Input
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Update scores
function updateScore() {
    document.getElementById('player1Score').textContent = paddle1.score;
    document.getElementById('player2Score').textContent = paddle2.score;
}

// Reset puck
function resetPuck() {
    puck.x = canvas.width / 2;
    puck.y = canvas.height / 2;
    puck.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
    puck.vy = (Math.random() > 0.5 ? 1 : -1) * 4;
}

// Collision detection
function checkCollision(paddle, puck) {
    const dx = puck.x - paddle.x;
    const dy = puck.y - paddle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < paddle.radius + puck.radius) {
        const angle = Math.atan2(dy, dx);
        puck.vx = Math.cos(angle) * 6;
        puck.vy = Math.sin(angle) * 6;
        puck.x = paddle.x + Math.cos(angle) * (paddle.radius + puck.radius);
        puck.y = paddle.y + Math.sin(angle) * (paddle.radius + puck.radius);
    }
}

// Update
function update() {
    // Move paddles
    if (keys['w'] && paddle1.y > paddle1.radius) {
        paddle1.y -= paddle1.speed;
    }
    if (keys['s'] && paddle1.y < canvas.height / 2 - paddle1.radius) {
        paddle1.y += paddle1.speed;
    }
    if (keys['a'] && paddle1.x > paddle1.radius) {
        paddle1.x -= paddle1.speed;
    }
    if (keys['d'] && paddle1.x < canvas.width - paddle1.radius) {
        paddle1.x += paddle1.speed;
    }
    
    if (keys['arrowup'] && paddle2.y > canvas.height / 2 + paddle2.radius) {
        paddle2.y -= paddle2.speed;
    }
    if (keys['arrowdown'] && paddle2.y < canvas.height - paddle2.radius) {
        paddle2.y += paddle2.speed;
    }
    if (keys['arrowleft'] && paddle2.x > paddle2.radius) {
        paddle2.x -= paddle2.speed;
    }
    if (keys['arrowright'] && paddle2.x < canvas.width - paddle2.radius) {
        paddle2.x += paddle2.speed;
    }
    
    // Move puck
    puck.x += puck.vx;
    puck.y += puck.vy;
    
    // Wall collisions
    if (puck.x - puck.radius <= 0 || puck.x + puck.radius >= canvas.width) {
        puck.vx = -puck.vx;
    }
    
    // Check collisions
    checkCollision(paddle1, puck);
    checkCollision(paddle2, puck);
    
    // Score
    if (puck.y - puck.radius <= 0) {
        paddle2.score++;
        updateScore();
        if (paddle2.score >= 7) {
            alert('Player 2 Wins!');
            paddle1.score = 0;
            paddle2.score = 0;
            updateScore();
        }
        resetPuck();
    }
    
    if (puck.y + puck.radius >= canvas.height) {
        paddle1.score++;
        updateScore();
        if (paddle1.score >= 7) {
            alert('Player 1 Wins!');
            paddle1.score = 0;
            paddle2.score = 0;
            updateScore();
        }
        resetPuck();
    }
}

// Draw
function draw() {
    // Clear
    ctx.fillStyle = '#2a4a3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Goals
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 4, 0);
    ctx.lineTo(canvas.width * 3 / 4, 0);
    ctx.stroke();
    
    ctx.strokeStyle = '#0066ff';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 4, canvas.height);
    ctx.lineTo(canvas.width * 3 / 4, canvas.height);
    ctx.stroke();
    
    // Paddles
    ctx.fillStyle = paddle1.color;
    ctx.beginPath();
    ctx.arc(paddle1.x, paddle1.y, paddle1.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = paddle2.color;
    ctx.beginPath();
    ctx.arc(paddle2.x, paddle2.y, paddle2.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Puck
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resetPuck();
updateScore();
gameLoop();


