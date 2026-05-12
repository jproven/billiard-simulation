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
const BALL_RADIUS = BALL_SIZE / 2

// STATE
let balls = []

// EVENTS
startBtn.addEventListener('click', startGame)

// LOOP
setInterval(() => {
    moveBalls()
    checkBallCollisions()
    renderBalls()
}, 20)

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
    })
}

function checkBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {

            const ballA = balls[i]
            const ballB = balls[j]

            const dx = ballB.x - ballA.x
            const dy = ballB.y - ballA.y

            const distance = Math.sqrt(dx * dx + dy * dy)

            const minDistance = BALL_RADIUS + BALL_RADIUS

            if (distance < minDistance) {

                // Prevent division by 0
                const angle = Math.atan2(dy, dx)

                const overlap = minDistance - distance

                // Separate balls
                ballA.x -= Math.cos(angle) * overlap / 2
                ballA.y -= Math.sin(angle) * overlap / 2

                ballB.x += Math.cos(angle) * overlap / 2
                ballB.y += Math.sin(angle) * overlap / 2

                // Swap velocities (arcade physics)
                const tempVx = ballA.velocityX
                const tempVy = ballA.velocityY

                ballA.velocityX = ballB.velocityX
                ballA.velocityY = ballB.velocityY

                ballB.velocityX = tempVx
                ballB.velocityY = tempVy
            }
        }
    }
}

function renderBalls() {
    balls.forEach(ball => {
        ball.element.style.left = ball.x + "px"
        ball.element.style.top = ball.y + "px"
    })
}