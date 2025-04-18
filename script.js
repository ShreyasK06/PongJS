// Theme switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply the saved theme or device preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');

        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            applyThemeToGame('light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            applyThemeToGame('dark');
        }

        // Add transition effect to body
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 1000);
    });

    // Apply theme to game elements
    function applyThemeToGame(theme) {
        // This will be called after the game is initialized
        if (typeof Pong !== 'undefined') {
            // Update game colors based on theme
            if (theme === 'dark') {
                Pong.color = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim();
            } else {
                Pong.color = 'black';
            }

            // Redraw the game with new colors
            if (Pong.context) {
                Pong.draw();
            }
        }
    }

    // Apply theme to game on initial load
    setTimeout(() => {
        applyThemeToGame(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    }, 500);

    // Add animation to the game title
    const gameTitle = document.querySelector('h1');
    if (gameTitle) {
        gameTitle.addEventListener('mouseover', () => {
            gameTitle.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                gameTitle.style.animation = 'pulse 2s infinite alternate';
            }, 500);
        });
    }
});

// Game controls functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game control buttons
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const modeBtn = document.getElementById('modeBtn');
    const difficultyBtn = document.getElementById('difficultyBtn');

    // Game state variables
    let isPaused = false;
    let isTwoPlayerMode = false;
    let difficultyLevel = 'normal'; // 'easy', 'normal', 'hard'

    // Wait for the game to be initialized
    const gameControlsInit = setInterval(() => {
        if (typeof Pong !== 'undefined' && Pong.running) {
            clearInterval(gameControlsInit);
            initializeGameControls();
        }
    }, 100);

    function initializeGameControls() {
        // Pause/Resume button
        pauseBtn.addEventListener('click', () => {
            if (!Pong.running) return; // Don't do anything if game hasn't started

            isPaused = !isPaused;

            if (isPaused) {
                // Pause the game
                Pong.paused = true;
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                pauseBtn.classList.add('resume');
            } else {
                // Resume the game
                Pong.paused = false;
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                pauseBtn.classList.remove('resume');
                // Restart animation loop if it was paused
                if (!Pong.over) requestAnimationFrame(Pong.loop);
            }
        });

        // Restart button
        restartBtn.addEventListener('click', () => {
            // Reset game state
            isPaused = false;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            pauseBtn.classList.remove('resume');

            // Reset and restart the game
            Pong = Object.assign({}, Game);
            Pong.initialize();

            // Apply current game mode and difficulty
            updateGameMode();
            updateDifficulty();

            // Start the game immediately
            Pong.running = true;
            Pong.paused = false;
            requestAnimationFrame(Pong.loop);
        });

        // Game mode toggle (1P vs 2P)
        modeBtn.addEventListener('click', () => {
            isTwoPlayerMode = !isTwoPlayerMode;

            if (isTwoPlayerMode) {
                modeBtn.innerHTML = '<i class="fas fa-users"></i> 2P Mode';
                modeBtn.classList.add('two-player');
                difficultyBtn.disabled = true;
                difficultyBtn.style.opacity = '0.5';
            } else {
                modeBtn.innerHTML = '<i class="fas fa-user"></i> 1P Mode';
                modeBtn.classList.remove('two-player');
                difficultyBtn.disabled = false;
                difficultyBtn.style.opacity = '1';
            }

            updateGameMode();
        });

        // Difficulty toggle
        difficultyBtn.addEventListener('click', () => {
            // Cycle through difficulty levels: easy -> normal -> hard -> easy
            if (difficultyLevel === 'easy') {
                difficultyLevel = 'normal';
                difficultyBtn.innerHTML = '<i class="fas fa-sliders-h"></i> Normal';
                difficultyBtn.classList.remove('easy');
            } else if (difficultyLevel === 'normal') {
                difficultyLevel = 'hard';
                difficultyBtn.innerHTML = '<i class="fas fa-fire"></i> Hard';
                difficultyBtn.classList.add('hard');
            } else {
                difficultyLevel = 'easy';
                difficultyBtn.innerHTML = '<i class="fas fa-feather"></i> Easy';
                difficultyBtn.classList.remove('hard');
                difficultyBtn.classList.add('easy');
            }

            updateDifficulty();
        });

        // Add the paused property to Pong object
        Pong.paused = false;

        // Store original update and loop functions
        const originalUpdate = Pong.update;
        const originalLoop = Pong.loop;

        // Override the update function to respect pause state
        Pong.update = function () {
            // Only update game state if not paused
            if (!this.paused) {
                originalUpdate.call(this);
            }
        };

        // Override the loop function to continue drawing even when paused
        Pong.loop = function () {
            // Always update visuals, but game logic only updates if not paused
            Pong.update();
            Pong.draw();

            // If the game is not over, draw the next frame
            if (!Pong.over) requestAnimationFrame(Pong.loop);
        };
    }

    // Update game mode (1P vs 2P)
    function updateGameMode() {
        if (!Pong) return;

        if (isTwoPlayerMode) {
            // Store the original update function if not already stored
            if (!window.originalGameUpdate) {
                window.originalGameUpdate = Game.update;
            }

            // Override AI movement to be controlled by player 2
            Pong.update = function () {
                // Skip updates if paused
                if (this.paused) return;
                if (!this.over) {
                    // Ball boundary checks and movement (unchanged)
                    if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
                    if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
                    if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
                    if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

                    // Player 1 movement
                    if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
                    else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

                    // Player 2 movement (right paddle)
                    if (this.ai.move === DIRECTION.UP) this.ai.y -= this.ai.speed;
                    else if (this.ai.move === DIRECTION.DOWN) this.ai.y += this.ai.speed;

                    // Ball movement and serve logic (unchanged)
                    if (Pong._turnDelayIsOver.call(this) && this.turn) {
                        this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                        this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                        this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                        this.turn = null;
                    }

                    // Player boundary checks
                    if (this.player.y <= 0) this.player.y = 0;
                    else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

                    // AI/Player 2 boundary checks
                    if (this.ai.y <= 0) this.ai.y = 0;
                    else if (this.ai.y >= (this.canvas.height - this.ai.height)) this.ai.y = (this.canvas.height - this.ai.height);

                    // Ball movement
                    if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
                    else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
                    if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
                    else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

                    // Collision detection (unchanged)
                    // Player-Ball collisions
                    if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                        if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                            this.ball.x = (this.player.x + this.ball.width);
                            this.ball.moveX = DIRECTION.RIGHT;
                        }
                    }

                    // AI/Player 2-Ball collisions
                    if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                        if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                            this.ball.x = (this.ai.x - this.ball.width);
                            this.ball.moveX = DIRECTION.LEFT;
                        }
                    }
                }

                // Handle scoring and round transitions (unchanged)
                if (this.player.score === rounds[this.round]) {
                    if (!rounds[this.round + 1]) {
                        this.over = true;
                        setTimeout(function () { Pong.endGameMenu('Player 1 Wins!'); }, 1000);
                    } else {
                        this.color = this._generateRoundColor();
                        this.player.score = this.ai.score = 0;
                        this.player.speed += 0.5;
                        this.ai.speed += 1;
                        this.ball.speed += 1;
                        this.round += 1;
                    }
                } else if (this.ai.score === rounds[this.round]) {
                    this.over = true;
                    setTimeout(function () { Pong.endGameMenu('Player 2 Wins!'); }, 1000);
                }
            };

            // Add keyboard controls for Player 2
            document.addEventListener('keydown', function (key) {
                // Player 2 controls (up/down arrows)
                if (key.key === 'ArrowUp') Pong.ai.move = DIRECTION.UP;
                if (key.key === 'ArrowDown') Pong.ai.move = DIRECTION.DOWN;
            });

            document.addEventListener('keyup', function (key) {
                // Player 2 stop moving on key release
                if ((key.key === 'ArrowUp' || key.key === 'ArrowDown') &&
                    Pong.ai.move !== DIRECTION.IDLE) {
                    Pong.ai.move = DIRECTION.IDLE;
                }
            });
        } else {
            // Restore original AI behavior using the stored original update function
            Pong.update = window.originalGameUpdate || Game.update;

            // Remove Player 2 keyboard controls
            document.removeEventListener('keydown', function (key) {
                if (key.key === 'ArrowUp') Pong.ai.move = DIRECTION.UP;
                if (key.key === 'ArrowDown') Pong.ai.move = DIRECTION.DOWN;
            });

            document.removeEventListener('keyup', function (key) {
                if ((key.key === 'ArrowUp' || key.key === 'ArrowDown') &&
                    Pong.ai.move !== DIRECTION.IDLE) {
                    Pong.ai.move = DIRECTION.IDLE;
                }
            });

            // Apply current difficulty
            updateDifficulty();
        }
    }

    // Update AI difficulty
    function updateDifficulty() {
        if (!Pong || isTwoPlayerMode) return;

        // Adjust AI speed based on difficulty
        switch (difficultyLevel) {
            case 'easy':
                Pong.ai.speed = 3;
                break;
            case 'normal':
                Pong.ai.speed = 5;
                break;
            case 'hard':
                Pong.ai.speed = 8;
                break;
        }
    }
});

