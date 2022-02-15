
// requires descargados
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// requires nativos
const fs = require('fs'); // Lo usare para borrar las imagenes cuando lo necesite
const path = require('path');

const Usuario  = require('../models/usuario');
const Producto = require('../models/producto')

//default options
app.use(fileUpload()); // Cuando llamamos esa funcion de "fileUpload()" todos los archivos que se carguen (da igual lo que sea), caen dentro de "req.files"


app.put('/upload/:tipo/:id', (req, res) =>{
    const tipo = req.params.tipo;
    const id = req.params.id;

    if(!req.files){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha selecciondo ningun archivo.'
            }
        });
    }

    // Validar tipo
    const tiposValidos = ['productos', 'usuarios']

    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: `Los tipos permitidos son: ${tiposValidos.join(', ')}.`, // Lo que hara ".join(', ')" es unir los elementos con un ", "
            }
        })
    }



    // Agarro el archivo
    const archivo = req.files.archivo; // Osea que se lo puedo enviar desde el "Body" poniendole el nombre de "archivo"
    // console.log(archivo.mimetype)
    const nombreCortado = archivo.name.split('.'); // Con esto saco la extencion...
    const extencionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'PNG'];

    if(extensionesValidas.indexOf(extencionArchivo) < 0){ // "indexOf" devuelve "0" en caso de que ENCONTRAR el elemento a buscar que le pasamos por parametro, y en caso de que NO LO ENCUENTRE devolvera "-1"
        return res.status(400).json({
            ok: false,
            err: {
                message: `Las extenciones permitidas son ${extensionesValidas.join(', ')}`, // Lo que hara ".join(', ')" es unir los elementos con un ", "
                ext: extencionArchivo
            }
        })
    }


    // Cambiar nombre al archivo
    // Le pongo "Id-Milisegundos", para prevenir el "Cache", ya que si cargamos una imagen con ese mismo "Id" el cache pensara que es la misma Imagen a pesar de que haya cambiado (solo que tiene el mismo nombre de la carga anterior) y por lo tanto nos cargara la imagen incorrecta...
    // Le pongemos "Milisegundos" ya que son los milosegundos actuales y es algo asi como aleatorio, y es dificil que siempre coincida 2 o 3 veces seguidas (esto va entre 0 y 999). De esta manera podremos subir la misma imagen y con el mismo "Id" de nombre, pero al ponerle ese "- Milisegundos" en el nombre, nos hara que la imagen sea UNICA
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencionArchivo}` 


    // Mover el archivo a la carpeta que los contendra...
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => { // En la ubicacion puedo poner "uploads/nombre.jpg" o tambien "./uploads/nombre.jpg"
        
        if(err){
            return res.status(500).json({
                ok: false,
                err,
                ver: 'Si es aca',
                ruta: __dirname
            });
        }

        
        // Aqui la imagen ya esta cargada
        if(tipo === 'usuarios'){
            imagenUsuario(id, res, nombreArchivo, tipo);
        }else{
            imagenProducto(id, res, nombreArchivo, tipo)
        }

    })

})


 // Hago estas funciones a parte para no meter tanto codigo dentro del "archivo.mv"
const imagenUsuario = (id, res, nombreArchivo, tipo) => { // Tendremos que enviarle el "res" como parametro, ya que como vemos esta funcion esta a fuera del "app.put()"

    Usuario.findById(id, (err, usuarioDB) => { // No aplico el "findByIdAndUpdate" de primero, ya que si hago eso, lo actualizara de inmediatamente sin hacer la comprobacion del "fs", entonces por eso primero confirmo si existe el 'usuario' y en caso de que exista, uso esos datos traidos para utilizar y hacer comprobaciones con el 'fs' y luego uso el "findByIdAndUpdate" para almacenarlos de nuevo con la 'img' cambiada, ya que si uso el "save()" por alguna razon la nueva version de 'mongoose' me dice que esta repetido el '_id' y al tutor del video SI LO DEJA HACERLO...

        if(err){

            borraArchivo(tipo, nombreArchivo); // Aqui le pasamos 'nombreArchivo' en lugar de 'usuarioDB.img', porque obviamente en caso de que se produzca un error 'usuarioDB = null' entonces no podemos acceder a 'usuarioDB.img'

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioDB){

            borraArchivo(tipo, nombreArchivo); // Aqui le pasamos 'nombreArchivo' en lugar de 'usuarioDB.img', porque obviamente en caso de que se produzca un error 'usuarioDB = null' entonces no podemos acceder a 'usuarioDB.img'

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe ese usuario ID'
                }
            });
        }


        // Verificar que la ruta de la Imagen exista, para borrarla
        borraArchivo(tipo, usuarioDB.img)
       

        Usuario.findByIdAndUpdate(id, {img: nombreArchivo}, {new: true, runValidators: true}, (err, usuarioGuardado) =>{ 

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if(!usuarioGuardado){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No existe ese usuario'
                    }
                });
            }

            res.json({
                ok: true,
                usuarioGuardado,
                img: nombreArchivo,
            })

        })

    })
}


const imagenProducto = (id, res, nombreArchivo, tipo) =>{

    Producto.findById(id, (err, productoDB) =>{

        if(err){
            borraArchivo(tipo, nombreArchivo)

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            borraArchivo(tipo, nombreArchivo)

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ese producto no existe findById'
                }
            });
        }

        // Borrar la img del producto
        borraArchivo(tipo, productoDB.img)

        Producto.findByIdAndUpdate(id, {img: nombreArchivo}, {new: true, runValidators: true}, (err, productoGuardado) =>{
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
    
            if(!productoGuardado){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Ese producto no existe.'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })



        })

    })

}


const borraArchivo = (tipo, nombreImg) =>{
    
    // console.log(path.resolve(__dirname, `../../uploads/usuarios/${usuarioGuardado.img}`))
    // console.log(__dirname)
    const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImg}`);
    // Comprobar si hay una imagen existente con el mismo nombre que tiene el atributo 'img' de un usuario... Esto lo hago con el fin de que si UN USUARIO vuelve a meter o actualizar su 'img', borre la que tenia anteriormente
    
    if(!nombreImg){
        return;
    }
    if(nombreImg.length > 0){ // Esto lo agregue yo por seguridad...
        if(fs.existsSync(pathImagen)){ // 'fs.existsSync()' recibe como parametro una "ruta", y en caso de que SI exista pues devolver "true", de lo contrario "false"
            fs.unlinkSync(pathImagen) // 'fs.unlinkSync()' recibe una "ruta" como parametro y lo que hace es BORRAR ese archivo que enviamos como ruta.
            // Si por alguna Razon intento meter un 'path' que no existe dentro del 'fs.unlinkSync()', me dara un error, por eso es bueno primero comprobar antes si el 'path' esta bueno con el 'fs.existsSync()'
            console.log('Borrado');
        }else{
            console.log('NO se pudo borrar')
        }
    }
}


module.exports = app;



// qwe
