
// requires
require('./config/config'); // Configuraciones de puertos

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const port = process.env.PORT;

// Configuracion global de rutas (Aqui estan los middlewares de las rutas)
app.use(require('./routes/index'))



// Conexion a la DB
mongoose.connect(process.env.URLDB, (err, res) =>{
    if(err) throw err;
    console.log(`Base de datos conectada.`)
});



// Server al a escucha
app.listen(port, ( ) => {
    console.log(`Servidor iniciado en el puerto ${port}`)
})







// qwe