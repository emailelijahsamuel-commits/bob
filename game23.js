// Poker Game (5 Card Draw)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let hand = [];
let deck = [];
let score = 0;
let gameState = 'deal'; // deal, playing, gameover
let held = [false, false, false, false, false];
let money = 1000;
let bet = 0;

const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dealHand() {
    createDeck();
    hand = [];
    for (let i = 0; i < 5; i++) {
        hand.push(deck.pop());
    }
    held = [false, false, false, false, false];
    gameState = 'playing';
}

function getHandRank() {
    const values = hand.map(c => {
        if (c.rank === 'A') return 14;
        if (c.rank === 'K') return 13;
        if (c.rank === 'Q') return 12;
        if (c.rank === 'J') return 11;
        return parseInt(c.rank);
    }).sort((a, b) => a - b);
    
    const suits = hand.map(c => c.suit);
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = values[4] - values[0] === 4 && new Set(values).size === 5;
    
    const counts = {};
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);
    const countsArr = Object.values(counts).sort((a, b) => b - a);
    
    if (isStraight && isFlush) return { name: 'Royal Flush', value: 250 };
    if (isStraight && isFlush) return { name: 'Straight Flush', value: 50 };
    if (countsArr[0] === 4) return { name: 'Four of a Kind', value: 25 };
    if (countsArr[0] === 3 && countsArr[1] === 2) return { name: 'Full House', value: 9 };
    if (isFlush) return { name: 'Flush', value: 6 };
    if (isStraight) return { name: 'Straight', value: 4 };
    if (countsArr[0] === 3) return { name: 'Three of a Kind', value: 3 };
    if (countsArr[0] === 2 && countsArr[1] === 2) return { name: 'Two Pair', value: 2 };
    if (countsArr[0] === 2) return { name: 'Pair', value: 1 };
    return { name: 'High Card', value: 0 };
}

function draw() {
    hand.forEach((card, i) => {
        if (!held[i]) {
            hand[i] = deck.pop();
        }
    });
    
    const rank = getHandRank();
    money += bet * rank.value;
    score = money;
    document.getElementById('score').textContent = score;
    gameState = 'gameover';
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (gameState === 'deal') {
        if (x > 300 && x < 500 && y > 500 && y < 550) {
            bet = 10;
            money -= bet;
            dealHand();
        }
    } else if (gameState === 'playing') {
        // Toggle hold
        for (let i = 0; i < 5; i++) {
            if (x > 100 + i * 120 && x < 160 + i * 120 && y > 400 && y < 450) {
                held[i] = !held[i];
            }
        }
        // Draw button
        if (x > 300 && x < 500 && y > 500 && y < 550) {
            draw();
        }
    } else if (gameState === 'gameover') {
        if (x > 300 && x < 500 && y > 500 && y < 550) {
            gameState = 'deal';
            bet = 0;
        }
    }
});

function drawCard(card, x, y, held) {
    ctx.fillStyle = held ? '#ffff00' : '#fff';
    ctx.fillRect(x, y, 60, 90);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x, y, 60, 90);
    
    ctx.fillStyle = ['♥', '♦'].includes(card.suit) ? '#ff0000' : '#000';
    ctx.font = '20px Arial';
    ctx.fillText(card.rank, x + 5, y + 25);
    ctx.font = '30px Arial';
    ctx.fillText(card.suit, x + 15, y + 60);
}

function render() {
    ctx.fillStyle = '#0d5f0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Money: $${money}`, 20, 30);
    
    if (gameState === 'deal') {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(300, 500, 200, 50);
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText('Deal ($10)', 350, 530);
    } else if (gameState === 'playing') {
        hand.forEach((card, i) => {
            drawCard(card, 100 + i * 120, 250, held[i]);
            ctx.fillStyle = held[i] ? '#00ff00' : '#ff0000';
            ctx.fillRect(100 + i * 120, 400, 60, 40);
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.fillText(held[i] ? 'HELD' : 'HOLD', 110 + i * 120, 425);
        });
        
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(300, 500, 200, 50);
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText('Draw', 370, 530);
    } else if (gameState === 'gameover') {
        hand.forEach((card, i) => {
            drawCard(card, 100 + i * 120, 250, false);
        });
        
        const rank = getHandRank();
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.fillText(rank.name, 300, 200);
        ctx.fillText(`Win: $${bet * rank.value}`, 300, 240);
        
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(300, 500, 200, 50);
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText('New Game', 350, 530);
    }
}

function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}

score = money;
document.getElementById('score').textContent = score;
gameLoop();
