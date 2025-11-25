// Blackjack Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let playerHand = [];
let dealerHand = [];
let deck = [];
let score = 0;
let gameState = 'betting'; // betting, playing, dealer, gameover
let bet = 0;
let money = 1000;

const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank, value: getValue(rank) });
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

function getValue(rank) {
    if (rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
}

function getHandValue(hand) {
    let value = 0;
    let aces = 0;
    for (let card of hand) {
        if (card.rank === 'A') aces++;
        value += card.value;
    }
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    return value;
}

function dealCard(hand) {
    if (deck.length === 0) createDeck();
    hand.push(deck.pop());
}

function startGame() {
    createDeck();
    playerHand = [];
    dealerHand = [];
    dealCard(playerHand);
    dealCard(playerHand);
    dealCard(dealerHand);
    gameState = 'playing';
}

function hit() {
    if (gameState !== 'playing') return;
    dealCard(playerHand);
    if (getHandValue(playerHand) > 21) {
        gameState = 'gameover';
        money -= bet;
        score = money;
        document.getElementById('score').textContent = score;
    }
}

function stand() {
    if (gameState !== 'playing') return;
    gameState = 'dealer';
    while (getHandValue(dealerHand) < 17) {
        dealCard(dealerHand);
    }
    
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand);
    
    if (dealerValue > 21 || playerValue > dealerValue) {
        money += bet * 2;
    } else if (playerValue < dealerValue) {
        money -= bet;
    }
    
    score = money;
    document.getElementById('score').textContent = score;
    gameState = 'gameover';
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (gameState === 'betting') {
        if (x > 200 && x < 300 && y > 500 && y < 550) {
            bet = 10;
            startGame();
        } else if (x > 350 && x < 450 && y > 500 && y < 550) {
            bet = 50;
            startGame();
        } else if (x > 500 && x < 600 && y > 500 && y < 550) {
            bet = 100;
            startGame();
        }
    } else if (gameState === 'playing') {
        if (x > 200 && x < 300 && y > 500 && y < 550) {
            hit();
        } else if (x > 350 && x < 450 && y > 500 && y < 550) {
            stand();
        }
    } else if (gameState === 'gameover') {
        if (x > 300 && x < 500 && y > 500 && y < 550) {
            gameState = 'betting';
            bet = 0;
        }
    }
});

function drawCard(card, x, y, faceUp = true) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, 60, 90);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x, y, 60, 90);
    
    if (faceUp) {
        ctx.fillStyle = ['♥', '♦'].includes(card.suit) ? '#ff0000' : '#000';
        ctx.font = '20px Arial';
        ctx.fillText(card.rank, x + 5, y + 25);
        ctx.font = '30px Arial';
        ctx.fillText(card.suit, x + 15, y + 60);
    } else {
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(x + 5, y + 5, 50, 80);
    }
}

function draw() {
    ctx.fillStyle = '#0d5f0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Money: $${money}`, 20, 30);
    if (bet > 0) ctx.fillText(`Bet: $${bet}`, 20, 60);
    
    if (gameState === 'betting') {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(200, 500, 100, 50);
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText('Bet $10', 220, 530);
        
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(350, 500, 100, 50);
        ctx.fillStyle = '#000';
        ctx.fillText('Bet $50', 370, 530);
        
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(500, 500, 100, 50);
        ctx.fillStyle = '#000';
        ctx.fillText('Bet $100', 520, 530);
    } else {
        // Draw dealer hand
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('Dealer:', 50, 100);
        dealerHand.forEach((card, i) => {
            drawCard(card, 50 + i * 70, 120, i > 0 || gameState !== 'playing');
        });
        if (gameState !== 'playing') {
            ctx.fillText(`Value: ${getHandValue(dealerHand)}`, 50, 230);
        }
        
        // Draw player hand
        ctx.fillText('Player:', 50, 350);
        playerHand.forEach((card, i) => {
            drawCard(card, 50 + i * 70, 370, true);
        });
        ctx.fillText(`Value: ${getHandValue(playerHand)}`, 50, 480);
        
        if (gameState === 'playing') {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(200, 500, 100, 50);
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.fillText('Hit', 230, 530);
            
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(350, 500, 100, 50);
            ctx.fillStyle = '#000';
            ctx.fillText('Stand', 370, 530);
        } else if (gameState === 'gameover') {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(300, 500, 200, 50);
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.fillText('New Game', 350, 530);
        }
    }
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

score = money;
document.getElementById('score').textContent = score;
gameLoop();
