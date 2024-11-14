const express = require('express');
const router = express.Router();
const conexion = require('../config/conexion');

router.post('/actualizar_alergia', async(req, res) => {
    const { id_historia_clinica, id_alergia, fecha_hasta_alergia } = req.body;
    // Verificar los valores recibidos
    console.log("Datos recibidos:", req.body);
    if (!fecha_hasta_alergia) {
        return res.status(200).send("Falta la fecha de la alergia");
    } else {
        try {
            const actualizarAlergia = "UPDATE s_alergia SET fecha_hasta_alergia = ? WHERE id_alergia = ? AND id_historia_clinica = ?";
            conexion.query(actualizarAlergia, [fecha_hasta_alergia, id_alergia, id_historia_clinica], (err, result) => {
                if (err) {
                    console.log("Error al actualizar la fecha de la alergia: " + err);
                    return res.status(500).send('Hubo un problema al guardar la actualización de la alergia.');
                }
                console.log("se actualizo correctamente la fecha de la alergia");
                res.redirect('/historia_clinica');
            });
        } catch (err) {
            console.log("Error en la inserción: " + err);
            res.status(500).send("Hubo un problema en la actualizacion de la alergia: " + err);
        }
    }
});

router.post('/actualizar_antecedente', async(req, res) => {
    const { id_historia_clinica, id_antecedente, fecha_hasta_antecedente } = req.body;
    if (!fecha_hasta_antecedente) {
        return res.status(200).send("falta marcar la fecha ");
    } else {
        try {
            const actualizarAntecedente = "UPDATE s_antecedentes SET fecha_hasta_antecedente = ? WHERE id_antecedente = ? AND id_historia_clinica = ?;";
            conexion.query(actualizarAntecedente, [fecha_hasta_antecedente, id_antecedente, id_historia_clinica], (err, result) => {
                if (err) {
                    console.log("error updating fecha_hasta_antecedente" + err);
                    return res.status(500).send("hubo un problema actualizando la fecha del antecedente" + err);
                }
                console.log("se actualizo correctamente la fecha del antecedente" + result);
                res.redirect('/historia_clinica');
            });
        } catch (err) {
            console.log("Error en la inserción: " + err);
            res.status(500).send('Hubo un problema en la actualizacion del antecedente.' + err);
        }
    }
});


router.post('/actualizar_habito', async(req, res) => {
    const { id_historia_clinica, id_habito, fecha_hasta_habito } = req.body;
    //  console.log("Valores recibidos:", fecha_hasta_habito, id_habito, id_historia_clinica);
    // Si id_habito es un arreglo, toma el primer valor
    let idHabito = id_habito;
    console.log("id del habito: ", idHabito);


    if (!fecha_hasta_habito) {
        return res.status(200).send('falta la fecha del habito');
    } else {
        try {
            const actualizarHabito = "UPDATE s_habito SET fecha_hasta_habito = ?  WHERE id_habito = ? AND id_historia_clinica = ?;";
            conexion.query(actualizarHabito, [fecha_hasta_habito, idHabito, id_historia_clinica], (err, result) => {
                if (err) {
                    return res.status(500).send("hubo un problema actualizando la fecha del habito" + err);
                }
                console.log("se actualizo correctamente la fecha del habito" + result);
                res.redirect('/historia_clinica');
            });
        } catch (err) {
            console.log("Error en la inserción: " + err);
            res.status(500).send('Hubo un problema en la actualizacion del habito.' + err);
        }
    }
});

module.exports = router;