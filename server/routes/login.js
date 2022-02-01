
// requires
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

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







module.exports = router;


// qwe