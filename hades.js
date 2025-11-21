// Hades Clone
let canvas, ctx;
let gameState = 'start';

// Player
let player = {
    x: 400,
    y: 300,
    width: 30,
    height: 30,
    speed: 5,
    hp: 100,
    maxHp: 100,
    dashCooldown: 0,
    castCooldown: 0,
    weapon: null,
    boons: [],
    darkness: 0,
    heat: 0
};

// Game state
let currentRoom = 1;
let enemies = [];
let projectiles = [];
let particles = [];
let roomComplete = false;
let enemiesDefeated = 0;

// Weapons
const WEAPONS = {
    STYGIAN_BLADE: {
        name: 'Stygian Blade',
        attackDamage: 20,
        attackSpeed: 0.3,
        specialDamage: 50,
        specialCooldown: 2,
        description: 'Balanced sword with quick attacks'
    },
    SHIELD: {
        name: 'Shield of Chaos',
        attackDamage: 15,
        attackSpeed: 0.4,
        specialDamage: 40,
        specialCooldown: 1.5,
        description: 'Defensive weapon with throw attack'
    },
    SPEAR: {
        name: 'Eternal Spear',
        attackDamage: 25,
        attackSpeed: 0.5,
        specialDamage: 60,
        specialCooldown: 2.5,
        description: 'Long range, high damage'
    },
    BOW: {
        name: 'Heart-Seeking Bow',
        attackDamage: 18,
        attackSpeed: 0.4,
        specialDamage: 45,
        specialCooldown: 2,
        description: 'Ranged attacks with charge'
    }
};

// Boons
const BOONS = {
    ZEUS: [
        { name: 'Lightning Strike', description: 'Attacks deal +10 lightning damage', effect: 'lightning' },
        { name: 'Thunder Dash', description: 'Dash creates lightning', effect: 'thunderDash' },
        { name: 'Divine Vengeance', description: 'When hit, strike nearby enemies', effect: 'vengeance' }
    ],
    POSEIDON: [
        { name: 'Tempest Strike', description: 'Attacks knockback and deal +15 damage', effect: 'knockback' },
        { name: 'Tidal Dash', description: 'Dash damages and knocks back enemies', effect: 'tidalDash' },
        { name: 'Razor Shoals', description: 'Knocked back enemies take damage over time', effect: 'razorShoals' }
    ],
    ATHENA: [
        { name: 'Divine Strike', description: 'Attacks deflect projectiles', effect: 'deflect' },
        { name: 'Divine Dash', description: 'Dash deflects attacks', effect: 'divineDash' },
        { name: 'Deathless Stand', description: 'Survive fatal damage once per room', effect: 'deathless' }
    ],
    ARES: [
        { name: 'Curse of Agony', description: 'Attacks apply Doom (explodes after 2s)', effect: 'doom' },
        { name: 'Blade Dash', description: 'Dash creates spinning blades', effect: 'bladeDash' },
        { name: 'Dire Misfortune', description: 'Doom deals +50% damage', effect: 'direMisfortune' }
    ],
    ARTEMIS: [
        { name: 'Deadly Strike', description: '+20% crit chance', effect: 'crit' },
        { name: 'Hunter Dash', description: 'Dash has +50% crit chance', effect: 'hunterDash' },
        { name: 'Support Fire', description: 'Attacks fire additional arrows', effect: 'supportFire' }
    ],
    APHRODITE: [
        { name: 'Heartbreak Strike', description: 'Attacks deal +30% damage and Weak', effect: 'weak' },
        { name: 'Passion Dash', description: 'Dash charms nearby enemies', effect: 'charm' },
        { name: 'Different League', description: 'Take -20% damage', effect: 'damageReduction' }
    ]
};

// Enemies
const ENEMY_TYPES = {
    SKELETON: {
        name: 'Skeleton',
        hp: 30,
        speed: 2,
        damage: 10,
        color: '#8B7355',
        size: 20,
        points: 5
    },
    WRAITH: {
        name: 'Wraith',
        hp: 20,
        speed: 3,
        damage: 8,
        color: '#4A4A4A',
        size: 18,
        points: 3
    },
    GORGON: {
        name: 'Gorgon',
        hp: 50,
        speed: 1.5,
        damage: 15,
        color: '#9370DB',
        size: 25,
        points: 10,
        shoots: true
    },
    MINOTAUR: {
        name: 'Minotaur',
        hp: 150,
        speed: 1,
        damage: 25,
        color: '#8B4513',
        size: 40,
        points: 25
    }
};

