const mysql = require('mysql');
const {query} = require("express");
const bcrypt = require('bcrypt');

let defaultHashedPw;

const users = []

// (async () => {
//     const salt = await bcrypt.genSalt(10);
//
//     defaultHashedPw = await bcrypt.hash("password", salt);
//
//     users.push({
//         id: 1,
//         username: "admin",
//         password: defaultHashedPw,
//     })
// })();

class DBmanager {
    con;
    constructor(host, user, password) {
        this.host = host
        this.user = user
        this.password = password
        this.con = this.getConnection();
    }


    getConnection() {
         const con = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: "forum",
            port: 3306
        });

        con.connect((err) => {
            if (err) {
                console.log("Error connecting to database", err);
                return;
            }
            console.log("Connected!");
        });
        return con;
    }

    async insertUser(username, password, role) {
        const query = 'INSERT INTO users (username,password,role) VALUES (?,?,?)';
        this.con.query(query, [username, password, role], (err, results) => {
            if (err) {
                console.log("Error inserting user", err);
                return;
            }
            console.log('User created with ID', results.insertId);
        });
    }
}

module.exports = DBmanager;



