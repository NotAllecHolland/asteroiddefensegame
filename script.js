// Game constants and variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const titleScreen = document.getElementById('title-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreValue = document.getElementById('score-value');
const finalScore = document.getElementById('final-score');
const levelValue = document.getElementById('level-value');
const healthBar = document.getElementById('health-bar');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Game state
let gameRunning = false;
let score = 0;
let level = 1;
let earthHealth = 100;
let lastAsteroidTime = 0;
let asteroidInterval = 1500; // milliseconds
let lastLaserTime = 0;
let laserCooldown = 300; // milliseconds

// Game objects
let spaceship = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 15,
    angle: -Math.PI / 2, // Pointing up
    rotationSpeed: 0.1
};

let lasers = [];
let asteroids = [];
let explosions = [];

// Control states
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// Game assets
const images = {
    spaceship: new Image(),
    asteroid: new Image(),
    earth: new Image(),
    background: new Image()
};

// Audio elements
const sounds = {
    laser: new Audio(),
    explosion: new Audio(),
    gameOver: new Audio(),
    background: new Audio()
};

// Load assets
function loadAssets() {
    // Use placeholder images (in a real project you'd load actual images)
    images.spaceship.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwY2NmZiIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDY2ZmYiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBvbHlnb24gcG9pbnRzPSIxNSwwIDMwLDMwIDE1LDIyIDAsMzAiIGZpbGw9InVybCgjZ3JhZCkiIHN0cm9rZT0iIzAwZmZmZiIgc3Ryb2tlLXdpZHRoPSIxIiAvPjwvc3ZnPg==';
    images.asteroid.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjAiIGZpbGw9IiM4ODg4ODgiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIzIiAvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjUiIGZpbGw9IiM1NTU1NTUiIC8+PGNpcmNsZSBjeD0iMjciIGN5PSIzMiIgcj0iNiIgZmlsbD0iIzY2NjY2NiIgLz48Y2lyY2xlIGN4PSIzNSIgY3k9IjE4IiByPSI0IiBmaWxsPSIjNzc3Nzc3IiAvPjwvc3ZnPg==';
    images.earth.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImVhcnRoR3JhZCIgY3g9IjAuNSIgY3k9IjAuNSIgcj0iMC41Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwMDg4ZmYiLz48c3RvcCBvZmZzZXQ9IjAuNiIgc3RvcC1jb2xvcj0iIzAwNjZjYyIvPjxzdG9wIG9mZnNldD0iMC44IiBzdG9wLWNvbG9yPSIjMDA0NDk5Ii8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEwMCIgcng9IjEwMCIgcnk9IjUwIiBmaWxsPSJ1cmwoI2VhcnRoR3JhZCkiLz48cGF0aCBkPSJNNTAsMTAwIFE3NSwgODAgMTAwLDkwIFExMjUsIDc1IDE1MCw4NSBRMTcwLCA5MCAxODAsODUiIHN0cm9rZT0iIzAwYWEwMCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTMwLDk1IFE1MCwgODUgNzAsOTIgUTkwLCA4MCAxMTAsODggUTEzMCwgOTUgMTUwLDg1IFExNzAsIDc1IDE5MCw5MCIgc3Ryb2tlPSIjMDBjYzAwIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
    images.background.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzA4MGIxZiIvPjwvc3ZnPg==';
    
    // Configure sounds (using short base64 encoded sounds would be better but omitting for brevity)
    sounds.laser.volume = 0.3;
    sounds.explosion.volume = 0.4;
    sounds.gameOver.volume = 0.5;
    sounds.background.volume = 0.2;
    sounds.background.loop = true;
}

// Initialize stars for background
const stars = [];
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.3 + 0.1
        });
    }
}

