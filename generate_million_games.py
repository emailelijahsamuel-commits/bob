#!/usr/bin/env python3
import os

# Game templates with variations
game_templates = [
    ("Click", "🎯", "Click the targets"),
    ("Shoot", "🔫", "Shoot the enemies"),
    ("Collect", "💰", "Collect items"),
    ("Avoid", "⚠️", "Avoid obstacles"),
    ("Match", "🔗", "Match pairs"),
    ("Race", "🏎️", "Race to finish"),
    ("Jump", "🦘", "Jump platforms"),
    ("Puzzle", "🧩", "Solve puzzles"),
    ("Defend", "🛡️", "Defend base"),
    ("Attack", "⚔️", "Attack enemies"),
]

# Generate games 104-1000103 (1 million games)
print("Generating 1,000,000 games...")

for i in range(104, 1000104):
    num = f"{i}"
    template = game_templates[i % len(game_templates)]
    name = f"{template[0]} Game {i}"
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name}</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }}
        #gameCanvas {{ border: 3px solid #fff; background: #000; display: block; margin: 20px auto; }}
        .back-btn {{ position: absolute; top: 20px; left: 20px; padding: 10px 20px; background: rgba(255,255,255,0.2); color: #fff; border: 2px solid #fff; border-radius: 10px; cursor: pointer; text-decoration: none; }}
        .info {{ text-align: center; color: #fff; margin: 20px; }}
    </style>
</head>
<body>
    <a href="index.html" class="back-btn">← Back</a>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div class="info">
        <h2>{template[1]} {name}</h2>
        <p>{template[2]}</p>
        <p>Score: <span id="score">0</span></p>
    </div>
    <script src="game{num}.js"></script>
</body>
</html>'''
    
    js = f'''// {name}
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
const targets = [];
let gameStarted = false;
const gameType = {i % 10};

function createTarget() {{
    targets.push({{
        x: Math.random() * (canvas.width - 40),
        y: Math.random() * (canvas.height - 40),
        width: 40,
        height: 40,
        active: true,
        color: `hsl(${{Math.random() * 360}}, 70%, 50%)`,
        speed: 1 + Math.random() * 2
    }});
}}

canvas.addEventListener('click', (e) => {{
    if (!gameStarted) {{
        gameStarted = true;
        for (let i = 0; i < 5; i++) createTarget();
        return;
    }}
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    targets.forEach((target, index) => {{
        if (target.active && x >= target.x && x <= target.x + target.width &&
            y >= target.y && y <= target.y + target.height) {{
            target.active = false;
            targets.splice(index, 1);
            score += 10;
            document.getElementById('score').textContent = score;
            createTarget();
        }}
    }});
}});

function update() {{
    if (!gameStarted) return;
    
    targets.forEach(target => {{
        target.x += (Math.random() - 0.5) * target.speed;
        target.y += (Math.random() - 0.5) * target.speed;
        target.x = Math.max(0, Math.min(canvas.width - target.width, target.x));
        target.y = Math.max(0, Math.min(canvas.height - target.height, target.y));
    }});
}}

function draw() {{
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!gameStarted) {{
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click to Start!', canvas.width/2, canvas.height/2);
        return;
    }}
    
    targets.forEach(target => {{
        if (target.active) {{
            ctx.fillStyle = target.color;
            if (gameType % 2 === 0) {{
                ctx.fillRect(target.x, target.y, target.width, target.height);
            }} else {{
                ctx.beginPath();
                ctx.arc(target.x + target.width/2, target.y + target.height/2, target.width/2, 0, Math.PI * 2);
                ctx.fill();
            }}
        }}
    }});
}}

function gameLoop() {{
    update();
    draw();
    requestAnimationFrame(gameLoop);
}}
gameLoop();
'''
    
    with open(f'game{num}.html', 'w', encoding='utf-8') as f:
        f.write(html)
    with open(f'game{num}.js', 'w', encoding='utf-8') as f:
        f.write(js)
    
    if i % 10000 == 0:
        print(f'Generated {i} games...')

print('Done! Generated 1,000,000 games.')

