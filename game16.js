// Chess Game (Simplified)
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Canvas not found!');
    alert('Error: Game canvas not found. Please refresh the page.');
}
const ctx = canvas.getContext('2d');

const boardSize = 8;
const cellSize = 70;
let board = [];
let selectedPiece = null;
let currentPlayer = 'white';
let score = 0;

const pieces = {
    'white': ['♔', '♕', '♖', '♗', '♘', '♙'],
    'black': ['♚', '♛', '♜', '♝', '♞', '♟']
};

function init() {
    board = [];
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            board[i][j] = null;
        }
    }
    
    // Place pieces
    for (let j = 0; j < boardSize; j++) {
        board[1][j] = { type: 'pawn', color: 'black', symbol: pieces.black[5] };
        board[6][j] = { type: 'pawn', color: 'white', symbol: pieces.white[5] };
    }
    
    board[0][0] = { type: 'rook', color: 'black', symbol: pieces.black[2] };
    board[0][7] = { type: 'rook', color: 'black', symbol: pieces.black[2] };
    board[7][0] = { type: 'rook', color: 'white', symbol: pieces.white[2] };
    board[7][7] = { type: 'rook', color: 'white', symbol: pieces.white[2] };
    
    board[0][4] = { type: 'king', color: 'black', symbol: pieces.black[0] };
    board[7][4] = { type: 'king', color: 'white', symbol: pieces.white[0] };
    
    score = 0;
    document.getElementById('score').textContent = score;
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 25) / cellSize);
    const y = Math.floor((e.clientY - rect.top - 25) / cellSize);
    
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return;
    
    if (selectedPiece) {
        // Move piece
        if (board[y][x] === null || board[y][x].color !== currentPlayer) {
            board[y][x] = selectedPiece.piece;
            board[selectedPiece.y][selectedPiece.x] = null;
            if (board[y][x] && board[y][x].color !== currentPlayer) {
                score += 10;
                document.getElementById('score').textContent = score;
            }
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            selectedPiece = null;
        } else {
            selectedPiece = null;
        }
    } else {
        // Select piece
        if (board[y][x] && board[y][x].color === currentPlayer) {
            selectedPiece = { x, y, piece: board[y][x] };
        }
    }
});

function draw() {
    // Draw board
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? '#f0d9b5' : '#b58863';
            ctx.fillRect(25 + j * cellSize, 25 + i * cellSize, cellSize, cellSize);
        }
    }
    
    // Highlight selected
    if (selectedPiece) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.fillRect(25 + selectedPiece.x * cellSize, 25 + selectedPiece.y * cellSize, cellSize, cellSize);
    }
    
    // Draw pieces
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j]) {
                ctx.fillStyle = board[i][j].color === 'white' ? '#fff' : '#000';
                ctx.fillText(board[i][j].symbol, 25 + j * cellSize + cellSize/2, 25 + i * cellSize + cellSize/2 + 15);
            }
        }
    }
    
    // Show current player
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Current Player: ${currentPlayer}`, 25, 580);
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

init();
gameLoop();
