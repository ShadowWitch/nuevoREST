
// requires
require('./config/config'); // Configuraciones de puertos

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path');

const app = express();
const port = process.env.PORT;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// habilitar la carpeta public
// app.use(express.static(__dirname + '../public'));
// console.log('ACA', __dirname + '../public'); // Como vemos este "path" esta mal hecho. Y para arreglar ese tipo de errores usamos la libreria "path"
app.use(express.static(path.resolve(__dirname, '../public')))
// console.log('ACA', path.resolve(__dirname, '../public')); // Lo que hace la libreria "path" es que podemos mandar "Segmentos" del path y esta funcion "path.resolve" los armara por nosotros...



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