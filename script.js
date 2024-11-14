document.addEventListener('click', ({ target }) => {
  if (!target.matches('[data-letter]')) return
  const currentValue = document.querySelector('input[type="text"]').value
  document.querySelector('input[type="text"]').value = `${currentValue}${target.innerText}`
})

document.addEventListener('click', ({ target }) => {
  if (!target.matches('[data-delete]')) return
  const currentValue = document.querySelector('input[type="text"]').value
  document.querySelector('input[type="text"]').value = `${currentValue.substring(0, currentValue.length - 1)}`
})

document.addEventListener('click', ({ target }) => {
  if (!target.matches('[data-space]')) return
  const currentValue = document.querySelector('input[type="text"]').value
  document.querySelector('input[type="text"]').value = `${currentValue} `
})

document.addEventListener('click', ({ target }) => {
  if (!target.matches('[data-submit]')) return

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

getPuzzle(2)

// https://www.rd.com/list/emoji-riddles/
