const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'forum'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

app.post('/register', (req, res) => {
    const { username, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.send('Les mots de passe ne correspondent pas.');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) throw err;
        res.send('Compte créé avec succès.');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.send('Nom d\'utilisateur incorrect.');
        }

        const user = results[0];

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.send('Mot de passe incorrect.');
        }

        res.send('Connexion réussie.');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
