// Slot Machine Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let reels = [0, 0, 0];
let spinning = [false, false, false];
let symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣'];
let score = 0;
let money = 1000;
let bet = 0;

function spin() {
    if (spinning.some(s => s) || bet === 0) return;
    money -= bet;
    score = money;
    document.getElementById('score').textContent = score;
    
    for (let i = 0; i < 3; i++) {
        spinning[i] = true;
        const spins = 20 + Math.random() * 10;
        let count = 0;
        
        function animateReel() {
            reels[i] = (reels[i] + 1) % symbols.length;
            count++;
            if (count < spins) {
                setTimeout(animateReel, 50);
            } else {
                spinning[i] = false;
                if (!spinning.some(s => s)) {
                    checkWin();
                }
            }
        }
        animateReel();
    }
}

function checkWin() {
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
        let win = 0;
        if (reels[0] === 7) { // 7️⃣
            win = bet * 100;
        } else if (reels[0] === 6) { // 💎
            win = bet * 50;
        } else if (reels[0] === 5) { // ⭐
            win = bet * 25;
        } else {
            win = bet * 10;
        }
        money += win;
        score = money;
        document.getElementById('score').textContent = score;
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        money += bet * 2;
        score = money;
        document.getElementById('score').textContent = score;
    }
    bet = 0;
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Bet buttons
    if (y > 450 && y < 500) {
        if (x > 100 && x < 200) {
            bet = 10;
        } else if (x > 250 && x < 350) {
            bet = 25;
        } else if (x > 400 && x < 500) {
            bet = 50;
        } else if (x > 550 && x < 650) {
            bet = 100;
        }
    }
    
    // Spin button
    if (x > 300 && x < 500 && y > 520 && y < 570 && !spinning.some(s => s)) {
        spin();
    }
});

function render() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Machine frame
    ctx.fillStyle = '#654321';
    ctx.fillRect(50, 50, 700, 350);
    
    // Reels
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#000';
        ctx.fillRect(150 + i * 200, 100, 150, 250);
        
        // Draw symbols
        for (let j = -1; j <= 1; j++) {
            const symbolIndex = (reels[i] + j + symbols.length) % symbols.length;
            ctx.fillStyle = '#fff';
            ctx.font = '60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(symbols[symbolIndex], 225 + i * 200, 150 + (j + 1) * 80);
        }
        
        // Highlight center
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(150 + i * 200, 190, 150, 80);
    }
    
    // Bet buttons
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(100, 450, 100, 50);
    ctx.fillRect(250, 450, 100, 50);
    ctx.fillRect(400, 450, 100, 50);
    ctx.fillRect(550, 450, 100, 50);
    
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('$10', 150, 480);
    ctx.fillText('$25', 300, 480);
    ctx.fillText('$50', 450, 480);
    ctx.fillText('$100', 600, 480);
    
    // Spin button
    ctx.fillStyle = spinning.some(s => s) ? '#666' : '#ff0000';
    ctx.fillRect(300, 520, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.fillText(spinning.some(s => s) ? 'SPINNING...' : 'SPIN', 400, 555);
    
    // Money display
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Money: $${money}`, 20, 30);
    if (bet > 0) ctx.fillText(`Bet: $${bet}`, 20, 60);
}

function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}

score = money;
document.getElementById('score').textContent = score;
gameLoop();
