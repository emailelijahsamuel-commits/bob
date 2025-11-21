// Slay the Spire Clone
let gameState = 'start';
let currentScreen = 'startScreen';

// Player stats
let player = {
    hp: 80,
    maxHp: 80,
    block: 0,
    energy: 3,
    maxEnergy: 3,
    gold: 99,
    floor: 1,
    deck: [],
    relics: [],
    potions: []
};

// Combat state
let combatState = {
    enemy: null,
    hand: [],
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    turn: 1,
    energy: 3
};

// Map state
let mapState = {
    currentRoom: 0,
    rooms: [],
    paths: []
};

// Card definitions
const CARDS = {
    STRIKE: {
        name: 'Strike',
        cost: 1,
        type: 'attack',
        description: 'Deal 6 damage.',
        effect: (target) => dealDamage(target, 6),
        rarity: 'common'
    },
    DEFEND: {
        name: 'Defend',
        cost: 1,
        type: 'skill',
        description: 'Gain 5 Block.',
        effect: () => gainBlock(5),
        rarity: 'common'
    },
    BASH: {
        name: 'Bash',
        cost: 2,
        type: 'attack',
        description: 'Deal 8 damage. Apply 2 Vulnerable.',
        effect: (target) => {
            dealDamage(target, 8);
            applyVulnerable(target, 2);
        },
        rarity: 'common'
    },
    ANGER: {
        name: 'Anger',
        cost: 0,
        type: 'attack',
        description: 'Deal 6 damage. Put a copy of this card on top of your draw pile.',
        effect: (target) => {
            dealDamage(target, 6);
            combatState.drawPile.unshift({...CARDS.ANGER});
        },
        rarity: 'common'
    },
    CLASH: {
        name: 'Clash',
        cost: 0,
        type: 'attack',
        description: 'Can only be played if every card in your hand is an Attack. Deal 14 damage.',
        effect: (target) => {
            const canPlay = combatState.hand.every(card => card.type === 'attack');
            if (canPlay) {
                dealDamage(target, 14);
            }
        },
        rarity: 'common'
    },
    CLEAVE: {
        name: 'Cleave',
        cost: 1,
        type: 'attack',
        description: 'Deal 8 damage to ALL enemies.',
        effect: () => {
            dealDamage(combatState.enemy, 8);
        },
        rarity: 'common'
    },
    IRON_WAVE: {
        name: 'Iron Wave',
        cost: 1,
        type: 'attack',
        description: 'Gain 5 Block. Deal 5 damage.',
        effect: (target) => {
            gainBlock(5);
            dealDamage(target, 5);
        },
        rarity: 'common'
    },
    SHrug_IT_OFF: {
        name: 'Shrug It Off',
        cost: 1,
        type: 'skill',
        description: 'Gain 8 Block. Draw 1 card.',
        effect: () => {
            gainBlock(8);
            drawCards(1);
        },
        rarity: 'common'
    },
    BODY_SLAM: {
        name: 'Body Slam',
        cost: 1,
        type: 'attack',
        description: 'Deal damage equal to your Block.',
        effect: (target) => {
            dealDamage(target, player.block);
        },
        rarity: 'common'
    },
    UPPERCUT: {
        name: 'Uppercut',
        cost: 2,
        type: 'attack',
        description: 'Deal 13 damage. Apply 1 Weak. Apply 1 Vulnerable.',
        effect: (target) => {
            dealDamage(target, 13);
            applyWeak(target, 1);
            applyVulnerable(target, 1);
        },
        rarity: 'uncommon'
    },
    WHIRLWIND: {
        name: 'Whirlwind',
        cost: 'X',
        type: 'attack',
        description: 'Spend all Energy. Deal 5 damage to ALL enemies X times.',
        effect: () => {
            const energy = combatState.energy;
            combatState.energy = 0;
            for (let i = 0; i < energy; i++) {
                dealDamage(combatState.enemy, 5);
            }
        },
        rarity: 'uncommon'
    },
    FLAME_BARRIER: {
        name: 'Flame Barrier',
        cost: 2,
        type: 'skill',
        description: 'Gain 12 Block. When attacked this turn, deal 4 damage back.',
        effect: () => {
            gainBlock(12);
            player.flameBarrier = true;
        },
        rarity: 'uncommon'
    },
    DEMON_FORM: {
        name: 'Demon Form',
        cost: 3,
        type: 'power',
        description: 'At the start of each turn, gain 2 Strength.',
        effect: () => {
            player.demonForm = true;
        },
        rarity: 'rare'
    },
    IMPERVIOUS: {
        name: 'Impervious',
        cost: 2,
        type: 'skill',
        description: 'Gain 30 Block.',
        effect: () => {
            gainBlock(30);
        },
        rarity: 'rare'
    }
};

