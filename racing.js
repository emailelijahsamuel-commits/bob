const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Track
const track = {
    innerRadius: 150,
    outerRadius: 250,
    centerX: canvas.width / 2,
    centerY: canvas.height / 2
};

// Cars
const car1 = {
    angle: 0,
    speed: 0,
    maxSpeed: 3,
    acceleration: 0.1,
    friction: 0.05,
    radius: track.innerRadius + (track.outerRadius - track.innerRadius) / 3,
    color: '#ff0000',
    lap: 0,
    lastCheckpoint: 0
};

const car2 = {
    angle: Math.PI,
    speed: 0,
    maxSpeed: 3,
    acceleration: 0.1,
    friction: 0.05,
    radius: track.innerRadius + (track.outerRadius - track.innerRadius) * 2 / 3,
    color: '#0066ff',
    lap: 0,
    lastCheckpoint: 0
};

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Update car
function updateCar(car, turnLeft, turnRight, accelerate) {
    if (accelerate) {
        car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
    } else {
        car.speed = Math.max(car.speed - car.friction, 0);
    }
    
    if (turnLeft) {
        car.angle -= 0.05;
    }
    if (turnRight) {
        car.angle += 0.05;
    }
    
    car.radius += car.speed * 0.1;
    
    // Keep car on track
    if (car.radius < track.innerRadius + 10) {
        car.radius = track.innerRadius + 10;
        car.speed *= 0.5;
    }
    if (car.radius > track.outerRadius - 10) {
        car.radius = track.outerRadius - 10;
        car.speed *= 0.5;
    }
    
    // Check lap
    const checkpoint = Math.floor(car.angle / (Math.PI * 2) * 4);
    if (checkpoint !== car.lastCheckpoint) {
        if (checkpoint === 0 && car.lastCheckpoint === 3) {
            car.lap++;
            if (car.lap >= 3) {
                const winner = car === car1 ? 'Player 1' : 'Player 2';
                alert(`${winner} Wins!`);
                resetGame();
            }
        }
        car.lastCheckpoint = checkpoint;
    }
}

// Update
function update() {
    updateCar(car1, keys['a'], keys['d'], keys['w']);
    updateCar(car2, keys['arrowleft'], keys['arrowright'], keys['arrowup']);
}

// Draw track
function drawTrack() {
    // Outer circle
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(track.centerX, track.centerY, track.outerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(track.centerX, track.centerY, track.innerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Start line
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(
        track.centerX + Math.cos(0) * track.innerRadius,
        track.centerY + Math.sin(0) * track.innerRadius
    );
    ctx.lineTo(
        track.centerX + Math.cos(0) * track.outerRadius,
        track.centerY + Math.sin(0) * track.outerRadius
    );
    ctx.stroke();
}

// Draw car
function drawCar(car) {
    const x = track.centerX + Math.cos(car.angle) * car.radius;
    const y = track.centerY + Math.sin(car.angle) * car.radius;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(car.angle + Math.PI / 2);
    
    ctx.fillStyle = car.color;
    ctx.fillRect(-15, -25, 30, 50);
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(-10, -20, 20, 15);
    
    ctx.restore();
    
    // Lap counter
    ctx.fillStyle = car.color;
    ctx.font = '20px Arial';
    ctx.fillText(`Lap: ${car.lap}/3`, car === car1 ? 20 : canvas.width - 120, 30);
}

// Draw
function draw() {
    // Clear
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawTrack();
    drawCar(car1);
    drawCar(car2);
}

// Reset
function resetGame() {
    car1.angle = 0;
    car1.speed = 0;
    car1.radius = track.innerRadius + (track.outerRadius - track.innerRadius) / 3;
    car1.lap = 0;
    car1.lastCheckpoint = 0;
    
    car2.angle = Math.PI;
    car2.speed = 0;
    car2.radius = track.innerRadius + (track.outerRadius - track.innerRadius) * 2 / 3;
    car2.lap = 0;
    car2.lastCheckpoint = 0;
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();


