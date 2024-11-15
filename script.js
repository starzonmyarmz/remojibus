const s = localStorage
const d = document

let answer

document.addEventListener('DOMContentLoaded', () => {
  if (s.getItem('remojibusPuzzles') == null) {

  }

  if (s.getItem('remojibusGroupWords') !== null) {
    d.getElementById('group-words').checked = JSON.parse(s.getItem('remojibusGroupWords'))
  }

  if (s.getItem('remojibusAudio') !== null) {
    d.getElementById('game-audio').checked = JSON.parse(s.getItem('remojibusAudio'))
  }

  if (s.getItem('remojibusTimer') !== null) {
    d.getElementById('game-timer').checked = JSON.parse(s.getItem('remojibusTimer'))
  }
})

d.addEventListener('click', ({ target }) => {
  const guessEl = d.querySelector('#guess')
  const currentValue = guessEl.textContent

  if (target.closest('[data-letter]')) {
    guessEl.textContent = `${currentValue}${target.textContent}`
  }

  if (target.closest('[data-space]')) {
    guessEl.textContent = `${currentValue} `
  }

  if (target.closest('[data-delete]')) {
    guessEl.textContent = currentValue.substring(0, currentValue.length - 1)
  }

  if (target.closest('[data-submit]')) {
    if (guessEl.textContent.includes(answer)) {

    } else {
      guessEl.classList.add('shake')
      guessEl.addEventListener('animationend', () => {
        guessEl.classList.remove('shake')
      })
    }
  }
})

d.addEventListener('change', ({ target }) => {
  if (target.closest('#group-words')) s.setItem('remojibusGroupWords', target.checked)
  if (target.closest('#game-audio')) s.setItem('remojibusAudio', target.checked)
  if (target.closest('#game-timer')) s.setItem('remojibusTimer', target.checked)
})


async function getPuzzle(id) {
  const response = await fetch("./puzzles.json")
  const data = await response.json()
  const puzzle = data[id]

  let words = []
  for (word of puzzle.puzzle) {
    words.push(`<div class="word">${word}</div>`)
  }
  d.querySelector('#puzzle').innerHTML = words.join('')

  answer = puzzle.answer
}

getPuzzle(3)

// https://www.rd.com/list/emoji-riddles/





let startTime
let stopwatchInterval
let elapsedPausedTime = 0

function startStopwatch() {
  if (!stopwatchInterval) {
    startTime = new Date().getTime() - elapsedPausedTime
    stopwatchInterval = setInterval(updateStopwatch, 1000)
  }
}

function stopStopwatch() {
  clearInterval(stopwatchInterval)
  elapsedPausedTime = new Date().getTime() - startTime
  stopwatchInterval = null
}

function resetStopwatch() {
  stopStopwatch()
  elapsedPausedTime = 0
  d.querySelector('h1').textContent = '00:00:00'
}

function updateStopwatch() {
  var currentTime = new Date().getTime()
  var elapsedTime = currentTime - startTime
  var seconds = Math.floor(elapsedTime / 1000) % 60
  var minutes = Math.floor(elapsedTime / 1000 / 60) % 60
  var hours = Math.floor(elapsedTime / 1000 / 60 / 60)
  var displayTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  d.querySelector('h1').textContent = displayTime
}

function pad(number) {
  return (number < 10 ? '0' : '') + number
}

startStopwatch()
