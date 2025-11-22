let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const statusElement = document.getElementById('status');
const boardElement = document.getElementById('board');

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Create board
function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.className = 'cell';
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => handleCellClick(i));
        boardElement.appendChild(cell);
    }
}

// Handle cell click
function handleCellClick(index) {
    if (board[index] !== '' || !gameActive) return;
    
    board[index] = currentPlayer;
    updateBoard();
    
    if (checkWinner()) {
        statusElement.textContent = `Player ${currentPlayer} Wins!`;
        gameActive = false;
        return;
    }
    
    if (board.every(cell => cell !== '')) {
        statusElement.textContent = "It's a Draw!";
        gameActive = false;
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusElement.textContent = `Player ${currentPlayer}'s Turn`;
}

// Update board display
function updateBoard() {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = board[index];
        cell.disabled = !gameActive || board[index] !== '';
    });
}

// Check winner
function checkWinner() {
    return winningConditions.some(condition => {
        const [a, b, c] = condition;
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

// Reset game
function resetGame() {
    currentPlayer = 'X';
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    statusElement.textContent = "Player X's Turn";
    updateBoard();
}

// Initialize
createBoard();
updateBoard();


