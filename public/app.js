const socket = io()
/* ========
  * Pages
======== */
const waitingOnPlayersPage = document.querySelector('.page-waiting-players')

/* ===========
  * Game Table
=========== */
// TODO:  Do a canvas game table

/* ========
  * Buttons
======== */
const diceGameButtons = document.querySelectorAll('.gameButton')
const barDiceBtn = document.querySelector('.barDice')
const shipCaptCrewBtn = document.querySelector('.shipCaptCrew')
const startCurrentGameBtn = document.querySelector('.startCurrentGame')
const shakeDiceBtn = document.querySelector('.shakeDice')
const setToneBtn = document.querySelector('.setTone')
const startNextRndBtn = document.querySelector('.startNextRnd')
const gameSelectionPage = document.querySelector('.game-selection-screen')
const playingGame = document.querySelector('.playing-game')
const rollDiceCurrentGameBtn = document.querySelector('.rollDiceCurrentGame')
const callDiceBtn = document.querySelector('.callDice')
const noUserNameBtn = document.querySelector('.noUserNameBtn')
const cheatingDialogBtn = document.querySelector('.cheatingDialogBtn')

/* ========
  * Dialogs
======== */
const dialog = document.getElementById('endOfGame')
const startGameDialog = document.getElementById('startGameDialog')
const startGameDialogBtn = document.querySelector('.startGameDialogBtn')
const startGameEOGBtn = document.querySelector('.startGameEOG')
const noUserNameDialog = document.querySelector('.noUserNameDialog')
const cheatingDialog = document.querySelector('.cheatingDialog')

/* =========
  * Elements
========= */
const shakeDiv = document.querySelector('.shakeDiv')
const page = document.querySelector('.page')
const wrapper = document.querySelector('.wrapper')
const turnAmtH3 = document.querySelector('.turnAmt')
const playerOne = document.querySelector('.playerOne')
const playerTwo = document.querySelector('.playerTwo')
const playerScore = document.querySelector('.playerScore')
const selectedGame = document.querySelector('.selectedGame')
const finalDice = document.querySelector('.showDice')
const roomIdP = document.querySelector('.roomId')
const enterRoomId = document.querySelector('.enterRoomId')
const joinRoom= document.querySelector('.joinRoom')
const userName = document.querySelector('.userName')
const playersNameArea = document.querySelector('.playersDiv')
const barGamesTitle = document.querySelector('.barGamesTitle')

/* ==============
  * Gameplay Data
============== */
const dieHolder = []
const tempDieHolder = []
const gameObject = {
  whoStarted: 0,
  player: 0,
  hasOneBeenFound: false,
  turns: 0,
  gameSelected: '',
  howManyOnes: 0,
  mostOthers: 0,
  howManyOthers: 0,
  gameOver: false,
  player1: {
    games: []
  },
  player2: {
    games: []
  }
}

let totalDice = {}
let gameRoomName = ''

/* ===================
  * Gameplay functions
=================== */

const diceClick = (e) => {
  const dieNumber = parseInt(e.target.dataset.number)
  const isActive = e.target.classList.contains('active')

  if (dieNumber === 1) return
  if (!gameObject.hasOneBeenFound) return

  isActive ? e.target.classList.remove('active') : e.target.classList.add('active')
}


const barDice = (e) => {
  const username = userName.value.trim()
  const gameType = e.target.dataset.game

  if (!username) {
    noUserNameDialog.showModal()
    return true
  }

  socket.emit('startRoom', { username, gameType })
  selectedGame.innerText = 'You have selected Bar Dice'
  shipCaptCrewBtn.classList.remove('active')
  barDiceBtn.classList.add('active')
  gameSelectionPage.classList.add('hidden')
  //playingGame.classList.remove('hidden')
  game()
}

const shipCaptCrew = (e) => {
  selectedGame.innerText = 'You have selected Ship Capt Crew'
  gameObject.gameSelected = e.originalTarget.dataset.game
  barDiceBtn.classList.remove('active')
  shipCaptCrewBtn.classList.add('active')
  gameSelectionPage.classList.add('hidden')
  //playingGame.classList.remove('hidden')
  game()
}

const game = () => {
  // resetGame()

  diceGameButtons.forEach(e => {
    const game = e.dataset.game

    switch (game) {
      case 'barDice':
        e.addEventListener('click', barDice)
        break
      case 'shipCaptCrew':
        e.addEventListener('click', shipCaptCrew)
        break
      // case 'shakeTheDice':
      //   e.addEventListener('click', shakeTheDice)
      default:
        console.log('nothing to see here')
        break
    }
  })
}