// Input
let keys = {};
let mouse = { x: 0, y: 0, left: false, right: false };
let casting = false;
let castTarget = { x: 0, y: 0 };

// Initialize
function init() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    // Event listeners
    document.getElementById('startBtn')?.addEventListener('click', startGame);
    document.getElementById('restartBtn')?.addEventListener('click', startGame);
    document.getElementById('newRunBtn')?.addEventListener('click', startGame);
    document.getElementById('skipBoonBtn')?.addEventListener('click', skipBoon);
    document.getElementById('leaveShopBtn')?.addEventListener('click', leaveShop);
    
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) mouse.left = true;
        if (e.button === 2) mouse.right = true;
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) mouse.left = false;
        if (e.button === 2) mouse.right = false;
    });
    
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    showScreen('startScreen');
}

// Game flow
function startGame() {
    gameState = 'weaponSelect';
    player = {
        x: 400,
        y: 300,
        width: 30,
        height: 30,
        speed: 5,
        hp: 100,
        maxHp: 100,
        dashCooldown: 0,
        castCooldown: 0,
        weapon: null,
        boons: [],
        darkness: 0,
        heat: 0,
        lastAttack: 0,
        lastSpecial: 0
    };
    
    currentRoom = 1;
    enemies = [];
    projectiles = [];
    particles = [];
    roomComplete = false;
    enemiesDefeated = 0;
    
    showWeaponSelection();
}

function showWeaponSelection() {
    showScreen('weaponScreen');
    const grid = document.getElementById('weaponOptions');
    if (!grid) {
        console.error('weaponOptions element not found!');
        return;
    }
    grid.innerHTML = '';
    
    Object.entries(WEAPONS).forEach(([key, weapon]) => {
        const weaponEl = document.createElement('div');
        weaponEl.className = 'weapon-card';
        weaponEl.innerHTML = `
            <h3>${weapon.name}</h3>
            <p>${weapon.description}</p>
            <p>Damage: ${weapon.attackDamage}</p>
            <p>Special: ${weapon.specialDamage}</p>
        `;
        weaponEl.addEventListener('click', () => selectWeapon(key));
        grid.appendChild(weaponEl);
    });
}

function selectWeapon(weaponKey) {
    player.weapon = {...WEAPONS[weaponKey]};
    player.lastAttack = 0;
    player.lastSpecial = 0;
    startRoom();
}

function startRoom() {
    gameState = 'playing';
    roomComplete = false;
    
    // Hide all screens, show canvas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    canvas.style.display = 'block';
    
    // Spawn enemies
    const enemyCount = 3 + Math.floor(currentRoom / 3);
    enemies = [];
    
    for (let i = 0; i < enemyCount; i++) {
        spawnEnemy();
    }
    
    // Reset player position
    player.x = 400;
    player.y = 300;
    
    updateStats();
    
    // Start game loop if not already running
    if (!window.gameLoopRunning) {
        window.gameLoopRunning = true;
        gameLoop();
    }
}

function spawnEnemy() {
    const types = Object.keys(ENEMY_TYPES);
    let typeKey = types[Math.floor(Math.random() * types.length)];
    
    // Boss on room 10
    if (currentRoom === 10) {
        typeKey = 'MINOTAUR';
    }
    
    const type = ENEMY_TYPES[typeKey];
    const angle = Math.random() * Math.PI * 2;
    const distance = 300 + Math.random() * 100;
    
    enemies.push({
        ...type,
        x: player.x + Math.cos(angle) * distance,
        y: player.y + Math.sin(angle) * distance,
        angle: 0,
        hp: type.hp,
        maxHp: type.hp,
        lastShot: 0,
        doom: null
    });
}

