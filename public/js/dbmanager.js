const mysql = require('mysql');
const {query} = require("express");
const bcrypt = require('bcrypt');

let defaultHashedPw;

const users = []

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
        if(await this.userExists(username)) {
            console.log("User already exists");
            return Promise.resolve("User already exists");
        }
         return new Promise(async (resolve, reject) => {
             const hasdedPw = await bcrypt.hash(password, 10);
             this.con.query(query, [username, hasdedPw, role], (err, results) => {
                 if (err) {
                     console.log("Error inserting user", err);
                     reject("Error inserting user");
                 } else {
                     console.log("User inserted with ID: ", results.insertId);
                     resolve("User inserted");
                 }
                 resolve(results);
             });
         });
    }

    async userExists(username) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE username = ?';
            this.con.query(query, [username], (err, results) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(results.length > 0);
            });
        });
    }


}

module.exports = DBmanager;



