// Checkers Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const boardSize = 8;
const cellSize = 70;
let board = [];
let selectedPiece = null;
let currentPlayer = 'red';
let score = 0;

function init() {
    board = [];
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            if ((i + j) % 2 === 1) {
                if (i < 3) {
                    board[i][j] = { type: 'black', king: false };
                } else if (i > 4) {
                    board[i][j] = { type: 'red', king: false };
                } else {
                    board[i][j] = null;
                }
            } else {
                board[i][j] = null;
            }
        }
    }
    score = 0;
    document.getElementById('score').textContent = score;
}

function getValidMoves(row, col) {
    if (!board[row][col] || board[row][col].type !== currentPlayer) return [];
    
    const piece = board[row][col];
    const moves = [];
    const directions = piece.king ? 
        [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
        (currentPlayer === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
    
    for (let [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
            if (!board[newRow][newCol]) {
                moves.push({row: newRow, col: newCol, jump: false});
            } else if (board[newRow][newCol].type !== currentPlayer) {
                const jumpRow = newRow + dr;
                const jumpCol = newCol + dc;
                if (jumpRow >= 0 && jumpRow < boardSize && jumpCol >= 0 && jumpCol < boardSize && !board[jumpRow][jumpCol]) {
                    moves.push({row: jumpRow, col: jumpCol, jump: true, captureRow: newRow, captureCol: newCol});
                }
            }
        }
    }
    
    return moves;
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 25) / cellSize);
    const y = Math.floor((e.clientY - rect.top - 25) / cellSize);
    
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return;
    
    if (selectedPiece) {
        const moves = getValidMoves(selectedPiece.row, selectedPiece.col);
        const move = moves.find(m => m.row === y && m.col === x);
        
        if (move) {
            board[y][x] = board[selectedPiece.row][selectedPiece.col];
            board[selectedPiece.row][selectedPiece.col] = null;
            
            if (move.jump) {
                board[move.captureRow][move.captureCol] = null;
                score += 10;
            }
            
            if (currentPlayer === 'red' && y === 0) {
                board[y][x].king = true;
            } else if (currentPlayer === 'black' && y === boardSize - 1) {
                board[y][x].king = true;
            }
            
            selectedPiece = null;
            currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
            document.getElementById('score').textContent = score;
        } else {
            selectedPiece = null;
        }
    } else if (board[y][x] && board[y][x].type === currentPlayer) {
        selectedPiece = { row: y, col: x };
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
        ctx.fillRect(25 + selectedPiece.col * cellSize, 25 + selectedPiece.row * cellSize, cellSize, cellSize);
        
        const moves = getValidMoves(selectedPiece.row, selectedPiece.col);
        moves.forEach(move => {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.fillRect(25 + move.col * cellSize, 25 + move.row * cellSize, cellSize, cellSize);
        });
    }
    
    // Draw pieces
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j]) {
                ctx.fillStyle = board[i][j].type === 'red' ? '#ff0000' : '#000';
                ctx.beginPath();
                ctx.arc(25 + j * cellSize + cellSize/2, 25 + i * cellSize + cellSize/2, cellSize/2 - 5, 0, Math.PI * 2);
                ctx.fill();
                
                if (board[i][j].king) {
                    ctx.fillStyle = '#ffff00';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('K', 25 + j * cellSize + cellSize/2, 25 + i * cellSize + cellSize/2 + 7);
                }
            }
        }
    }
    
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