// Game loop
function gameLoop() {
    if (gameState === 'playing') {
        update();
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update cooldowns
    if (player.dashCooldown > 0) player.dashCooldown -= 1/60;
    if (player.castCooldown > 0) player.castCooldown -= 1/60;
    if (player.lastAttack > 0) player.lastAttack -= 1/60;
    if (player.lastSpecial > 0) player.lastSpecial -= 1/60;
    
    // Player movement
    let dx = 0, dy = 0;
    if (keys['w']) dy -= player.speed;
    if (keys['s']) dy += player.speed;
    if (keys['a']) dx -= player.speed;
    if (keys['d']) dx += player.speed;
    
    // Dash
    if (keys[' '] && player.dashCooldown <= 0) {
        const dashSpeed = 15;
        player.x += dx * dashSpeed;
        player.y += dy * dashSpeed;
        player.dashCooldown = 1;
        
        // Dash boons
        player.boons.forEach(boon => {
            if (boon.effect === 'thunderDash') {
                createLightning(player.x, player.y);
            }
            if (boon.effect === 'tidalDash') {
                enemies.forEach(enemy => {
                    const dist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
                    if (dist < 50) {
                        knockback(enemy, 100);
                        dealDamage(enemy, 15);
                    }
                });
            }
            if (boon.effect === 'bladeDash') {
                createBlade(player.x, player.y);
            }
        });
        
        createParticles(player.x, player.y, '#00FFFF', 10);
    } else {
        // Normal movement
        player.x += dx;
        player.y += dy;
    }
    
    // Keep player in bounds
    player.x = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.x));
    player.y = Math.max(player.height/2, Math.min(canvas.height - player.height/2, player.y));
    
    // Attack
    if (mouse.left && player.lastAttack <= 0 && player.weapon) {
        attack();
    }
    
    // Special
    if (mouse.right && player.lastSpecial <= 0 && player.weapon) {
        special();
    }
    
    // Cast targeting
    if (keys['q'] && player.castCooldown <= 0) {
        if (!casting) {
            casting = true;
        }
        // Update cast target to mouse position
        castTarget.x = mouse.x;
        castTarget.y = mouse.y;
    } else if (casting && !keys['q']) {
        // Release Q to cast
        cast(castTarget.x, castTarget.y);
        casting = false;
    } else if (!keys['q']) {
        casting = false;
    }
    
    // Update enemies
    enemies.forEach((enemy, index) => {
        // Move towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
            enemy.angle = Math.atan2(dy, dx);
        }
        
        // Shoot if ranged
        if (enemy.shoots && dist < 400 && Date.now() - enemy.lastShot > 2000) {
            shootProjectile(enemy.x, enemy.y, enemy.angle, false);
            enemy.lastShot = Date.now();
        }
        
        // Check collision with player
        if (dist < (player.width/2 + enemy.size/2)) {
            dealPlayerDamage(enemy.damage);
            knockback(player, 50, Math.atan2(dy, dx) + Math.PI);
        }
        
        // Update doom
        if (enemy.doom) {
            enemy.doom.timer -= 1/60;
            if (enemy.doom.timer <= 0) {
                let damage = 30;
                if (player.boons.some(b => b.effect === 'direMisfortune')) {
                    damage = 45;
                }
                dealDamage(enemy, damage);
                createExplosion(enemy.x, enemy.y);
                enemy.doom = null;
            }
        }
    });
    
    // Update projectiles
    projectiles.forEach((proj, index) => {
        proj.x += Math.cos(proj.angle) * proj.speed;
        proj.y += Math.sin(proj.angle) * proj.speed;
        
        // Check bounds
        if (proj.x < 0 || proj.x > canvas.width || proj.y < 0 || proj.y > canvas.height) {
            projectiles.splice(index, 1);
            return;
        }
        
        // Check collision
        if (proj.enemy) {
            // Enemy projectile
            const dist = Math.sqrt((proj.x - player.x) ** 2 + (proj.y - player.y) ** 2);
            if (dist < player.width/2 + 5) {
                dealPlayerDamage(10);
                projectiles.splice(index, 1);
            }
        } else {
            // Player projectile
            enemies.forEach((enemy, eIndex) => {
                const dist = Math.sqrt((proj.x - enemy.x) ** 2 + (proj.y - enemy.y) ** 2);
                if (dist < enemy.size/2 + 5) {
                    dealDamage(enemy, proj.damage);
                    projectiles.splice(index, 1);
                }
            });
        }
    });
    
    // Update particles
    particles.forEach((part, index) => {
        part.x += part.vx;
        part.y += part.vy;
        part.life -= 1/60;
        if (part.life <= 0) {
            particles.splice(index, 1);
        }
    });
    
    // Check room complete
    if (enemies.length === 0 && !roomComplete) {
        roomComplete = true;
        setTimeout(() => {
            completeRoom();
        }, 1000);
    }
    
    // Check death
    if (player.hp <= 0) {
        gameOver();
    }
    
    // Check victory
    if (currentRoom > 10) {
        victory();
    }
}

