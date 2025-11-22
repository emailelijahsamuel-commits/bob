let currentPlayer = 'red';
let selectedPiece = null;
let board = [];

// Initialize board
function initBoard() {
    board = [];
    for (let row = 0; row < 8; row++) {
        board[row] = [];
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                if (row < 3) {
                    board[row][col] = { type: 'black', king: false };
                } else if (row > 4) {
                    board[row][col] = { type: 'red', king: false };
                } else {
                    board[row][col] = null;
                }
            } else {
                board[row][col] = null;
            }
        }
    }
}

// Create board
function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(row, col));
            boardElement.appendChild(cell);
        }
    }
    updateBoard();
}

// Update board display
function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('selected');
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.innerHTML = '';
        
        if (board[row][col]) {
            const piece = document.createElement('div');
            piece.className = `piece ${board[row][col].type} ${board[row][col].king ? 'king' : ''}`;
            cell.appendChild(piece);
        }
        
        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
            cell.classList.add('selected');
        }
    });
}

// Get valid moves
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
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            if (!board[newRow][newCol]) {
                moves.push({row: newRow, col: newCol, jump: false});
            } else if (board[newRow][newCol].type !== currentPlayer) {
                const jumpRow = newRow + dr;
                const jumpCol = newCol + dc;
                if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8 && !board[jumpRow][jumpCol]) {
                    moves.push({row: jumpRow, col: jumpCol, jump: true, captureRow: newRow, captureCol: newCol});
                }
            }
        }
    }
    
    return moves;
}

// Handle cell click
function handleCellClick(row, col) {
    if (selectedPiece) {
        const moves = getValidMoves(selectedPiece.row, selectedPiece.col);
        const move = moves.find(m => m.row === row && m.col === col);
        
        if (move) {
            // Make move
            board[row][col] = board[selectedPiece.row][selectedPiece.col];
            board[selectedPiece.row][selectedPiece.col] = null;
            
            // Capture
            if (move.jump) {
                board[move.captureRow][move.captureCol] = null;
            }
            
            // King promotion
            if (currentPlayer === 'red' && row === 0) {
                board[row][col].king = true;
            } else if (currentPlayer === 'black' && row === 7) {
                board[row][col].king = true;
            }
            
            selectedPiece = null;
            currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
            document.getElementById('status').textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
            
            // Check win
            const redPieces = board.flat().filter(p => p && p.type === 'red').length;
            const blackPieces = board.flat().filter(p => p && p.type === 'black').length;
            
            if (redPieces === 0) {
                alert('Black Wins!');
                initBoard();
                currentPlayer = 'red';
                document.getElementById('status').textContent = "Red's Turn";
            } else if (blackPieces === 0) {
                alert('Red Wins!');
                initBoard();
                currentPlayer = 'red';
                document.getElementById('status').textContent = "Red's Turn";
            }
        } else {
            selectedPiece = null;
        }
    } else if (board[row][col] && board[row][col].type === currentPlayer) {
        selectedPiece = { row, col };
    }
    
    updateBoard();
}

// Initialize
initBoard();
createBoard();


