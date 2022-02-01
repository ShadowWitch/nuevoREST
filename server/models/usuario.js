
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator'); // Para validar que solo exista ese usuario


// NOTA: Para encriptar la contrasena utilizaremos un Hash de una sola via que quiere decir que NO se puede reconstruir a su version anterior o mejor dicho a su forma original, lo cual resulta imposible reconstruirla...

const rolesValidos = {
    values: ['Admin', 'User'],
    message: '{VALUE} no es un rol valido' // Al ponerle {VALUE} le estoy diciendo que me muestre EL VALOR... Si pusiera "{PATH}" me mostraria "role no es un rol valido" pero si lo dejo con "{VALUE}" me mostrara "RolIngresado no es un rol valido"
}


const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'], // Encaso de que NO se cumpla enviara 'El nombre es necesario'
    },
    email: {
        type: String,
        unique: true, // Al poner esto le estoy diciendo que NO se puede repetir el mismo correo
        required: [true, 'El correo es necesario'],
    },
    password: {
        type: String,
        required: [true, 'La contrasea es necesaria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos // Para decirle los tipos de roles que puede aceptar...
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Al poner "methods" estoy accediendo a los metodos del "Schema", y el "toJSON" SIEMPRE SE LLAMA cuando se intenta IMPRIMIR (como el caso de ahorita que estamos mandando todo el Schema a una impresion mediante "json") 
usuarioSchema.methods.toJSON = function() { // Aqui uso una "function" porque en funcion de Flechas NO puedo usar el "this"
    
    let user = this; // Al poner esto me estoy refiriendo a todo el Objeto "usuarioSchema"
    // console.log(user)
    let userObject = user.toObject(); // El "toObject" para que luego podamos usar el metodo "delete"
    delete userObject.password; // "delete" para eliminar un elemento, en este paso el "password" del objeto "userObject"
    // console.log(userObject)

    return userObject; // Devolvemos esto, PERO SIN LA CONTRASENA para que luego se imprima en donde lo querramos mostrar
}

// Al ponerle "PATH" le estoy diciendo que me muestre el "key" o el nombre de indice en este caso "email".
// Al ponerle {VALUE} le estoy diciendo que me muestre EL VALOR... Si pusiera "{PATH}" me mostraria "debe de ser unico" pero si lo dejo con "{VALUE}" me mostrara "EmailIngresado debe de ser unico"
usuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe de ser unico'}); // Al usar esto nos devolver que el "email debe ser unico"... Esto hara que podamos leer mas facil, cual error es el que se produce, osea que es mas FamilyFriendly a la hora de leerlo
// Esto se enviara al "err" que devolvemos en el "usuario.save( err, usuarioDB)"



module.exports = mongoose.model('Usuario', usuarioSchema);



// qwe