// https://www.rd.com/list/emoji-riddles/

const s = localStorage
const d = document

let currentPuzzle
let currentPuzzleId
let currentAnswer

anyPuzzles = () => {
  let puzzlesCount = JSON.parse(s.getItem('remojibusPuzzles')).length
  let completedCount = JSON.parse(s.getItem('remojibusCompleted')).length
  return puzzlesCount !== completedCount
}

d.addEventListener('DOMContentLoaded', () => {
  if (s.getItem('remojibusPuzzles') == null) {
    getPuzzles()
  }

  if (s.getItem('remojibusCompleted') == null) {
    s.setItem('remojibusCompleted', JSON.stringify([]))
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

  if (!anyPuzzles()) {
    d.querySelector('#pregame').hidden = true
    d.querySelector('#game').hidden = true
    d.querySelector('#win').hidden = true
    d.querySelector('#dunzo').hidden = false
  }
})

d.addEventListener('click', ({ target }) => {
  const guessEl = d.querySelector('#guess')
  const currentValue = guessEl.textContent

  if (target.closest('[data-start]')) {
    if (anyPuzzles()) {
      d.querySelector('#pregame').hidden = true
      d.querySelector('#game').hidden = false
      d.querySelector('#win').hidden = true
      d.querySelector('#guess').textContent = ''

      getPuzzle()
      resetTimer()
      startTimer()
    } else {
      d.querySelector('#pregame').hidden = true
      d.querySelector('#game').hidden = true
      d.querySelector('#win').hidden = true
      d.querySelector('#dunzo').hidden = false
    }
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

  if (target.closest('[data-erase]')) {
    s.removeItem('remojibusPuzzles')
  }

  if (target.closest('[data-submit]')) {
    if (guessEl.textContent.includes(currentAnswer)) {
      d.querySelector('#game').hidden = true
      d.querySelector('#win').hidden = false

      stopTimer()

      let newArray = JSON.parse(s.getItem('remojibusCompleted'))
      newArray.push(currentPuzzleId)
      s.setItem('remojibusCompleted', JSON.stringify(newArray))
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

function getPuzzle() {
  if (!anyPuzzles()) return

  let findingPuzzle = true
  let random
  let puzzles

  while (findingPuzzle) {
    random = Math.floor(Math.random() * JSON.parse(s.getItem('remojibusPuzzles')).length)
    puzzles = JSON.parse(s.getItem('remojibusCompleted'))

    if (puzzles.findIndex((el) => el === random) === -1) {
      currentPuzzleId = random
      currentPuzzle = JSON.parse(s.getItem('remojibusPuzzles'))[currentPuzzleId]
      findingPuzzle = false
    }
  }

  let words = []

  for (word of currentPuzzle.puzzle) {
    words.push(`<div class="word">${word}</div>`)
  }

  d.querySelector('#puzzle').innerHTML = words.join('')
  d.querySelectorAll('[data-id]').forEach((el) => { el.textContent = `puzzle #${currentPuzzleId + 1}` })

  currentAnswer = currentPuzzle.answer
}

async function getPuzzles() {
  const response = await fetch('./puzzles.json')
  const data = await response.json()
  s.setItem('remojibusPuzzles', JSON.stringify(data))
}



// Timer

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
  d.querySelectorAll('[data-timer]').forEach((el) => { el.textContent = '00:00:00' })
}

function updateTimer() {
  var currentTime = new Date().getTime()
  var elapsedTime = currentTime - startTime
  var seconds = Math.floor(elapsedTime / 1000) % 60
  var minutes = Math.floor(elapsedTime / 1000 / 60) % 60
  var hours = Math.floor(elapsedTime / 1000 / 60 / 60)
  var displayTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  d.querySelectorAll('[data-timer]').forEach((el) => { el.textContent = displayTime })
}

function pad(number) {
  return (number < 10 ? '0' : '') + number
}