// Enemy definitions
const ENEMIES = {
    JAW_WORM: {
        name: 'Jaw Worm',
        hp: 40,
        maxHp: 40,
        block: 0,
        intents: [
            { type: 'attack', value: 11, text: 'Attack 11' },
            { type: 'block', value: 6, text: 'Block 6' },
            { type: 'attack', value: 7, text: 'Attack 7' }
        ]
    },
    CULTIST: {
        name: 'Cultist',
        hp: 48,
        maxHp: 48,
        block: 0,
        intents: [
            { type: 'ritual', value: 3, text: 'Ritual +3' },
            { type: 'attack', value: 6, text: 'Attack 6' },
            { type: 'attack', value: 6, text: 'Attack 6' }
        ],
        ritual: 0
    },
    SLIME_SMALL: {
        name: 'Acid Slime (S)',
        hp: 8,
        maxHp: 8,
        block: 0,
        intents: [
            { type: 'attack', value: 3, text: 'Attack 3' },
            { type: 'attack', value: 5, text: 'Attack 5' }
        ]
    },
    SLIME_MEDIUM: {
        name: 'Acid Slime (M)',
        hp: 28,
        maxHp: 28,
        block: 0,
        intents: [
            { type: 'attack', value: 8, text: 'Attack 8' },
            { type: 'debuff', value: 2, text: 'Lick -2 Str' }
        ]
    },
    NOB: {
        name: 'Gremlin Nob',
        hp: 82,
        maxHp: 82,
        block: 0,
        intents: [
            { type: 'attack', value: 14, text: 'Attack 14' },
            { type: 'attack', value: 16, text: 'Attack 16' },
            { type: 'debuff', value: 2, text: 'Skull Bash' }
        ]
    }
};

// Relic definitions
const RELICS = {
    BURNING_BLOOD: {
        name: 'Burning Blood',
        description: 'At the end of combat, heal 6 HP.',
        effect: 'healEndCombat'
    },
    ANCHOR: {
        name: 'Anchor',
        description: 'Start each combat with 10 Block.',
        effect: 'startBlock'
    },
    VAJRA: {
        name: 'Vajra',
        description: 'Start each combat with 1 Strength.',
        effect: 'startStrength'
    },
    BRONZE_SCALES: {
        name: 'Bronze Scales',
        description: 'When attacked, deal 3 damage back.',
        effect: 'thorns'
    }
};

// Initialize
function init() {
    // Set up initial deck
    for (let i = 0; i < 5; i++) {
        player.deck.push({...CARDS.STRIKE});
    }
    for (let i = 0; i < 4; i++) {
        player.deck.push({...CARDS.DEFEND});
    }
    player.deck.push({...CARDS.BASH});
    
    // Event listeners
    document.getElementById('startBtn')?.addEventListener('click', startRun);
    document.getElementById('restartBtn')?.addEventListener('click', startRun);
    document.getElementById('endTurnBtn')?.addEventListener('click', endTurn);
    document.getElementById('leaveShopBtn')?.addEventListener('click', leaveShop);
    document.getElementById('restBtn')?.addEventListener('click', rest);
    document.getElementById('upgradeCardBtn')?.addEventListener('click', upgradeCard);
    document.getElementById('leaveRestBtn')?.addEventListener('click', leaveRest);
    document.getElementById('closeDeckBtn')?.addEventListener('click', closeDeck);
    document.getElementById('deckBtn')?.addEventListener('click', showDeck);
    document.getElementById('relicsBtn')?.addEventListener('click', showRelics);
    
    updateStats();
}

