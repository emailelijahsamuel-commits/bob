// Cyber Runner Game - Cyberpunk-themed runner
class CyberRunnerGame {
    constructor() {
        this.theme = {
            name: 'Cyber Runner',
            bgGradient: ['#0d0221', '#261447', '#2d1b69'],
            groundColor: '#541388',
            playerColor: '#00f5ff',
            obstacleColors: ['#ff006e', '#8338ec', '#3a86ff'],
            coinColor: '#ffbe0b',
            textColor: '#00f5ff'
        };
        console.log('Cyber Runner initialized');
        this.setupTheme();
    }
    
    setupTheme() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #0d0221 0%, #261447 50%, #2d1b69 100%)';
        
        if (typeof player !== 'undefined') {
            player.color = this.theme.playerColor;
        }
    }
    
    cleanup() {
        const canvas = document.getElementById('gameCanvas');
        canvas.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #98D8C8 100%)';
    }
}








