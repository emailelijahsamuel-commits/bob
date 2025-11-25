// Solitaire (Klondike)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [];
let tableau = [[], [], [], [], [], [], []];
let foundation = [[], [], [], []];
let waste = [];
let stock = [];
let selectedCard = null;
let score = 0;

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank, value: getValue(rank), faceUp: false });
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
    if (rank === 'A') return 1;
    if (['J', 'Q', 'K'].includes(rank)) return 11 + ['J', 'Q', 'K'].indexOf(rank);
    return parseInt(rank);
}

function deal() {
    createDeck();
    tableau = [[], [], [], [], [], [], []];
    foundation = [[], [], [], []];
    waste = [];
    stock = [];
    
    // Deal to tableau
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            if (j === i) card.faceUp = true;
            tableau[i].push(card);
        }
    }
    
    stock = deck;
    score = 0;
    document.getElementById('score').textContent = score;
}

function drawCard(card, x, y, faceUp) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, 60, 90);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x, y, 60, 90);
    
    if (faceUp) {
        ctx.fillStyle = ['♥', '♦'].includes(card.suit) ? '#ff0000' : '#000';
        ctx.font = '16px Arial';
        ctx.fillText(card.rank, x + 5, y + 20);
        ctx.font = '24px Arial';
        ctx.fillText(card.suit, x + 20, y + 50);
    } else {
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(x + 5, y + 5, 50, 80);
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Stock pile
    if (x > 50 && x < 110 && y > 50 && y < 140) {
        if (stock.length > 0) {
            const card = stock.pop();
            card.faceUp = true;
            waste.push(card);
        } else {
            stock = waste.reverse();
            waste = [];
            stock.forEach(c => c.faceUp = false);
        }
    }
    
    // Waste pile
    if (waste.length > 0 && x > 130 && x < 190 && y > 50 && y < 140) {
        selectedCard = waste[waste.length - 1];
    }
    
    // Foundation
    for (let i = 0; i < 4; i++) {
        if (x > 400 + i * 80 && x < 460 + i * 80 && y > 50 && y < 140) {
            if (selectedCard && foundation[i].length === 0 && selectedCard.value === 1) {
                foundation[i].push(selectedCard);
                waste.pop();
                selectedCard = null;
                score += 10;
                document.getElementById('score').textContent = score;
            } else if (selectedCard && foundation[i].length > 0) {
                const top = foundation[i][foundation[i].length - 1];
                if (selectedCard.suit === top.suit && selectedCard.value === top.value + 1) {
                    foundation[i].push(selectedCard);
                    waste.pop();
                    selectedCard = null;
                    score += 10;
                    document.getElementById('score').textContent = score;
                }
            }
        }
    }
    
    // Tableau
    for (let i = 0; i < 7; i++) {
        const colX = 50 + i * 100;
        if (x > colX && x < colX + 60) {
            if (tableau[i].length > 0) {
                const card = tableau[i][tableau[i].length - 1];
                if (card.faceUp && y > 200) {
                    if (selectedCard) {
                        if (canPlaceOnTableau(selectedCard, card)) {
                            tableau[i].push(selectedCard);
                            waste.pop();
                            selectedCard = null;
                            score += 5;
                            document.getElementById('score').textContent = score;
                        }
                    } else {
                        selectedCard = tableau[i].pop();
                    }
                }
            } else if (selectedCard && selectedCard.value === 13) {
                tableau[i].push(selectedCard);
                waste.pop();
                selectedCard = null;
                score += 5;
                document.getElementById('score').textContent = score;
            }
        }
    }
});

function canPlaceOnTableau(card, target) {
    const redSuits = ['♥', '♦'];
    const isRed = redSuits.includes(card.suit);
    const targetIsRed = redSuits.includes(target.suit);
    return isRed !== targetIsRed && card.value === target.value - 1;
}

function render() {
    ctx.fillStyle = '#0d5f0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Stock
    if (stock.length > 0) {
        drawCard(stock[stock.length - 1], 50, 50, false);
    }
    
    // Waste
    if (waste.length > 0) {
        drawCard(waste[waste.length - 1], 130, 50, true);
    }
    
    // Foundation
    for (let i = 0; i < 4; i++) {
        if (foundation[i].length > 0) {
            drawCard(foundation[i][foundation[i].length - 1], 400 + i * 80, 50, true);
        } else {
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(400 + i * 80, 50, 60, 90);
        }
    }
    
    // Tableau
    for (let i = 0; i < 7; i++) {
        tableau[i].forEach((card, index) => {
            drawCard(card, 50 + i * 100, 200 + index * 30, card.faceUp);
        });
    }
    
    // Selected card
    if (selectedCard) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(130, 50, 60, 90);
    }
}

function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}

deal();
gameLoop();
