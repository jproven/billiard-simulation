// DOM
const board = document.querySelector('#board')
const startBtn = document.querySelector('#startBtn')
const aimLine = document.querySelector('#aimLine')

// CONFIG
const PLAY_AREA = {
    top: 60,
    bottom: 55,
    left: 75,
    right: 70
}

const POCKET_RADIUS = 32

const pockets = [
    // Top left
    {
        x: PLAY_AREA.left,
        y: PLAY_AREA.top
    },

    // Top middle
    {
        x: board.clientWidth / 2,
        y: PLAY_AREA.top - 5
    },

    // Top right
    {
        x: board.clientWidth - PLAY_AREA.right,
        y: PLAY_AREA.top
    },

    // Bottom left
    {
        x: PLAY_AREA.left,
        y: board.clientHeight - PLAY_AREA.bottom
    },

    // Bottom middle
    {
        x: board.clientWidth / 2,
        y: board.clientHeight - PLAY_AREA.bottom + 5
    },

    // Bottom right
    {
        x: board.clientWidth - PLAY_AREA.right,
        y: board.clientHeight - PLAY_AREA.bottom
    }
]

const BALL_SIZE = 30
const BALL_RADIUS = BALL_SIZE / 2
const FRICTION = 0.985
const MIN_VELOCITY = 0.05

// STATE
let balls = []
let aiming = false
let aimStart = null
let aimEnd = null

// EVENTS
startBtn.addEventListener('click', startGame)

board.addEventListener('mousedown', (e) => {
    aiming = true
    aimStart = { x: e.offsetX, y: e.offsetY }
})

board.addEventListener('mousemove', (e) => {
    if (!aiming) return

    aimEnd = { x: e.offsetX, y: e.offsetY }

    const cue = balls.find(b => b.isCue)
    if (!cue) return

    const startX = cue.x + BALL_RADIUS
    const startY = cue.y + BALL_RADIUS

    const dx = aimEnd.x - startX
    const dy = aimEnd.y - startY

    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    aimLine.style.display = 'block'
    aimLine.style.width = length + 'px'
    aimLine.style.left = startX + 'px'
    aimLine.style.top = startY + 'px'
    aimLine.style.transform = `rotate(${angle}rad)`
})

board.addEventListener('mouseup', () => {
    if (!aiming) return
    aiming = false

    shootCueBall()
    
    aimLine.style.display = 'none'
    aimStart = null
    aimEnd = null
})

// LOOP
function gameLoop() {
    moveBalls()
    checkBallCollisions()
    checkPocketCollisions()
    renderBalls()
    requestAnimationFrame(gameLoop)
}
gameLoop()

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
        velocityY: velocityY,
        isCue: balls.length === 0
    }

    ball.style.left = x + "px"
    ball.style.top = y + "px"

    board.appendChild(ball)
    balls.push(ballObject)
}

function shootCueBall() {
    const cue = balls.find(b => b.isCue)
    if (!cue || !aimStart || !aimEnd) return

    const dx = aimStart.x - aimEnd.x
    const dy = aimStart.y - aimEnd.y

    const power = 0.2

    cue.velocityX = dx * power
    cue.velocityY = dy * power
}

function moveBalls() {
    balls.forEach(ball => {

        // Update position
        ball.x += ball.velocityX
        ball.y += ball.velocityY

        ball.velocityX *= FRICTION
        ball.velocityY *= FRICTION

        if (Math.abs(ball.velocityX) < MIN_VELOCITY) {
            ball.velocityX = 0
        }

        if (Math.abs(ball.velocityY) < MIN_VELOCITY) {
            ball.velocityY = 0
        }

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

            // Centers
            const ax = ballA.x + BALL_RADIUS
            const ay = ballA.y + BALL_RADIUS

            const bx = ballB.x + BALL_RADIUS
            const by = ballB.y + BALL_RADIUS

            // Distance between centers
            const dx = bx - ax
            const dy = by - ay

            const distance = Math.sqrt(dx * dx + dy * dy)

            const minDistance = BALL_SIZE

            // COLLISION
            if (distance < minDistance) {

                // Normal vector
                const nx = dx / distance
                const ny = dy / distance

                // ---------- SEPARATE BALLS ----------

                const overlap = minDistance - distance

                ballA.x -= nx * overlap / 2
                ballA.y -= ny * overlap / 2

                ballB.x += nx * overlap / 2
                ballB.y += ny * overlap / 2

                // ---------- ELASTIC COLLISION ----------

                // Relative velocity (IMPORTANT: correct order)
                const rvx = ballB.velocityX - ballA.velocityX
                const rvy = ballB.velocityY - ballA.velocityY

                // Velocity along normal
                const velocityAlongNormal = rvx * nx + rvy * ny

                // Ignore if separating
                if (velocityAlongNormal > 0) continue

                // Elasticity
                const restitution = 0.95

                // Impulse
                const impulse = -(1 + restitution) * velocityAlongNormal / 2

                const impulseX = impulse * nx
                const impulseY = impulse * ny

                // Apply impulse
                ballA.velocityX -= impulseX
                ballA.velocityY -= impulseY

                ballB.velocityX += impulseX
                ballB.velocityY += impulseY
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

function checkPocketCollisions() {
    for (let i = balls.length - 1; i >= 0; i--) {

        const ball = balls[i]

        const ballCenterX = ball.x + BALL_RADIUS
        const ballCenterY = ball.y + BALL_RADIUS

        for (const pocket of pockets) {

            const dx = pocket.x - ballCenterX
            const dy = pocket.y - ballCenterY

            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < POCKET_RADIUS) {

                ball.element.remove()
                balls.splice(i, 1)

                break
            }
        }
    }
}