#!/usr/bin/env python3
games = [
    ("Breakout", "🎯", "Break blocks with a bouncing ball", "breakout"),
    ("Asteroids", "🌌", "Destroy asteroids in space", "asteroids"),
    ("Snake", "🐍", "Classic snake game", "snake"),
    ("Tetris", "🧩", "Stack falling blocks", "tetris"),
    ("Flappy Bird", "🐦", "Fly through obstacles", "flappy"),
    ("2048", "🔢", "Merge numbers to reach 2048", "numbers"),
    ("Brick Breaker", "🧱", "Break all the bricks", "brick"),
    ("Space Invaders", "👾", "Defend Earth from aliens", "invaders"),
    ("Frogger", "🐸", "Cross the road safely", "frogger"),
    ("Bubble Shooter", "🫧", "Pop matching bubbles", "bubble"),
    ("Match 3", "💎", "Match three in a row", "match3"),
    ("Word Search", "🔍", "Find hidden words", "wordsearch"),
    ("Crossword", "📝", "Solve the crossword puzzle", "crossword"),
    ("Sudoku", "9️⃣", "Fill the 9x9 grid", "sudoku"),
    ("Chess", "♟️", "Play chess", "chess"),
    ("Checkers", "⚫", "Play checkers", "checkers2"),
    ("Go", "⚪", "Ancient strategy game", "go"),
    ("Reversi", "🔄", "Flip pieces to win", "reversi"),
    ("Minesweeper", "💣", "Find all mines", "minesweeper"),
    ("Solitaire", "🃏", "Classic card game", "solitaire"),
    ("Blackjack", "🃑", "Beat the dealer", "blackjack"),
    ("Poker", "🎰", "Play poker", "poker"),
    ("Roulette", "🎲", "Spin the wheel", "roulette"),
    ("Slot Machine", "🎰", "Pull the lever", "slot"),
    ("Bingo", "🎯", "Mark your numbers", "bingo"),
    ("Darts", "🎯", "Hit the bullseye", "darts"),
    ("Bowling", "🎳", "Knock down pins", "bowling"),
    ("Golf", "⛳", "Sink the ball", "golf"),
    ("Basketball", "🏀", "Shoot hoops", "basketball"),
    ("Soccer", "⚽", "Score goals", "soccer"),
    ("Baseball", "⚾", "Hit home runs", "baseball"),
    ("Tennis", "🎾", "Win the match", "tennis"),
    ("Ping Pong", "🏓", "Table tennis", "pingpong"),
    ("Pool", "🎱", "Sink all balls", "pool"),
    ("Dodgeball", "🤾", "Dodge the balls", "dodgeball"),
    ("Frisbee", "🥏", "Catch the frisbee", "frisbee"),
    ("Archery", "🏹", "Hit the target", "archery"),
    ("Fishing", "🎣", "Catch fish", "fishing"),
    ("Cooking", "👨‍🍳", "Cook delicious meals", "cooking"),
    ("Platformer", "🦘", "Jump and run", "platformer"),
    ("Runner", "🏃", "Endless runner", "runner"),
    ("Racing", "🏎️", "Race to the finish", "racing2"),
    ("Parking", "🅿️", "Park the car", "parking"),
    ("Flight", "✈️", "Fly the plane", "flight"),
    ("Helicopter", "🚁", "Pilot the helicopter", "helicopter"),
    ("Submarine", "🌊", "Navigate underwater", "submarine"),
    ("Boat", "⛵", "Sail the seas", "boat"),
    ("Train", "🚂", "Drive the train", "train"),
    ("Truck", "🚚", "Deliver cargo", "truck"),
    ("Taxi", "🚕", "Pick up passengers", "taxi"),
    ("Bus", "🚌", "Drive the bus route", "bus"),
    ("Monster", "👹", "Fight monsters", "monster"),
    ("Zombie", "🧟", "Survive the zombies", "zombie"),
    ("Vampire", "🧛", "Defeat vampires", "vampire"),
    ("Ghost", "👻", "Catch the ghosts", "ghost"),
    ("Dragon", "🐉", "Slay the dragon", "dragon"),
    ("Wizard", "🧙", "Cast spells", "wizard"),
    ("Knight", "🛡️", "Fight as a knight", "knight"),
    ("Ninja", "🥷", "Stealth mission", "ninja"),
    ("Pirate", "🏴‍☠️", "Sail the high seas", "pirate"),
    ("Cowboy", "🤠", "Wild west adventure", "cowboy"),
    ("Robot", "🤖", "Control the robot", "robot"),
    ("Alien", "👽", "Invade Earth", "alien"),
    ("UFO", "🛸", "Fly the UFO", "ufo"),
    ("Rocket", "🚀", "Launch to space", "rocket"),
    ("Moon", "🌙", "Land on the moon", "moon"),
    ("Mars", "🔴", "Explore Mars", "mars"),
    ("Star", "⭐", "Collect stars", "star"),
    ("Planet", "🪐", "Explore planets", "planet"),
    ("Galaxy", "🌌", "Travel the galaxy", "galaxy"),
    ("Comet", "☄️", "Catch the comet", "comet"),
    ("Meteor", "☄️", "Avoid meteors", "meteor"),
    ("Treasure", "💎", "Find the treasure", "treasure"),
    ("Coin", "🪙", "Collect coins", "coin"),
    ("Gem", "💠", "Gather gems", "gem"),
    ("Jewel", "💍", "Collect jewels", "jewel"),
    ("Diamond", "💎", "Mine diamonds", "diamond"),
    ("Gold", "🥇", "Collect gold", "gold"),
    ("Silver", "🥈", "Gather silver", "silver"),
    ("Bronze", "🥉", "Find bronze", "bronze"),
    ("Medal", "🏅", "Win medals", "medal"),
    ("Trophy", "🏆", "Earn trophies", "trophy"),
    ("Crown", "👑", "Wear the crown", "crown"),
    ("Castle", "🏰", "Defend the castle", "castle"),
    ("Tower", "🗼", "Build the tower", "tower"),
    ("Bridge", "🌉", "Cross the bridge", "bridge"),
    ("Mountain", "⛰️", "Climb the mountain", "mountain"),
    ("Forest", "🌲", "Explore the forest", "forest"),
    ("Desert", "🏜️", "Cross the desert", "desert"),
    ("Island", "🏝️", "Survive the island", "island"),
    ("Beach", "🏖️", "Relax on the beach", "beach"),
    ("Ocean", "🌊", "Dive into the ocean", "ocean"),
    ("River", "🌊", "Navigate the river", "river"),
    ("Lake", "🏞️", "Explore the lake", "lake"),
    ("Waterfall", "🌊", "Climb the waterfall", "waterfall"),
    ("Volcano", "🌋", "Escape the volcano", "volcano"),
    ("Cave", "🕳️", "Explore the cave", "cave"),
    ("Crystal", "🔮", "Collect crystals", "crystal"),
    ("Magic", "✨", "Use magic powers", "magic"),
    ("Fairy", "🧚", "Help the fairy", "fairy"),
    ("Unicorn", "🦄", "Ride the unicorn", "unicorn"),
    ("Rainbow", "🌈", "Follow the rainbow", "rainbow"),
]

for i, (name, icon, desc, slug) in enumerate(games, 2):
    num = f"{i:02d}"
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
        <h2>{icon} {name}</h2>
        <p>{desc}</p>
        <p>Score: <span id="score">0</span></p>
    </div>
    <script src="game{num}.js"></script>
</body>
</html>'''
    
    js = f'''const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let gameState = 'playing';

function update() {{
    if (gameState !== 'playing') return;
    // Game logic here
    requestAnimationFrame(update);
}}

function draw() {{
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('{name} Game', canvas.width/2, canvas.height/2);
    ctx.fillText('Click to play!', canvas.width/2, canvas.height/2 + 40);
}}

canvas.addEventListener('click', () => {{
    score++;
    document.getElementById('score').textContent = score;
    draw();
}});

draw();
update();
'''
    
    with open(f'game{num}.html', 'w', encoding='utf-8') as f:
        f.write(html)
    with open(f'game{num}.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print(f'Created game{num}.html and game{num}.js')

