// Interactive Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
const targets = [];
let gameStarted = false;

function createTarget() {
    targets.push({
        x: Math.random() * (canvas.width - 40),
        y: Math.random() * (canvas.height - 40),
        width: 40,
        height: 40,
        active: true,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
}

canvas.addEventListener('click', (e) => {
    if (!gameStarted) {
        gameStarted = true;
        for (let i = 0; i < 5; i++) createTarget();
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    targets.forEach((target, index) => {
        if (target.active && x >= target.x && x <= target.x + target.width &&
            y >= target.y && y <= target.y + target.height) {
            target.active = false;
            targets.splice(index, 1);
            score += 10;
            document.getElementById('score').textContent = score;
            createTarget();
        }
    });
});

function update() {
    if (!gameStarted) return;
    
    targets.forEach(target => {
        target.x += (Math.random() - 0.5) * 2;
        target.y += (Math.random() - 0.5) * 2;
        target.x = Math.max(0, Math.min(canvas.width - target.width, target.x));
        target.y = Math.max(0, Math.min(canvas.height - target.height, target.y));
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!gameStarted) {
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click to Start!', canvas.width/2, canvas.height/2);
        return;
    }
    
    targets.forEach(target => {
        if (target.active) {
            ctx.fillStyle = target.color;
            ctx.fillRect(target.x, target.y, target.width, target.height);
        }
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
