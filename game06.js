// Flappy Bird Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bird = { x: 100, y: canvas.height / 2, radius: 20, velocity: 0, gravity: 0.5 };
const pipes = [];
let score = 0;
let frameCount = 0;

function createPipe() {
    const gap = 150;
    const topHeight = Math.random() * (canvas.height - gap - 100) + 50;
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + gap,
        width: 50,
        passed: false
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp') {
        bird.velocity = -8;
    }
});

canvas.addEventListener('click', () => {
    bird.velocity = -8;
});

function update() {
    frameCount++;
    if (frameCount % 100 === 0) createPipe();
    
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Update pipes
    pipes.forEach((pipe, index) => {
        pipe.x -= 3;
        
        // Check collision
        if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipe.width) {
            if (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > pipe.bottomY) {
                reset();
            }
        }
        
        // Score
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
            score += 1;
            document.getElementById('score').textContent = score;
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
        }
    });
    
    // Ground/ceiling collision
    if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        reset();
    }
}

function draw() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pipes
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
    });
    
    // Draw bird
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
}

function reset() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    document.getElementById('score').textContent = score;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
