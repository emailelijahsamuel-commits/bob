// Pac-Man Game
let canvas, ctx;

// Game state
let gameState = 'start';
let score = 0;
let lives = 3;
let level = 1;
let gameLoop = null;

// Grid settings
const CELL_SIZE = 20;
const ROWS = 30;
const COLS = 30;

// Maze layout (1 = wall, 0 = dot, 2 = power pellet, 3 = empty)
const MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,2,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,2,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1],
    [3,3,3,3,3,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,3,3,3,3,3],
    [1,1,1,1,1,1,0,1,1,0,1,1,1,1,3,3,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,0,1,1,0,1,3,3,3,3,3,3,3,3,1,0,1,1,0,1,1,1,1,1,1],
    [3,3,3,3,3,1,0,1,1,0,1,3,3,3,3,3,3,3,3,1,0,1,1,0,1,3,3,3,3,3],
    [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,2,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,2,1],
    [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let maze = [];
let dotsRemaining = 0;

// Pac-Man
let pacman = {
    x: 14,
    y: 18,
    direction: 0, // 0: right, 1: down, 2: left, 3: up
    nextDirection: 0,
    mouthAngle: 0,
    mouthOpen: true,
    speed: 0.15
};

// Ghosts
let ghosts = [
    { x: 14, y: 10, direction: 0, color: '#FF0000', name: 'Blinky', mode: 'chase', scared: false, homeX: 14, homeY: 10 },
    { x: 13, y: 10, direction: 0, color: '#FFB8FF', name: 'Pinky', mode: 'chase', scared: false, homeX: 13, homeY: 10 },
    { x: 15, y: 10, direction: 0, color: '#00FFFF', name: 'Inky', mode: 'chase', scared: false, homeX: 15, homeY: 10 },
    { x: 14, y: 11, direction: 0, color: '#FFB851', name: 'Clyde', mode: 'chase', scared: false, homeX: 14, homeY: 11 }
];

let powerPelletActive = false;
let powerPelletTimer = 0;
const POWER_PELLET_DURATION = 600; // 10 seconds at 60fps

// Keys
let keys = {};

// Initialize maze
function initMaze() {
    maze = MAZE_TEMPLATE.map(row => [...row]);
    dotsRemaining = 0;
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (maze[y][x] === 0 || maze[y][x] === 2) {
                dotsRemaining++;
            }
        }
    }
    
    // Reset positions
    pacman.x = 14;
    pacman.y = 18;
    pacman.direction = 0;
    pacman.nextDirection = 0;
    
    ghosts.forEach((ghost, i) => {
        ghost.x = ghost.homeX;
        ghost.y = ghost.homeY;
        ghost.direction = 0;
        ghost.mode = 'chase';
        ghost.scared = false;
    });
    
    powerPelletActive = false;
    powerPelletTimer = 0;
}

