// Snake Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let direction = {x: 1, y: 0};
let food = {x: 15, y: 15};
let score = 0;
let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'ArrowUp' && direction.y === 0) direction = {x: 0, y: -1};
    if (e.key === 'ArrowDown' && direction.y === 0) direction = {x: 0, y: 1};
    if (e.key === 'ArrowLeft' && direction.x === 0) direction = {x: -1, y: 0};
    if (e.key === 'ArrowRight' && direction.x === 0) direction = {x: 1, y: 0};
});

function update() {
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        reset();
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            reset();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    
    // Draw snake
    ctx.fillStyle = '#00ff00';
    snake.forEach((segment, index) => {
        if (index === 0) ctx.fillStyle = '#00ff00';
        else ctx.fillStyle = '#00cc00';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function reset() {
    snake = [{x: 10, y: 10}];
    direction = {x: 1, y: 0};
    score = 0;
    document.getElementById('score').textContent = score;
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

function gameLoop() {
    update();
    draw();
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 100);
}

gameLoop();
