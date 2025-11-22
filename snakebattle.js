const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Snakes
const snake1 = {
    body: [{x: 10, y: 10}],
    direction: {x: 1, y: 0},
    nextDirection: {x: 1, y: 0},
    color: '#ff0000',
    score: 0
};

const snake2 = {
    body: [{x: 30, y: 10}],
    direction: {x: -1, y: 0},
    nextDirection: {x: -1, y: 0},
    color: '#0066ff',
    score: 0
};

// Food
let food = {x: 15, y: 15};

// Input
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Snake 1 controls (WASD)
    if (e.key.toLowerCase() === 'w' && snake1.direction.y === 0) {
        snake1.nextDirection = {x: 0, y: -1};
    }
    if (e.key.toLowerCase() === 's' && snake1.direction.y === 0) {
        snake1.nextDirection = {x: 0, y: 1};
    }
    if (e.key.toLowerCase() === 'a' && snake1.direction.x === 0) {
        snake1.nextDirection = {x: -1, y: 0};
    }
    if (e.key.toLowerCase() === 'd' && snake1.direction.x === 0) {
        snake1.nextDirection = {x: 1, y: 0};
    }
    
    // Snake 2 controls (Arrow keys)
    if (e.key === 'ArrowUp' && snake2.direction.y === 0) {
        snake2.nextDirection = {x: 0, y: -1};
    }
    if (e.key === 'ArrowDown' && snake2.direction.y === 0) {
        snake2.nextDirection = {x: 0, y: 1};
    }
    if (e.key === 'ArrowLeft' && snake2.direction.x === 0) {
        snake2.nextDirection = {x: -1, y: 0};
    }
    if (e.key === 'ArrowRight' && snake2.direction.x === 0) {
        snake2.nextDirection = {x: 1, y: 0};
    }
});

// Generate food
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

// Update snake
function updateSnake(snake) {
    snake.direction = snake.nextDirection;
    const head = {
        x: snake.body[0].x + snake.direction.x,
        y: snake.body[0].y + snake.direction.y
    };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return false;
    }
    
    // Check self collision
    for (let segment of snake.body) {
        if (head.x === segment.x && head.y === segment.y) {
            return false;
        }
    }
    
    snake.body.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        snake.score++;
        document.getElementById(snake === snake1 ? 'score1' : 'score2').textContent = snake.score;
        generateFood();
    } else {
        snake.body.pop();
    }
    
    return true;
}

// Update
function update() {
    const snake1Alive = updateSnake(snake1);
    const snake2Alive = updateSnake(snake2);
    
    if (!snake1Alive || !snake2Alive) {
        if (!snake1Alive && !snake2Alive) {
            alert('Draw! Both snakes crashed!');
        } else if (!snake1Alive) {
            alert('Player 2 Wins!');
        } else {
            alert('Player 1 Wins!');
        }
        resetGame();
    }
}

// Draw
function draw() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw food
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    
    // Draw snakes
    function drawSnake(snake) {
        ctx.fillStyle = snake.color;
        snake.body.forEach((segment, index) => {
            if (index === 0) {
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = snake.color;
            }
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }
    
    drawSnake(snake1);
    drawSnake(snake2);
}

// Reset game
function resetGame() {
    snake1.body = [{x: 10, y: 10}];
    snake1.direction = {x: 1, y: 0};
    snake1.nextDirection = {x: 1, y: 0};
    snake1.score = 0;
    
    snake2.body = [{x: 30, y: 10}];
    snake2.direction = {x: -1, y: 0};
    snake2.nextDirection = {x: -1, y: 0};
    snake2.score = 0;
    
    document.getElementById('score1').textContent = '0';
    document.getElementById('score2').textContent = '0';
    
    generateFood();
}

// Game loop
function gameLoop() {
    update();
    draw();
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 100);
}

// Start
generateFood();
gameLoop();