// Game flow
function startRun() {
    player = {
        hp: 80,
        maxHp: 80,
        block: 0,
        energy: 3,
        maxEnergy: 3,
        gold: 99,
        floor: 1,
        deck: [],
        relics: [],
        potions: [],
        strength: 0,
        weak: 0,
        vulnerable: 0
    };
    
    // Reset deck
    player.deck = [];
    for (let i = 0; i < 5; i++) {
        player.deck.push({...CARDS.STRIKE});
    }
    for (let i = 0; i < 4; i++) {
        player.deck.push({...CARDS.DEFEND});
    }
    player.deck.push({...CARDS.BASH});
    
    showScreen('mapScreen');
    generateMap();
    updateStats();
}

function generateMap() {
    const roomCount = 10 + Math.floor(Math.random() * 5);
    mapState.rooms = [];
    mapState.currentRoom = 0;
    
    for (let i = 0; i < roomCount; i++) {
        let roomType = 'combat';
        if (i === 0) roomType = 'start';
        else if (i === roomCount - 1) roomType = 'boss';
        else if (i % 3 === 0 && i > 0) roomType = Math.random() < 0.5 ? 'shop' : 'rest';
        else if (i % 7 === 0) roomType = 'elite';
        
        mapState.rooms.push({
            type: roomType,
            visited: i === 0,
            id: i
        });
    }
    
    renderMap();
}

function renderMap() {
    const container = document.getElementById('mapContainer');
    container.innerHTML = '';
    
    mapState.rooms.forEach((room, index) => {
        const roomEl = document.createElement('div');
        roomEl.className = `map-room ${room.type} ${room.visited ? 'visited' : ''} ${index === mapState.currentRoom ? 'current' : ''}`;
        
        let icon = '⚔️';
        if (room.type === 'start') icon = '🚪';
        else if (room.type === 'boss') icon = '👹';
        else if (room.type === 'shop') icon = '🏪';
        else if (room.type === 'rest') icon = '💤';
        else if (room.type === 'elite') icon = '💀';
        
        roomEl.textContent = icon;
        roomEl.title = room.type.charAt(0).toUpperCase() + room.type.slice(1);
        
        if (room.visited || index === mapState.currentRoom + 1) {
            roomEl.addEventListener('click', () => enterRoom(index));
        }
        
        container.appendChild(roomEl);
    });
    
    document.getElementById('mapFloor').textContent = player.floor;
    document.getElementById('roomsRemaining').textContent = mapState.rooms.length - mapState.currentRoom - 1;
}

function enterRoom(roomIndex) {
    if (roomIndex !== mapState.currentRoom + 1 && !mapState.rooms[roomIndex].visited) return;
    
    mapState.currentRoom = roomIndex;
    mapState.rooms[roomIndex].visited = true;
    
    const room = mapState.rooms[roomIndex];
    
    switch (room.type) {
        case 'combat':
        case 'elite':
            startCombat(room.type === 'elite');
            break;
        case 'shop':
            showShop();
            break;
        case 'rest':
            showRest();
            break;
        case 'boss':
            startCombat(true, true);
            break;
    }
}

