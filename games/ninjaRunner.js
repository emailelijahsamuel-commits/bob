// Ninja Runner Game - Ninja-themed runner
class NinjaRunnerGame {
    constructor() {
        this.theme = {
            name: 'Ninja Runner',
            bgGradient: ['#1a1a2e', '#16213e', '#0f3460'],
            groundColor: '#2d3436',
            playerColor: '#2d3436',
            obstacleColors: ['#e74c3c', '#c0392b', '#8e44ad'],
            coinColor: '#f1c40f',
            textColor: '#ecf0f1'
        };
        console.log('Ninja Runner initialized');
        this.setupTheme();
    }
    
    setupTheme() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
        
        if (typeof player !== 'undefined') {
            player.color = this.theme.playerColor;
        }
    }
    
    cleanup() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #98D8C8 100%)';
    }
}