// Modify the game's draw function to use CSS variables for colors
// This will be executed after index.js loads and initializes the game
window.addEventListener('load', () => {
    if (typeof Pong !== 'undefined' && Pong.draw) {
        // Store the original draw function
        const originalDraw = Pong.draw;

        // Override the draw function to use theme colors
        Pong.draw = function () {
            // Call the original draw function
            originalDraw.call(this);

            // Apply additional styling or animations to game elements
            // This runs on every frame, so keep it lightweight

            // Add a subtle glow to the ball when it's moving
            if (this.ball && this._turnDelayIsOver.call(this)) {
                const ctx = this.context;
                const ballX = this.ball.x + this.ball.width / 2;
                const ballY = this.ball.y + this.ball.height / 2;

                // Create a radial gradient for the glow effect
                const gradient = ctx.createRadialGradient(
                    ballX, ballY, 0,
                    ballX, ballY, 30
                );

                // Add color stops to the gradient
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                // Draw the glow
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(ballX, ballY, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }

            // Draw pause overlay if game is paused
            if (this.paused) {
                const ctx = this.context;

                // Semi-transparent overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // Pause text with glow effect
                ctx.shadowColor = 'rgba(52, 152, 219, 0.8)';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#ffffff';
                ctx.font = '70px Poppins';
                ctx.textAlign = 'center';
                ctx.fillText('GAME PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 30);

                // Instructions
                ctx.shadowBlur = 5;
                ctx.font = '30px Poppins';
                ctx.fillText('Click the Pause button to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);

                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }
        };
    }
});