function attack() {
    if (!player.weapon) return;
    
    player.lastAttack = player.weapon.attackSpeed;
    
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    let damage = player.weapon.attackDamage;
    
    // Apply boons
    player.boons.forEach(boon => {
        if (boon.effect === 'lightning') {
            damage += 10;
            createLightning(player.x, player.y);
        }
        if (boon.effect === 'knockback') {
            damage += 15;
            enemies.forEach(enemy => {
                const dist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
                if (dist < 60) {
                    knockback(enemy, 80);
                }
            });
        }
        if (boon.effect === 'doom') {
            enemies.forEach(enemy => {
                const dist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
                if (dist < 60) {
                    enemy.doom = { timer: 2 };
                }
            });
        }
        if (boon.effect === 'crit' && Math.random() < 0.2) {
            damage *= 2;
        }
        if (boon.effect === 'weak') {
            damage = Math.floor(damage * 1.3);
        }
        if (boon.effect === 'supportFire') {
            shootProjectile(player.x, player.y, angle + Math.PI/6, true);
            shootProjectile(player.x, player.y, angle - Math.PI/6, true);
        }
    });
    
    // Find closest enemy
    let closestEnemy = null;
    let closestDist = 60;
    enemies.forEach(enemy => {
        const dist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
        if (dist < closestDist) {
            closestDist = dist;
            closestEnemy = enemy;
        }
    });
    
    if (closestEnemy) {
        dealDamage(closestEnemy, damage);
        createParticles(closestEnemy.x, closestEnemy.y, '#FF0000', 5);
    }
}

function special() {
    if (!player.weapon) return;
    
    player.lastSpecial = player.weapon.specialCooldown;
    
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    let damage = player.weapon.specialDamage;
    
    // Apply boons
    player.boons.forEach(boon => {
        if (boon.effect === 'lightning') damage += 10;
        if (boon.effect === 'knockback') damage += 15;
    });
    
    // Area effect
    enemies.forEach(enemy => {
        const dist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
        if (dist < 100) {
            dealDamage(enemy, damage);
            createParticles(enemy.x, enemy.y, '#FFD700', 8);
        }
    });
    
    createExplosion(player.x, player.y);
}

function cast(targetX, targetY) {
    player.castCooldown = 3;
    
    // Cast at target location (like placing a spell)
    const angle = Math.atan2(targetY - player.y, targetX - player.x);
    const distance = Math.sqrt((targetX - player.x) ** 2 + (targetY - player.y) ** 2);
    
    // Create cast effect at target location
    createCastEffect(targetX, targetY);
    
    // Also shoot projectile from player to target
    shootProjectile(player.x, player.y, angle, true, 50);
    createParticles(player.x, player.y, '#9370DB', 10);
}

function createCastEffect(x, y) {
    // Create area effect at cast location
    createParticles(x, y, '#9370DB', 15);
    
    // Damage enemies in area
    enemies.forEach(enemy => {
        const dist = Math.sqrt((enemy.x - x) ** 2 + (enemy.y - y) ** 2);
        if (dist < 60) {
            dealDamage(enemy, 40);
            createParticles(enemy.x, enemy.y, '#9370DB', 5);
        }
    });
    
    // Visual explosion
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            color: '#9370DB',
            life: 0.8,
            size: Math.random() * 4 + 3
        });
    }
}

