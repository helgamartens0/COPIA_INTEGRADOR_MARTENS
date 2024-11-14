require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const session = require('express-session');


app.set("view engine", "pug");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        secure: false
    }
}));

app.use(require("./rutas/index"));
app.use(express.static("public"));
app.use(require("./rutas/login"));
app.use(require("./rutas/agenda_mes"));
app.use(require("./rutas/historia_clinica"));
app.use(require("./rutas/ver_historia_clinica"));
app.use(require("./rutas/form_fecha"));
app.use(require("./rutas/actualizacion_fechas_HC"));
app.listen(port, () => {
    console.log("listening on port " + port);
});