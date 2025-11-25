// Sudoku Game
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas not found!');
    alert('Error: Game canvas not found. Please refresh the page.');
}
const ctx = canvas.getContext('2d');

const gridSize = 9;
const cellSize = 60;
let grid = [];
let selectedCell = null;
let score = 0;

function init() {
    grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = 0;
        }
    }
    generatePuzzle();
    score = 0;
    document.getElementById('score').textContent = score;
}

function generatePuzzle() {
    // Simple puzzle - fill some cells
    const puzzle = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
    ];
    grid = puzzle.map(row => [...row]);
}

function isValid(row, col, num) {
    // Check row
    for (let j = 0; j < gridSize; j++) {
        if (grid[row][j] === num) return false;
    }
    // Check column
    for (let i = 0; i < gridSize; i++) {
        if (grid[i][col] === num) return false;
    }
    // Check box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
        for (let j = boxCol; j < boxCol + 3; j++) {
            if (grid[i][j] === num) return false;
        }
    }
    return true;
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 50) / cellSize);
    const y = Math.floor((e.clientY - rect.top - 50) / cellSize);
    
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        selectedCell = {x, y};
    }
});

document.addEventListener('keydown', (e) => {
    if (selectedCell && '123456789'.includes(e.key)) {
        const num = parseInt(e.key);
        if (isValid(selectedCell.y, selectedCell.x, num)) {
            grid[selectedCell.y][selectedCell.x] = num;
            score += 10;
            document.getElementById('score').textContent = score;
            selectedCell = null;
        }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCell) {
            grid[selectedCell.y][selectedCell.x] = 0;
            selectedCell = null;
        }
    }
});

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        ctx.lineWidth = (i % 3 === 0) ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(50 + i * cellSize, 50);
        ctx.lineTo(50 + i * cellSize, 50 + gridSize * cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(50, 50 + i * cellSize);
        ctx.lineTo(50 + gridSize * cellSize, 50 + i * cellSize);
        ctx.stroke();
    }
    
    // Draw numbers
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] !== 0) {
                ctx.fillStyle = '#000';
                ctx.fillText(grid[i][j], 50 + j * cellSize + cellSize/2, 50 + i * cellSize + cellSize/2 + 10);
            }
        }
    }
    
    // Highlight selected
    if (selectedCell) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(50 + selectedCell.x * cellSize, 50 + selectedCell.y * cellSize, cellSize, cellSize);
    }
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

init();
gameLoop();
