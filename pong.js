const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddle1 = {
    x: 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    speed: 5,
    score: 0
};

const paddle2 = {
    x: canvas.width - 30,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    speed: 5,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 3,
    speed: 5
};

// Input
const keys = {};

// Event listeners
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

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.velocityY = (Math.random() * 2 - 1) * 3;
}

// Collision detection
function checkCollision(rect, circle) {
    return circle.x + circle.radius > rect.x &&
           circle.x - circle.radius < rect.x + rect.width &&
           circle.y + circle.radius > rect.y &&
           circle.y - circle.radius < rect.y + rect.height;
}

// Update
function update() {
    // Move paddles
    if (keys['w'] && paddle1.y > 0) {
        paddle1.y -= paddle1.speed;
    }
    if (keys['s'] && paddle1.y < canvas.height - paddle1.height) {
        paddle1.y += paddle1.speed;
    }
    
    if (keys['arrowup'] && paddle2.y > 0) {
        paddle2.y -= paddle2.speed;
    }
    if (keys['arrowdown'] && paddle2.y < canvas.height - paddle2.height) {
        paddle2.y += paddle2.speed;
    }
    
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Ball collision with top/bottom walls
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.velocityY = -ball.velocityY;
    }
    
    // Ball collision with paddles
    if (checkCollision(paddle1, ball) && ball.velocityX < 0) {
        ball.velocityX = -ball.velocityX;
        ball.velocityY = ((ball.y - (paddle1.y + paddle1.height / 2)) / paddle1.height) * 5;
    }
    
    if (checkCollision(paddle2, ball) && ball.velocityX > 0) {
        ball.velocityX = -ball.velocityX;
        ball.velocityY = ((ball.y - (paddle2.y + paddle2.height / 2)) / paddle2.height) * 5;
    }
    
    // Score
    if (ball.x < 0) {
        paddle2.score++;
        updateScore();
        if (paddle2.score >= 5) {
            alert('Player 2 Wins!');
            paddle1.score = 0;
            paddle2.score = 0;
            updateScore();
        }
        resetBall();
    }
    
    if (ball.x > canvas.width) {
        paddle1.score++;
        updateScore();
        if (paddle1.score >= 5) {
            alert('Player 1 Wins!');
            paddle1.score = 0;
            paddle2.score = 0;
            updateScore();
        }
        resetBall();
    }
}

// Draw
function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    
    // Ball
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

// Start
resetBall();
updateScore();
gameLoop();


