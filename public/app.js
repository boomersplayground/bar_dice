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
const roomId = document.querySelector('.roomId')
const roomName = document.querySelector('.roomName')
const enterRoomId = document.querySelector('.enterRoomId')
const joinRoom = document.querySelector('.joinRoom')
const userName = document.querySelector('.userName')
const playersNameArea = document.querySelector('.playersDiv')
const barGamesTitle = document.querySelector('.barGamesTitle')
const gameTitle = document.querySelector('.gameTitle')

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

const startGame = ({ gameRoom, user, userId }) => {
  // console.log("==== START GAME ====")
  // console.log(gameRoom, user, userId)
  // console.log("==== START GAME ====")
  barGamesTitle.replaceChildren()
  const currentUsername = user[userId].username
  const users = gameRoom.users
  const { id, game } = gameRoom
  const div = document.createElement('div')
  const p = document.createElement('p')
  const p2 = document.createElement('p')
  roomName.innerText = `Room Name: ${gameRoom.roomName}`
  roomId.innerText = `Room ID: ${id}`
  p.innerText = `${currentUsername} you started a ${game} game!!!`
  p.classList.add('center')
  p2.innerText = `Press "Start Game" to throw first roll`
  p2.classList.add('center')
  barGamesTitle.append(p)
  barGamesTitle.append(p2)
  page.prepend(div)
  localStorage.setItem('gameRoom', JSON.stringify(gameRoom))
  localStorage.setItem('user', JSON.stringify(user))
  newPlayers({ users })
}

const youJoinedGame = ({ gameRoom, userId, user }) => {
  const { users, game } = gameRoom
  console.log('yjg ', gameRoom)
  const currentUsername = user[userId].username
  let gameCreator = ''
  for (const key in gameRoom.users) {
    if (key === gameRoom.currentlyPlaying) {
      gameCreator = gameRoom.users[key].username
    }
  }

  barGamesTitle.replaceChildren()
  const div = document.createElement('div')
  const p = document.createElement('p')
  const p2 = document.createElement('p')
  const p3 = document.createElement('p')
  const p4 = document.createElement('p')
  div.classList.add("gameDiv")
  p2.innerText = `Room Name:  ${gameRoom.roomName}`
  p3.innerText = `Wait for ${gameCreator} to finish their turn`
  p4.innerText = `Room ID:  ${gameRoom.id}`
  barGamesTitle.append(p3)
  div.append(p)
  div.append(p2)
  div.append(p4)
  page.prepend(div)
  gameSelectionScreen.classList.add('hidden')

  localStorage.setItem('gameRoom', JSON.stringify(gameRoom))
  localStorage.setItem('user', JSON.stringify(user))
  newPlayers({ users })
}

const newPlayers = ({ users }) => {
  // console.log("newPlayers ", users)
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

const drawDice = ({ player }) => {
  console.log('dd ', player)
  const { dice } = player
  roomId.replaceChildren()
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
  roomId.append(diceWrapper)
}

const drawTheNewThrow = ({ gameRoom, userId }) => {
  barGamesTitle.replaceChildren()
  const user = JSON.parse(localStorage.getItem('user'))
  console.log('blah ', user[userId])
  const p = document.createElement('p')
  const player = gameRoom.users[userId]
  const username = gameRoom.users[userId].username
  const numOfRolls = player.turnsRolled

  if (user[userId]) {
    console.log('isUser')
    p.classList.add('whoIsPlaying')
    p.innerText = `You have thrown ${numOfRolls} time${numOfRolls === 1 ? '' : 's'}`
    barGamesTitle.append(p)
  } else {
    console.log('isNotUser')
    p.classList.add('whoIsPlaying')
    p.innerText = `${username} is playing`
    barGamesTitle.append(p)
  }
  drawDice({ player })
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
  const gameRoom = JSON.parse(localStorage.getItem('gameRoom'))
  const user = JSON.parse(localStorage.getItem('user'))
  socket.emit('startCurrentGame', { gameRoom, user })
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
  socket.on('roomId', ({ gameRoom, user, userId }) => {
    // console.log('roomID socket ', users)
    startGame({ gameRoom, user, userId })
  })

  socket.on('youJoinedRoom', ({ gameRoom, userId, user }) => {
    // console.log('youJoinedRoom socket ', data)
    youJoinedGame({ gameRoom, userId, user })
  })

  socket.on('users', ({ users }) => {
    console.log('user socket ', users)
    newPlayers({ users })
  })

  socket.on('someoneStartedPlaying', ({ gameRoom, userId }) => {
    console.log('SOMEONE ', gameRoom, userId)
    drawTheNewThrow({ gameRoom, userId })
  })

  socket.on('someoneRolledTheDice', ({ player }) => {
    console.log('player ', player)
    drawTheNewThrow({ player })
  })

  socket.on('youSuck', data => {
    console.log('youSuck ', data)
    cheatingDialog.showModal()
  })

  socket.on('itWorks', ({ player, finalScore }) => {
    endPlayersTurn({ player, finalScore })
    console.log('itWorks', player, finalScore)
  })

  socket.on('stillWorks', ({ player, finalScore }) => {
    console.log('stillWorks', player, finalScore)
    endRollersTurn({ player, finalScore })
  })
})
