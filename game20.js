// Minesweeper
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
draw();