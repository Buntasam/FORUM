const express = require('express')
const app = express()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/home.html')
})

const backendPlayers = {}
const game = {}

io.on('connection', (socket) => {
  socket.on('initgame', ({username}) => {
    backendPlayers[socket.id] = {
      username
    }
    console.log(backendPlayers);
  })
  io.emit('updatePlayers', backendPlayers)


  socket.on('disconnect', reason => {
    console.log(reason);
    delete backendPlayers[socket.id]
    io.emit('updatePlayers', backendPlayers)

  })
});

server.listen(port, () => {
  console.log('http://localhost:3000')
})
