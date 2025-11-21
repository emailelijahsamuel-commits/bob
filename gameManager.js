// Game Manager - Handles switching between different runner games
class GameManager {
    constructor() {
        this.currentGame = null;
        this.currentGameType = null;
        this.games = {};
        this.init();
    }
    
    init() {
        // Get UI elements
        this.gameSelectorScreen = document.getElementById('gameSelectorScreen');
        this.startScreen = document.getElementById('startScreen');
        this.gameTitle = document.getElementById('gameTitle');
        this.gameSubtitle = document.getElementById('gameSubtitle');
        this.gameInstructions = document.getElementById('gameInstructions');
        this.statsBar = document.getElementById('statsBar');
        this.ammoStat = document.getElementById('ammoStat');
        
        // Check if elements exist
        if (!this.gameSelectorScreen || !this.startScreen) {
            console.error('Game UI elements not found!');
            return;
        }
        
        // Register games (check if classes exist)
        if (typeof SuperRunnerGame !== 'undefined') {
            this.registerGame('super', SuperRunnerGame);
        }
        if (typeof SpaceRunnerGame !== 'undefined') {
            this.registerGame('space', SpaceRunnerGame);
        }
        if (typeof ZombieRunnerGame !== 'undefined') {
            this.registerGame('zombie', ZombieRunnerGame);
        }
        if (typeof NinjaRunnerGame !== 'undefined') {
            this.registerGame('ninja', NinjaRunnerGame);
        }
        if (typeof CyberRunnerGame !== 'undefined') {
            this.registerGame('cyber', CyberRunnerGame);
        }
        if (typeof FantasyRunnerGame !== 'undefined') {
            this.registerGame('fantasy', FantasyRunnerGame);
        }
        
        // Setup game selector buttons
        document.querySelectorAll('.game-card').forEach(card => {
            const gameType = card.dataset.game;
            const btn = card.querySelector('.game-select-btn');
            
            if (btn) {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.selectGame(gameType);
                });
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectGame(gameType);
                });
            }
        });
        
        // Setup back to selector button
        const backBtn = document.getElementById('backToSelectorBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showGameSelector();
            });
        }
        
        // Setup selector button from game over
        const selectorBtn = document.getElementById('selectorBtn');
        if (selectorBtn) {
            selectorBtn.addEventListener('click', () => {
                this.showGameSelector();
            });
        }
    }
    
    registerGame(type, GameClass) {
        this.games[type] = GameClass;
    }
    
    selectGame(gameType) {
        if (!this.games[gameType]) {
            console.error(`Game type ${gameType} not found. Available games:`, Object.keys(this.games));
            alert(`Game "${gameType}" is not available. Please try another game.`);
            return;
        }
        
        this.currentGameType = gameType;
        const GameClass = this.games[gameType];
        
        // Hide selector, show start screen
        if (this.gameSelectorScreen) {
            this.gameSelectorScreen.classList.add('hidden');
        }
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
            this.startScreen.style.display = 'block';
        }
        if (this.statsBar) {
            this.statsBar.classList.remove('hidden');
        }
        
        // Update UI based on game type
        this.updateGameUI(gameType);
        
        // Initialize game if not already done
        if (!this.currentGame || this.currentGame.type !== gameType) {
            if (this.currentGame && this.currentGame.cleanup) {
                this.currentGame.cleanup();
            }
            try {
                this.currentGame = new GameClass();
                this.currentGame.type = gameType;
            } catch (error) {
                console.error('Error initializing game:', error);
                alert('Error loading game. Please try again.');
                return;
            }
        }
        
        // Reset player color if needed
        if (typeof player !== 'undefined' && this.currentGame && this.currentGame.theme) {
            player.color = this.currentGame.theme.playerColor;
        }
    }
    
    updateGameUI(gameType) {
        const gameInfo = {
            super: {
                title: '🏃 Super Runner',
                subtitle: 'Classic endless runner with guns and upgrades!',
                instructions: `
                    <p><strong>Controls:</strong></p>
                    <p>🔼 Space / Up - Jump</p>
                    <p>⬇️ Down Arrow - Slide</p>
                    <p>⬅️➡️ Left/Right - Move</p>
                    <p>⚡ Shift - Dash!</p>
                    <p>🔫 Click / X - Shoot!</p>
                    <p>💎 Collect coins to upgrade!</p>
                `,
                showAmmo: true
            },
            space: {
                title: '🚀 Space Runner',
                subtitle: 'Run through space stations and avoid aliens!',
                instructions: `
                    <p><strong>Controls:</strong></p>
                    <p>🔼 Space / Up - Jump</p>
                    <p>⬇️ Down Arrow - Slide</p>
                    <p>⬅️➡️ Left/Right - Move</p>
                    <p>⚡ Shift - Boost!</p>
                    <p>🔫 Click / X - Shoot Lasers!</p>
                    <p>⚡ Collect energy cells!</p>
                `,
                showAmmo: true
            },
            zombie: {
                title: '🧟 Zombie Runner',
                subtitle: 'Survive the zombie apocalypse!',
                instructions: `
                    <p><strong>Controls:</strong></p>
                    <p>🔼 Space / Up - Jump</p>
                    <p>⬇️ Down Arrow - Slide</p>
                    <p>⬅️➡️ Left/Right - Move</p>
                    <p>⚡ Shift - Sprint!</p>
                    <p>🔫 Click / X - Shoot!</p>
                    <p>💊 Collect supplies and ammo!</p>
                `,
                showAmmo: true
            },
            ninja: {
                title: '🥷 Ninja Runner',
                subtitle: 'Master the shadows and become a ninja!',
                instructions: `
                    <p><strong>Controls:</strong></p>
                    <p>🔼 Space / Up - Jump</p>
                    <p>⬇️ Down Arrow - Crouch</p>
                    <p>⬅️➡️ Left/Right - Move</p>
                    <p>⚡ Shift - Dash Attack!</p>
                    <p>🔫 Click / X - Throw Shuriken!</p>
                    <p>⭐ Collect ninja stars!</p>
                `,
                showAmmo: true
            },
            cyber: {
                title: '💻 Cyber Runner',
                subtitle: 'Neon-lit cyberpunk world awaits!',
                instructions: `
                    <p><strong>Controls:</strong></p>
                    <p>🔼 Space / Up - Jump</p>
                    <p>⬇️ Down Arrow - Slide</p>
                    <p>⬅️➡️ Left/Right - Move</p>
                    <p>⚡ Shift - Hack Dash!</p>
                    <p>🔫 Click / X - Fire Plasma!</p>
                    <p>💾 Collect data chips!</p>
                `,
                showAmmo: true
            },
            fantasy: {
                title: '⚔️ Fantasy Runner',
                subtitle: 'Magical realm of adventure!',
                instructions: `
                    <p><strong>Controls:</strong></p>
                    <p>🔼 Space / Up - Jump</p>
                    <p>⬇️ Down Arrow - Slide</p>
                    <p>⬅️➡️ Left/Right - Move</p>
                    <p>⚡ Shift - Magic Dash!</p>
                    <p>🔫 Click / X - Cast Spell!</p>
                    <p>💎 Collect magical gems!</p>
                `,
                showAmmo: true
            }
        };
        
        const info = gameInfo[gameType];
        if (info) {
            this.gameTitle.textContent = info.title;
            this.gameSubtitle.textContent = info.subtitle;
            this.gameInstructions.innerHTML = info.instructions;
            this.ammoStat.style.display = info.showAmmo ? 'block' : 'none';
        }
    }
    
    showGameSelector() {
        // Hide all game screens
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
            this.startScreen.style.display = 'none';
        }
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
        const shopScreen = document.getElementById('shopScreen');
        if (shopScreen) {
            shopScreen.classList.add('hidden');
        }
        if (this.statsBar) {
            this.statsBar.classList.add('hidden');
        }
        
        // Show selector
        if (this.gameSelectorScreen) {
            this.gameSelectorScreen.classList.remove('hidden');
            this.gameSelectorScreen.style.display = 'block';
        }
        
        // Stop game loop
        if (typeof stopGameLoop === 'function') {
            stopGameLoop();
        }
        
        // Reset game state
        if (typeof gameState !== 'undefined') {
            gameState = 'start';
        }
        
        // Cleanup current game
        if (this.currentGame && this.currentGame.cleanup) {
            this.currentGame.cleanup();
        }
        this.currentGame = null;
    }
    
    getCurrentGame() {
        return this.currentGame;
    }
}

// Game manager will be initialized after all scripts load
let gameManager = null;

