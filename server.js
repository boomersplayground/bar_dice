const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
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

const areYouCheating = ({ dice, serverDice }) => {
  const convertedDice = JSON.parse(dice)

  for (let i = 0; i < serverDice.length; i++) {
    if (serverDice[i].value !== convertedDice[i].value) {
      return true
    }
  }

  return false
}

io.on('connection', (socket) => {
  socket.on('startRoom', data => {
    console.log("Start current game", data)
    const { user, gameType } = data.payload
    const game = readableGame({ game: gameType })
    const gameRoom = rooms[socket.id] = {}
    const userId = uuidv4()
    gameRoom["gameStarted"] = false
    gameRoom["game"] = game
    gameRoom["users"] = []
    gameRoom["users"][userId] = { name: user }
    gameRoom["gameCreator"] = user
    gameRoom["users"][userId]["turnsRolled"] = 0
    gameRoom["id"] = socket.id
    const users = rooms[socket.id]['users']
    socket.join(socket.id)
    console.log('u ', users)
    socket.emit('roomId', { gameRoom, users, userId, username: user })
  })

  socket.on('roomId', ({ roomId, user }) => {
    console.log('ri ', roomId, 'su ', user)
    const userId = uuidv4()
    socket.join(roomId)
    const gameRoom = rooms[roomId]
    gameRoom["users"][userId] = { name: user }
    gameRoom["users"][userId]["turnsRolled"] = 0
    const users = rooms[roomId]["users"]
    console.log('bad ', users)
    socket.emit('youJoinedRoom', { user })
    io.to(roomId).emit("users", { roomId, user, users })
  })

  socket.on('startCurrentGame', ({ id, username, userId }) => {
    const users = rooms[id]['users']
    const player = rooms[id]["users"][userId]
    const playersDice = player["dice"] = []

    for (let i = 0; i < 5; i++) {
      const dice = {}
      dice.value = Math.floor(Math.random() * 6) + 1
      dice.isActive = dice.value === 1 ? true : false
      playersDice.push(dice)
    }

    console.log("here", player)
    io.to(id).emit('someoneStartedPlaying', { username, player, userId })
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
    player.turnsRolled ++

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
