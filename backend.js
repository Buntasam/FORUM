const express = require('express');
const app = express();
const DBmanager = require('./public/js/dbmanager.js');
const bodyParser = require('body-parser'); // Ajout de body-parser

// socket.io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json()); // Utilisation de body-parser pour parser les données JSON

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/createaccount.html');
});

const db = new DBmanager("localhost", "root", "");

// Route pour gérer la création d'utilisateur
app.post('/createUser', (req, res) => {
  const { username, password, role } = req.body;
  db.insertUser(username, password, role)
    .then(() => {
      res.status(200).send({ message: 'User created successfully' });
    })
    .catch(err => {
      res.status(500).send({ message: 'Error creating user', error: err });
    });
});

const backendPlayers = {};

io.on('connection', (socket) => {
  socket.on('initgame', ({ username }) => {
    backendPlayers[socket.id] = {
      username
    };
    console.log(backendPlayers);
  });
  io.emit('updatePlayers', backendPlayers);

  socket.on('disconnect', reason => {
    console.log(reason);
    delete backendPlayers[socket.id];
    io.emit('updatePlayers', backendPlayers);
  });
});

server.listen(port, () => {
  console.log('http://localhost:3000');
});
