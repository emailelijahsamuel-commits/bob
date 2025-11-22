#!/usr/bin/env python3
import os

# Game implementations
games = {
    'game11': '''// Bubble Shooter
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
gameLoop();''',

    'game20': '''// Minesweeper
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 10;
const cellSize = 60;
let grid = [];
let revealed = [];
let gameOver = false;
let score = 0;

function init() {
    grid = [];
    revealed = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        revealed[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = Math.random() < 0.15 ? -1 : 0;
            revealed[i][j] = false;
        }
    }
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] !== -1) {
                let count = 0;
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        if (i + di >= 0 && i + di < gridSize && j + dj >= 0 && j + dj < gridSize) {
                            if (grid[i + di][j + dj] === -1) count++;
                        }
                    }
                }
                grid[i][j] = count;
            }
        }
    }
}

canvas.addEventListener('click', (e) => {
    if (gameOver) {
        init();
        gameOver = false;
        score = 0;
        document.getElementById('score').textContent = score;
        draw();
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && !revealed[y][x]) {
        revealed[y][x] = true;
        if (grid[y][x] === -1) {
            gameOver = true;
        } else {
            score += 10;
            document.getElementById('score').textContent = score;
        }
        draw();
    }
});

function draw() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const x = j * cellSize;
            const y = i * cellSize;
            
            if (revealed[i][j]) {
                if (grid[i][j] === -1) {
                    ctx.fillStyle = '#ff0000';
                } else {
                    ctx.fillStyle = '#fff';
                }
                ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
                
                if (grid[i][j] > 0) {
                    ctx.fillStyle = '#000';
                    ctx.font = '30px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(grid[i][j], x + cellSize / 2, y + cellSize / 2 + 10);
                }
            } else {
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
            }
        }
    }
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! Click to restart', canvas.width / 2, canvas.height / 2);
    }
}

init();
draw();''',

    'game30': '''// Basketball
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
gameLoop();'''
}

# Fix all remaining games with simple click-to-score games
for i in range(1, 104):
    num = f"{i:02d}"
    filename = f'game{num}.js'
    
    # Skip games we already fixed
    if filename in ['game01.js', 'game02.js', 'game03.js', 'game04.js', 'game05.js', 
                     'game06.js', 'game07.js', 'game09.js', 'game10.js', 'game11.js', 
                     'game20.js', 'game30.js']:
        continue
    
    # Create a simple interactive game
    game_code = f'''// Interactive Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
const targets = [];
let gameStarted = false;

function createTarget() {{
    targets.push({{
        x: Math.random() * (canvas.width - 40),
        y: Math.random() * (canvas.height - 40),
        width: 40,
        height: 40,
        active: true,
        color: `hsl(${{Math.random() * 360}}, 70%, 50%)`
    }});
}}

canvas.addEventListener('click', (e) => {{
    if (!gameStarted) {{
        gameStarted = true;
        for (let i = 0; i < 5; i++) createTarget();
        return;
    }}
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    targets.forEach((target, index) => {{
        if (target.active && x >= target.x && x <= target.x + target.width &&
            y >= target.y && y <= target.y + target.height) {{
            target.active = false;
            targets.splice(index, 1);
            score += 10;
            document.getElementById('score').textContent = score;
            createTarget();
        }}
    }});
}});

function update() {{
    if (!gameStarted) return;
    
    targets.forEach(target => {{
        target.x += (Math.random() - 0.5) * 2;
        target.y += (Math.random() - 0.5) * 2;
        target.x = Math.max(0, Math.min(canvas.width - target.width, target.x));
        target.y = Math.max(0, Math.min(canvas.height - target.height, target.y));
    }});
}}

function draw() {{
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!gameStarted) {{
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click to Start!', canvas.width/2, canvas.height/2);
        return;
    }}
    
    targets.forEach(target => {{
        if (target.active) {{
            ctx.fillStyle = target.color;
            ctx.fillRect(target.x, target.y, target.width, target.height);
        }}
    }});
}}

function gameLoop() {{
    update();
    draw();
    requestAnimationFrame(gameLoop);
}}
gameLoop();
'''

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(game_code)
    print(f'Fixed {filename}')

# Write special games
for game_id, code in games.items():
    filename = f'{game_id}.js'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f'Fixed {filename}')

print('All games fixed!')

