
// requires
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

// libreria de Google
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const router = express.Router();

router.post('/login', (req, res) =>{

    const body = req.body;
    const {email, password} = body;

    Usuario.findOne({email: email}, (err, usuarioDB) =>{

        if(err) return res.status(500).json({ok: false, err}); // En caso de que hay un erro en LA SOLICITUD

        if(!usuarioDB){ // En caso de que haya puesto el "email" INCORRECTO
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contrasena incorrecto.'
                }
            });
        }

        if(!bcrypt.compareSync(password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contrasena) incorrecto.'
                }
            });
        }


        // Generar token
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN}) // Expirara en 30 dias... En caso de solo poner "60 * 60" le estaria diciendo que expira en "1 hora", los primeros "60" son segundos, y los "60" que siguen son minutos


        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    })

});



// Configuraciones de Google
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    
    const payload = ticket.getPayload();

    const {email, name, picture} = payload;

    return {
        email,
        nombre: name,
        picture,
        google: true // Para que ingresemos a la DB el "google = true"
    }

    // asd
    // console.log(payload);


  }
//   verify().catch(console.error);


router.post('/google', async (req, res) =>{

    let token = req.body.idtoken;
    // let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7Il9pZCI6IjYxZjhkOTIxZjllMjRlN2YyZTQ2NjgwYSIsIm5vbWJyZSI6IkFkbWluMTYiLCJlbWFpbCI6ImFkbWluMTZAZ21haWwuY29tIiwicm9sZSI6IkFkbWluIiwiZXN0YWRvIjp0cnVlLCJnb29nbGUiOnRydWUsIl9fdiI6MH0sImlhdCI6MTY0Mzg3MzAyNiwiZXhwIjoxNjQzODc1NjE4fQ.qPcZuEV9ZBEXsnBZ5vd8lzeZpWUghFgCEKWCSPcT6VM';
    // console.log(req.body)
    // console.log('ACA', req.body)

    const googleUser = await verify(token)
        .catch(err => { // En caso de que se produzca un error (que el token este malo)
            return res.status(403).json({ //status 403 = Forbidden
                ok: false,
                err
            })
        }); 

    // console.log(googleUser);
    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) =>{ // Para ver si ya existe ese usuario o no
        
        if(err){ // En caso de que suceda un erro en la consulta
            return res.status(500).json({ // status 500 = Internal Server Error
                ok: false,
                err
            });
        };

        if( usuarioDB ){
            if(usuarioDB.google === false){ // Si no se ha registrado por Google (pero intento autenticarse mediante google) entonces NO debe de ser permitido (Ya que su cuenta la creo como usuario normal sin usar Google Sing-In)
                return res.status(400).json({ // status 400 = Bad Request
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticacion normal.'
                    }
                });

            }else{ // En caso de que SI sea un usuario registrado con Google
                
                // Creo un token NORMAL (no de google), renovamos su nuevo token para que pueda seguir trabajando el usuario.
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }

        }else{ // En caso de que sus credenciales de Google esten bien, PERO NO este registrado en la Base de Datos... (Osea que sea su PRIMERA VEZ que se esta Autenticando)

            const {nombre, email, picture} = googleUser;
            let usuario = new Usuario({
                nombre,
                email,
                password: ':D', // Esto ni si quiera sirve, pero lo pasaremos ya que en el modal pusimos "required: true"... Nadie podra iniciar sesion usando un correo y esa ":D" ya que recordemos que intentara pasar esa carita feliz a un "hash de 10 vueltas", cosa que no funcionara...  
                img: picture,
                google: true,
                role: 'User'
            });

            // Guardar en la DB
            usuario.save( (err, usuarioDB) =>{
                if(err){
                    return res.status(500).json({ // status 500 = Internal Server Error
                        ok: false,
                        err
                    });
                };

                 // Creo un token NORMAL (no de google), renovamos su nuevo token para que pueda seguir trabajando el usuario.
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            })

        }

    })

})






module.exports = router;


// qwe