const startGame = ({ gameRoom, users, user, userId }) => {
  console.log("==== START GAME ====")
  console.log(gameRoom, users, user, userId)
  console.log("==== START GAME ====")
  barGamesTitle.replaceChildren()
  const { id, game } = gameRoom
  const div = document.createElement('div')
  const p = document.createElement('p')
  const p2 = document.createElement('p')
  const p3 = document.createElement('p')
  const p4 = document.createElement('p')
  const p5 = document.createElement('p')
  p.innerText = `${user[userId].username} you started a ${game} game!!!`
  p2.innerText = `Room Name: ${gameRoom.roomName}`
  p2.classList.add('pplInRoom')
  p3.innerText = `${user[userId].username} you started a ${game} game!!!`
  p4.innerText =  `Press "Start Game" to throw first roll`
  p5.innerText = `Room ID: ${gameRoom.id}`
  barGamesTitle.append(p3)
  barGamesTitle.append(p4)
  div.append(p)
  div.append(p2, p5)
  page.prepend(div)
  waitingOnPlayersPage.classList.remove('hidden')
  startCurrentGameBtn.classList.remove('hidden')
  gameSelectionPage.classList.add('hidden')
  addUsers({ users })
}

const youJoinedGame = (data) => {
  const { user, userId, gameRoom } = data
  const { users, game } = gameRoom
  let gameCreator = ''
  for (const key in gameRoom.users) {
    if (key === gameRoom.currentlyPlaying) {
      gameCreator = gameRoom.users[key].username
    }
  }

  gameSelectionPage.classList.add('hidden')
  barGamesTitle.replaceChildren()
  const div = document.createElement('div')
  const p = document.createElement('p')
  const p3 = document.createElement('p')
  const p5 = document.createElement('p')
  div.classList.add("gameDiv")
  p.innerText = `${gameCreator} has started a ${game} game`
  p3.innerText =  `Wait for ${gameCreator} to finish their turn`
  barGamesTitle.append(p3)
  div.append(p)
  div.append(p5)
  page.prepend(div)
  waitingOnPlayersPage.classList.remove('hidden')
  startCurrentGameBtn.classList.remove('hidden')
  gameSelectionPage.classList.add('hidden')
  addUsers({ users })
}

const addUsers = ({ users }) => {
  console.log("addUsers ", users)
  playersNameArea.replaceChildren()
  const p = document.createElement('p')
  const usersUl = document.createElement('ul')
  for (const key in users) {
    console.log("a ", users[key])
    const userLi = document.createElement('li')
    userLi.classList.add('user')
    userLi.setAttribute('username', users[key].username)
    userLi.innerText = `${users[key].username}`
    usersUl.append(userLi)
  }

  p.innerText = "People playing in this room!"
  playersNameArea.append(p)
  playersNameArea.append(usersUl)
}

const playTheGame = ({ player }) => {
  // localStorage.removeItem("dice")
  drawDice({ player })
  startCurrentGameBtn.classList.add('hidden')
  rollDiceCurrentGameBtn.classList.remove('hidden')
  callDiceBtn.classList.remove('hidden')
}

const drawDice = ({ player }) => {
  console.log('ll ', player)
  const { dice } = player
  const diceForLocalStorage = JSON.stringify(dice)
  // localStorage.setItem("dice", diceForLocalStorage)
  roomIdP.replaceChildren()
  const diceWrapper = document.createElement('div')
  diceWrapper.classList.add('diceWrapper')
  dice.forEach(die => {
    const dice = document.createElement('div')
    die.value === 1 ? dice.classList.add('active') : ''
    die.value === 1 ? gameObject.hasOneBeenFound = true : ''
    die.isActive ? dice.classList.add('active') : ''
    dice.classList.add('dice', `dice${die.value}`)
    dice.style.backgroundImage = `url(./img/dice${die.value}.png)`
    dice.setAttribute('data-number', die.value)
    dice.addEventListener('click', (e) => diceClick(e))
    diceWrapper.appendChild(dice)
  })
  roomIdP.append(diceWrapper)
}

