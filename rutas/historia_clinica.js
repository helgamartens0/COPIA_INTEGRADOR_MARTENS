const express = require('express');
const router = express.Router();
const conexion = require('../config/conexion');

// Ruta para ver la historia clínica
router.get('/historia_clinica', (req, res) => {
    if (!req.session.paciente) {
        return res.send("No hay datos del paciente guardados."); // Mostrar mensaje si no hay datos
    }
    const paciente = req.session.paciente;
    const consultaSelectAlergia = `SELECT id_alergia,nombre_alergia FROM alergia`;
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

    const consultaTemplates = `SELECT * FROM templates WHERE id_medico = ? `;
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

                            //septima conexion: select de alergias
                            conexion.query(consultaSelectAlergia, (errSelectAlergia, resultSelectAlergia) => {
                                if (errSelectAlergia) {
                                    console.log(errSelectAlergia);
                                    return res.status(500).send("Error al obtener datos de alergias para selección.");
                                }

                                //octava conexion: consultas realizadas por otros medicos 
                                conexion.query(consultas, [paciente.id_paciente, paciente.id_medico], (errConsultas, resultConsultas) => {
                                    if (errConsultas) {
                                        console.log("error al obtener consulta de la BD" + errConsultas);
                                        return res.status(500).send("ERROR al obtener consultas de la BD");
                                    }
                                    //novena conexion: consulta templates
                                    conexion.query(consultaTemplates, [paciente.id_medico], (errTemplates, resultTemplates) => {
                                        if (errTemplates) {
                                            console.log("Error al obtener templates de la BD" + errTemplates);
                                            return res.status(500).send("Error al obtener templates de la BD ");
                                        } //  console.log("Datos obtenidos de alergias: " + JSON.stringify(resultSelectAlergia, null, 2));

                                        // Formatear las fechas
                                        resultAlergias.forEach(alergia => {
                                            alergia.fecha_desde = formatFecha(alergia.fecha_desde);
                                            alergia.fecha_hasta = formatFecha(alergia.fecha_hasta);
                                            alergia.fecha_carga_alergia = formatFecha(alergia.fecha_carga_alergia);
                                        });

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
                                        // console.log("resultTemplates: " + JSON.stringify(resultTemplates, null, 2));
                                        res.render('historia_clinica', {
                                            paciente: paciente, // Pasar los datos del paciente a la vista
                                            alergias: resultAlergias,
                                            antecedentes: resultAntecedentes,
                                            habitos: resultHabitos,
                                            medicamentos: resultMedicamentos,
                                            evoluciones: resultEvoluciones,
                                            diagnosticos: resultDiagnosticos,
                                            alergiasSelect: resultSelectAlergia,
                                            consultas: resultConsultas,
                                            templates: resultTemplates

                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.get('/historia_clinica', (req, res) => {
    const alergias = "SELECT * FROM alergia";

    conexion.query(alergias, (err, result) => {
        if (err) {
            console.log("error al obtener alergia de la BD" + err);
            return res.status(500).send("ERROR al obtener alergias de la BD");
        }

        res.render('historia_clinica', {
            alergias: result
        });
    });
});
router.post('/agregar_alergia', async(req, res) => {
    console.log(req.body);
    const { id_alergia, importancia_alergia, fecha_desde_alergia, fecha_hasta_alergia, id_historia_clinica, id_medico } = req.body;
    console.log("id_alergia: " + id_alergia);
    // Si id_alergia es un array, toma solo el primer valor
    const idAlergia = Array.isArray(id_alergia) ? id_alergia[1] : id_alergia;
    console.log("idAlergia: " + idAlergia);
    if (!idAlergia || idAlergia === "") {
        return res.status(400).send("Debe seleccionar una alergia.");
    }

    if (!importancia_alergia || !fecha_desde_alergia) {
        return res.status(400).send("Faltan datos obligatorios");
    } else {
        try {
            const insertar = `
            INSERT INTO s_alergia(id_alergia, importancia_alergia, fecha_desde_alergia, fecha_hasta_alergia, id_historia_clinica, id_medico, fecha_carga_alergia)
            VALUES( ? , ? , ? , ? , ? , ?, CURRENT_DATE )
            `;

            conexion.query(insertar, [idAlergia, importancia_alergia, fecha_desde_alergia, fecha_hasta_alergia || null, id_historia_clinica, id_medico], (err, result) => {
                if (err) {
                    console.error('Error al agregar alergia:', err);
                    return res.status(500).send('Hubo un problema al guardar la alergia.');
                }

                res.redirect('/historia_clinica');
            });
        } catch (error) {
            console.error('Error en la inserción:', error);
            res.status(500).send('Hubo un problema al insertar la alergia.');
        }
    }
});

router.post('/agregar_antecedente', async(req, res) => {
    console.log(req.body);
    const { descripcion_antecedente, fecha_desde_antecedente, fecha_hasta_antecedente, id_historia_clinica, id_medico } = req.body;
    if (!descripcion_antecedente || !fecha_desde_antecedente) {
        return res.status(400).send("Faltan datos obligatorios");
    } else {
        try {
            const insertar = "INSERT INTO s_antecedentes(descripcion_antecedente,fecha_desde_antecedente, fecha_hasta_antecedente, id_historia_clinica,id_medico,fecha_carga_antecedente)" +
                " VALUES (?,?,?,?,?, CURRENT_DATE);";

            conexion.query(insertar, [descripcion_antecedente, fecha_desde_antecedente, fecha_hasta_antecedente || null, id_historia_clinica, id_medico], (err, result) => {
                if (err) {
                    console.log("error al insertar antecedente patologico" + err.message);
                    return res.status(500).send('Hubo un problema al guardar el antecedente.');
                }
                res.redirect('/historia_clinica');

            });
        } catch (err) {
            console.log("error en la insercion");
            res.status(500).send('Hubo un problema al insertar el antecedente.');
        }

    }
});

router.post('/agregar_habito', async(req, res) => {
    console.log(req.body);
    const { descripcion, fecha_desde_habito, fecha_hasta_habito, id_historia_clinica, id_medico } = req.body;
    if (!descripcion || !fecha_desde_habito) {
        return res.status(404).send("faltan datos obligatorios");
    } else {
        try {
            const insertarS_Habito = "INSERT INTO s_habito (descripcion,fecha_desde_habito,fecha_hasta_habito,id_historia_clinica,id_medico,fecha_carga_habito) " +
                " VALUES (?,?,?,?,?,CURRENT_DATE);";

            conexion.query(insertarS_Habito, [descripcion, fecha_desde_habito, fecha_hasta_habito || null, id_historia_clinica, id_medico], (err, result) => {
                if (err) {
                    console.log("error al insertar habito" + err.message);
                    return res.status(500).send('Hubo un problema al guardar el habito.');
                }
                res.redirect('/historia_clinica');
            });
        } catch (err) {
            console.log("error en la insercion" + err);
            res.status(500).send('hubo un problema al insertar el habito.');
        }

    }
});
router.post('/agregar_medicamento', async(req, res) => {
    console.log(req.body);
    const { descripcion, id_historia_clinica, id_medico } = req.body;

    if (!descripcion) {

        return res.status(404).send("faltan datos obligatorios");
    } else {
        try {
            const insertar = "INSERT INTO s_medicamento (descripcion,id_historia_clinica,id_medico,fecha_carga_medicamento) " +
                "VALUES (?,?,?,CURRENT_DATE);";
            conexion.query(insertar, [descripcion, id_historia_clinica, id_medico], (err, result) => {
                if (err) {
                    console.log("error al insertar medicamento" + err.message);
                    return res.status(500).send('Hubo un problema al guardar el medicamento.');
                }
                res.redirect('/historia_clinica');
            });
        } catch (err) {
            console.log("error en la insercion");
            res.status(500).send('Hubo un problema al insertar el medicamento.');
        }
    }
});
router.post('/agregar_diagnostico', async(req, res) => {
    console.log(req.body);
    const { descripcion_diagnostico, id_agenda_horarios } = req.body;
    if (!descripcion_diagnostico) {
        return res.status(404).send("faltan datos obligatorios en el diagnostico");
    } else {
        try {
            const insertar = "INSERT INTO diagnostico (descripcion_diagnostico, id_agenda_horarios,id_estado) " +
                "VALUES (?,?,1);";
            conexion.query(insertar, [descripcion_diagnostico, id_agenda_horarios], (err, result) => {
                if (err) {
                    console.log("error al insertar diagnostico" + err.message);
                    return res.status(500).send('Hubo un problema al guardar el diagnostico.');
                }
                res.redirect('/historia_clinica');
            });
        } catch (err) {
            console.log("error en la insercion");
            res.status(500).send('Hubo un problema al insertar el diagnostico.');
        }
    }
});

router.post('/agregar_evolucion', async(req, res) => {
    // console.log(req.body);
    if (!req.session.paciente) {
        return res.send("No hay datos del paciente guardados."); // Mostrar mensaje si no hay datos
    }
    const paciente = req.session.paciente;
    const { descripcion_evolucion, id_agenda_horarios } = req.body;

    if (!descripcion_evolucion) {
        return res.status(404).send("faltan datos obligatorios en el diagnostico");
    } else {
        try {
            const insertar = "INSERT INTO evolucion(id_turno,id_historia_clinica, descripcion_evolucion, id_estado)" +
                "VALUES (?,?,?,1)"
            conexion.query(insertar, [id_agenda_horarios, paciente.id_paciente, descripcion_evolucion], (err, result) => {
                if (err) {
                    console.log("error al insertar la evolucion" + err.message);
                    return res.status(500).send('Hubo un problema al guardar la evolucion.');
                }
                console.log("EVOLUCION CARGADA CON EXITO");
                res.redirect('/historia_clinica');
            });
        } catch (err) {
            console.log("error en la insercion");
            res.status(500).send('Hubo un problema al insertar LA EVOLUCION.');
        }
    }
});
router.get('/obtener_template/:id', (req, res) => {
    const templateId = req.params.id;
    const consultaTemplate = `SELECT contenido_template FROM templates WHERE id_template = ?`;

    conexion.query(consultaTemplate, [templateId], (err, result) => {
        if (err) {
            console.error("Error al obtener el contenido del template: " + err);
            return res.status(500).json({ error: "Error al obtener el contenido del template." });
        }
        console.log("ID del template: " + templateId);
        //  console.log("Resultado de la consulta:", result); // Agregado para ver el resultado de la consulta

        if (result.length > 0) {
            // Reemplazar los caracteres escapados (\n, \r\n) si es necesario
            const contenidoTemplate = result[0].contenido_template.replace(/\\n/g, '\n').replace(/\\r\\n/g, '\n');
            res.json({ contenido_template: contenidoTemplate });
        } else {
            // Si no se encuentra el template, devolver una respuesta vacía
            res.json({ contenido_template: '' });
        }
    });
});
router.get('/verificar_cierre_consulta/:id_agenda_horarios', async(req, res) => {
    const { id_agenda_horarios } = req.params;

    try {
        const sqlDiagnostico = "SELECT COUNT(*) AS total FROM diagnostico WHERE id_agenda_horarios = ? AND id_estado = 1";
        const sqlEvolucion = "SELECT COUNT(*) AS total FROM evolucion WHERE id_turno = ? AND id_estado = 1";
        const sqlCambioEstadoAgenda = "UPDATE agenda_horarios SET id_estado = 1 WHERE id_agenda_horarios = ?";
        conexion.query(sqlDiagnostico, [id_agenda_horarios], (err, resultDiagnostico) => {
            if (err) throw err;
            conexion.query(sqlEvolucion, [id_agenda_horarios], (err, resultEvolucion) => {
                if (err) throw err;
                conexion.query(sqlCambioEstadoAgenda, [id_agenda_horarios], (err, resultCambioEstadoAgenda) => {
                    if (err) throw err;
                    const tieneDiagnostico = resultDiagnostico[0].total > 0;
                    const tieneEvolucion = resultEvolucion[0].total > 0;
                    console.log("tiene diagnostico: " + tieneDiagnostico);
                    console.log("tiene evolucion: " + tieneEvolucion);
                    res.json({ puedeCerrar: tieneDiagnostico && tieneEvolucion });
                });
            });
        });
    } catch (error) {
        console.error("Error verificando el cierre de la consulta:", error);
        res.status(500).send("Error al verificar el cierre de la consulta.");
    }
});

// Función para formatear la fecha a DD-MM-AAAA
function formatFecha(fecha) {
    if (!fecha) return null; // Si no hay fecha, retorna null

    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();

    return `${dia}-${mes}-${anio}`;
}

// Función para obtener la fecha de hoy en formato DD-MM-AAAA [quizas no la use]
function obtenerFechaHoy() {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}-${mes}-${anio}`;


}

module.exports = router;