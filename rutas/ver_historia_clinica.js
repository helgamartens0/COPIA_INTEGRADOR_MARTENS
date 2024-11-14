const express = require('express');
const router = express.Router();
const conexion = require('../config/conexion');
// Ruta para ver la historia clínica
// Ruta para ver la historia clínica

router.get('/ver_historia_clinica', (req, res) => {
    if (!req.session.paciente) {
        return res.send("No hay datos del paciente guardados."); // Mostrar mensaje si no hay datos
    }
    const paciente = req.session.paciente;
    const consultaAlergia = `SELECT DISTINCT s_alergia.id_alergia, alergia.nombre_alergia, s_alergia.importancia_alergia, MIN(s_alergia.fecha_desde_alergia) AS fecha_desde, MAX(s_alergia.fecha_hasta_alergia) AS fecha_hasta, fecha_carga_alergia FROM s_alergia JOIN paciente ON s_alergia.id_historia_clinica = paciente.id_paciente JOIN alergia ON s_alergia.id_alergia = alergia.id_alergia WHERE paciente.id_paciente = 11 AND s_alergia.id_medico = 222 GROUP BY alergia.nombre_alergia ORDER BY fecha_carga_alergia ASC;`;

    const consultaAntecedente = ` SELECT s_antecedentes.id_antecedente,s_antecedentes.descripcion_antecedente, fecha_desde_antecedente, fecha_hasta_antecedente,fecha_carga_antecedente FROM s_antecedentes JOIN paciente ON s_antecedentes.id_historia_clinica = paciente.id_paciente WHERE s_antecedentes.id_historia_clinica = ? AND s_antecedentes.id_medico = ?; `;

    const consultaHabitos = `SELECT id_habito, descripcion, fecha_desde_habito, fecha_hasta_habito,fecha_carga_habito   
        FROM s_habito 
        JOIN paciente ON s_habito.id_historia_clinica = paciente.id_paciente 
        WHERE s_habito.id_historia_clinica = ? AND s_habito.id_medico = ?`;

    const consultaMedicamentos = ` SELECT id_medicamento, descripcion,fecha_carga_medicamento    
        FROM s_medicamento 
        JOIN paciente ON s_medicamento.id_historia_clinica = paciente.id_paciente 
        WHERE paciente.id_paciente  = ? AND s_medicamento.id_medico = ?  ;`;

    const consultaEvoluciones = `
            SELECT descripcion_evolucion, agenda_horarios.fecha
            FROM evolucion
            JOIN paciente ON evolucion.id_historia_clinica = paciente.id_paciente
            JOIN agenda_horarios ON evolucion.id_turno = agenda_horarios.id_agenda_horarios
            WHERE evolucion.id_historia_clinica = ? AND agenda_horarios.id_medico = ? ;
            `;

    const consultaDiagnosticos = `
            SELECT descripcion_diagnostico, agenda_horarios.fecha, agenda_horarios.id_paciente,
                agenda_horarios.motivo_cita, agenda_horarios.id_medico
            FROM diagnostico
            JOIN agenda_horarios ON diagnostico.id_agenda_horarios = agenda_horarios.id_agenda_horarios
            WHERE agenda_horarios.id_paciente = ? AND agenda_horarios.id_medico = ? ;
            `;

    const consultas = `SELECT agenda_horarios.fecha,agenda_horarios.motivo_cita, agenda_horarios.id_paciente, medico.nombre_medico, diagnostico.descripcion_diagnostico 
            FROM consultas 
            JOIN agenda_horarios ON agenda_horarios.id_agenda_horarios = consultas.id_agenda_horarios 
            JOIN medico ON medico.id_medico = consultas.id_medico
            JOIN diagnostico ON diagnostico.id_diagnostico = consultas.id_diagnostico
            WHERE consultas.id_paciente = ? AND consultas.id_medico != ?;
            `;

    // Primera consulta: alergias
    conexion.query(consultaAlergia, [paciente.id_paciente, paciente.id_medico], (errAlergias, resultAlergias) => {
        if (errAlergias) {
            console.log(errAlergias);
            return res.status(500).send("Error al obtener datos de alergias.");
        }

        // Segunda consulta: antecedentes
        conexion.query(consultaAntecedente, [paciente.id_paciente, paciente.id_medico], (errAntecedentes, resultAntecedentes) => {
            if (errAntecedentes) {
                console.log(errAntecedentes);
                return res.status(500).send("Error al obtener datos de antecedentes.");
            }
            //tercera consulta: habitos
            conexion.query(consultaHabitos, [paciente.id_paciente, paciente.id_medico], (errHabitos, resultHabitos) => {
                if (errHabitos) {
                    console.log(errHabitos);
                    return res.status(500).send("Error al obtener datos de habitos.");
                }
                //cuarta consulta: medicamentos
                conexion.query(consultaMedicamentos, [paciente.id_paciente, paciente.id_medico], (errMedicamentos, resultMedicamentos) => {
                    if (errMedicamentos) {
                        console.log(errMedicamentos);
                        return res.status(500).send("Error al obtener datos de medicamentos.");
                    }

                    //quinta consulta: evoluciones
                    conexion.query(consultaEvoluciones, [paciente.id_paciente, paciente.id_medico], (errEvoluciones, resultEvoluciones) => {
                        if (errEvoluciones) {
                            console.log(errEvoluciones);
                            return res.status(500).send("Error al obtener datos de evoluciones.");
                        }
                        //sexta consulta: diagnosticos
                        conexion.query(consultaDiagnosticos, [paciente.id_paciente, paciente.id_medico], (errDiagnosticos, resultDiagnosticos) => {
                            if (errDiagnosticos) {
                                console.log(errDiagnosticos);
                                return res.status(500).send("Error al obtener datos de los diagnosticos.");
                            }



                            //octava conexion: consultas realizadas por otros medicos 
                            conexion.query(consultas, [paciente.id_paciente, paciente.id_medico], (errConsultas, resultConsultas) => {
                                if (errConsultas) {
                                    console.log("error al obtener consulta de la BD" + errConsultas);
                                    return res.status(500).send("ERROR al obtener consultas de la BD");
                                }

                                // Formatear las fechas de las alergias
                                resultAlergias.forEach(alergia => {
                                    alergia.fecha_desde = formatFecha(alergia.fecha_desde);
                                    alergia.fecha_hasta = formatFecha(alergia.fecha_hasta);
                                    alergia.fecha_carga_alergia = formatFecha(alergia.fecha_carga_alergia);
                                });

                                // Formatear las fechas de los antecedentes
                                resultAntecedentes.forEach(antecedente => {
                                    antecedente.fecha_desde_antecedente = formatFecha(antecedente.fecha_desde_antecedente);
                                    antecedente.fecha_hasta_antecedente = formatFecha(antecedente.fecha_hasta_antecedente);
                                    antecedente.fecha_carga_antecedente = formatFecha(antecedente.fecha_carga_antecedente);
                                });

                                resultHabitos.forEach(habito => {
                                    habito.fecha_desde_habito = formatFecha(habito.fecha_desde_habito);
                                    habito.fecha_hasta_habito = formatFecha(habito.fecha_hasta_habito);
                                    habito.fecha_carga_habito = formatFecha(habito.fecha_carga_habito);
                                });

                                resultMedicamentos.forEach(medicamento => {
                                    medicamento.fecha_carga_medicamento = formatFecha(medicamento.fecha_carga_medicamento);
                                });

                                resultEvoluciones.forEach(evolucion => {
                                    evolucion.fecha = formatFecha(evolucion.fecha);
                                });

                                resultDiagnosticos.forEach(diagnostico => {
                                    diagnostico.fecha = formatFecha(diagnostico.fecha);
                                });

                                resultConsultas.forEach(consulta => {
                                    consulta.fecha = formatFecha(consulta.fecha);
                                });
                                // console.log("resultSelectAlergia: " + JSON.stringify(resultSelectAlergia, null, 2));
                                // Renderizar la vista con los datos
                                res.render('ver_historia_clinica', {
                                    paciente: paciente, // Pasar los datos del paciente a la vista
                                    alergias: resultAlergias,
                                    antecedentes: resultAntecedentes,
                                    habitos: resultHabitos,
                                    medicamentos: resultMedicamentos,
                                    evoluciones: resultEvoluciones,
                                    diagnosticos: resultDiagnosticos,
                                    consultas: resultConsultas,

                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
// Función para formatear la fecha a DD-MM-AAAA
function formatFecha(fecha) {
    if (!fecha) return null; // Si no hay fecha, retorna null

    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const año = date.getFullYear();

    return `${dia}-${mes}-${año}`;
}


module.exports = router;