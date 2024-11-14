const express = require('express');
const router = express.Router();
const conexion = require('../config/conexion');
const link = require("../config/link");

router.post("/login", function(req, res) {
    console.log("Solicitud de inicio de sesión recibida");
    const datos = req.body;

    let username = datos.usuario;
    let contrasenia = datos.pass;

    const verificar = "SELECT id_usuario,nombre_medico, contrasenia FROM usuario JOIN medico ON usuario.id_usuario = medico.id_medico WHERE id_usuario = ? AND contrasenia = ?;";

    conexion.query(verificar, [username, contrasenia], function(err, resultado) {
        if (err) {
            throw err;
        } else {
            if (resultado.length > 0) {
                console.log("Usuario encontrado");
                req.session.medico = resultado[0].nombre_medico;
                req.session.id_medico = resultado[0].id_usuario;
                console.log("Nombre del médico guardado en sesión:", req.session.medico); // Verificar que se guarda correctamente
                console.log("id del medico: ", req.session.id_medico)
                res.redirect(`/agenda_mes?id_medico=${resultado[0].id_usuario}`);
            } else {
                console.log("Los datos ingresados NO son correctos");
                res.render("index", { link });
            }
        }
    });
});

module.exports = router;