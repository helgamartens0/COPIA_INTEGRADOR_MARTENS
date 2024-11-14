const express = require('express');
const router = express.Router();
const conexion = require('../config/conexion');
router.get('/agenda_mes', (req, res) => {
    const id_medico = req.session.id_medico;

    const consulta = `
    SELECT agenda_horarios.id_agenda_horarios, paciente.id_paciente, nombre_paciente, 
    agenda_horarios_estados.id_estado, descripcion, fecha, inicio, motivo_cita, nombre_medico 
    FROM agenda_horarios JOIN medico ON medico.id_medico = agenda_horarios.id_medico 
    JOIN paciente ON agenda_horarios.id_paciente = paciente.id_paciente 
    JOIN agenda_horarios_estados ON agenda_horarios_estados.id_estado = agenda_horarios.id_estado
     WHERE agenda_horarios.id_medico = ? ORDER BY fecha, inicio, id_estado DESC;
    `;
    const today = obtenerFechaHoy();
    let fechaSeleccionada = req.query.fechaSeleccionada || today; // asigna la fecha actual si no hay fechaSeleccionada


    conexion.query(consulta, [id_medico], (err, turnos) => {
        if (err) {
            console.error("Error al obtener turnos:", err);
            return res.redirect('/');
        } else {

            turnos.forEach(turno => {
                turno.fecha = formatFecha(turno.fecha);
            });

            console.log("fecha de hoy: " + today);
            console.log("fecha seleccionada: " + fechaSeleccionada);
            const turnosHoy = turnos.filter(turno => turno.fecha === fechaSeleccionada);
            const otrosTurnos = turnos.filter(turno => turno.fecha !== fechaSeleccionada);

            res.render('agenda_mes', {
                medico: req.session.medico,
                turnosHoy,
                otrosTurnos,
                today,
                fechaSeleccionada,
                id_medico: req.session.id_medico
            });
        }
    });
});


// Ruta para guardar los datos del paciente en la sesión
router.get('/guardar_paciente/:id_paciente/:id_agenda_horarios', (req, res) => {
    const id_paciente = req.params.id_paciente;
    const id_agenda_horarios = req.params.id_agenda_horarios;
    // Consulta para obtener los datos del paciente después de actualizar el estado
    const consultaPaciente = "SELECT *, id_agenda_horarios FROM paciente JOIN agenda_horarios ON agenda_horarios.id_paciente = paciente.id_paciente" +
        " WHERE agenda_horarios.id_agenda_horarios = ? " +
        " AND paciente.id_paciente = ? ;";

    conexion.query(consultaPaciente, [id_agenda_horarios, id_paciente], (errPaciente, resultado) => {
        if (errPaciente) {
            console.error("Error al obtener datos del paciente:", errPaciente);
            return res.redirect('/agenda_mes');
        }

        if (resultado.length === 0) {
            console.log("No se encontró un paciente con el ID especificado.");
            return res.redirect('/agenda_mes');
        }

        // Guardar los datos del paciente en la sesión
        req.session.paciente = resultado[0];
        req.session.paciente.edad = calcularEdad(req.session.paciente.fecha_nac_paciente);

        console.log("Datos del paciente guardados en sesión:", req.session.paciente);

        // Redirigir a la página de historia clínica
        res.redirect(`/ver_historia_clinica?id_paciente=${id_paciente}`);
    });
});



router.get('/guardar_paciente_atendido/:id_paciente/:id_agenda_horarios', (req, res) => {
    const id_paciente = req.params.id_paciente;
    const id_agenda_horarios = req.params.id_agenda_horarios;
    // Consulta para obtener los datos del paciente después de actualizar el estado
    const consultaPaciente = "SELECT *, id_agenda_horarios FROM paciente JOIN agenda_horarios ON agenda_horarios.id_paciente = paciente.id_paciente" +
        " WHERE agenda_horarios.id_agenda_horarios = ? " +
        " AND paciente.id_paciente = ? ;";

    conexion.query(consultaPaciente, [id_agenda_horarios, id_paciente], (errPaciente, resultado) => {
        if (errPaciente) {
            console.error("Error al obtener datos del paciente:", errPaciente);
            return res.redirect('/agenda_mes');
        }

        if (resultado.length === 0) {
            console.log("No se encontró un paciente con el ID especificado.");
            return res.redirect('/agenda_mes');
        }

        // Guardar los datos del paciente en la sesión
        req.session.paciente = resultado[0];
        req.session.paciente.edad = calcularEdad(req.session.paciente.fecha_nac_paciente);

        console.log("Datos del paciente guardados en sesión:", req.session.paciente);

        // Redirigir a la página de historia clínica
        res.redirect('/historia_clinica');
    });
});


// Función para formatear la fecha a DD-MM-AAAA
function formatFecha(fecha) {
    if (!fecha) return null; // Si no hay fecha, retorna null

    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();

    return `${ anio }-${ mes }-${ dia }`;
}
// Función para calcular la edad dada una fecha de nacimiento
function calcularEdad(fechaNacimiento) {
    const hoy = new Date(); // Fecha actual
    const nacimiento = new Date(fechaNacimiento); // Convertir la fecha de nacimiento en objeto Date

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    // Si aún no ha cumplido años este año, restamos 1
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}
// Función para obtener la fecha de hoy en formato DD-MM-AAAA
function obtenerFechaHoy() {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${ anio }-${ mes }-${ dia }`;

}

module.exports = router;