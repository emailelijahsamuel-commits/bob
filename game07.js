// 2048 Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 4;
const cellSize = 150;
let grid = [];
let score = 0;
let moved = false;

function init() {
    grid = Array(4).fill().map(() => Array(4).fill(0));
    addRandom();
    addRandom();
    score = 0;
    document.getElementById('score').textContent = score;
}

function addRandom() {
    const empty = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) empty.push({i, j});
        }
    }
    if (empty.length > 0) {
        const cell = empty[Math.floor(Math.random() * empty.length)];
        grid[cell.i][cell.j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function move(direction) {
    moved = false;
    const oldGrid = grid.map(row => [...row]);
    
    if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
            grid[i] = mergeRow(grid[i].filter(x => x !== 0));
            while (grid[i].length < 4) grid[i].push(0);
        }
    } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
            grid[i] = mergeRow(grid[i].filter(x => x !== 0).reverse()).reverse();
            while (grid[i].length < 4) grid[i].unshift(0);
        }
    } else if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
            const col = [];
            for (let i = 0; i < 4; i++) col.push(grid[i][j]);
            const merged = mergeRow(col.filter(x => x !== 0));
            while (merged.length < 4) merged.push(0);
            for (let i = 0; i < 4; i++) grid[i][j] = merged[i];
        }
    } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
            const col = [];
            for (let i = 0; i < 4; i++) col.push(grid[i][j]);
            const merged = mergeRow(col.filter(x => x !== 0).reverse()).reverse();
            while (merged.length < 4) merged.unshift(0);
            for (let i = 0; i < 4; i++) grid[i][j] = merged[i];
        }
    }
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] !== oldGrid[i][j]) moved = true;
        }
    }
    
    if (moved) addRandom();
}

function mergeRow(row) {
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row[i + 1] = 0;
        }
    }
    return row.filter(x => x !== 0);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
    document.getElementById('score').textContent = score;
    draw();
});

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const colors = {
        2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
        32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61'
    };
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const x = j * cellSize + 10;
            const y = i * cellSize + 10;
            ctx.fillStyle = grid[i][j] === 0 ? '#3c3a32' : (colors[grid[i][j]] || '#edc22e');
            ctx.fillRect(x, y, cellSize - 20, cellSize - 20);
            if (grid[i][j] !== 0) {
                ctx.fillStyle = '#776e65';
                ctx.font = 'bold 40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(grid[i][j], x + cellSize/2 - 10, y + cellSize/2 + 15);
            }
        }
    }
}

init();
draw();
