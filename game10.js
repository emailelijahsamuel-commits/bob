// Frogger Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const frog = { x: canvas.width / 2, y: canvas.height - 30, size: 20 };
const cars = [];
let score = 0;
let keys = {};

// Create cars
for (let i = 0; i < 5; i++) {
    cars.push({
        x: Math.random() * canvas.width,
        y: 100 + i * 80,
        width: 60,
        height: 30,
        speed: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2)
    });
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'ArrowUp') frog.y -= 30;
    if (e.key === 'ArrowDown' && frog.y < canvas.height - 30) frog.y += 30;
    if (e.key === 'ArrowLeft' && frog.x > 0) frog.x -= 30;
    if (e.key === 'ArrowRight' && frog.x < canvas.width - frog.size) frog.x += 30;
});

function update() {
    // Move cars
    cars.forEach(car => {
        car.x += car.speed;
        if (car.speed > 0 && car.x > canvas.width) car.x = -car.width;
        if (car.speed < 0 && car.x < -car.width) car.x = canvas.width;
        
        // Check collision
        if (frog.x < car.x + car.width && frog.x + frog.size > car.x &&
            frog.y < car.y + car.height && frog.y + frog.size > car.y) {
            frog.x = canvas.width / 2;
            frog.y = canvas.height - 30;
            score = Math.max(0, score - 10);
            document.getElementById('score').textContent = score;
        }
    });
    
    // Check win
    if (frog.y < 30) {
        score += 50;
        document.getElementById('score').textContent = score;
        frog.x = canvas.width / 2;
        frog.y = canvas.height - 30;
    }
}

function draw() {
    // Road
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 80, canvas.width, canvas.height - 80);
    
    // Grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    // Draw cars
    ctx.fillStyle = '#ff0000';
    cars.forEach(car => {
        ctx.fillRect(car.x, car.y, car.width, car.height);
    });
    
    // Draw frog
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(frog.x, frog.y, frog.size, frog.size);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
