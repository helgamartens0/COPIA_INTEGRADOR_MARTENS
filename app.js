require('dotenv').config(); // Carga las variables de entorno del archivo .env
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const { Sequelize } = require('sequelize'); // Importa Sequelize
const session = require('express-session'); // Módulo de sesiones
const SequelizeStore = require('connect-session-sequelize')(session.Store); // Configura el almacén de sesiones con Sequelize

// Conexión a la base de datos MySQL con Sequelize utilizando las variables de entorno
const sequelize = new Sequelize(process.env.MYSQL_ADDON_URI, { // Usa la URL de conexión de Clever Cloud
    dialect: 'mysql',
    logging: false, // Desactiva el logging si no lo necesitas
});

// Define el modelo para almacenar sesiones
const Session = sequelize.define('session', {
    sid: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    sess: {
        type: Sequelize.JSON,
        allowNull: false,
    },
    expires: {
        type: Sequelize.DATE,
        allowNull: false,
    },
});

// Sincroniza la base de datos (esto creará la tabla de sesiones si no existe)
sequelize.sync();

// Configura Express para usar sesiones almacenadas en la base de datos
app.use(session({
    secret: process.env.SESSION_SECRET, // Cambia esto por una cadena segura aleatoria
    store: new SequelizeStore({
        db: sequelize, // Usa la base de datos para almacenar las sesiones
        table: 'session', // Especifica la tabla para las sesiones
    }),
    resave: false, // Evita guardar la sesión en cada solicitud si no ha habido cambios
    saveUninitialized: false, // Solo guarda las sesiones si tienen datos inicializados
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // Duración de la cookie de sesión (ejemplo: 2 horas)
        secure: process.env.NODE_ENV === 'production', // Cambia a true si estás usando HTTPS
    },
}));

// Middleware de configuración de rutas
app.set("view engine", "pug");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas de la aplicación
app.use(require("./rutas/index"));
app.use(express.static("public"));
app.use(require("./rutas/login"));
app.use(require("./rutas/agenda_mes"));
app.use(require("./rutas/historia_clinica"));
app.use(require("./rutas/ver_historia_clinica"));
app.use(require("./rutas/form_fecha"));
app.use(require("./rutas/actualizacion_fechas_HC"));

// Inicia el servidor
app.listen(port, () => {
    console.log("listening on port " + port);
});