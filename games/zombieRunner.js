// Zombie Runner Game - Apocalypse-themed runner
class ZombieRunnerGame {
    constructor() {
        this.theme = {
            name: 'Zombie Runner',
            bgGradient: ['#2d1810', '#3d2415', '#4a2c1a'],
            groundColor: '#654321',
            playerColor: '#8b4513',
            obstacleColors: ['#8b0000', '#a0522d', '#696969'],
            coinColor: '#ffd700',
            textColor: '#ff6347'
        };
        console.log('Zombie Runner initialized');
        this.setupTheme();
    }
    
    setupTheme() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #2d1810 0%, #3d2415 50%, #4a2c1a 100%)';
        
        if (typeof player !== 'undefined') {
            player.color = this.theme.playerColor;
        }
    }
    
    cleanup() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #98D8C8 100%)';
    }
}










