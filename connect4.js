let currentPlayer = 'red';
let board = [];
let gameActive = true;

const statusElement = document.getElementById('status');
const boardElement = document.getElementById('board');

// Initialize board
function initBoard() {
    board = [];
    for (let row = 0; row < 6; row++) {
        board[row] = [];
        for (let col = 0; col < 7; col++) {
            board[row][col] = null;
        }
    }
}

// Create board
function createBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleColumnClick(col));
            boardElement.appendChild(cell);
        }
    }
    updateBoard();
}

// Update board display
function updateBoard() {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 7);
        const col = index % 7;
        cell.className = 'cell';
        if (board[row][col]) {
            cell.classList.add(board[row][col]);
        }
    });
}

// Handle column click
function handleColumnClick(col) {
    if (!gameActive) return;
    
    // Find lowest empty row
    let row = -1;
    for (let r = 5; r >= 0; r--) {
        if (!board[r][col]) {
            row = r;
            break;
        }
    }
    
    if (row === -1) return; // Column full
    
    board[row][col] = currentPlayer;
    updateBoard();
    
    if (checkWinner(row, col)) {
        statusElement.textContent = `Player ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} Wins!`;
        gameActive = false;
        return;
    }
    
    if (board[0].every(cell => cell !== null)) {
        statusElement.textContent = "It's a Draw!";
        gameActive = false;
        return;
    }
    
    currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
    statusElement.textContent = `Player ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
}

// Check winner
function checkWinner(row, col) {
    const directions = [
        [[0, 1], [0, -1]], // Horizontal
        [[1, 0], [-1, 0]], // Vertical
        [[1, 1], [-1, -1]], // Diagonal /
        [[1, -1], [-1, 1]]  // Diagonal \
    ];
    
    for (let dir of directions) {
        let count = 1;
        
        for (let [dr, dc] of dir) {
            let r = row + dr;
            let c = col + dc;
            
            while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === currentPlayer) {
                count++;
                r += dr;
                c += dc;
            }
        }
        
        if (count >= 4) return true;
    }
    
    return false;
}

// Reset game
function resetGame() {
    currentPlayer = 'red';
    gameActive = true;
    statusElement.textContent = "Player Red's Turn";
    initBoard();
    updateBoard();
}

// Initialize
initBoard();
createBoard();