function shootProjectile(x, y, angle, playerProj, damage = 20) {
    projectiles.push({
        x: x,
        y: y,
        angle: angle,
        speed: playerProj ? 10 : 5,
        damage: damage,
        enemy: !playerProj,
        radius: 5
    });
}

function dealDamage(enemy, amount) {
    enemy.hp -= amount;
    if (enemy.hp <= 0) {
        killEnemy(enemy);
    }
}

function killEnemy(enemy) {
    const index = enemies.indexOf(enemy);
    if (index > -1) {
        enemies.splice(index, 1);
        enemiesDefeated++;
        player.darkness += enemy.points;
        createParticles(enemy.x, enemy.y, '#FFD700', 15);
    }
}

function dealPlayerDamage(amount) {
    // Damage reduction
    let finalAmount = amount;
    player.boons.forEach(boon => {
        if (boon.effect === 'damageReduction') {
            finalAmount *= 0.8;
        }
    });
    
    player.hp -= finalAmount;
    
    // Vengeance
    player.boons.forEach(boon => {
        if (boon.effect === 'vengeance') {
            enemies.forEach(enemy => {
                const dist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
                if (dist < 100) {
                    createLightning(enemy.x, enemy.y);
                    dealDamage(enemy, 20);
                }
            });
        }
    });
    
    createParticles(player.x, player.y, '#FF0000', 10);
}

function knockback(target, force, angle = null) {
    if (!angle) {
        angle = Math.atan2(target.y - player.y, target.x - player.x);
    }
    target.x += Math.cos(angle) * force;
    target.y += Math.sin(angle) * force;
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            color: color,
            life: 0.5,
            size: Math.random() * 3 + 2
        });
    }
}

function createLightning(x, y) {
    enemies.forEach(enemy => {
        const dist = Math.sqrt((enemy.x - x) ** 2 + (enemy.y - y) ** 2);
        if (dist < 80) {
            dealDamage(enemy, 15);
        }
    });
    createParticles(x, y, '#FFFF00', 5);
}

function createBlade(x, y) {
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        shootProjectile(x, y, angle, true, 10);
    }
}

function createExplosion(x, y) {
    createParticles(x, y, '#FF4500', 20);
    enemies.forEach(enemy => {
        const dist = Math.sqrt((enemy.x - x) ** 2 + (enemy.y - y) ** 2);
        if (dist < 60) {
            dealDamage(enemy, 25);
        }
    });
}

function completeRoom() {
    if (gameState !== 'playing') return;
    
    // Show rewards
    const rewards = ['boon', 'shop', 'rest'];
    if (currentRoom % 3 === 0) {
        showBoonSelection();
    } else {
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        if (reward === 'boon') {
            showBoonSelection();
        } else if (reward === 'shop') {
            showShop();
        } else {
            rest();
        }
    }
}

function showBoonSelection() {
    showScreen('boonScreen');
    const gods = Object.keys(BOONS);
    const god = gods[Math.floor(Math.random() * gods.length)];
    const boons = BOONS[god];
    
    const options = document.getElementById('boonOptions');
    if (!options) {
        console.error('boonOptions element not found!');
        return;
    }
    options.innerHTML = '';
    
    // Add title
    const titleEl = document.createElement('h2');
    titleEl.textContent = `${god}'s Boon`;
    titleEl.style.marginBottom = '10px';
    options.appendChild(titleEl);
    
    boons.forEach(boon => {
        const boonEl = document.createElement('div');
        boonEl.className = 'boon-card';
        boonEl.innerHTML = `
            <h3>${boon.name}</h3>
            <p>${boon.description}</p>
        `;
        boonEl.addEventListener('click', () => selectBoon(boon));
        options.appendChild(boonEl);
    });
}

function selectBoon(boon) {
    player.boons.push(boon);
    updateBoonsDisplay();
    nextRoom();
}

function skipBoon() {
    nextRoom();
}