// Combat system
function startCombat(isElite = false, isBoss = false) {
    showScreen('combatScreen');
    
    // Create enemy
    let enemyTemplate;
    if (isBoss) {
        enemyTemplate = ENEMIES.NOB;
    } else if (isElite) {
        enemyTemplate = ENEMIES.NOB;
    } else {
        const enemies = [ENEMIES.JAW_WORM, ENEMIES.CULTIST];
        enemyTemplate = enemies[Math.floor(Math.random() * enemies.length)];
    }
    
    combatState.enemy = {
        ...enemyTemplate,
        hp: enemyTemplate.maxHp,
        block: 0,
        intentIndex: 0,
        weak: 0,
        vulnerable: 0
    };
    
    // Reset combat state
    combatState.hand = [];
    combatState.drawPile = [...player.deck.map(card => ({...card}))];
    combatState.discardPile = [];
    combatState.exhaustPile = [];
    combatState.turn = 1;
    combatState.energy = player.maxEnergy;
    
    // Shuffle draw pile
    shuffle(combatState.drawPile);
    
    // Draw starting hand
    drawCards(5);
    
    // Apply relics
    player.relics.forEach(relic => {
        if (relic.effect === 'startBlock') {
            player.block += 10;
        }
        if (relic.effect === 'startStrength') {
            player.strength = (player.strength || 0) + 1;
        }
    });
    
    updateCombatUI();
    updateEnemyIntent();
}

function drawCards(count) {
    for (let i = 0; i < count; i++) {
        if (combatState.drawPile.length === 0) {
            if (combatState.discardPile.length === 0) break;
            combatState.drawPile = [...combatState.discardPile];
            combatState.discardPile = [];
            shuffle(combatState.drawPile);
        }
        const card = combatState.drawPile.shift();
        combatState.hand.push(card);
    }
    renderHand();
}

