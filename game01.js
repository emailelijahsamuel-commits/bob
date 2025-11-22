const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const grid = 4;
const cardSize = 140;
let cards = [];
let flipped = [];
let score = 0;

function init() {
    const symbols = ['🎮','🎯','🎲','🎨','🎪','🎭','🎬','🎤','🎧','🎵','🎶','🎸','🎹','🎺','🎻','🥁'];
    const pairs = [...symbols.slice(0,8), ...symbols.slice(0,8)].sort(() => Math.random() - 0.5);
    cards = [];
    for (let i = 0; i < grid; i++) {
        cards[i] = [];
        for (let j = 0; j < grid; j++) {
            cards[i][j] = { symbol: pairs[i * grid + j], flipped: false, matched: false };
        }
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < grid; i++) {
        for (let j = 0; j < grid; j++) {
            const x = j * cardSize + 10;
            const y = i * cardSize + 10;
            ctx.fillStyle = cards[i][j].flipped || cards[i][j].matched ? '#fff' : '#333';
            ctx.fillRect(x, y, cardSize - 20, cardSize - 20);
            if (cards[i][j].flipped || cards[i][j].matched) {
                ctx.font = '60px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(cards[i][j].symbol, x + cardSize/2 - 10, y + cardSize/2 + 20);
            }
        }
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cardSize);
    const y = Math.floor((e.clientY - rect.top) / cardSize);
    if (x >= 0 && x < grid && y >= 0 && y < grid && !cards[y][x].flipped && !cards[y][x].matched && flipped.length < 2) {
        cards[y][x].flipped = true;
        flipped.push({x, y});
        if (flipped.length === 2) {
            if (cards[flipped[0].y][flipped[0].x].symbol === cards[flipped[1].y][flipped[1].x].symbol) {
                cards[flipped[0].y][flipped[0].x].matched = true;
                cards[flipped[1].y][flipped[1].x].matched = true;
                score += 10;
                document.getElementById('score').textContent = score;
            }
            setTimeout(() => {
                cards[flipped[0].y][flipped[0].x].flipped = false;
                cards[flipped[1].y][flipped[1].x].flipped = false;
                flipped = [];
                draw();
            }, 1000);
        }
        draw();
    }
});

init();
draw();

