document.addEventListener('click', ({ target }) => {
  if (!target.closest('[data-letter]')) return
  const currentValue = document.querySelector('#guess').textContent
  document.querySelector('#guess').textContent = `${currentValue}${target.textContent}`
})

document.addEventListener('click', ({ target }) => {
  if (!target.closest('[data-space]')) return
  const currentValue = document.querySelector('#guess').textContent
  document.querySelector('#guess').textContent = `${currentValue} `
})

document.addEventListener('click', ({ target }) => {
  if (!target.closest('[data-delete]')) return
  const currentValue = document.querySelector('#guess').textContent
  document.querySelector('#guess').textContent = currentValue.substring(0, currentValue.length - 1)

})

document.addEventListener('click', ({ target }) => {
  if (!target.closest('[data-submit]')) return
})

async function getPuzzle(id) {
  const response = await fetch("./puzzles.json")
  const data = await response.json()
  const puzzle = data[id]

  let words = []
  for (word of puzzle.puzzle) {
    words.push(`<div class="word">${word}</div>`)
  }
  document.querySelector('#puzzle').innerHTML = words.join('')
}

getPuzzle(3)

// https://www.rd.com/list/emoji-riddles/
