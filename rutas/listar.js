/*const express = require('express');
const router = express.Router();
const conexion = require('../config/conexion'); // Asegúrate de tener la conexión a la base de datos

// Definir la ruta para /listar
router.get("/listar", (req, res) => {
    // Recuperamos médicos desde la base de datos
    conexion.query("SELECT * FROM medico", (err, result) => {
        if (err) {
            throw new Error("No se pudo consultar los médicos");
        } else {
            res.render("listar", { medicos: re sult }); // Renderizamos la vista listar.pug con los datos
        }
    });
});

module.exports = router; // Exportamos el router*/