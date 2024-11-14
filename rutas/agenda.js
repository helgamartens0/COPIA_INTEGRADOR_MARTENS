/*const express = require('express');
const router = express.Router();
const conexion = require('../config/conexion');
const link = require("../config/link");
 
router.get('/agenda', (req, res) => {
    if (req.session.medico) {
        const id_medico = req.session.id_medico;

        const query = `
            SELECT e.id_especialidad, e.descripcion 
            FROM especialidad e 
            JOIN medico_especialidad me ON e.id_especialidad = me.id_especialidad 
            WHERE me.id_medico = ?;
        `;

        conexion.query(query, [id_medico], (err, especialidades) => {
            if (err) {
                console.error("Error al obtener especialidades:", err);
                return res.redirect('/'); // Manejar el error apropiadamente
            }

            res.render('agenda', {
                medico: req.session.medico,
                id_medico: id_medico,
                especialidades
            });
        });
    } else {
        res.redirect('/');
    }
});


module.exports = router; // Exporta el router*/