const sqlite3 = require("sqlite3")
const db = new sqlite3.Database("./database.db")

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS  transactions 
        (
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        type   TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT
        )`)
})

module.exports = db;