// Event listeners
function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
        if (e.code === 'ArrowRight') keys.ArrowRight = true;
        if (e.code === 'Space') keys.Space = true;
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
        if (e.code === 'ArrowRight') keys.ArrowRight = false;
        if (e.code === 'Space') keys.Space = false;
    });
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = document.getElementById('game-container');
    // Maintain aspect ratio
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    spaceship.x = canvas.width / 2;
    spaceship.y = canvas.height - 50;
}

// Game logic functions
function startGame() {
    titleScreen.classList.add('hide');
    resetGame();
    gameRunning = true;
    sounds.background.play().catch(e => console.log("Audio play failed:", e));
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameOverScreen.classList.add('hide');
    resetGame();
    gameRunning = true;
    sounds.background.play().catch(e => console.log("Audio play failed:", e));
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    score = 0;
    level = 1;
    earthHealth = 100;
    lasers = [];
    asteroids = [];
    explosions = [];
    lastAsteroidTime = 0;
    asteroidInterval = 1500;
    
    // Reset UI
    scoreValue.textContent = score;
    levelValue.textContent = level;
    healthBar.style.width = '100%';
    
    // Reset spaceship
    spaceship.x = canvas.width / 2;
    spaceship.y = canvas.height - 50;
    spaceship.angle = -Math.PI / 2;
}

function gameOver() {
    gameRunning = false;
    sounds.gameOver.play().catch(e => console.log("Audio play failed:", e));
    sounds.background.pause();
    sounds.background.currentTime = 0;
    
    finalScore.textContent = score;
    gameOverScreen.classList.remove('hide');
}

// Update functions
function updateSpaceship(deltaTime) {
    // Update rotation
    if (keys.ArrowLeft) spaceship.angle -= spaceship.rotationSpeed;
    if (keys.ArrowRight) spaceship.angle += spaceship.rotationSpeed;
    
    // Fire laser with cooldown
    const currentTime = Date.now();
    if (keys.Space && currentTime - lastLaserTime > laserCooldown) {
        const laserVelocity = 8;
        lasers.push({
            x: spaceship.x,
            y: spaceship.y,
            vx: Math.cos(spaceship.angle) * laserVelocity,
            vy: Math.sin(spaceship.angle) * laserVelocity,
            width: 4,
            height: 10,
            angle: spaceship.angle
        });
        
        lastLaserTime = currentTime;
        sounds.laser.cloneNode().play().catch(e => console.log("Audio play failed:", e));
    }
}

function updateLasers() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        
        // Move laser
        laser.x += laser.vx;
        laser.y += laser.vy;
        
        // Remove if off-screen
        if (laser.x < 0 || laser.x > canvas.width || 
            laser.y < 0 || laser.y > canvas.height) {
            lasers.splice(i, 1);
        }
    }
}

function spawnAsteroid() {
    const currentTime = Date.now();
    
    // Check if it's time to spawn a new asteroid
    if (currentTime - lastAsteroidTime > asteroidInterval) {
        const size = Math.random() * 20 + 20; // Random size between 20-40
        
        asteroids.push({
            x: Math.random() * canvas.width,
            y: -size,
            radius: size / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 1 + level * 0.2, // Increase speed with level
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.05
        });
        
        lastAsteroidTime = currentTime;
        
        // Adjust spawn rate based on level
        asteroidInterval = Math.max(1500 - level * 100, 500);
    }
}

function updateAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        
        // Move asteroid
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Bounce off screen edges (X only)
        if (asteroid.x - asteroid.radius < 0 || asteroid.x + asteroid.radius > canvas.width) {
            asteroid.vx *= -1;
        }
        
        // Check if asteroid hit Earth
        if (asteroid.y - asteroid.radius > canvas.height) {
            earthHealth -= 10;
            healthBar.style.width = `${earthHealth}%`;
            
            if (earthHealth <= 0) {
                gameOver();
            }
            
            asteroids.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Check laser-asteroid collisions
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            
            // Simple distance-based collision detection
            const dx = laser.x - asteroid.x;
            const dy = laser.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < asteroid.radius + 5) {
                // Create explosion
                explosions.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    radius: asteroid.radius,
                    maxRadius: asteroid.radius * 1.5,
                    life: 1.0, // 100%
                    decay: 0.05
                });
                
                // Play explosion sound
                sounds.explosion.cloneNode().play().catch(e => console.log("Audio play failed:", e));
                
                // Update score
                score += 10 * Math.round(asteroid.radius / 5);
                scoreValue.textContent = score;
                
                // Level up every 500 points
                if (Math.floor(score / 500) + 1 > level) {
                    level = Math.floor(score / 500) + 1;
                    levelValue.textContent = level;
                }
                
                // Remove laser and asteroid
                lasers.splice(i, 1);
                asteroids.splice(j, 1);
                break;
            }
        }
    }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        
        // Reduce life of explosion
        explosion.life -= explosion.decay;
        
        // Remove if dead
        if (explosion.life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

function updateStars() {
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

// Drawing functions
function drawBackground() {
    // Draw space background
    ctx.fillStyle = '#080b1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#fff';
    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEarth() {
    // Draw Earth at the bottom of the canvas
    ctx.drawImage(
        images.earth, 
        canvas.width / 2 - 100, 
        canvas.height - 25, 
        200, 
        100
    );
}

function drawSpaceship() {
    ctx.save();
    ctx.translate(spaceship.x, spaceship.y);
    ctx.rotate(spaceship.angle);
    ctx.drawImage(
        images.spaceship, 
        -spaceship.radius, 
        -spaceship.radius, 
        spaceship.radius * 2, 
        spaceship.radius * 2
    );
    ctx.restore();
}

function drawLasers() {
    ctx.fillStyle = '#f00';
    
    for (let laser of lasers) {
        ctx.save();
        ctx.translate(laser.x, laser.y);
        ctx.rotate(laser.angle);
        ctx.fillRect(-laser.width / 2, -laser.height / 2, laser.width, laser.height);
        
        // Add glow effect
        ctx.shadowColor = '#f88';
        ctx.shadowBlur = 10;
        ctx.fillRect(-laser.width / 2, -laser.height / 2, laser.width, laser.height);
        
        ctx.restore();
    }
}

function drawAsteroids() {
    for (let asteroid of asteroids) {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        ctx.drawImage(
            images.asteroid, 
            -asteroid.radius, 
            -asteroid.radius, 
            asteroid.radius * 2, 
            asteroid.radius * 2
        );
        ctx.restore();
    }
}

function drawExplosions() {
    for (let explosion of explosions) {
        const gradient = ctx.createRadialGradient(
            explosion.x, explosion.y, 0,
            explosion.x, explosion.y, explosion.radius * explosion.life
        );
        
        // Inner color - white/yellow
        gradient.addColorStop(0, `rgba(255, 255, 200, ${explosion.life})`);
        // Middle color - orange
        gradient.addColorStop(0.4, `rgba(255, 100, 0, ${explosion.life})`);
        // Outer color - red
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius * explosion.life * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Main game loop
let lastTime = 0;
function gameLoop(timestamp) {
    // Calculate delta time for smooth animations
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    updateStars();
    
    // Draw Earth
    drawEarth();
    
    if (gameRunning) {
        // Update game objects
        updateSpaceship(deltaTime);
        updateLasers();
        spawnAsteroid();
        updateAsteroids();
        checkCollisions();
        updateExplosions();
        
        // Draw game objects
        drawSpaceship();
        drawLasers();
        drawAsteroids();
        drawExplosions();
        
        // Request next frame
        requestAnimationFrame(gameLoop);
    }
}

// Initialize game
function init() {
    loadAssets();
    initStars();
    setupEventListeners();
    
    // Start with title screen
    titleScreen.classList.remove('hide');
    gameOverScreen.classList.add('hide');
}

// Start initialization when the page loads
window.onload = init;