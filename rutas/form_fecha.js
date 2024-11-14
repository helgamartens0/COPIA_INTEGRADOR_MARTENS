const express = require('express');
const router = express.Router();
const conexion = require('../config/conexion');

router.get('/mostrar_turno', (req, res) => {
    const id_medico = req.query.id_medico || req.session.id_medico;
    const medico = req.query.medico || req.session.medico;
    console.log("id del medico en la fecha seleccionada: " + id_medico);
    console.log("nombre del medico en la fecha seleccionada: " + medico);
    const fechaSeleccionada = req.query.fechaSeleccionada; // Obtener la fecha seleccionada desde la solicitud
    console.log("fechaSeleccionada en el form: " + fechaSeleccionada);
    console.log(fechaSeleccionada === obtenerFechaHoy()); //
    const consulta = `
    SELECT paciente.id_paciente, nombre_paciente, agenda_horarios_estados.id_estado, descripcion, fecha, inicio, motivo_cita, nombre_medico 
    FROM agenda_horarios 
    JOIN medico ON medico.id_medico = agenda_horarios.id_medico 
    JOIN paciente ON agenda_horarios.id_paciente = paciente.id_paciente 
    JOIN agenda_horarios_estados ON agenda_horarios_estados.id_estado = agenda_horarios.id_estado 
    WHERE agenda_horarios.id_medico = ? AND fecha = ? 
    ORDER BY fecha, inicio, id_estado DESC;`;

    conexion.query(consulta, [id_medico, fechaSeleccionada], (err, turnos) => {
        if (err) {
            console.error("Error al obtener los turnos:", err);
            return res.redirect("/agenda_mes");
        } else {
            // Formatear la fecha de cada turno a DD-MM-AAAA
            turnos.forEach(turno => {
                turno.fecha = formatFecha(turno.fecha); // Formatear la fecha
            });

            // Pasamos `fechaSeleccionada` y `turnosHoy` a la vista Pug
            res.render('agenda_mes', {
                medico: req.session.medico,
                id_medico: req.session.id_medico,
                turnosHoy: turnos,
                today: new Date().toISOString().split('T')[0] // Formato aaaa-mm-dd
            });
        }
    });
});
// Función para formatear la fecha a DD-MM-AAAA
function formatFecha(fecha) {
    if (!fecha) return null; // Si no hay fecha, retorna null

    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();

    return `${anio}-${mes}-${dia}`;
}
// Función para obtener la fecha de hoy en formato DD-MM-AAAA
function obtenerFechaHoy() {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${anio}-${mes}-${dia}`;
}

module.exports = router;