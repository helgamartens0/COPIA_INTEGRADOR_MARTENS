require('dotenv').config(); // Cargar variables de entorno

const mysql = require('mysql2');

// Crear la conexión a la base de datos con los valores de .env
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.MYSQL_ADDON_DB
});

console.log(process.env.DB_HOST); // Debería imprimir 'bqyfnfvkn725migytxqx-mysql.services.clever-cloud.com'
console.log(process.env.DB_USERNAME); // Debería imprimir 'uasfantmhwbqy22h'
console.log(process.env.DB_PASSWORD); // Debería imprimir 'iIrehnbxkaFOMF4OkYtu'
console.log(process.env.DB_NAME); // Debería imprimir 'bqyfnfvkn725migytxqx'

// Conectar a la base de datos
conexion.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err.stack);
        return;
    }
    console.log("Conexión a la base de datos exitosa.");

    // Aquí seleccionas explícitamente la base de datos que deseas usar
    conexion.query("USE bqyfnfvkn725migytxqx", function(err) {
        if (err) throw err;
        console.log("Base de datos 'consultorio_martens' seleccionada.");
    });
});

module.exports = conexion;