// Draw functions
function drawMaze() {
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cellX = x * CELL_SIZE;
            const cellY = y * CELL_SIZE;
            
            if (maze[y][x] === 1) {
                // Wall
                ctx.fillStyle = '#2121DE';
                ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
            } else if (maze[y][x] === 0) {
                // Dot
                ctx.fillStyle = '#FFB8FF';
                ctx.beginPath();
                ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (maze[y][x] === 2) {
                // Power pellet
                const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
                ctx.fillStyle = '#FFB8FF';
                ctx.beginPath();
                ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, 6 * pulse, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    if (!ctx) return;
    const x = pacman.x * CELL_SIZE + CELL_SIZE / 2;
    const y = pacman.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 2;
    
    // Animate mouth
    pacman.mouthAngle += 0.3;
    if (pacman.mouthAngle > Math.PI * 2) {
        pacman.mouthAngle = 0;
        pacman.mouthOpen = !pacman.mouthOpen;
    }
    
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    const startAngle = pacman.direction * Math.PI / 2;
    const mouthAngle = pacman.mouthOpen ? Math.PI / 3 : 0;
    
    ctx.arc(x, y, radius, startAngle + mouthAngle, startAngle + Math.PI * 2 - mouthAngle);
    ctx.lineTo(x, y);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#000';
    const eyeOffset = 3;
    const eyeX = x + Math.cos(startAngle) * eyeOffset;
    const eyeY = y + Math.sin(startAngle) * eyeOffset;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawGhosts() {
    if (!ctx) return;
    ghosts.forEach(ghost => {
        const x = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const y = ghost.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 - 2;
        
        // Ghost body
        ctx.fillStyle = ghost.scared ? '#2121DE' : ghost.color;
        ctx.beginPath();
        ctx.arc(x, y - radius / 2, radius, Math.PI, 0, false);
        ctx.rect(x - radius, y - radius / 2, radius * 2, radius * 1.5);
        ctx.fill();
        
        // Ghost bottom (wavy)
        ctx.beginPath();
        ctx.moveTo(x - radius, y + radius);
        for (let i = 0; i < 3; i++) {
            ctx.lineTo(x - radius + (i * radius * 2 / 3), y + radius - (i % 2 === 0 ? 5 : 0));
        }
        ctx.lineTo(x + radius, y + radius);
        ctx.fill();
        
        // Eyes
        if (!ghost.scared) {
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2);
            ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            const pupilOffset = 1;
            const pupilX = x - 4 + Math.cos(ghost.direction * Math.PI / 2) * pupilOffset;
            const pupilY = y - 4 + Math.sin(ghost.direction * Math.PI / 2) * pupilOffset;
            ctx.beginPath();
            ctx.arc(pupilX, pupilY, 1.5, 0, Math.PI * 2);
            ctx.arc(pupilX + 8, pupilY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Scared eyes
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x - 3, y, 2, 0, Math.PI * 2);
            ctx.arc(x + 3, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Movement
function canMove(x, y) {
    const gridX = Math.floor(x);
    const gridY = Math.floor(y);
    
    if (gridX < 0 || gridX >= COLS || gridY < 0 || gridY >= ROWS) {
        return false;
    }
    
    // Tunnel wrap
    if (gridY === 9 && (gridX < 0 || gridX >= COLS)) {
        return true;
    }
    
    return maze[gridY][gridX] !== 1 && maze[gridY][gridX] !== 3;
}

function updatePacman() {
    // Try to change direction
    const directions = [
        { dx: 1, dy: 0 },  // Right
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }, // Left
        { dx: 0, dy: -1 }  // Up
    ];
    
    const nextDir = directions[pacman.nextDirection];
    const nextX = Math.floor(pacman.x + nextDir.dx);
    const nextY = Math.floor(pacman.y + nextDir.dy);
    
    if (canMove(nextX, nextY)) {
        pacman.direction = pacman.nextDirection;
    }
    
    // Move in current direction
    const dir = directions[pacman.direction];
    const newX = pacman.x + dir.dx * pacman.speed;
    const newY = pacman.y + dir.dy * pacman.speed;
    
    // Tunnel wrap
    if (Math.floor(pacman.y) === 9) {
        if (newX < -0.5) {
            pacman.x = COLS - 0.5;
            return;
        } else if (newX >= COLS - 0.5) {
            pacman.x = -0.5;
            return;
        }
    }
    
    if (canMove(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
    } else {
        // Align to grid
        pacman.x = Math.round(pacman.x);
        pacman.y = Math.round(pacman.y);
    }
    
    // Collect dots
    const gridX = Math.floor(pacman.x);
    const gridY = Math.floor(pacman.y);
    
    if (maze[gridY] && maze[gridY][gridX] === 0) {
        maze[gridY][gridX] = 3;
        score += 10;
        dotsRemaining--;
        updateStats();
    } else if (maze[gridY] && maze[gridY][gridX] === 2) {
        maze[gridY][gridX] = 3;
        score += 50;
        dotsRemaining--;
        powerPelletActive = true;
        powerPelletTimer = POWER_PELLET_DURATION;
        ghosts.forEach(ghost => {
            ghost.scared = true;
        });
        updateStats();
    }
    
    // Check win condition
    if (dotsRemaining === 0) {
        levelComplete();
    }
}

function updateGhosts() {
    ghosts.forEach((ghost, index) => {
        // Update scared state
        if (powerPelletActive) {
            ghost.scared = true;
        } else {
            ghost.scared = false;
        }
        
        // Simple AI
        const directions = [
            { dx: 1, dy: 0 },  // Right
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }, // Left
            { dx: 0, dy: -1 }  // Up
        ];
        
        // Choose direction based on mode
        let targetX, targetY;
        
        if (ghost.scared) {
            // Run away from Pac-Man
            targetX = pacman.x - (pacman.x - ghost.x) * 2;
            targetY = pacman.y - (pacman.y - ghost.y) * 2;
        } else {
            // Chase Pac-Man (different strategies for each ghost)
            switch (index) {
                case 0: // Blinky - direct chase
                    targetX = pacman.x;
                    targetY = pacman.y;
                    break;
                case 1: // Pinky - ahead of Pac-Man
                    const dir = directions[pacman.direction];
                    targetX = pacman.x + dir.dx * 4;
                    targetY = pacman.y + dir.dy * 4;
                    break;
                case 2: // Inky - complex
                    targetX = pacman.x + (pacman.x - ghost.x);
                    targetY = pacman.y + (pacman.y - ghost.y);
                    break;
                case 3: // Clyde - scatter when close
                    const dist = Math.sqrt((ghost.x - pacman.x) ** 2 + (ghost.y - pacman.y) ** 2);
                    if (dist < 8) {
                        targetX = 0;
                        targetY = ROWS - 1;
                    } else {
                        targetX = pacman.x;
                        targetY = pacman.y;
                    }
                    break;
            }
        }
        
        // Find best direction
        let bestDir = ghost.direction;
        let bestDist = Infinity;
        
        directions.forEach((dir, i) => {
            // Don't reverse direction
            if (i === (ghost.direction + 2) % 4) return;
            
            const newX = Math.floor(ghost.x + dir.dx);
            const newY = Math.floor(ghost.y + dir.dy);
            
            if (canMove(newX, newY)) {
                const dist = Math.sqrt((newX - targetX) ** 2 + (newY - targetY) ** 2);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestDir = i;
                }
            }
        });
        
        ghost.direction = bestDir;
        
        // Move
        const dir = directions[ghost.direction];
        const newX = ghost.x + dir.dx * (ghost.scared ? 0.08 : 0.1);
        const newY = ghost.y + dir.dy * (ghost.scared ? 0.08 : 0.1);
        
        // Tunnel wrap
        if (Math.floor(ghost.y) === 9) {
            if (newX < -0.5) {
                ghost.x = COLS - 0.5;
                return;
            } else if (newX >= COLS - 0.5) {
                ghost.x = -0.5;
                return;
            }
        }
        
        if (canMove(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        } else {
            ghost.x = Math.round(ghost.x);
            ghost.y = Math.round(ghost.y);
        }
        
        // Check collision with Pac-Man
        const dist = Math.sqrt((ghost.x - pacman.x) ** 2 + (ghost.y - pacman.y) ** 2);
        if (dist < 0.5) {
            if (ghost.scared) {
                // Eat ghost
                score += 200 * (ghosts.filter(g => g.scared).length);
                ghost.x = ghost.homeX;
                ghost.y = ghost.homeY;
                ghost.scared = false;
                updateStats();
            } else {
                // Pac-Man dies
                loseLife();
            }
        }
    });
}

// Game logic
function updatePowerPellet() {
    if (powerPelletActive) {
        powerPelletTimer--;
        if (powerPelletTimer <= 0) {
            powerPelletActive = false;
            ghosts.forEach(ghost => {
                ghost.scared = false;
            });
        }
    }
}

function loseLife() {
    lives--;
    updateStats();
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Reset positions
        pacman.x = 14;
        pacman.y = 18;
        pacman.direction = 0;
        pacman.nextDirection = 0;
        
        ghosts.forEach(ghost => {
            ghost.x = ghost.homeX;
            ghost.y = ghost.homeY;
            ghost.direction = 0;
            ghost.scared = false;
        });
        
        powerPelletActive = false;
        powerPelletTimer = 0;
    }
}

function levelComplete() {
    gameState = 'levelComplete';
    const bonus = (lives * 1000) + (Math.floor(powerPelletTimer / 60) * 100);
    score += bonus;
    document.getElementById('bonusScore').textContent = bonus;
    document.getElementById('levelCompleteScreen').classList.remove('hidden');
    clearInterval(gameLoop);
}

function nextLevel() {
    level++;
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    initMaze();
    gameState = 'playing';
    pacman.speed = Math.min(0.15 + level * 0.01, 0.25);
    startGame();
}

function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    clearInterval(gameLoop);
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// Input handling
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (gameState === 'playing') {
        if (e.key === 'ArrowRight' || e.key === 'd') {
            pacman.nextDirection = 0;
        } else if (e.key === 'ArrowDown' || e.key === 's') {
            pacman.nextDirection = 1;
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            pacman.nextDirection = 2;
        } else if (e.key === 'ArrowUp' || e.key === 'w') {
            pacman.nextDirection = 3;
        } else if (e.key === ' ') {
            // Pause (implement if needed)
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Game loop
function gameLoopFunc() {
    if (gameState === 'playing') {
        updatePacman();
        updateGhosts();
        updatePowerPellet();
        
        drawMaze();
        drawPacman();
        drawGhosts();
    }
}

function startGame() {
    gameState = 'playing';
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    
    initMaze();
    updateStats();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameLoopFunc, 1000 / 60);
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    pacman.speed = 0.15;
    startGame();
}

// Initialize when DOM is ready
function init() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 600;
    
    // Event listeners
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    
    if (startBtn) startBtn.addEventListener('click', startGame);
    if (restartBtn) restartBtn.addEventListener('click', resetGame);
    if (nextLevelBtn) nextLevelBtn.addEventListener('click', nextLevel);
    
    // Initial draw
    drawMaze();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