function renderHand() {
    const handEl = document.getElementById('hand');
    handEl.innerHTML = '';
    
    combatState.hand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-cost">${card.cost}</div>
            <div class="card-description">${card.description}</div>
            <div class="card-type">${card.type}</div>
        `;
        
        const canPlay = canPlayCard(card);
        if (!canPlay) {
            cardEl.classList.add('unplayable');
        }
        
        cardEl.addEventListener('click', () => playCard(card, index));
        handEl.appendChild(cardEl);
    });
}

function canPlayCard(card) {
    if (card.cost === 'X') return combatState.energy > 0;
    return combatState.energy >= card.cost;
}

function playCard(card, handIndex) {
    if (!canPlayCard(card)) return;
    
    if (card.cost === 'X') {
        // X cost cards handled in effect
    } else {
        combatState.energy -= card.cost;
    }
    
    card.effect(combatState.enemy);
    
    // Remove from hand
    combatState.hand.splice(handIndex, 1);
    combatState.discardPile.push(card);
    
    renderHand();
    updateCombatUI();
    
    // Check win condition
    if (combatState.enemy.hp <= 0) {
        winCombat();
    }
}

function endTurn() {
    // Enemy turn
    executeEnemyTurn();
    
    // Start player turn
    combatState.turn++;
    combatState.energy = player.maxEnergy;
    
    // Apply status effects
    if (player.demonForm) {
        player.strength = (player.strength || 0) + 2;
    }
    
    // Draw cards
    drawCards(5);
    
    // Update enemy intent
    updateEnemyIntent();
    
    updateCombatUI();
    
    // Check lose condition
    if (player.hp <= 0) {
        gameOver();
    }
}

function executeEnemyTurn() {
    const enemy = combatState.enemy;
    const intent = enemy.intents[enemy.intentIndex % enemy.intents.length];
    
    switch (intent.type) {
        case 'attack':
            let damage = intent.value;
            if (enemy.strength) damage += enemy.strength;
            if (player.vulnerable) damage = Math.floor(damage * 1.5);
            if (player.weak) damage = Math.floor(damage * 0.75);
            
            damage = Math.max(0, damage - player.block);
            player.block = Math.max(0, player.block - (intent.value + (enemy.strength || 0)));
            player.hp -= damage;
            
            // Thorns
            if (player.relics.some(r => r.effect === 'thorns')) {
                enemy.hp -= 3;
            }
            
            // Flame Barrier
            if (player.flameBarrier) {
                enemy.hp -= 4;
                player.flameBarrier = false;
            }
            break;
        case 'block':
            enemy.block += intent.value;
            break;
        case 'ritual':
            enemy.ritual = (enemy.ritual || 0) + intent.value;
            enemy.strength = (enemy.strength || 0) + enemy.ritual;
            break;
        case 'debuff':
            player.strength = Math.max(0, (player.strength || 0) - intent.value);
            break;
    }
    
    enemy.intentIndex++;
    
    // Discard hand
    combatState.discardPile.push(...combatState.hand);
    combatState.hand = [];
}

function updateEnemyIntent() {
    const enemy = combatState.enemy;
    const intent = enemy.intents[enemy.intentIndex % enemy.intents.length];
    document.getElementById('enemyIntent').textContent = intent.text;
}

function updateCombatUI() {
    document.getElementById('playerHp').textContent = `${player.hp}/${player.maxHp}`;
    document.getElementById('playerBlock').textContent = player.block;
    document.getElementById('enemyHp').textContent = `${combatState.enemy.hp}/${combatState.enemy.maxHp}`;
    document.getElementById('enemyName').textContent = combatState.enemy.name;
    document.getElementById('energy').textContent = `${combatState.energy}/${player.maxEnergy}`;
}

function winCombat() {
    // Heal from relics
    player.relics.forEach(relic => {
        if (relic.effect === 'healEndCombat') {
            player.hp = Math.min(player.maxHp, player.hp + 6);
        }
    });
    
    // Gold reward
    const goldReward = 10 + Math.floor(Math.random() * 15);
    player.gold += goldReward;
    
    // Show card reward
    showCardReward();
}

// Card effects
function dealDamage(target, amount) {
    if (player.strength) amount += player.strength;
    if (target.vulnerable) amount = Math.floor(amount * 1.5);
    if (player.weak) amount = Math.floor(amount * 0.75);
    
    const actualDamage = Math.max(0, amount - target.block);
    target.block = Math.max(0, target.block - amount);
    target.hp -= actualDamage;
    
    updateCombatUI();
}

function gainBlock(amount) {
    player.block += amount;
    updateCombatUI();
}

function applyWeak(target, amount) {
    target.weak = (target.weak || 0) + amount;
}

function applyVulnerable(target, amount) {
    target.vulnerable = (target.vulnerable || 0) + amount;
}

// Card rewards
function showCardReward() {
    showScreen('cardRewardScreen');
    
    const rewardsEl = document.getElementById('cardRewards');
    rewardsEl.innerHTML = '';
    
    const cardPool = Object.values(CARDS).filter(c => c.rarity !== 'rare' || Math.random() < 0.1);
    const rewards = [];
    
    for (let i = 0; i < 3; i++) {
        const card = cardPool[Math.floor(Math.random() * cardPool.length)];
        rewards.push(card);
    }
    
    rewards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card reward-card';
        cardEl.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-cost">${card.cost}</div>
            <div class="card-description">${card.description}</div>
            <div class="card-type">${card.type}</div>
        `;
        cardEl.addEventListener('click', () => addCardToDeck(card));
        rewardsEl.appendChild(cardEl);
    });
    
    document.getElementById('skipCardBtn').addEventListener('click', () => {
        afterCardReward();
    });
}

function addCardToDeck(card) {
    player.deck.push({...card});
    afterCardReward();
}

function afterCardReward() {
    mapState.currentRoom++;
    if (mapState.currentRoom >= mapState.rooms.length) {
        player.floor++;
        generateMap();
    } else {
        renderMap();
        showScreen('mapScreen');
    }
    updateStats();
}

