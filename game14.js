// Crossword Game
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas not found!');
    alert('Error: Game canvas not found. Please refresh the page.');
}
const ctx = canvas.getContext('2d');

const gridSize = 10;
const cellSize = 50;
let grid = [];
let clues = [
    {word: 'GAME', row: 2, col: 1, dir: 'across'},
    {word: 'FUN', row: 4, col: 3, dir: 'across'},
    {word: 'PLAY', row: 6, col: 1, dir: 'across'},
    {word: 'WIN', row: 1, col: 2, dir: 'down'},
    {word: 'SCORE', row: 3, col: 5, dir: 'down'}
];
let currentInput = '';
let selectedClue = null;
let score = 0;

function init() {
    grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = { letter: '', filled: false, clue: null };
        }
    }
    
    clues.forEach(clue => {
        for (let i = 0; i < clue.word.length; i++) {
            if (clue.dir === 'across') {
                grid[clue.row][clue.col + i].clue = clue;
            } else {
                grid[clue.row + i][clue.col].clue = clue;
            }
        }
    });
    
    score = 0;
    document.getElementById('score').textContent = score;
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 25) / cellSize);
    const y = Math.floor((e.clientY - rect.top - 25) / cellSize);
    
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && grid[y][x].clue) {
        selectedClue = grid[y][x].clue;
        currentInput = '';
    }
});

document.addEventListener('keydown', (e) => {
    if (selectedClue && e.key.length === 1 && /[A-Za-z]/.test(e.key)) {
        currentInput += e.key.toUpperCase();
        if (currentInput.length <= selectedClue.word.length) {
            for (let i = 0; i < currentInput.length; i++) {
                if (selectedClue.dir === 'across') {
                    grid[selectedClue.row][selectedClue.col + i].letter = currentInput[i];
                } else {
                    grid[selectedClue.row + i][selectedClue.col].letter = currentInput[i];
                }
            }
            
            if (currentInput === selectedClue.word) {
                for (let i = 0; i < selectedClue.word.length; i++) {
                    if (selectedClue.dir === 'across') {
                        grid[selectedClue.row][selectedClue.col + i].filled = true;
                    } else {
                        grid[selectedClue.row + i][selectedClue.col].filled = true;
                    }
                }
                score += 100;
                document.getElementById('score').textContent = score;
                selectedClue = null;
                currentInput = '';
            }
        }
    }
    if (e.key === 'Backspace' && currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        for (let i = currentInput.length; i < selectedClue.word.length; i++) {
            if (selectedClue.dir === 'across') {
                grid[selectedClue.row][selectedClue.col + i].letter = '';
            } else {
                grid[selectedClue.row + i][selectedClue.col].letter = '';
            }
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
        ctx.beginPath();
        ctx.moveTo(25 + i * cellSize, 25);
        ctx.lineTo(25 + i * cellSize, 25 + gridSize * cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(25, 25 + i * cellSize);
        ctx.lineTo(25 + gridSize * cellSize, 25 + i * cellSize);
        ctx.stroke();
    }
    
    // Draw cells
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j].clue) {
                ctx.fillStyle = grid[i][j].filled ? '#90EE90' : '#fff';
                ctx.fillRect(25 + j * cellSize + 1, 25 + i * cellSize + 1, cellSize - 2, cellSize - 2);
                
                if (grid[i][j].letter) {
                    ctx.fillStyle = '#000';
                    ctx.font = '30px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(grid[i][j].letter, 25 + j * cellSize + cellSize/2, 25 + i * cellSize + cellSize/2 + 10);
                }
            } else {
                ctx.fillStyle = '#000';
                ctx.fillRect(25 + j * cellSize + 1, 25 + i * cellSize + 1, cellSize - 2, cellSize - 2);
            }
        }
    }
    
    // Show clues
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Clues:', 550, 50);
    clues.forEach((clue, i) => {
        const solved = clue.word.split('').every((_, idx) => {
            if (clue.dir === 'across') {
                return grid[clue.row][clue.col + idx].filled;
            } else {
                return grid[clue.row + idx][clue.col].filled;
            }
        });
        ctx.fillStyle = solved ? '#00ff00' : '#000';
        ctx.fillText(`${i+1}. ${clue.word} (${clue.dir})`, 550, 80 + i * 25);
    });
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

init();
gameLoop();
