// Word Search Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const words = ['GAME', 'FUN', 'PLAY', 'WIN', 'SCORE'];
const gridSize = 10;
const cellSize = 50;
let grid = [];
let selectedCells = [];
let foundWords = [];
let score = 0;

function init() {
    grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
    }
    
    // Place words
    words.forEach(word => {
        const dir = Math.random() > 0.5 ? 'h' : 'v';
        const row = Math.floor(Math.random() * (gridSize - word.length));
        const col = Math.floor(Math.random() * (gridSize - word.length));
        
        for (let i = 0; i < word.length; i++) {
            if (dir === 'h') {
                grid[row][col + i] = word[i];
            } else {
                grid[row + i][col] = word[i];
            }
        }
    });
    
    foundWords = [];
    score = 0;
    document.getElementById('score').textContent = score;
}

let isSelecting = false;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 25) / cellSize);
    const y = Math.floor((e.clientY - rect.top - 25) / cellSize);
    
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        isSelecting = true;
        selectedCells = [{x, y}];
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 25) / cellSize);
    const y = Math.floor((e.clientY - rect.top - 25) / cellSize);
    
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        const last = selectedCells[selectedCells.length - 1];
        if (x !== last.x || y !== last.y) {
            selectedCells.push({x, y});
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (selectedCells.length > 0) {
        checkWord();
        selectedCells = [];
    }
    isSelecting = false;
});

function checkWord() {
    const word = selectedCells.map(cell => grid[cell.y][cell.x]).join('');
    const reverseWord = word.split('').reverse().join('');
    
    words.forEach(w => {
        if ((word === w || reverseWord === w) && !foundWords.includes(w)) {
            foundWords.push(w);
            score += 100;
            document.getElementById('score').textContent = score;
        }
    });
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(25 + i * cellSize, 25);
        ctx.lineTo(25 + i * cellSize, 25 + gridSize * cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(25, 25 + i * cellSize);
        ctx.lineTo(25 + gridSize * cellSize, 25 + i * cellSize);
        ctx.stroke();
    }
    
    // Draw letters
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.fillStyle = '#000';
            ctx.fillText(grid[i][j], 25 + j * cellSize + cellSize/2, 25 + i * cellSize + cellSize/2 + 8);
        }
    }
    
    // Highlight selected
    selectedCells.forEach(cell => {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.fillRect(25 + cell.x * cellSize, 25 + cell.y * cellSize, cellSize, cellSize);
    });
    
    // Show found words
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Find: ' + words.filter(w => !foundWords.includes(w)).join(', '), 25, 550);
    ctx.fillText('Found: ' + foundWords.join(', '), 25, 575);
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

init();
gameLoop();
