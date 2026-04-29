// DOM
const board = document.querySelector('#board')
const startBtn = document.querySelector('#startBtn')

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

    const x = Math.random() * (board.clientWidth - 30)
    const y = Math.random() * (board.clientHeight - 30)

    const velocityX = Math.random() * 4 - 2
    const velocityY = Math.random() * 4 - 2

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

        ball.x += ball.velocityX
        ball.y += ball.velocityY

        if (ball.x <= 0 || ball.x >= board.clientWidth - 30) {
            ball.velocityX *= -1
        }

        if (ball.y <= 0 || ball.y >= board.clientHeight - 30) {
            ball.velocityY *= -1
        }

        ball.element.style.left = ball.x + "px"
        ball.element.style.top = ball.y + "px"

    })
}