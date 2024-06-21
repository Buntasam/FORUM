const express = require('express')
const app = express()
const DBmanager = require('./public/js/dbmanager.js')
require('dotenv').config()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const mysql = require("mysql");
const session = require('express-session')
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})

const port = 3000

app.use(express.static('public'))
app.use(session({
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: false
  }
}))

app.get('/', (req, res) => {
  console.log(req.session)
  res.sendFile(__dirname + '/public/html/createaccount.html')
})

app.get('/home', (req, res) => {
  if(req.session.idUser){
    res.sendFile(__dirname + '/public/html/home.html')
  }else {
    res.sendFile(__dirname + '/public/html/createaccount.html')
  }
})

const db = new DBmanager("localhost","root","")

const backendPlayers = {}

io.on('connection', (socket) => {
  socket.on('createUser', ({username, password}) => {
    db.insertUser(username, password, "membre")
    app.get('/', (req, res) => {
      res.send(__dirname + '/public/html/home.html')
    })
  })



  socket.on('disconnect', reason => {
    console.log(`Socket disconnected: ${reason}`);
  })


});

server.listen(port, () => {
  console.log('http://localhost:3000')
})