const drawTheNewThrow = ({ user, username, player }) => {
  barGamesTitle.replaceChildren()
  const p = document.createElement('p') 
  const numOfRolls = player.turnsRolled

  if (user === username) {
    p.classList.add('whoIsPlaying')
    p.innerText = `You have thrown ${numOfRolls} time${numOfRolls === 1 ? '' : 's'}`
    barGamesTitle.append(p)
  } else {
    p.classList.add('whoIsPlaying')
    p.innerText = `${username} is playing`
    barGamesTitle.append(p)
  }
  playTheGame({ player })
}

const endRollersTurn = ({ player, finalScore }) => {
  const p = document.querySelector(".whoIsPlaying")
  const p1 = document.createElement('p')
  p1.classList.add('score', 'center')
  p1.innerText = `You rolled ${finalScore}`
  p.append(p1)
  console.log('p ', player, 'f ', finalScore)
}

const endPlayersTurn = ({ finalScore, player }) => {
  const p = document.querySelector(".whoIsPlaying")
  const p1 = document.createElement('p')
  p1.classList.add('score', 'center')
  p1.innerText = `${player.name} rolled ${finalScore}`
  p.append(p1)
  console.log('p ', player, 'f ', finalScore)
}

/* ================
  * Event Listeners
================ */
joinRoom.addEventListener('click', (e) => {
  e.preventDefault()
  
  const trimmedUsername = userName.value.trim()
  const trimmedRoomId = enterRoomId.value.trim()

  if (!trimmedRoomId || !trimmedUsername) {
    noUserNameDialog.showModal()
    return true
  }

  const payload = {
    roomId: trimmedRoomId,
    username: trimmedUsername
  }
  socket.emit('roomId', payload)
})

startGameDialogBtn.addEventListener('click', () => {
  game()
})

startGameEOGBtn.addEventListener('click', () => {
  wrapper.replaceChildren()
  dialog.close()
  startGameDialog.close()
  game()
})

setToneBtn.addEventListener('click', () => {
  setTheTone()
})

startNextRndBtn.addEventListener('click', () => {
  startNextRound()
})

barDiceBtn.addEventListener('click', () => {

})

shipCaptCrewBtn.addEventListener('click', () => {

})

startCurrentGameBtn.addEventListener('click', () => {
  socket.emit('startCurrentGame', { gameRoomName })
})

rollDiceCurrentGameBtn.addEventListener('click', () => {
  const allDice = document.querySelectorAll('.dice')
  const dice = {}

  allDice.forEach((die, index) => {
    const dieNumber = Number(die.dataset.number)
    if (die.classList.contains('active')) {
      dice[index] = {}
      dice[index]["isActive"] = true
      dice[index]["value"] = dieNumber
    } else {
      dice[index] = {}
      dice[index]["isActive"] = false
      dice[index]["value"] = dieNumber
    }
  })

  socket.emit('rollTheDice', { dice, gameRoomName })
})

callDiceBtn.addEventListener('click', () => {
  console.log('yo')
})

/* ===============
  * Dialog Buttons
=============++ */

noUserNameBtn.addEventListener('click', () => {
  noUserNameDialog.close()
})

cheatingDialogBtn.addEventListener('click', () => {
  cheatingDialog.close()
})

game()


/* ======================
  * Incoming socket Stuff
====================== */

socket.on('connect', () => {
  socket.on('roomId', ({ gameRoom, users, user, userId }) => {
    console.log('roomID socket ', users)
    startGame({ gameRoom, users, user, userId })
  })

  socket.on('youJoinedRoom', data => {
    console.log('youJoinedRoom socket ', data)
    youJoinedGame(data)
  })

  socket.on('users', ({ users })=> {
    console.log('user socket ', users)
    addUsers({ users })
  })

  socket.on('someoneStartedPlaying', ({ gameRoom, player }) => {
    console.log('SOMEONE ', gameRoom, player)
    drawTheNewThrow({ gameRoom, player })
  })

  socket.on('someoneRolledTheDice', ({ player }) => {
    console.log('player ', player)
    drawTheNewThrow({ player })
  })

  socket.on('youSuck', data => {
    console.log('youSuck ', data)
    cheatingDialog.showModal()
  })

  socket.on('itWorks', ({ player, finalScore}) => {
    endPlayersTurn({ player, finalScore })
    console.log('itWorks', player, finalScore)
  })

  socket.on('stillWorks', ({ player, finalScore}) => {
    console.log('stillWorks', player, finalScore)
    endRollersTurn({ player, finalScore })
  })
})
