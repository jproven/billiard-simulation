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
    console.log('Clicked')
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
const board = document.querySelector('board')
const startBtn = document.querySelector('startBtn')

startBtn.addEventListenter('click, startGame)')

let x = 100
let y = 100
let velocityX = 2
let velocityY = 2
let ballElement = null

function startGame() {
    console.log('Game Started')
    const ball = document.createElement('div')
    ball.classList.add('ball')

    ballElement = ball

    const x = Math.random() * (board.clientWidth - 30)
    const y = Math.random() * (board.clientHeight - 30)

    ball.style.left = x + "px"
    ball.style.top = y + "px"

    board.appendChild(ball)
}

setInterval(moveBall, 20)

function moveBall() {
    if (!ballElement) return

    x +=velocityX
    y +=velocityY

    if (x <= 0 || x >= board.clientWidth - 30) {
        velocityX = -velocityX
    }

    if (y <= 0 || y >= board.clientHeight - 30) {
        velocityY = -velocityY
    }

    ballElement.style.left = x + "px"
    ballElement.style.top = y + "px"
}