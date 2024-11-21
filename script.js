const s = localStorage
const d = document
const v = 1

let soundTick
let soundDoh
let soundYay
let guessEl
let currentPuzzle
let currentPuzzleId
let currentAnswer
let currentRequiredWords

d.addEventListener('DOMContentLoaded', () => {
  soundTick = d.querySelector('[data-sound-tick]')
  soundDoh = d.querySelector('[data-sound-doh]')
  soundYay = d.querySelector('[data-sound-yay]')
  guessEl = d.querySelector('#guess')
  playSound = d.querySelector('#game-audio')

  // Check local storage for settings
  if (s.getItem('remojibusPuzzles') == null || s.getItem('remojibusVersion') < v) getPuzzles()
  if (s.getItem('remojibusCompleted') == null) s.setItem('remojibusCompleted', JSON.stringify([]))
  if (s.getItem('remojibusHints') !== null) d.getElementById('hints').checked = JSON.parse(s.getItem('remojibusHints'))
  if (s.getItem('remojibusUnderlineWords') !== null) d.getElementById('underline-words').checked = JSON.parse(s.getItem('remojibusUnderlineWords'))
  if (s.getItem('remojibusGroupWords') !== null) d.getElementById('group-words').checked = JSON.parse(s.getItem('remojibusGroupWords'))
  if (s.getItem('remojibusAudio') !== null) d.getElementById('game-audio').checked = JSON.parse(s.getItem('remojibusAudio'))
  if (s.getItem('remojibusTimer') !== null) d.getElementById('game-timer').checked = JSON.parse(s.getItem('remojibusTimer'))

  // If all puzzles completed show the all done screen
  if (!anyPuzzles()) {
    d.querySelectorAll('#pregame, #game, #win').forEach(el => el.hidden = true)
    d.querySelector('#dunzo').hidden = false
  }
})

d.addEventListener('click', ({ target }) => {
  let currentValue = guessEl.dataset.words

  // Start new puzzle
  if (target.closest('[data-start]')) {
    if (anyPuzzles()) {
      d.querySelectorAll('#pregame, #win').forEach(el => el.hidden = true)
      d.querySelector('#game').hidden = false
      d.querySelector('#guess').textContent = ''
      guessEl.dataset.words = ''

      if (playSound.checked) soundTick.play()

      getPuzzle()
      resetTimer()
      startTimer()
    } else {
      d.querySelectorAll('#pregame, #game, #win').forEach(el => el.hidden = true)
      d.querySelector('#dunzo').hidden = false
    }
  }

  if (target.closest('[data-letter]')) guessEl.dataset.words = `${currentValue}${target.textContent}`
  if (target.closest('[data-space]')) guessEl.dataset.words = `${currentValue} `
  if (target.closest('[data-delete]')) guessEl.dataset.words = currentValue.substring(0, guessEl.dataset.words.length - 1)
  if (target.closest('[data-letter], [data-space], [data-delete]')) updateGuess()
  if (target.closest('[data-erase]')) s.removeItem('remojibusCompleted')
  if (target.closest('[data-submit]')) submitPuzzle(currentValue)
})

// Share the puzzle
d.querySelector('[data-share]').addEventListener('click', async () => {
  await navigator.share({
    title: "🚌 Remojibus",
    text: "Rebus puzzles… but with emojis",
    url: "https://remojibus.iamdanielmarino.com",
  })
})

d.addEventListener('change', ({ target }) => {
  if (target.closest('#hints')) s.setItem('remojibusHints', target.checked)
  if (target.closest('#underline-words')) s.setItem('remojibusUnderlineWords', target.checked)
  if (target.closest('#group-words')) s.setItem('remojibusGroupWords', target.checked)
  if (target.closest('#game-audio')) s.setItem('remojibusAudio', target.checked)
  if (target.closest('#game-timer')) s.setItem('remojibusTimer', target.checked)
})

