// Tetris Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let score = 0;
let currentPiece = null;
let dropTime = 0;
let lastTime = 0;

const pieces = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]]  // L
];

function createPiece() {
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        matrix: type,
        x: Math.floor(COLS / 2) - Math.floor(type[0].length / 2),
        y: 0
    };
}

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }
}

function drawPiece(piece) {
    if (!piece) return;
    ctx.fillStyle = '#ff00ff';
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillRect(
                    (piece.x + x) * BLOCK_SIZE,
                    (piece.y + y) * BLOCK_SIZE,
                    BLOCK_SIZE - 1,
                    BLOCK_SIZE - 1
                );
            }
        });
    });
}

function validMove(piece, dx, dy, matrix) {
    matrix = matrix || piece.matrix;
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x]) {
                const newX = piece.x + x + dx;
                const newY = piece.y + y + dy;
                if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
                if (newY >= 0 && board[newY][newX]) return false;
            }
        }
    }
    return true;
}

function placePiece(piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[piece.y + y][piece.x + x] = 1;
            }
        });
    });
    
    // Clear lines
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell === 1)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            document.getElementById('score').textContent = score;
            y++;
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (!currentPiece) return;
    
    if (e.key === 'ArrowLeft' && validMove(currentPiece, -1, 0)) currentPiece.x--;
    if (e.key === 'ArrowRight' && validMove(currentPiece, 1, 0)) currentPiece.x++;
    if (e.key === 'ArrowDown' && validMove(currentPiece, 0, 1)) currentPiece.y++;
    if (e.key === ' ') {
        const rotated = currentPiece.matrix[0].map((_, i) =>
            currentPiece.matrix.map(row => row[i]).reverse()
        );
        if (validMove(currentPiece, 0, 0, rotated)) {
            currentPiece.matrix = rotated;
        }
    }
});

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropTime += deltaTime;
    
    if (!currentPiece) {
        currentPiece = createPiece();
        if (!validMove(currentPiece, 0, 0)) {
            alert('Game Over! Score: ' + score);
            board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
            score = 0;
            document.getElementById('score').textContent = score;
        }
    }
    
    if (dropTime > 1000) {
        if (validMove(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            placePiece(currentPiece);
            currentPiece = null;
        }
        dropTime = 0;
    }
    
    drawBoard();
    drawPiece(currentPiece);
    requestAnimationFrame(update);
}

update();
