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