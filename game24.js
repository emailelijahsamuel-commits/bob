// Roulette Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let wheelAngle = 0;
let spinning = false;
let selectedNumber = null;
let score = 0;
let money = 1000;
let bet = 0;
let betType = 'number'; // number, red, black, even, odd
let betValue = null;

const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function spin() {
    if (spinning || bet === 0) return;
    money -= bet;
    spinning = true;
    const spins = 5 + Math.random() * 3;
    const targetAngle = Math.random() * Math.PI * 2;
    let currentSpin = 0;
    
    function animate() {
        wheelAngle += 0.2;
        currentSpin += 0.2 / (Math.PI * 2);
        
        if (currentSpin < spins) {
            requestAnimationFrame(animate);
        } else {
            wheelAngle = targetAngle;
            const index = Math.floor((targetAngle / (Math.PI * 2)) * numbers.length);
            selectedNumber = numbers[index];
            checkWin();
            spinning = false;
        }
        render();
    }
    animate();
}

function checkWin() {
    let won = false;
    let multiplier = 1;
    
    if (betType === 'number' && selectedNumber === betValue) {
        won = true;
        multiplier = 35;
    } else if (betType === 'red' && redNumbers.includes(selectedNumber)) {
        won = true;
        multiplier = 2;
    } else if (betType === 'black' && !redNumbers.includes(selectedNumber) && selectedNumber !== 0) {
        won = true;
        multiplier = 2;
    } else if (betType === 'even' && selectedNumber % 2 === 0 && selectedNumber !== 0) {
        won = true;
        multiplier = 2;
    } else if (betType === 'odd' && selectedNumber % 2 === 1) {
        won = true;
        multiplier = 2;
    }
    
    if (won) {
        money += bet * multiplier;
    }
    
    score = money;
    document.getElementById('score').textContent = score;
    bet = 0;
    betValue = null;
}

canvas.addEventListener('click', (e) => {
    if (spinning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Bet buttons
    if (y > 450 && y < 500) {
        if (x > 50 && x < 150) {
            bet = 10;
            betType = 'red';
        } else if (x > 170 && x < 270) {
            bet = 10;
            betType = 'black';
        } else if (x > 290 && x < 390) {
            bet = 10;
            betType = 'even';
        } else if (x > 410 && x < 510) {
            bet = 10;
            betType = 'odd';
        }
    }
    
    // Number bets (click on wheel)
    const centerX = canvas.width / 2;
    const centerY = 250;
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 80 && dist < 150) {
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        if (angle < 0) angle += Math.PI * 2;
        const index = Math.floor((angle / (Math.PI * 2)) * numbers.length);
        betValue = numbers[index];
        bet = 10;
        betType = 'number';
    }
    
    // Spin button
    if (x > 300 && x < 500 && y > 520 && y < 570) {
        spin();
    }
});

function render() {
    ctx.fillStyle = '#0d5f0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Money: $${money}`, 20, 30);
    if (bet > 0) ctx.fillText(`Bet: $${bet}`, 20, 60);
    if (selectedNumber !== null) {
        ctx.fillText(`Landed on: ${selectedNumber}`, 20, 90);
    }
    
    // Draw wheel
    const centerX = canvas.width / 2;
    const centerY = 250;
    const radius = 150;
    
    const segmentAngle = (Math.PI * 2) / numbers.length;
    numbers.forEach((num, i) => {
        const angle = segmentAngle * i - Math.PI / 2 + wheelAngle;
        ctx.fillStyle = redNumbers.includes(num) ? '#ff0000' : (num === 0 ? '#00ff00' : '#000');
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + segmentAngle);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        const textX = centerX + Math.cos(angle + segmentAngle / 2) * (radius * 0.7);
        const textY = centerY + Math.sin(angle + segmentAngle / 2) * (radius * 0.7) + 5;
        ctx.fillText(num, textX, textY);
    });
    
    // Bet buttons
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(50, 450, 100, 50);
    ctx.fillStyle = '#000';
    ctx.fillRect(170, 450, 100, 50);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(290, 450, 100, 50);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(410, 450, 100, 50);
    
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText('Red', 100, 480);
    ctx.fillText('Black', 220, 480);
    ctx.fillText('Even', 340, 480);
    ctx.fillText('Odd', 460, 480);
    
    // Spin button
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(300, 520, 200, 50);
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(spinning ? 'Spinning...' : 'SPIN', 400, 555);
}

function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}

score = money;
document.getElementById('score').textContent = score;
gameLoop();
