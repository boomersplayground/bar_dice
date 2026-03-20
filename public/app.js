const socket = io()
/* ========
  * Pages
======== */
const waitingOnPlayersPage = document.querySelector('.page-waiting-players')
const gameSelectionScreen = document.querySelector('.gameSelectionScreen')
const waitingOnGameScreen = document.querySelector('.waitingOnGameScreen')
const playingGameScreen = document.querySelector('.playingGameScreen')

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
const rollDiceBtn = document.querySelector('.rollDice')
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
const roomId = document.querySelector('.roomId')
const roomName = document.querySelector('.roomName')
const enterRoomId = document.querySelector('.enterRoomId')
const joinRoom = document.querySelector('.joinRoom')
const userName = document.querySelector('.userName')
const playersNameArea = document.querySelector('.playersDiv')
const barGamesTitle = document.querySelector('.barGamesTitle')
const gameTitle = document.querySelector('.gameTitle')

let userId
let gameId
/* ===================
  * Gameplay functions
=================== */

const diceClick = (e, user) => {
  const dieNumber = parseInt(e.target.dataset.number)
  const isActive = e.target.classList.contains('active')

  if (dieNumber === 1) return
  if (!user.hasOneBeenFound) return

  isActive ? e.target.classList.remove('active') : e.target.classList.add('active')
}


const barDice = (e) => {
  const username = userName.value.trim()
  const gameType = e.target.dataset.game

  if (!username) {
    noUserNameDialog.showModal()
    return true
  }

  gameSelectionScreen.classList.add('hidden')
  waitingOnGameScreen.classList.remove('hidden')
  socket.emit('startRoom', { username, gameType })
}

const shipCaptCrew = (e) => {
  selectedGame.innerText = 'You have selected Ship Capt Crew'
  gameObject.gameSelected = e.originalTarget.dataset.game
  barDiceBtn.classList.remove('active')
  shipCaptCrewBtn.classList.add('active')
  gameSelectionPage.classList.add('hidden')
}

const game = () => {
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

const startGame = ({ gameRoom, user }) => {
  console.log("STARTGAME ", gameRoom, user)
  barGamesTitle.replaceChildren()
  const { id, game, users } = gameRoom
  const currentUserId = user.id

  const userId = currentUserId
  const gameId = id

  const div = document.createElement('div')
  const p = document.createElement('p')
  const p2 = document.createElement('p')
  roomName.innerText = `Room Name: ${gameRoom.roomName}`
  roomId.innerText = `Room ID: ${id}`
  p.innerText = `${user} you started a ${game} game!!!`
  p.classList.add('center')
  p2.innerText = `Press "Start Game" to throw first roll`
  p2.classList.add('center')
  barGamesTitle.append(p)
  barGamesTitle.append(p2)
  page.prepend(div)
  localStorage.setItem('gameRoom', JSON.stringify(gameRoom))
  localStorage.setItem('user', JSON.stringify(user))
  newPlayers({ gameRoom })
}

const youJoinedGame = ({ gameRoom, user }) => {
  const { currentlyPlaying, users } = gameRoom
  const currentPlayer = users.find(user => user.id === currentlyPlaying)
  barGamesTitle.replaceChildren()
  //
  // user.id = user.id
  // gameId = gameRoom.id
  const div = document.createElement('div')
  const p = document.createElement('p')
  const p2 = document.createElement('p')
  roomName.innerText = `Room Name: ${gameRoom.roomName}`
  roomId.innerText = `Room ID: ${gameRoom.id}`
  p.innerText = `${currentPlayer.name} started a ${gameRoom.game} game!!!`
  p.classList.add('center')
  p2.classList.add('center')
  barGamesTitle.append(p)
  barGamesTitle.append(p2)
  page.prepend(div)
  gameSelectionScreen.classList.add('hidden')

  localStorage.setItem('gameRoom', JSON.stringify(gameRoom))
  localStorage.setItem('user', JSON.stringify(user))
  newPlayers({ gameRoom })
}

const newPlayers = ({ gameRoom }) => {
  playersNameArea.replaceChildren()
  const users = gameRoom.users
  const p = document.createElement('p')
  const usersUl = document.createElement('ul')
  for (const user of users) {
    console.log('USER ', user)
    const userLi = document.createElement('li')
    userLi.classList.add('user')
    userLi.setAttribute('username', user.username)
    userLi.innerText = `${user.name}`
    usersUl.append(userLi)
  }

  p.innerText = "People playing in this room!"
  playersNameArea.append(p)
  playersNameArea.append(usersUl)
  localStorage.setItem('gameRoom', JSON.stringify(gameRoom))
}

const drawDice = ({ user, gameRoom, isPlayer }) => {
  const { dice } = user
  const diceWrapper = document.createElement('div')
  diceWrapper.classList.add('diceWrapper')
  dice.forEach(die => {
    const dice = document.createElement('div')
    die.value === 1 ? dice.classList.add('active') : ''
    die.value === 1 ? gameRoom.hasOneBeenFound = true : ''
    die.isActive ? dice.classList.add('active') : ''
    dice.classList.add('dice', `dice${die.value}`)
    dice.style.backgroundImage = `url(./img/dice${die.value}.png)`
    dice.setAttribute('data-number', die.value)
    isPlayer ? dice.addEventListener('click', (e) => diceClick(e, user)) : null
    diceWrapper.append(dice)
  })
  barGamesTitle.append(diceWrapper)
}

const drawTheNewThrow = ({ gameRoom, user }) => {
  const lsGameRoom = localStorage.getItem('gameRoom')
  const lsUser = localStorage.getItem('user')
  console.log('111 ', lsGameRoom)
  console.log('222 ', lsUser)
  const p = document.createElement('p')
  barGamesTitle.replaceChildren()

  if (userId === user.id) {
    const isPlayer = true
    p.classList.add('whoIsPlaying')
    p.innerText = `You have thrown ${user.numOfRolls} time${user.numOfRolls === 1 ? '' : 's'}`
    barGamesTitle.append(p)
    drawDice({ user, gameRoom, isPlayer })
  } else {
    const isPlayer = false
    p.classList.add('whoIsPlaying')
    p.innerText = `${user.username} is playing`
    barGamesTitle.append(p)
    drawDice({ user, gameRoom, isPlayer })
  }

  startCurrentGameBtn.classList.add('hidden')
}

const endPlayersTurn = ({ user, gameRoom }) => {
  const localUser = JSON.parse(localStorage.getItem('user'))
  console.log('2 ', user)
  const isPlayer = user.id === localUser.id
  const p = document.querySelector(".whoIsPlaying")
  const p1 = document.createElement('p')
  drawDice({ user, gameRoom, isPlayer })
  rollDiceBtn.classList.add('hidden')
  callDiceBtn.classList.add('hidden')
  p1.classList.add('score', 'center')
  p1.innerText = `${user.username} rolled ${user.finalScore}`
  p.append(p1)
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
  const gameRoom = JSON.parse(localStorage.getItem('gameRoom'))
  const user = JSON.parse(localStorage.getItem('user'))
  console.log('SCGB ', user, gameRoom)
  socket.emit('startCurrentGame', { gameRoom, user })
})

