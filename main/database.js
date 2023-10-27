import {app} from "electron";

const sqlite3 = require('sqlite3').verbose();

// Create and connect to the database
let db ;

function connect() {
    console.log('connect : ',app.getPath("userData")+'/database.db')
    return new sqlite3.Database(app.getPath("userData")+'/database.db') ;
}
// Create a table
// db.serialize(() => {
//     db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER)');
//
//     // Insert data into the table
//     const stmt = db.prepare('INSERT INTO users (name, age) VALUES (?, ?)');
//     stmt.run('John Doe', 25);
//     stmt.run('Jane Smith', 30);
//     stmt.finalize();
//
//     // Retrieve data from the table
//     db.each('SELECT * FROM users', (err, row) => {
//         console.log(row.id, row.name, row.age);
//     });
// });
//
// // Close the database connection when done
// db.close();

// Retrieve data from the table function
function getUser(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

// Retrieve data from the table function
function getUsers() {
    return new Promise((resolve, reject) => {
        const db = connect();
        db.all('SELECT * FROM users', (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
        db.close();
    });
}

// Insert data into the table function
function insertUser(name, age) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (name, age) VALUES (?, ?)', [name, age], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

// Update data in the table function
function updateUser(id, name, age) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users SET name = ?, age = ? WHERE id = ?', [name, age, id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

// Delete data from the table function
function deleteUser(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function getUsage() {
    return new Promise((resolve, reject) => {
        const db = connect();
        db.all('SELECT seq AS key, v_code, m_code, f_code, u_date, u_usage FROM usage_t', (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
        db.close();
    });
}

// Export functions
export default getUsers;
