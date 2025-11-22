// Space Runner Game - Space-themed runner
class SpaceRunnerGame {
    constructor() {
        this.theme = {
            name: 'Space Runner',
            bgGradient: ['#0a0e27', '#1a1f3a', '#2d3561'],
            groundColor: '#4a5568',
            playerColor: '#60a5fa',
            obstacleColors: ['#ef4444', '#f59e0b', '#8b5cf6'],
            coinColor: '#fbbf24',
            textColor: '#60a5fa'
        };
        console.log('Space Runner initialized');
        this.setupTheme();
    }
    
    setupTheme() {
        // Override canvas background
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #2d3561 100%)';
        
        // Update player color if game is running
        if (typeof player !== 'undefined') {
            player.color = this.theme.playerColor;
        }
    }
    
    cleanup() {
        // Reset canvas background
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #98D8C8 100%)';
    }
}










