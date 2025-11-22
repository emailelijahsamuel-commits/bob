// Fantasy Runner Game - Fantasy-themed runner
class FantasyRunnerGame {
    constructor() {
        this.theme = {
            name: 'Fantasy Runner',
            bgGradient: ['#1e3c72', '#2a5298', '#7e8ba3'],
            groundColor: '#8b7355',
            playerColor: '#d4af37',
            obstacleColors: ['#8b0000', '#4b0082', '#006400'],
            coinColor: '#ffd700',
            textColor: '#ffd700'
        };
        console.log('Fantasy Runner initialized');
        this.setupTheme();
    }
    
    setupTheme() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%)';
        
        if (typeof player !== 'undefined') {
            player.color = this.theme.playerColor;
        }
    }
    
    cleanup() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #98D8C8 100%)';
    }
}










