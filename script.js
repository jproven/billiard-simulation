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
    { x: PLAY_AREA.left, y: PLAY_AREA.top },
    { x: board.clientWidth / 2, y: PLAY_AREA.top - 5 },
    { x: board.clientWidth - PLAY_AREA.right, y: PLAY_AREA.top },
    { x: PLAY_AREA.left, y: board.clientHeight - PLAY_AREA.bottom },
    { x: board.clientWidth / 2, y: board.clientHeight - PLAY_AREA.bottom + 5 },
    { x: board.clientWidth - PLAY_AREA.right, y: board.clientHeight - PLAY_AREA.bottom }
]

const BALL_SIZE = 30
const BALL_RADIUS = BALL_SIZE / 2
const FRICTION = 0.985
const MIN_VELOCITY = 0.05
const MAX_SPEED = 12

// STATE
let balls = []

let aiming = false
let aimStart = null
let aimEnd = null
let power = 0
let charging = false
let maxPower = 12

// EVENTS
startBtn.addEventListener('click', startGame)

// Start aiming (origin is always the cue ball)
board.addEventListener('mousedown', (e) => {
    if (isAnyBallMoving()) return

    const cue = balls.find(b => b.isCue)
    if (!cue) return

    aiming = true
    charging = true
    power = 0

    // Lock aim origin to cue ball center
    aimStart = {
        x: cue.x + BALL_RADIUS,
        y: cue.y + BALL_RADIUS
    }
})

// Update aim direction and visual line
board.addEventListener('mousemove', (e) => {
    if (!aiming) return

    const cue = balls.find(b => b.isCue)
    if (!cue) return

    const startX = cue.x + BALL_RADIUS
    const startY = cue.y + BALL_RADIUS

    aimEnd = { x: e.offsetX, y: e.offsetY }

    const dx = aimEnd.x - startX
    const dy = aimEnd.y - startY

    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    // Render aiming line
    aimLine.style.display = 'block'
    aimLine.style.width = length + 'px'
    aimLine.style.left = startX + 'px'
    aimLine.style.top = startY + 'px'
    aimLine.style.transform = `rotate(${angle}rad)`
})

// Shoot cue ball
board.addEventListener('mouseup', () => {
    if (!aiming) return

    aiming = false
    charging = false

    shootCueBall()

    aimLine.style.display = 'none'
})

// GAME LOOP
function gameLoop() {

    // Charge power while holding mouse
    if (charging && aiming) {
        power += 0.12
        if (power > maxPower) power = maxPower
    }

    moveBalls()
    checkBallCollisions()
    checkPocketCollisions()
    renderBalls()

    requestAnimationFrame(gameLoop)
}
gameLoop()

// -------------------- GAME FUNCTIONS --------------------

// Create a new ball
function startGame() {
    const ball = document.createElement('div')
    ball.classList.add('ball')

    ball.style.width = BALL_SIZE + "px"
    ball.style.height = BALL_SIZE + "px"

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
        x,
        y,
        velocityX,
        velocityY,
        isCue: balls.length === 0
    }

    ball.style.left = x + "px"
    ball.style.top = y + "px"

    board.appendChild(ball)
    balls.push(ballObject)
}

// Apply force to cue ball
function shootCueBall() {
    const cue = balls.find(b => b.isCue)
    if (!cue || !aimStart || !aimEnd) return

    const dx = aimStart.x - aimEnd.x
    const dy = aimStart.y - aimEnd.y

    const length = Math.sqrt(dx * dx + dy * dy)
    if (length === 0) return

    const nx = dx / length
    const ny = dy / length

    const force = power * 0.4

    cue.velocityX = nx * force
    cue.velocityY = ny * force

    // Clamp max speed
    const speed = Math.sqrt(cue.velocityX ** 2 + cue.velocityY ** 2)

    if (speed > MAX_SPEED) {
        const scale = MAX_SPEED / speed
        cue.velocityX *= scale
        cue.velocityY *= scale
    }
}

// Check if any ball is moving
function isAnyBallMoving() {
    return balls.some(ball =>
        Math.abs(ball.velocityX) > 0 ||
        Math.abs(ball.velocityY) > 0
    )
}

// Update ball physics
function moveBalls() {
    balls.forEach(ball => {

        ball.x += ball.velocityX
        ball.y += ball.velocityY

        ball.velocityX *= FRICTION
        ball.velocityY *= FRICTION

        if (Math.abs(ball.velocityX) < MIN_VELOCITY) ball.velocityX = 0
        if (Math.abs(ball.velocityY) < MIN_VELOCITY) ball.velocityY = 0

        const maxX = board.clientWidth - BALL_SIZE - PLAY_AREA.right
        const maxY = board.clientHeight - BALL_SIZE - PLAY_AREA.bottom

        // Wall collisions
        if (ball.x <= PLAY_AREA.left) {
            ball.x = PLAY_AREA.left
            ball.velocityX *= -1
        }

        if (ball.x >= maxX) {
            ball.x = maxX
            ball.velocityX *= -1
        }

        if (ball.y <= PLAY_AREA.top) {
            ball.y = PLAY_AREA.top
            ball.velocityY *= -1
        }

        if (ball.y >= maxY) {
            ball.y = maxY
            ball.velocityY *= -1
        }
    })
}

// Ball-ball collisions
function checkBallCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {

            const a = balls[i]
            const b = balls[j]

            const ax = a.x + BALL_RADIUS
            const ay = a.y + BALL_RADIUS
            const bx = b.x + BALL_RADIUS
            const by = b.y + BALL_RADIUS

            const dx = bx - ax
            const dy = by - ay

            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance === 0) continue

            const minDistance = BALL_SIZE

            if (distance < minDistance) {

                const nx = dx / distance
                const ny = dy / distance

                const overlap = minDistance - distance

                a.x -= nx * overlap / 2
                a.y -= ny * overlap / 2

                b.x += nx * overlap / 2
                b.y += ny * overlap / 2

                const rvx = b.velocityX - a.velocityX
                const rvy = b.velocityY - a.velocityY

                const velocityAlongNormal = rvx * nx + rvy * ny

                if (velocityAlongNormal > 0) continue

                const restitution = 0.95
                const impulse = -(1 + restitution) * velocityAlongNormal / 2

                const ix = impulse * nx
                const iy = impulse * ny

                a.velocityX -= ix
                a.velocityY -= iy

                b.velocityX += ix
                b.velocityY += iy
            }
        }
    }
}

// Render balls
function renderBalls() {
    balls.forEach(ball => {
        ball.element.style.left = ball.x + "px"
        ball.element.style.top = ball.y + "px"
    })
}

// Pocket collision detection
function checkPocketCollisions() {
    for (let i = balls.length - 1; i >= 0; i--) {

        const ball = balls[i]

        const cx = ball.x + BALL_RADIUS
        const cy = ball.y + BALL_RADIUS

        for (const pocket of pockets) {

            const dx = pocket.x - cx
            const dy = pocket.y - cy

            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < POCKET_RADIUS) {
                ball.element.remove()
                balls.splice(i, 1)
                break
            }
        }
    }
}