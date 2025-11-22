const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let gameState = 'playing';

function update() {
    if (gameState !== 'playing') return;
    // Game logic here
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pirate Game', canvas.width/2, canvas.height/2);
    ctx.fillText('Click to play!', canvas.width/2, canvas.height/2 + 40);
}

canvas.addEventListener('click', () => {
    score++;
    document.getElementById('score').textContent = score;
    draw();
});

draw();
update();
