const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const conexion = require('./config/conexion');
const session = require('express-session'); //modulo de sesiones
require('dotenv').config(); // Carga las variables de entorno del archivo .env
app.set("view engine", "pug");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET, // Cambia esto por una cadena segura aleatoria
    resave: false, // Evita guardar la sesión en cada solicitud si no ha habido cambios
    saveUninitialized: false, // Solo guarda las sesiones si tienen datos inicializados
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // Duración de la cookie de sesión (ejemplo: 2 horas)
        secure: false // Cambia a true si estás utilizando HTTPS
    }
}));

app.use(require("./rutas/index"));
app.use(express.static("public"));
app.use(require("./rutas/login"));
//app.use(require("./rutas/agenda"));
app.use(require("./rutas/agenda_mes"));
//app.use(require("./rutas/listar"));
app.use(require("./rutas/historia_clinica"));
app.use(require("./rutas/ver_historia_clinica"));
app.use(require("./rutas/form_fecha"));
app.use(require("./rutas/actualizacion_fechas_HC"));
app.listen(port, () => {
    console.log("listening on port " + port);
});