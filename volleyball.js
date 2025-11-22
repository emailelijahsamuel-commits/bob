const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Players
const player1 = {
    x: canvas.width / 2,
    y: 100,
    radius: 25,
    speed: 5,
    color: '#ff0000',
    score: 0
};

const player2 = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    radius: 25,
    speed: 5,
    color: '#0066ff',
    score: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    vx: 3,
    vy: 3
};

// Net
const netY = canvas.height / 2;

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
    document.getElementById('player1Score').textContent = player1.score;
    document.getElementById('player2Score').textContent = player2.score;
}

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 3;
    ball.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
}

// Collision detection
function checkCollision(player, ball) {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < player.radius + ball.radius) {
        const angle = Math.atan2(dy, dx);
        ball.vx = Math.cos(angle) * 5;
        ball.vy = Math.sin(angle) * 5;
        ball.x = player.x + Math.cos(angle) * (player.radius + ball.radius);
        ball.y = player.y + Math.sin(angle) * (player.radius + ball.radius);
    }
}

// Update
function update() {
    // Move players
    if (keys['w'] && player1.y > player1.radius) {
        player1.y -= player1.speed;
    }
    if (keys['s'] && player1.y < netY - player1.radius) {
        player1.y += player1.speed;
    }
    if (keys['a'] && player1.x > player1.radius) {
        player1.x -= player1.speed;
    }
    if (keys['d'] && player1.x < canvas.width - player1.radius) {
        player1.x += player1.speed;
    }
    
    if (keys['arrowup'] && player2.y > netY + player2.radius) {
        player2.y -= player2.speed;
    }
    if (keys['arrowdown'] && player2.y < canvas.height - player2.radius) {
        player2.y += player2.speed;
    }
    if (keys['arrowleft'] && player2.x > player2.radius) {
        player2.x -= player2.speed;
    }
    if (keys['arrowright'] && player2.x < canvas.width - player2.radius) {
        player2.x += player2.speed;
    }
    
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Wall collisions
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
        ball.vx = -ball.vx;
    }
    
    // Net collision
    if ((ball.y - ball.radius <= netY && ball.y + ball.vy - ball.radius > netY) ||
        (ball.y + ball.radius >= netY && ball.y + ball.vy + ball.radius < netY)) {
        if (ball.x > canvas.width / 2 - 50 && ball.x < canvas.width / 2 + 50) {
            ball.vy = -ball.vy;
        }
    }
    
    // Check collisions
    checkCollision(player1, ball);
    checkCollision(player2, ball);
    
    // Score
    if (ball.y - ball.radius <= 0) {
        player2.score++;
        updateScore();
        if (player2.score >= 15) {
            alert('Player 2 Wins!');
            player1.score = 0;
            player2.score = 0;
            updateScore();
        }
        resetBall();
    }
    
    if (ball.y + ball.radius >= canvas.height) {
        player1.score++;
        updateScore();
        if (player1.score >= 15) {
            alert('Player 1 Wins!');
            player1.score = 0;
            player2.score = 0;
            updateScore();
        }
        resetBall();
    }
}

// Draw
function draw() {
    // Clear
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Net
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 50, netY);
    ctx.lineTo(canvas.width / 2 + 50, netY);
    ctx.stroke();
    
    // Players
    ctx.fillStyle = player1.color;
    ctx.beginPath();
    ctx.arc(player1.x, player1.y, player1.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = player2.color;
    ctx.beginPath();
    ctx.arc(player2.x, player2.y, player2.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resetBall();
updateScore();
gameLoop();


