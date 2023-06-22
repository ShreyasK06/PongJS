const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#score");
const resetBtn = document.querySelector("#resetBtn");
const mode = document.querySelector("#mode");
const gameType = document.getElementById("gameType");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = "black";
const blueColor = "blue";
const redColor = "red";
const paddleBorder = "black";
const ballColor = "white";
const ballBorderColor = "black";
const ballRadius = 12.5;
const paddleSpeed = 10;
let twoPlayerGame = true;
let aiGameEasy = false;
let intervalID;
let ballSpeed;
let ballX = gameWidth / 2;
let ballY = gameHeight / 2;
let ballXDirection = 0;
let ballYDirection = 0;
let bScore = 0;
let rScore = 0;
let blue = {
    width: 25,
    height: 100,
    x: 0,
    y: 0
};
let red = {
    width: 25,
    height: 100,
    x: gameWidth - 25,
    y: gameHeight - 100
};

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
mode.addEventListener("click", switchGameMode);


gameStart();


function gameStart() {
    gameType.innerText = "TWO PLAYER GAME";
    createBall();
    nextTick();
};

function switchGameMode() {
    if (twoPlayerGame) {
        twoPlayerGame = false;
        aiGameEasy = true;
        gameType.innerText = "PLAYING AGAINST AI";
        console.log(gameType.innerText);

    } else if (aiGameEasy) {
        aiGameEasy = false;
        twoPlayerGame = true;
        gameType.innerText = "TWO PLAYER GAME";
        console.log(gameType.innerText);
    }
}

function nextTick() {
    intervalID = setTimeout(() => {
        clearBoard();
        drawPaddles();
        moveBall();
        drawBall(ballX, ballY);
        checkCollision();
        aiMove();
        nextTick();
    }, 10)
};
function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
};
function drawPaddles() {
    ctx.strokeStyle = paddleBorder;

    ctx.fillStyle = blueColor;
    ctx.fillRect(blue.x, blue.y, blue.width, blue.height);
    ctx.strokeRect(blue.x, blue.y, blue.width, blue.height);

    ctx.fillStyle = redColor;
    ctx.fillRect(red.x, red.y, red.width, red.height);
    ctx.strokeRect(red.x, red.y, red.width, red.height);
};
function createBall() {
    ballSpeed = 1;
    if (Math.round(Math.random()) == 1) {
        ballXDirection = 1;
    }
    else {
        ballXDirection = -1;
    }
    if (Math.round(Math.random()) == 1) {
        ballYDirection = Math.random() * 1; //more random directions
    }
    else {
        ballYDirection = Math.random() * -1; //more random directions
    }
    ballX = gameWidth / 2;
    ballY = gameHeight / 2;
    drawBall(ballX, ballY);
};
function moveBall() {
    ballX += (ballSpeed * ballXDirection);
    ballY += (ballSpeed * ballYDirection);
};
function drawBall(ballX, ballY) {
    ctx.fillStyle = ballColor;
    ctx.strokeStyle = ballBorderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
};
function checkCollision() {
    if (ballY <= 0 + ballRadius) {
        ballYDirection *= -1;
    }
    if (ballY >= gameHeight - ballRadius) {
        ballYDirection *= -1;
    }
    if (ballX <= 0) {
        bScore++;
        updateScore();
        createBall();
        return;
    }
    if (ballX >= gameWidth) {
        rScore++;
        updateScore();
        createBall();
        return;
    }
    if (ballX <= (blue.x + blue.width + ballRadius)) {
        if (ballY > blue.y && ballY < blue.y + blue.height) {
            ballX = (blue.x + blue.width) + ballRadius;
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
    if (ballX >= (red.x - ballRadius)) {
        if (ballY > red.y && ballY < red.y + red.height) {
            ballX = red.x - ballRadius;
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
};
function changeDirection(event) {
    console.log(twoPlayerGame);
    const keyPressed = event.keyCode;
    const blueUp = 87;
    const blueDown = 83;
    const redUp = 38;
    const redDown = 40;
    const reset = 82;

    switch (keyPressed) {
        case (blueUp):
            event.preventDefault();
            if (blue.y > 0) {
                blue.y -= paddleSpeed;
            }
            break;
        case (blueDown):
            event.preventDefault();
            if (blue.y < gameHeight - blue.height) {
                blue.y += paddleSpeed;
            }
            break;
        case (twoPlayerGame):
            if (redUp) {
                console.log("redUp");
                event.preventDefault();
                if (red.y > 0) {
                    red.y -= paddleSpeed;
                }
            } else if (redDown) {
                event.preventDefault();
                if (red.y < gameHeight - red.height) {
                    red.y += paddleSpeed;
                }
            }
            break;
        case (reset):
            resetGame();
            break;
    }
}
function updateScore() {
    scoreText.textContent = `${rScore} : ${bScore}`;
};

function aiMove() {
    if (aiGameEasy) {
        while (red.y < ballY) {
            red.y++;
        } while (red.y > ballY) {
            red.y--;
        }
    }
}

function resetGame() {
    bScore = 0;
    rScore = 0;
    blue = {
        width: 25,
        height: 100,
        x: 0,
        y: 0
    };
    red = {
        width: 25,
        height: 100,
        x: gameWidth - 25,
        y: gameHeight - 100
    };
    ballSpeed = 1;
    ballX = 0;
    ballY = 0;
    ballXDirection = 0;
    ballYDirection = 0;
    updateScore();
    clearInterval(intervalID);
    gameStart();
};