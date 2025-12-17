import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid'
import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { createRoomName } from './utilities/cities.js'
import { areYouCheating, getPlayerScore } from './utilities/common_functions.js'
const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const io = new Server(server);
const rooms = {}

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const readableGame = ({ game }) => {
  const gameArray = game.split(/(?=[A-Z])/)
  const upperGameArray = gameArray.map(name => name[0].toUpperCase() + name.slice(1))
  return upperGameArray.join(' ')
}

io.on('connection', (socket) => {
  socket.on('startRoom', ({ username, gameType }) => {
    // console.log("Start current game", username, gameType)
    const game = readableGame({ game: gameType })
    const gameRoom = rooms[socket.id] = {}
    const roomName = createRoomName()
    const user = {
      id: uuidv4(),
      username: username,
      numOfRolls: 0,
      hasQualified: false,
      finalScore: '',
      noMoreThrowsLeft: false,
      dice: []
    }
    gameRoom["gameStarted"] = false
    gameRoom["currentlyPlaying"] = user.id
    gameRoom["game"] = game
    gameRoom['roomName'] = roomName
    gameRoom["users"] = []
    gameRoom["users"].push(user)
    gameRoom["id"] = socket.id
    socket.join(socket.id)
    socket.emit('roomId', { gameRoom, user })
  })

  socket.on('roomId', ({ roomId, username }) => {
    const user = {
      id: uuidv4(),
      username: username,
      numOfRolls: 0,
      hasQualified: false,
      finalScore: '',
      noMoreThrowsLeft: false,
      dice: []
    }

    socket.join(roomId)
    const gameRoom = rooms[roomId]
    gameRoom.users.push(user)
    const users = rooms[roomId]["users"]
    socket.emit('youJoinedRoom', { gameRoom, user })
    io.to(roomId).emit("users", { users })
  })

  socket.on('startCurrentGame', ({ gameId, userId }) => {
    const gameRoom = rooms[gameId]
    const { id } = gameRoom
    const user = gameRoom["users"].find(playingUser => playingUser.id === userId)
    user.numOfRolls++

    for (let i = 0; i < 5; i++) {
      const dice = {}
      dice.value = Math.floor(Math.random() * 6) + 1
      if (dice.value === 1) {
        dice.isActive = true
        user.hasQualified = true
      }
      user.dice.push(dice)
    }

    io.to(id).emit('someoneStartedPlaying', { gameRoom, user })
  })

  socket.on('rollTheDice', ({ localDice, gameId, userId }) => {
    const gameRoom = rooms[gameId]
    const user = gameRoom.users.find(playingUser => playingUser.id === userId)
    const { dice } = user
    const cheater = areYouCheating({ localDice, dice })
    user.numOfRolls++

    if (cheater) {
      const text = "You Suck"
      socket.emit('youSuck', text)
      return
    }


    dice.length = 0

    for (const tempDie in localDice) {
      const die = localDice[tempDie]
      if (die.isActive) {
        dice.push(die)
      } else {
        const newInactiveDice = {}
        newInactiveDice.value = Math.floor(Math.random() * 6) + 1
        newInactiveDice.isActive = newInactiveDice.value === 1 ? true : false
        dice.push(newInactiveDice)
      }
    }

    if (user.numOfRolls >= 3) {
      user.finalScore = getPlayerScore({ user })
      io.to(gameId).emit('usedAllAttempts', { dice, user, gameRoom })
      io.to(gameId).emit('someoneRolledTheDice', { gameRoom, user })
      return
    }

    io.to(gameId).emit('someoneRolledTheDice', { gameRoom, user })
  })

  socket.on('callDice', ({ localDice, gameId, userId }) => {
    const gameRoom = rooms[gameId]
    const user = gameRoom.users.find(playingUser => playingUser.id === userId)
    const { dice } = user
    const cheater = areYouCheating({ localDice, dice })

    if (cheater) {
      const text = "You Suck"
      socket.emit('youSuck', text)
      return
    }

    dice.length = 0
    user.numOfRolls++

    for (const tempDie in localDice) {
      const die = localDice[tempDie]
      if (die.isActive) {
        dice.push(die)
      } else {
        const newInactiveDice = {}
        newInactiveDice.value = Math.floor(Math.random() * 6) + 1
        newInactiveDice.isActive = newInactiveDice.value === 1 ? true : false
        dice.push(newInactiveDice)
      }
    }

    console.log('gameRoom ', user.dice)

    io.to(gameId).emit('someoneRolledTheDice', { gameRoom, user })
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});
