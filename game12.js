// Match 3 Game
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas not found!');
    alert('Error: Game canvas not found. Please refresh the page.');
}
const ctx = canvas.getContext('2d');

const gridSize = 8;
const cellSize = 80;
let grid = [];
let selectedCell = null;
let score = 0;
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

function init() {
    grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = Math.floor(Math.random() * colors.length);
        }
    }
    score = 0;
    document.getElementById('score').textContent = score;
}

function checkMatches() {
    let found = false;
    // Check rows
    for (let i = 0; i < gridSize; i++) {
        let count = 1;
        for (let j = 1; j < gridSize; j++) {
            if (grid[i][j] === grid[i][j-1]) {
                count++;
            } else {
                if (count >= 3) {
                    for (let k = j - count; k < j; k++) {
                        grid[i][k] = -1;
                    }
                    score += count * 10;
                    found = true;
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let k = gridSize - count; k < gridSize; k++) {
                grid[i][k] = -1;
            }
            score += count * 10;
            found = true;
        }
    }
    
    // Check columns
    for (let j = 0; j < gridSize; j++) {
        let count = 1;
        for (let i = 1; i < gridSize; i++) {
            if (grid[i][j] === grid[i-1][j]) {
                count++;
            } else {
                if (count >= 3) {
                    for (let k = i - count; k < i; k++) {
                        grid[k][j] = -1;
                    }
                    score += count * 10;
                    found = true;
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let k = gridSize - count; k < gridSize; k++) {
                grid[k][j] = -1;
            }
            score += count * 10;
            found = true;
        }
    }
    
    if (found) {
        // Drop gems
        for (let j = 0; j < gridSize; j++) {
            let writeIndex = gridSize - 1;
            for (let i = gridSize - 1; i >= 0; i--) {
                if (grid[i][j] !== -1) {
                    grid[writeIndex][j] = grid[i][j];
                    writeIndex--;
                }
            }
            while (writeIndex >= 0) {
                grid[writeIndex][j] = Math.floor(Math.random() * colors.length);
                writeIndex--;
            }
        }
        document.getElementById('score').textContent = score;
        setTimeout(checkMatches, 300);
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 50) / cellSize);
    const y = Math.floor((e.clientY - rect.top - 50) / cellSize);
    
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
    
    if (selectedCell) {
        const dx = Math.abs(selectedCell.x - x);
        const dy = Math.abs(selectedCell.y - y);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // Swap
            const temp = grid[y][x];
            grid[y][x] = grid[selectedCell.y][selectedCell.x];
            grid[selectedCell.y][selectedCell.x] = temp;
            selectedCell = null;
            setTimeout(checkMatches, 100);
        } else {
            selectedCell = {x, y};
        }
    } else {
        selectedCell = {x, y};
    }
});

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] !== -1) {
                ctx.fillStyle = colors[grid[i][j]];
                ctx.fillRect(50 + j * cellSize, 50 + i * cellSize, cellSize - 4, cellSize - 4);
            }
        }
    }
    
    if (selectedCell) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(50 + selectedCell.x * cellSize, 50 + selectedCell.y * cellSize, cellSize - 4, cellSize - 4);
    }
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

init();
gameLoop();