d.addEventListener('keyup', (el) => {
  if (d.querySelector('#game').hidden === true) return

  let currentValue = guessEl.dataset.words

  if ("abcdefghijklmnopqrstuvwxyz".includes(el.key)) guessEl.dataset.words = `${currentValue}${el.key}`
  if (el.key === ' ') guessEl.dataset.words = `${currentValue} `
  if (el.key === 'Backspace') guessEl.dataset.words = currentValue.substring(0, guessEl.dataset.words.length - 1)
  if ('abcdefghijklmnopqrstuvwxyz'.includes(el.key) || el.key === ' ' || el.key === 'Backspace') updateGuess()
  if (el.key === 'Enter') submitPuzzle(currentValue)
})

function updateGuess() {
  let thisText = guessEl.dataset.words.split(' ')
  let thisHtml = []

  for (let w of thisText) {
    thisHtml.push(`<span class="w ${currentRequiredWords.includes(w) ? 'h' : ''}">${w}</span>`)
  }

  guessEl.innerHTML = thisHtml.join('')

  if (playSound.checked) soundTick.play()
}

function submitPuzzle(val) {
  let isAnswerCorrect = true
  let leadingSpace
  let trailingSpace

  for (let [index, thisWord] of currentRequiredWords.entries()) {
    leadingSpace = index > 0 ? ' ' : ''
    trailingSpace = index < currentRequiredWords.length - 1 ? ' ' : ''

    if (!val.includes(`${leadingSpace}${thisWord}${trailingSpace}`)) {
      isAnswerCorrect = false
      break
    }
  }

  // Puzzle is correct
  if (isAnswerCorrect) {
    d.querySelector('#game').hidden = true
    d.querySelector('#win').hidden = false

    if (playSound.checked) soundYay.play()

    stopTimer()

    let newArray = JSON.parse(s.getItem('remojibusCompleted'))
    newArray.push(currentPuzzleId)
    s.setItem('remojibusCompleted', JSON.stringify(newArray))
  }

  // Puzzle is wrong
  if (!isAnswerCorrect) {
    if (playSound.checked) soundDoh.play()
    d.querySelectorAll('.w:not(.h)').forEach((el) => el.classList.add('shake'))
    d.addEventListener('animationend', () => d.querySelectorAll('.w:not(.h)').forEach((el) => el.classList.remove('shake')))
  }
}

function getPuzzle() {
  if (!anyPuzzles()) return

  let findingPuzzle = true
  let wordsMarkup = []
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

  for (word of currentPuzzle.puzzle) {
    wordsMarkup.push(`<div class="word">${word}</div>`)
  }

  d.querySelector('#puzzle').innerHTML = wordsMarkup.join('')
  d.querySelector('[data-id]').textContent = `puzzle #${currentPuzzleId + 1}`
  d.querySelector('#hint').textContent = `Hint: ${currentPuzzle.hint}`

  currentAnswer = currentPuzzle.answer
  currentRequiredWords = currentPuzzle.words || [currentPuzzle.answer]
}

async function getPuzzles() {
  const response = await fetch('./puzzles.json')
  const data = await response.json()
  s.setItem('remojibusPuzzles', JSON.stringify(data))
  s.setItem('remojibusVersion', v)
}

anyPuzzles = () => {
  let puzzlesCount = JSON.parse(s.getItem('remojibusPuzzles') || 0).length
  let completedCount = JSON.parse(s.getItem('remojibusCompleted')).length
  return puzzlesCount !== completedCount
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
  let currentTime = new Date().getTime()
  let elapsedTime = currentTime - startTime
  let seconds = Math.floor(elapsedTime / 1000) % 60
  let minutes = Math.floor(elapsedTime / 1000 / 60) % 60
  let hours = Math.floor(elapsedTime / 1000 / 60 / 60)
  let displayTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  d.querySelectorAll('[data-timer]').forEach((el) => { el.textContent = displayTime })
}

function pad(number) {
  return (number < 10 ? '0' : '') + number
}

// Hack to close popovers on iOS
d.addEventListener('click', ({target}) => {
  if (!d.querySelector(':popover-open')) return
  if (target.closest(':popover-open')) return
  d.querySelector(':popover-open').hidePopover()
})
