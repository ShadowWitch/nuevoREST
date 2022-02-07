
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriaSchema = new Schema({

    nombre:{
        type: String,
        required: [true, 'Tiene que ingresar el nombre de la Categoria.']
    },
    usuario:{
        type: Schema.Types.ObjectId, // Para poder hacer algo asi como relaciones... Solamente pasar el "id" del Usuario para luego usar el "populate" y llamar los demas datos
        ref: 'Usuario' // Para hacer referencia a la coleccion de "usuarios"
    },
    descripcion:{
        type: String,
        required: [true, 'Ingrese descripcion de Categoria']
    }
})


module.exports = mongoose.model('Categoria', categoriaSchema);




// qwe