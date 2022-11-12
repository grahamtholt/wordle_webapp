const NUMBER_OF_GUESSES = 6
const WORD_LENGTH = 5
const OUTPUT_BASE = 3
let guessesRemaining = NUMBER_OF_GUESSES
let guesses = [[]]
let outputs = [[]]
let nextLetter = 0
let shadeMap = ['rgb(120,124,126)','rgb(201,180,88)','rgb(106,170,100)']
let finished = false

function insertLetter(letter, shade_idx=0){
  if (nextLetter === WORD_LENGTH){
    return
  }
  letter = letter.toLowerCase()

  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
  let box = row.children[nextLetter]
  box.textContent = letter
  box.classList.add("filled-box")
  box.disabled = false
  box.style.backgroundColor = shadeMap[shade_idx]
  guesses[NUMBER_OF_GUESSES - guessesRemaining].push(letter)
  outputs[NUMBER_OF_GUESSES - guessesRemaining].push(0)
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
  let row_idx = event.currentTarget.row_idx
  let letter_idx = event.currentTarget.letter_idx
  if (row_idx >= outputs.length){
    return
  }

  outputs[row_idx][letter_idx] = (outputs[row_idx][letter_idx] + 1) % OUTPUT_BASE
  event.currentTarget.style.backgroundColor = shadeMap[outputs[row_idx][letter_idx]]
}

function insertWord(word, shade_idx=0){
  // Clear any existing state for this row
  nextLetter = 0
  guesses[NUMBER_OF_GUESSES - guessesRemaining].length = 0
  outputs[NUMBER_OF_GUESSES - guessesRemaining].length = 0
  // Insert the new row
  for (let i = 0; i < word.length; i++){
    insertLetter(word[i], shade_idx)
  }
}

function readState(){
  //TODO: Error checking and handling
  let guess_words = []
  let obs = []
  for (let i=0; i<guesses.length; i++){
    if (guesses[i].length == 5){
      guess_words.push(guesses[i].join(''))
    }
  }
  for (let j=0; j<outputs.length; j++){
    if (outputs[j].length == 5 && !outputs[j].includes(-1)){
      obs.push(parseInt(outputs[j].join(''), 3))
    }
  }
  return {"guess_list": guess_words, "obs_list": obs}
}

function freezeState(row_idx){
  let row = document.getElementsByClassName("letter-row")[row_idx]

  for (let j = 0; j < WORD_LENGTH; j++) {
      let box = row.children[j]
      box.disabled = true
  }
}

function stepRow(){
  // Freeze the row
  freezeState(NUMBER_OF_GUESSES - guessesRemaining)
  // Carriage return
  guessesRemaining -= 1
  nextLetter = 0
  guesses.push([])
  outputs.push([])
}

function getGuess(){
  // Do we need to move down a row?
  if (nextLetter === WORD_LENGTH){
    stepRow()
  }
  // Get guess word from server
  let server_data = readState()
  $.ajax({
    type: "POST",
    url: "/compute_guess",
    data: JSON.stringify(server_data),
    contentType: "application/json",
    success: function(result){ processGuess(result) },
    error: function(xhr, status, error) {
      alert('fail')
    },
  })
}

function processGuess(result){
  if (result["done?"]){
    insertWord(result["guess"], 2)
    // Freeze this row and next row
    freezeState(NUMBER_OF_GUESSES - guessesRemaining - 1)
    freezeState(NUMBER_OF_GUESSES - guessesRemaining)
  }else{
    insertWord(result["guess"])
    // Add slot for next guess and coloring
  }
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
  if (guessesRemaining <= 0 || finished){
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

// Listen for guess getting
let guess_button = document.getElementById("get-guess")
guess_button.addEventListener('click', getGuess)
