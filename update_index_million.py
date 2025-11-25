#!/usr/bin/env python3

# Read current index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where to insert new games
insert_point = content.find('</div>\n        </div>\n        \n        <div style="text-align: center')

# Generate game cards for games 104-1000103
game_cards = []
game_templates = [
    ("Click", "🎯"),
    ("Shoot", "🔫"),
    ("Collect", "💰"),
    ("Avoid", "⚠️"),
    ("Match", "🔗"),
    ("Race", "🏎️"),
    ("Jump", "🦘"),
    ("Puzzle", "🧩"),
    ("Defend", "🛡️"),
    ("Attack", "⚔️"),
]

# Generate cards in batches to avoid huge file
# We'll create a dynamic loading system instead
new_section = '''
                <!-- Dynamic Games Section - 1,000,000 games available -->
                <div id="dynamicGames" style="grid-column: 1 / -1;">
                    <h2 style="color: #667eea; text-align: center; margin: 20px;">🎮 1,000,000+ More Games</h2>
                    <p style="text-align: center; color: #666; margin-bottom: 20px;">
                        Games are loaded dynamically. Enter a game number (104-1000103) to play!
                    </p>
                    <div style="text-align: center; margin: 20px;">
                        <input type="number" id="gameNumber" placeholder="Enter game number (104-1000103)" 
                               style="padding: 10px; font-size: 16px; width: 300px; border-radius: 5px; border: 2px solid #667eea;">
                        <button onclick="loadGame()" 
                                style="padding: 10px 20px; font-size: 16px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                            Play Game
                        </button>
                    </div>
                    <div id="gamePreview" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                        <!-- Preview games will be loaded here -->
                    </div>
                </div>
                
                <script>
                function loadGame() {
                    const num = document.getElementById('gameNumber').value;
                    if (num >= 104 && num <= 1000103) {
                        window.location.href = `game${num}.html`;
                    } else {
                        alert('Please enter a number between 104 and 1000103');
                    }
                }
                
                // Show preview of some games
                function showPreview() {
                    const preview = document.getElementById('gamePreview');
                    const templates = [
                        {name: "Click", icon: "🎯"},
                        {name: "Shoot", icon: "🔫"},
                        {name: "Collect", icon: "💰"},
                        {name: "Avoid", icon: "⚠️"},
                        {name: "Match", icon: "🔗"},
                        {name: "Race", icon: "🏎️"},
                        {name: "Jump", icon: "🦘"},
                        {name: "Puzzle", icon: "🧩"},
                        {name: "Defend", icon: "🛡️"},
                        {name: "Attack", icon: "⚔️"},
                    ];
                    
                    for (let i = 0; i < 20; i++) {
                        const gameNum = 104 + i * 50000;
                        const template = templates[i % templates.length];
                        const card = document.createElement('a');
                        card.href = `game${gameNum}.html`;
                        card.className = 'game-card';
                        card.innerHTML = `
                            <div class="game-icon">${template.icon}</div>
                            <h3>${template.name} Game ${gameNum}</h3>
                            <p>Game #${gameNum}</p>
                        `;
                        preview.appendChild(card);
                    }
                }
                showPreview();
                </script>
'''

# Insert before the closing div
new_content = content[:insert_point] + new_section + content[insert_point:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated index.html with dynamic game loading system')