rollDiceBtn.addEventListener('click', () => {
  const allDice = document.querySelectorAll('.dice')
  const localDice = {}

  allDice.forEach((die, index) => {
    const dieNumber = Number(die.dataset.number)
    if (die.classList.contains('active')) {
      localDice[index] = {}
      localDice[index]["isActive"] = true
      localDice[index]["value"] = dieNumber
    } else {
      localDice[index] = {}
      localDice[index]["isActive"] = false
      localDice[index]["value"] = dieNumber
    }
  })

  socket.emit('rollTheDice', { localDice, gameId, userId })
})

callDiceBtn.addEventListener('click', () => {
  const allDice = document.querySelectorAll('.dice')
  const localDice = {}

  allDice.forEach((die, index) => {
    const dieNumber = Number(die.dataset.number)
    if (die.classList.contains('active')) {
      localDice[index] = {}
      localDice[index]["isActive"] = true
      localDice[index]["value"] = dieNumber
    } else {
      localDice[index] = {}
      localDice[index]["isActive"] = false
      localDice[index]["value"] = dieNumber
    }
  })

  socket.emit('callDice', { localDice, gameId, userId })

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
  socket.on('roomId', ({ gameRoom, users, user }) => {
    console.log('ROOMID ', gameRoom, users, user)
    startGame({ gameRoom, user })
  })

  socket.on('youJoinedRoom', ({ gameRoom, user }) => {
    console.log('g111111 ', gameRoom, user)
    youJoinedGame({ gameRoom, user })
  })

  socket.on('users', ({ gameRoom }) => {
    newPlayers({ gameRoom })
  })

  socket.on('someoneStartedPlaying', ({ gameRoom }) => {
    console.log('STP ', gameRoom )
    drawTheNewThrow({ gameRoom })
  })

  socket.on('someoneRolledTheDice', ({ gameRoom, user }) => {
    drawTheNewThrow({ gameRoom, user })
  })

  socket.on('youSuck', data => {
    cheatingDialog.showModal()
  })

  socket.on('usedAllAttempts', ({ dice, user, gameRoom }) => {
    endPlayersTurn({ dice, user, gameRoom })
  })
})
