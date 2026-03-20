import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import http from 'http'
import { Server } from 'socket.io'
import { createRoomName } from './utilities/cities.js'

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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

const allGames = { rooms: {}}

io.on('connection', (socket) => {
  socket.on('startRoom', data => {
    const { username: user, gameType } = data
    const game = readableGame({ game: gameType })
    const gameRoom = allGames.rooms[socket.id] = {}
    const userId = uuidv4()
    gameRoom['roomName'] = createRoomName()
    gameRoom["gameStarted"] = false
    gameRoom["game"] = game
    gameRoom["users"] = []
    gameRoom["users"].push({id: userId, name: user, turnsRolled: 0, dice: [] })
    gameRoom["currentlyPlaying"] = userId
    gameRoom["id"] = socket.id
    const users = gameRoom['users']
    socket.join(socket.id)
    socket.emit('roomId', { gameRoom, users, userId, user })
  })

  socket.on('roomId', ({ roomId, username }) => {
    const userId = uuidv4()
    const user = username
    socket.join(roomId)
    const gameRoom = allGames.rooms[roomId]
    gameRoom["users"].push({id: userId, name: user, turnsRolled: 0, dice: [] })
    const users = gameRoom["users"]
    console.log('ll ', gameRoom)
    socket.emit('youJoinedRoom', { user, gameRoom })
    io.to(roomId).emit("users", { gameRoom })
  })

  socket.on('startCurrentGame', ({ gameRoom, user }) => {
    console.log('gg ', gameRoom)
    const { currentlyPlaying, id } = gameRoom
    const users = gameRoom['users']
    const player = users.find(user => user.id === currentlyPlaying)
    const playersDice = player["dice"] = []

    for (let i = 0; i < 5; i++) {
      const dice = {}
      dice.value = Math.floor(Math.random() * 6) + 1
      dice.isActive = dice.value === 1 ? true : false
      playersDice.push(dice)
    }

    io.to(id).emit('someoneStartedPlaying', { gameRoom })
  })

  socket.on('rollTheDice', data => {
    const { userId, id, dice } = data

    const player = rooms[id]['users'][userId]
    console.log('1rtd ', rooms[id]['users'])
    console.log('2rtd ', player)
    console.log('3rtd ', userId)
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
