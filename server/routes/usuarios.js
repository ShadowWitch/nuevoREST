
// requires
const express = require('express');
const Usuario = require('../models/usuario')
const bcrypt = require('bcrypt')
const _ = require('underscore')
const router = express.Router();

const {verificarToken, verificaAdmin_role} = require('../middlewares/autenticacion'); // Middleware



router.get('/usuarios', verificarToken, (req, res) => { // "verificarToken" va sin parentesis ya que NO lo quiero ejecutar, solamente quiero que se dispare cuando el usuario quiera acceder a "/usuarios" mediante una solicitud "get"
    // Usar usuario del JWT
    /*
    const {email, nombre} = req.usuario;
    return res.json({
        usuario: req.usuario,
        email,
        nombre
    })
    */


    // En caso de que NO mande un un "query" llamado "desde" entonces "desde" tomara el valor de "0"
    const desde = req.query.desde || 0; // Esto de "req.query" son PARAMETROS OPCIONALES, que se envian desde la url por ejemplo:  "http://localhost:3000/usuarios?desde=5"
    const limite = req.query.limite || 5; // Para agregar otro parametro hay que usar el "&" por ejemplo: "localhost:3000/usuarios?desde=2&limite=3"

    Usuario.find({estado: true}, 'nombre email role estado google') // Si pongo "({}, 'nombre email')" solo me mostrara el "nombre y email" de cada uno
            .skip(desde) // Que se salte los primeros "5" registros para que me muestre los siguientes
            .limit(limite) // Que solo me muestre 5 registros
            .exec((err, usuarios) => { // "exec" es para decirle que me ejecute la funcion hecha anteriormente (osea el "find()")
                if(err){
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                Usuario.count({estado: true}, (err, conteo) => {

                    res.json({
                        ok: true,
                        usuarios,
                        conteo
                    });

                });

            })
})


router.post('/usuarios', [verificarToken, verificaAdmin_role], (req, res) => {
    const body = req.body;
    const {nombre, email, password, img, role, estado, google} = body;

    

    // console.log(req.usuario)

    const usuario = new Usuario({
        nombre,
        email,
        password: bcrypt.hashSync(password, 10), // "hashSync" para que haga un 'hash' de forma sincrona (osea que NO use un callback, una promesa si no que lo haga directamente)
        role,
        estado,
        google
    });

    usuario.save( (err, usuarioDB) => { // Guardar en la DB

        if(err) { // En caso de que se produzca un error
            return res.status(400).json({
                ok: false,
                err
            })
        }

        // Esto lo hice alla el "modal" del "usuario.js", utilizando unos metodos. Aunque tambien se podia hacer aqui de una manera mas sencilla... La unica diferencia es que alla, YA me devolvia el "usuarioDB" sin el "password" y mientras que aqui NO y lo unico que hice aqui fue QUITARSELO y luego devolver la respuesta con eso quitado...
        // const userObject = usuarioDB.toObject();
        // delete userObject.password;
        // console.log(userObject)

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

})

router.put('/usuarios/:id', [verificarToken, verificaAdmin_role], (req, res) => {
    const id = req.params.id;

    // Esto de aqui lo haremos para NO pueda actualizar el Rol, ni la Password, ni el google
    const body = _.pick(req.body, ['nombre', 'email', 'estado', 'img', 'role']); // Ponemos solamente los datos que SI QUEREMOS PERMITIR que el usuario pueda EDITAR


    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioDB) => { // Al ponerle {new: true} es para decirle que me devuelva el usuario YA ACTUALIZADO de una vez y no que vaya atrasado... Asi de esta menera al devolver la respuesta me lo muestra ya actualizado y no el que YA actualizado.
        // Al usar "runValidators: ture" estamos diciendo que corra todas las validaciones del "Schema" que creamos... Ya que si no utilizamos esto, entonces podremos editar los "Roles" y poner por ejemplo "asdqwe" y a pesar de que sea un Rol "NO permitido" siempre lo actualizara, es por eso que usaremos este "runValidators" para que SI podamos validar el "Rol" y todas las demas validaciones que tengamos en nuestro "Schema"

        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: "No se encontro el usuario a editar."
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })

    })

    
});

router.delete('/usuarios/:id', [verificarToken, verificaAdmin_role], (req, res) => {
    const id = req.params.id;
    const estado_cambiado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, estado_cambiado, {new: true, runValidators: true}, (err, usuarioEstado) =>{ // Ahora es raro que se eliminen los usuarios, por lo general solamente se les cambia el estado, en este caso cuando le doy eliminar solo pone el "estado" en "false"...

        if(err) return res.status(400).json({ok: true, err});

        if(!usuarioEstado){
            return res.json({
                ok: false,
                err: {
                    message: "Usuario no encontrado."
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioEstado
        })

    })


    /*
    Usuario.findByIdAndRemove(id, (err, userBorrado) => { // Para que ya deje de existir el registro

        if(err) return res.status(400).json({ok: true, err});

        if(!userBorrado){
            return res.json({
                ok: false,
                err: {
                    message: "Usuario no encontrado."
                }
            });
        }

        res.json({
            ok: true,
            userBorrado
        });
        
    }) 
    */

})


module.exports = router;


// qwe