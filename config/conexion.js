const sql = require('mysql2');

let conexion = sql.createConnection({
    host: process.env.DB_HOST,

    user: process.env.DB_USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME
})

conexion.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log('connection established');
    }
});

module.exports = conexion;