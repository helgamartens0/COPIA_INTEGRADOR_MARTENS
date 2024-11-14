function habilitarEdicionAlergia(idAlergia) {
    // Mostrar el botón de "Actualizar Alergia" y deshabilitar el botón de "Guardar Alergia"
    const actualizarBtn = document.getElementById("actualizar_alergia");
    actualizarBtn.disabled = false;

    // Establecer el id de alergia en el campo oculto del formulario
    document.getElementById("id_alergia").value = idAlergia;

    // Deshabilitar los campos que no deben ser editados
    document.getElementById("nombre_alergia").disabled = true;
    document.getElementById("importancia_alergia").disabled = true;
    document.getElementById("fecha_desde_alergia").disabled = true;
    document.getElementById("guardar_alergia").disabled = true;

    // Habilitar solo el campo "Fecha de Fin"
    const fechaHastaAlergia = document.getElementById("fecha_hasta_alergia");
    fechaHastaAlergia.disabled = false;
    // Opcional: Enfocar en el campo de "Fecha de Fin"
    fechaHastaAlergia.focus();

    console.log("Edición habilitada para alergia ID:", idAlergia);
}
// Espera a que el documento esté listo
document.addEventListener("DOMContentLoaded", function() {
    // Selecciona el elemento select por su id
    const selectAlergia = document.getElementById("nombre_alergia");

    // Agrega un evento para cuando cambia la selección
    selectAlergia.addEventListener("change", function() {
        // Obtiene el id de la alergia seleccionada
        const idAlergia = selectAlergia.value;
        // Obtiene el nombre de la alergia seleccionada
        const nombreAlergia = selectAlergia.options[selectAlergia.selectedIndex].text;

        // Muestra el resultado en la consola
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

    // Habilitar solo el campo "Fecha de Fin"
    const fechaHastaAntecedente = document.getElementById("fecha_hasta_antecedente");
    fechaHastaAntecedente.disabled = false;

    // Opcional: Enfocar en el campo de "Fecha de Fin"
    fechaHastaAntecedente.focus();

    console.log("Edición habilitada para el antecedente con ID:", idAntecedente);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('actualizar_antecedente').addEventListener('click', function() {
        // Cambiar la acción del formulario a "/actualizar_antecedente"
        const form = document.getElementById('formAntecedente');
        form.action = '/actualizar_antecedente';
        form.submit(); // Enviar el formulario

        console.log("Formulario enviado a /actualizar_antecedente");
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

    // Habilitar solo el campo "Fecha de Fin"
    const fechaHastaHabito = document.getElementById("fecha_hasta_habito");
    fechaHastaHabito.disabled = false;

    // Opcional: Enfocar en el campo de "Fecha de Fin"
    fechaHastaHabito.focus();

    console.log("Edición habilitada para el habito con ID:", idHabito);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('actualizar_habito').addEventListener('click', function() {
        // Cambiar la acción del formulario a "/actualizar_antecedente"
        const form = document.getElementById('formHabito');
        form.action = '/actualizar_habito';
        form.submit(); // Enviar el formulario

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


    // Asegúrate de que este código se ejecute cuando el formulario se envíe
    const form = document.getElementById('form_evoluciones');
    if (form) {
        //console.log("if form anda ")
        form.addEventListener('submit', (event) => {
            // Prevenir el comportamiento por defecto del formulario
            event.preventDefault();

            // Obtener el contenido del editor de Quill y asignarlo al campo oculto
            const descripcion = editor.root.innerHTML;
            console.log("Contenido de la evolución:", descripcion); // Verifica el valor

            document.getElementById("descripcion_evolucion").value = descripcion;

            // Ahora que el campo está actualizado, puedes enviar el formulario si es necesario
            form.submit(); // Descomenta esta línea si quieres enviar el formulario después de actualizar el campo oculto
        });
    }

});


//Cliente: La función cerrarConsulta() hace una solicitud a /verificar_cierre_consulta,
//  pasando el ID de la consulta actual. Según el resultado, redirige o muestra una alerta.
async function cerrarConsulta(event) {
    event.preventDefault(); // Prevenir que se recargue la página al hacer submit

    const idAgendaHorarios = document.querySelector("input[name='id_agenda_horarios']").value;
    const idDoctor = document.querySelector("input[name='id_medico']").value;

    // Verificar si el div de mensajeCierre existe
    const mensajeCierre = document.getElementById('mensajeCierre');
    const mensajeError = document.getElementById('mensajeError');

    // Solo intentar modificar el mensaje si el div existe
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