function showShop() {
    showScreen('shopScreen');
    const items = document.getElementById('shopItems');
    items.innerHTML = '';
    
    const shopItems = [
        { name: 'Health Potion', effect: 'heal', cost: 50, description: 'Restore 50 HP' },
        { name: 'Max HP Up', effect: 'maxHp', cost: 100, description: '+20 Max HP' },
        { name: 'Speed Up', effect: 'speed', cost: 75, description: '+1 Speed' }
    ];
    
    shopItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        itemEl.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <button class="buy-btn" data-cost="${item.cost}" data-effect="${item.effect}">Buy (${item.cost}g)</button>
        `;
        itemEl.querySelector('.buy-btn').addEventListener('click', () => {
            if (player.darkness >= item.cost) {
                player.darkness -= item.cost;
                applyShopItem(item.effect);
                itemEl.remove();
                updateStats();
            }
        });
        items.appendChild(itemEl);
    });
}

function applyShopItem(effect) {
    if (effect === 'heal') {
        player.hp = Math.min(player.maxHp, player.hp + 50);
    } else if (effect === 'maxHp') {
        player.maxHp += 20;
        player.hp += 20;
    } else if (effect === 'speed') {
        player.speed += 1;
    }
}

function leaveShop() {
    nextRoom();
}

function rest() {
    player.hp = player.maxHp;
    nextRoom();
}

function nextRoom() {
    currentRoom++;
    if (currentRoom > 10) {
        victory();
    } else {
        startRoom();
    }
}

function updateBoonsDisplay() {
    // Boons display is optional - create if needed
    let display = document.getElementById('boonsDisplay');
    if (!display) {
        // Create display if it doesn't exist
        display = document.createElement('div');
        display.id = 'boonsDisplay';
        display.className = 'boons-display';
        document.querySelector('.stats-bar')?.appendChild(display);
    }
    display.innerHTML = '';
    player.boons.forEach(boon => {
        const boonEl = document.createElement('div');
        boonEl.className = 'boon-badge';
        boonEl.textContent = boon.name;
        display.appendChild(boonEl);
    });
}

function updateStats() {
    const hpEl = document.getElementById('playerHp');
    const roomEl = document.getElementById('roomNumber');
    const darknessEl = document.getElementById('darkness');
    
    if (hpEl) hpEl.textContent = `${Math.max(0, Math.floor(player.hp))}/${player.maxHp}`;
    if (roomEl) roomEl.textContent = currentRoom;
    if (darknessEl) darknessEl.textContent = player.darkness;
}

function render() {
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // HP bar
        const barWidth = enemy.size;
        const barHeight = 4;
        const hpPercent = enemy.hp / enemy.maxHp;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size/2 - 10, barWidth, barHeight);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size/2 - 10, barWidth * hpPercent, barHeight);
    });
    
    // Draw projectiles
    projectiles.forEach(proj => {
        ctx.fillStyle = proj.enemy ? '#FF0000' : '#00FFFF';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw particles
    particles.forEach(part => {
        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.life;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    // Draw cast targeting indicator
    if (casting && player.castCooldown <= 0) {
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(castTarget.x, castTarget.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw target circle
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(castTarget.x, castTarget.y, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw crosshair
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(castTarget.x - 10, castTarget.y);
        ctx.lineTo(castTarget.x + 10, castTarget.y);
        ctx.moveTo(castTarget.x, castTarget.y - 10);
        ctx.lineTo(castTarget.x, castTarget.y + 10);
        ctx.stroke();
    }
    
    // Draw player
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Player HP bar
    const barWidth = 60;
    const barHeight = 6;
    const hpPercent = player.hp / player.maxHp;
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x - barWidth/2, player.y - player.height/2 - 15, barWidth, barHeight);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(player.x - barWidth/2, player.y - player.height/2 - 15, barWidth * hpPercent, barHeight);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
    
    if (screenId === 'gameScreen' || screenId === 'playing') {
        gameState = 'playing';
        canvas.style.display = 'block';
    } else {
        canvas.style.display = screenId === 'startScreen' ? 'none' : 'block';
        gameState = screenId;
    }
}

function gameOver() {
    gameState = 'gameOver';
    showScreen('gameOverScreen');
    document.getElementById('finalRooms').textContent = currentRoom - 1;
    document.getElementById('finalEnemies').textContent = enemiesDefeated;
    document.getElementById('finalDarkness').textContent = player.darkness;
}

function victory() {
    gameState = 'victory';
    showScreen('victoryScreen');
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

