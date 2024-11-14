function habilitarEdicionAlergia(idAlergia) {
    const actualizarBtn = document.getElementById("actualizar_alergia");
    actualizarBtn.disabled = false;

    //  id de alergia en el campo oculto del formulario
    document.getElementById("id_alergia").value = idAlergia;

    // Deshabilitar los campos
    document.getElementById("nombre_alergia").disabled = true;
    document.getElementById("importancia_alergia").disabled = true;
    document.getElementById("fecha_desde_alergia").disabled = true;
    document.getElementById("guardar_alergia").disabled = true;

    const fechaHastaAlergia = document.getElementById("fecha_hasta_alergia");
    fechaHastaAlergia.disabled = false;
    fechaHastaAlergia.focus();

    console.log("Edición habilitada para alergia ID:", idAlergia);
}
// Espera a que el documento esté listo
document.addEventListener("DOMContentLoaded", function() {
    const selectAlergia = document.getElementById("nombre_alergia");

    // Agrega un evento para cuando cambia la selección
    selectAlergia.addEventListener("change", function() {
        const idAlergia = selectAlergia.value;
        const nombreAlergia = selectAlergia.options[selectAlergia.selectedIndex].text;

        console.log("ID de Alergia seleccionada:", idAlergia);
        console.log("Nombre de Alergia seleccionada:", nombreAlergia);
    });
});

document.getElementById('actualizar_alergia').addEventListener('click', function() {
    const idAlergia = document.getElementById("id_alergia").value;
    const fechaHasta = document.getElementById("fecha_hasta_alergia").value;
    console.log("Datos enviados:");
    console.log("ID Alergia:", idAlergia);
    console.log("Fecha Hasta:", fechaHasta);

    const form = document.getElementById('formAlergia');
    form.action = '/actualizar_alergia';
    form.method = 'POST';
    form.submit();

});


function habilitarEdicionAntecedente(idAntecedente) {
    const actualizarBtn = document.getElementById("actualizar_antecedente");
    actualizarBtn.disabled = false;

    // Establecer el ID del antecedente en el campo oculto del formulario
    document.getElementById("id_antecedente").value = idAntecedente;

    // Deshabilitar los campos que no deben ser editados
    document.getElementById("descripcion_antecedente").disabled = true;
    document.getElementById("fecha_desde_antecedente").disabled = true;
    document.getElementById("guardar_antecedente").disabled = true;

    const fechaHastaAntecedente = document.getElementById("fecha_hasta_antecedente");
    fechaHastaAntecedente.disabled = false;
    fechaHastaAntecedente.focus();

    console.log("Edición habilitada para el antecedente con ID:", idAntecedente);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('actualizar_antecedente').addEventListener('click', function() {
        const form = document.getElementById('formAntecedente');
        form.action = '/actualizar_antecedente';
        form.submit();
        console.log("Formulario enviado a /actualizar_antecedente");
    });
});

function habilitarEdicionMedicamento(idMedicamento) {
    const actualizarBtn = document.getElementById("actualizar_medicamento");
    actualizarBtn.disabled = false;

    // pongo ID del medicamento en el campo oculto del formulario
    document.getElementById("id_medicamento").value = idMedicamento;

    // deshabilito btn guardar
    document.getElementById("guardar_medicamento").disabled = true;

}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('actualizar_medicamento').addEventListener('click', function() {

        const form = document.getElementById('formMedicamento');
        form.action = '/actualizar_medicamento';
        form.submit();
    });
});


function habilitarEdicionHabito(idHabito) {
    const actualizarBtn = document.getElementById("actualizar_habito");
    actualizarBtn.disabled = false;
    // Establecer el ID del antecedente en el campo oculto del formulario
    document.getElementById("id_habito").value = idHabito;

    // Deshabilitar los campos que no deben ser editados
    document.getElementById("habito").disabled = true;
    document.getElementById("fecha_desde_habito").disabled = true;
    document.getElementById("guardar_habito").disabled = true;

    const fechaHastaHabito = document.getElementById("fecha_hasta_habito");
    fechaHastaHabito.disabled = false;
    fechaHastaHabito.focus();

    console.log("Edición habilitada para el habito con ID:", idHabito);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('actualizar_habito').addEventListener('click', function() {
        const form = document.getElementById('formHabito');
        form.action = '/actualizar_habito';
        form.submit();

        console.log("Formulario enviado a /actualizar_habito");
    });
});

document.addEventListener('DOMContentLoaded', () => {

    const editor = new Quill('#editor-container', {
        theme: 'snow'
    });

    const templateSelect = document.getElementById('id_template');
    if (templateSelect) {
        templateSelect.addEventListener('change', (event) => {
            const selectedTemplateId = event.target.value;
            console.log('Template seleccionado:', selectedTemplateId);

            if (selectedTemplateId) {
                // Hacer la solicitud al servidor para obtener el contenido del template
                fetch(`/obtener_template/${selectedTemplateId}`)
                    .then((response) => response.json())
                    .then((data) => {
                        const rawContent = data.contenido_template;
                        if (rawContent) {
                            // Dividir el contenido en líneas y preparar el Delta para Quill
                            const lines = rawContent.split('\\n');
                            const delta = lines.map((line) => ({ insert: line + '\n' }));
                            editor.setContents(delta); // Insertar el contenido en Quill
                        } else {
                            editor.setContents([{ insert: '\n' }]); // Limpiar el editor si está vacío
                        }
                    })
                    .catch((error) => {
                        console.error('Error al cargar el template:', error);
                    });
            } else {
                editor.setContents([{ insert: '\n' }]); // Limpiar el editor si no hay selección
            }
        });
    } else {
        console.error('No se encontró el elemento con id "id_template".');
    }


    const form = document.getElementById('form_evoluciones');
    if (form) {
        //console.log("if form anda ")
        form.addEventListener('submit', (event) => {
            // Prevenir el comportamiento por defecto del formulario
            event.preventDefault();

            // Obtener el contenido del editor de Quill y asignarlo al campo oculto
            const descripcion = editor.root.innerHTML;
            console.log("Contenido de la evolución:", descripcion); // Verificando el valor

            document.getElementById("descripcion_evolucion").value = descripcion;

            form.submit();
        });
    }

});


//  La función cerrarConsulta() hace una solicitud a /verificar_cierre_consulta,
//  pasando el ID de la consulta actual. Según el resultado, redirige o muestra una alerta.
async function cerrarConsulta(event) {
    event.preventDefault();

    const idAgendaHorarios = document.querySelector("input[name='id_agenda_horarios']").value;
    const idDoctor = document.querySelector("input[name='id_medico']").value;

    // Verifico si el div de mensajeCierre existe
    const mensajeCierre = document.getElementById('mensajeCierre');
    const mensajeError = document.getElementById('mensajeError');

    // Solo intenyo modificar el mensaje si el div existe
    if (mensajeCierre && mensajeError) {
        try {
            const response = await fetch(`/verificar_cierre_consulta/${idAgendaHorarios}`);
            const data = await response.json();

            if (data.puedeCerrar) {
                // Si puede cerrar la consulta, redirige
                window.location.href = `/agenda_mes?id_medico=${idDoctor}`;
            } else {
                // Si no puede cerrar la consulta, muestra el mensaje en el div
                mensajeError.textContent = "Debe tener un diagnóstico y una evolución registrados para cerrar la consulta.";
                mensajeCierre.style.display = "block"; // Hacer visible el mensaje
            }
        } catch (error) {
            console.error("Error verificando el cierre de la consulta:", error);
        }
    }
}