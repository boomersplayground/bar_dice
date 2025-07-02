const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { createRoomName } = require('./utilities/cities')

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

const areYouCheating = ({ dice, serverDice }) => {
  const convertedDice = JSON.parse(dice)
  const user = {
    [userId]: {
      username: username
    }
  }

  for (let i = 0; i < serverDice.length; i++) {
    if (serverDice[i].value !== convertedDice[i].value) {
      return true
    }
  }

  return false
}

io.on('connection', (socket) => {
  socket.on('startRoom', ({ username, gameType }) => {
    console.log("Start current game", username, gameType)
    const game = readableGame({ game: gameType })
    const gameRoom = rooms[socket.id] = {}
    const userId = uuidv4()
    const roomName = createRoomName()
    gameRoom["gameStarted"] = false
    gameRoom["currentlyPlaying"] = userId
    gameRoom["game"] = game
    gameRoom['roomName'] = roomName
    gameRoom["users"] = {}
    gameRoom["users"][userId] = { username: username }
    gameRoom["users"][userId]["turnsRolled"] = 0
    gameRoom["id"] = socket.id
    const user = {
      [userId]: {
        id: userId,
        username: username
      }
    }
    socket.join(socket.id)
    socket.emit('roomId', { gameRoom, user, userId })
  })

  socket.on('roomId', ({ roomId, username }) => {
    // console.log('ri ', roomId, 'su ', username)
    const userId = uuidv4()
    socket.join(roomId)
    const gameRoom = rooms[roomId]
    gameRoom["users"][userId] = { username: username }
    gameRoom["users"][userId]["turnsRolled"] = 0
    const users = rooms[roomId]["users"]
    const user = {
      [userId]: {
        id: userId,
        username: username
      }
    }
    console.log('bad ', user)
    socket.emit('youJoinedRoom', { gameRoom, userId, user })
    io.to(roomId).emit("users", { roomId, username, users })
  })

  socket.on('startCurrentGame', ({ gameRoom, user }) => {
    const { id } = gameRoom
    const users = rooms[id]['users']
    const player = rooms[id]["users"][user.id]
    console.log('pp ', player)
    const playersDice = player["dice"] = []

    for (let i = 0; i < 5; i++) {
      const dice = {}
      dice.value = Math.floor(Math.random() * 6) + 1
      dice.isActive = dice.value === 1 ? true : false
      playersDice.push(dice)
    }

    io.to(id).emit('someoneStartedPlaying', { gameRoom, user })
  })

  socket.on('rollTheDice', data => {
    const { userId, id, dice } = data

    const player = rooms[id]['users'][userId]
    console.log('1 ', rooms[id]['users'])
    console.log('2 ', player)
    console.log('3 ', userId)
    const serverDice = player.dice
    const cheater = areYouCheating({ dice, serverDice })
    const convertedDice = JSON.parse(dice)

    if (cheater) {
      const text = "You Suck"
      socket.emit('youSuck', text)
      return
    }

    // if (player.turnsRolled === 3) {
    //   const finalScore = getPlayerScore({ serverDice, player.turnsRolled })
    // }

    serverDice.length = 0
    player.turnsRolled++

    for (const die of convertedDice) {
      if (die.isActive) {
        serverDice.push(die)
      } else {
        const newInactiveDice = {}
        newInactiveDice.value = Math.floor(Math.random() * 6) + 1
        newInactiveDice.isActive = newInactiveDice.value === 1 ? true : false
        serverDice.push(newInactiveDice)
      }
    }

    console.log('p ', player, userId)

    io.to(id).emit('someoneRolledTheDice', { player, userId })
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});
