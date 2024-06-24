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
const bodyParser = require("body-parser");
const {redirect} = require("express/lib/response");
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})

const port = 3000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const users =[{id: 1, username: "meca", password: "azerty"},
  {id: 2, username: "bunta", password: "querty",}]

app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: process.env.SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: true,
    }
}));

const redirectLogin = (req, res, next) => {
  if(!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
};

const redirectHome = (req, res, next) => {
  if(req.session.userId) {
    res.redirect('/home');
  } else {
    next();
  }
};

const redirectRegister = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/register');
  } else {
    next();
  }
}



app.get('/', redirectLogin, (req, res) => {
  const { userId } = req.session;
  console.log(`User ID: ${userId}`.green)
})

app.get('/register',redirectHome , (req, res) => {
  console.log(req.session)
  res.sendFile(__dirname + '/public/html/createaccount.html')
});

app.get('/login',redirectHome ,(req, res) => {
  res.sendFile(__dirname + '/public/html/login.html')
});

app.post('/register',redirectHome , (req, res) => {
  res.sendFile(__dirname + '/public/html/createaccount.html')
});

app.post('/login',redirectHome , (req, res) => {
  res.sendFile(__dirname + '/public/html/login.html')
});

app.get('/home',redirectLogin , (req, res) => {
  res.sendFile(__dirname + '/public/html/home.html')
});

app.get('/logout',redirectLogin , (req, res) => {

});

const db = new DBmanager("localhost","root","")

const backendPlayers = {}

io.on('connection', (socket) => {
  socket.on('createUser', ({username, password}) => {
    db.insertUser(username, password, "membre");
  });

  socket.on('registerPage', () => {
    redirect('/register')
  });

  socket.on('disconnect', reason => {
    console.log(`Socket disconnected: ${reason}`);
  })



});

server.listen(port, () => {
  console.log('http://localhost:3000')
})

