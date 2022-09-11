const NUMBER_OF_GUESSES = 6
const WORD_LENGTH = 5
const OUTPUT_BASE = 3
let guessesRemaining = NUMBER_OF_GUESSES
let guesses = [[]]
let outputs = [[]]
let nextLetter = 0
let shadeMap = ['gray','yellow','green']
let letter

function insertLetter(letter){
  if (nextLetter === 5){
    return
  }
  letter = letter.toLowerCase()

  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
  let box = row.children[nextLetter]
  box.textContent = letter
  box.classList.add("filled-box")
  box.disabled = false
  guesses[NUMBER_OF_GUESSES - guessesRemaining].push(letter)
  outputs[NUMBER_OF_GUESSES - guessesRemaining].push(-1)
  nextLetter += 1
}

function deleteLetter(){
  if (nextLetter <= 0){
    return
  }
  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
  let box = row.children[nextLetter - 1]
  box.textContent = ""
  box.classList.remove("filled-box")
  box.disabled = true
  guesses[NUMBER_OF_GUESSES - guessesRemaining].pop()
  outputs[NUMBER_OF_GUESSES - guessesRemaining].pop()
  box.style.backgroundColor = 'white'
  nextLetter -= 1
}

function setShade(event){
  //alert(`${event.currentTarget.row_idx}, ${event.currentTarget.letter_idx}`)
  let row_idx = event.currentTarget.row_idx
  let letter_idx = event.currentTarget.letter_idx
  if (row_idx >= outputs.length){
    return
  }

  outputs[row_idx][letter_idx] = (outputs[row_idx][letter_idx] + 1) % OUTPUT_BASE
  event.currentTarget.style.backgroundColor = shadeMap[outputs[row_idx][letter_idx]]
}

function initBoard() {
    let board = document.getElementById("game-board")

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"

        for (let j = 0; j < WORD_LENGTH; j++) {
            let box = document.createElement("button")
            box.className = "letter-box"
            box.row_idx = i
            box.letter_idx = j
            box.addEventListener('click', setShade)
            box.disabled = true
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}


initBoard()

// Listen for keypresses
document.addEventListener("keyup", (e) => {
  if (guessesRemaining <= 0){
    return
  }

  let pressedKey = String(e.key)
  if (pressedKey == "Backspace" && nextLetter > 0){
    deleteLetter()
    return
  }

  let found = pressedKey.match(/[a-z]/gi)
  if (!found || found.length > 1){
    return
  }else{
    insertLetter(pressedKey)
  }
})
