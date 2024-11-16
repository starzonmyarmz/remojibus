const s = localStorage
const d = document

let random, answer

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

  getPuzzle(4)
})

d.addEventListener('click', ({ target }) => {
  const guessEl = d.querySelector('#guess')
  const currentValue = guessEl.textContent

  if (target.closest('[data-start]')) {
    d.querySelector('#pregame').hidden = true
    d.querySelector('#game').hidden = false
    startTimer()
  }

  if (target.closest('[data-letter]')) {
    guessEl.textContent = `${currentValue}${target.textContent}`
  }

  if (target.closest('[data-space]')) {
    guessEl.textContent = `${currentValue} `
  }

  if (target.closest('[data-delete]')) {
    guessEl.textContent = currentValue.substring(0, currentValue.length - 1)
  }

  if (target.closest('[data-reset]')) {
    s.removeItem('remojibusPuzzles')
  }

  if (target.closest('[data-submit]')) {
    if (guessEl.textContent.includes(answer)) {
      d.querySelector('#game').hidden = true
      d.querySelector('#win').hidden = false
      stopTimer()
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

// https://www.rd.com/list/emoji-riddles/



let startTime
let timerInterval
let elapsedPausedTime = 0

function startTimer() {
  if (!timerInterval) {
    startTime = new Date().getTime() - elapsedPausedTime
    timerInterval = setInterval(updateTimer, 1000)
  }
}

function stopTimer() {
  clearInterval(timerInterval)
  elapsedPausedTime = new Date().getTime() - startTime
  timerInterval = null
}

function resetTimer() {
  stopTimer()
  elapsedPausedTime = 0
  d.querySelector('#timer').textContent = '00:00:00'
}

function updateTimer() {
  var currentTime = new Date().getTime()
  var elapsedTime = currentTime - startTime
  var seconds = Math.floor(elapsedTime / 1000) % 60
  var minutes = Math.floor(elapsedTime / 1000 / 60) % 60
  var hours = Math.floor(elapsedTime / 1000 / 60 / 60)
  var displayTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  d.querySelector('#timer').textContent = displayTime
}

function pad(number) {
  return (number < 10 ? '0' : '') + number
}