// Shop
function showShop() {
    showScreen('shopScreen');
    
    // Generate shop items
    const shopCards = [];
    const cardPool = Object.values(CARDS);
    for (let i = 0; i < 5; i++) {
        shopCards.push(cardPool[Math.floor(Math.random() * cardPool.length)]);
    }
    
    const shopCardsEl = document.getElementById('shopCards');
    shopCardsEl.innerHTML = '';
    shopCards.forEach(card => {
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        itemEl.innerHTML = `
            <div class="card">
                <div class="card-name">${card.name}</div>
                <div class="card-description">${card.description}</div>
            </div>
            <button class="buy-btn" data-price="50">Buy (50g)</button>
        `;
        itemEl.querySelector('.buy-btn').addEventListener('click', () => {
            if (player.gold >= 50) {
                player.gold -= 50;
                player.deck.push({...card});
                updateStats();
                itemEl.remove();
            }
        });
        shopCardsEl.appendChild(itemEl);
    });
    
    // Relics
    const shopRelicsEl = document.getElementById('shopRelics');
    shopRelicsEl.innerHTML = '';
    const relicKeys = Object.keys(RELICS);
    const shopRelic = RELICS[relicKeys[Math.floor(Math.random() * relicKeys.length)]];
    const relicEl = document.createElement('div');
    relicEl.className = 'shop-item';
    relicEl.innerHTML = `
        <div>${shopRelic.name}</div>
        <div>${shopRelic.description}</div>
        <button class="buy-btn" data-price="150">Buy (150g)</button>
    `;
    relicEl.querySelector('.buy-btn').addEventListener('click', () => {
        if (player.gold >= 150) {
            player.gold -= 150;
            player.relics.push({...shopRelic});
            updateStats();
            relicEl.remove();
        }
    });
    shopRelicsEl.appendChild(relicEl);
}

function leaveShop() {
    mapState.currentRoom++;
    if (mapState.currentRoom >= mapState.rooms.length) {
        player.floor++;
        generateMap();
    } else {
        renderMap();
        showScreen('mapScreen');
    }
    updateStats();
}

// Rest
function showRest() {
    showScreen('restScreen');
}

function rest() {
    player.hp = Math.min(player.maxHp, player.hp + Math.floor(player.maxHp * 0.3));
    updateStats();
    leaveRest();
}

function upgradeCard() {
    // Simple upgrade - just show message
    alert('Select a card to upgrade (feature simplified)');
    leaveRest();
}

function leaveRest() {
    mapState.currentRoom++;
    if (mapState.currentRoom >= mapState.rooms.length) {
        player.floor++;
        generateMap();
    } else {
        renderMap();
        showScreen('mapScreen');
    }
    updateStats();
}

// Deck view
function showDeck() {
    showScreen('deckScreen');
    const deckList = document.getElementById('deckList');
    deckList.innerHTML = '';
    
    const cardCounts = {};
    player.deck.forEach(card => {
        cardCounts[card.name] = (cardCounts[card.name] || 0) + 1;
    });
    
    Object.entries(cardCounts).forEach(([name, count]) => {
        const item = document.createElement('div');
        item.className = 'deck-item';
        item.textContent = `${name} x${count}`;
        deckList.appendChild(item);
    });
}

function closeDeck() {
    showScreen('mapScreen');
}

function showRelics() {
    alert('Relics: ' + (player.relics.length > 0 ? player.relics.map(r => r.name).join(', ') : 'None'));
}

// Utility
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId)?.classList.remove('hidden');
    currentScreen = screenId;
}

function updateStats() {
    document.getElementById('hp').textContent = `${player.hp}/${player.maxHp}`;
    document.getElementById('gold').textContent = player.gold;
    document.getElementById('floor').textContent = player.floor;
    document.getElementById('energy').textContent = `${player.maxEnergy}/${player.maxEnergy}`;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function gameOver() {
    showScreen('gameOverScreen');
    document.getElementById('finalFloor').textContent = player.floor;
    // Count enemies defeated
    const enemiesDefeated = mapState.currentRoom;
    document.getElementById('enemiesDefeated').textContent = enemiesDefeated;
    document.getElementById('cardsCollected').textContent = player.deck.length;
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}







