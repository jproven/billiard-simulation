// DOM
const board = document.querySelector('#board')
const startBtn = document.querySelector('#startBtn')

// CONFIG
const PLAY_AREA = {
    top: 60,
    bottom: 55,
    left: 75,
    right: 70
}
const BALL_SIZE = 30

// STATE
let balls = []

// EVENTS
startBtn.addEventListener('click', startGame)

// LOOP
setInterval(moveBalls, 20)

// FUNCTIONS
function startGame() {
    const ball = document.createElement('div')
    ball.classList.add('ball')

    // Apply dynamic size from JS
    ball.style.width = BALL_SIZE + "px"
    ball.style.height = BALL_SIZE + "px"

    // Spawn inside real playable area (asymmetric margins)
    const x = PLAY_AREA.left + Math.random() * (
        board.clientWidth - BALL_SIZE - PLAY_AREA.left - PLAY_AREA.right
    )

    const y = PLAY_AREA.top + Math.random() * (
        board.clientHeight - BALL_SIZE - PLAY_AREA.top - PLAY_AREA.bottom
    )

    const velocityX = (Math.random() * 4 - 2) * 2
    const velocityY = (Math.random() * 4 - 2) * 2

    const ballObject = {
        element: ball,
        x: x,
        y: y,
        velocityX: velocityX,
        velocityY: velocityY
    }

    ball.style.left = x + "px"
    ball.style.top = y + "px"

    board.appendChild(ball)
    balls.push(ballObject)
}

function moveBalls() {
    balls.forEach(ball => {

        // Update position
        ball.x += ball.velocityX
        ball.y += ball.velocityY

        const maxX = board.clientWidth - BALL_SIZE - PLAY_AREA.right
        const maxY = board.clientHeight - BALL_SIZE - PLAY_AREA.bottom

        // LEFT COLLISION
        if (ball.x <= PLAY_AREA.left) {
            ball.x = PLAY_AREA.left
            ball.velocityX *= -1
        }

        // RIGHT COLLISION
        if (ball.x >= maxX) {
            ball.x = maxX
            ball.velocityX *= -1
        }

        // TOP COLLISION
        if (ball.y <= PLAY_AREA.top) {
            ball.y = PLAY_AREA.top
            ball.velocityY *= -1
        }

        // BOTTOM COLLISION
        if (ball.y >= maxY) {
            ball.y = maxY
            ball.velocityY *= -1
        }

        // Render
        ball.element.style.left = ball.x + "px"
        ball.element.style.top = ball.y + "px"
    })
}