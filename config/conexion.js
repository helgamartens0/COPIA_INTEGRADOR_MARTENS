const sql = require('mysql2');

let conexion = sql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.PASSWORD
})

conexion.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log('connection established');
    }
});

module.exports = conexion;