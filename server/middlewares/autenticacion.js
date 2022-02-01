
//requires
const jwt = require('jsonwebtoken');


// Verificar el token
const verificarToken = (req, res, next) => {

    const token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decode) =>{ // El "decode" contendra la informacion del usuario (osea basicamente es todo el Payload)

        if(err) { // En caso de que la informacion sea INCORRECTA
            return res.status(401).json({
                ok: false,
                err:{
                    message: 'Token no valido.'
                }
            })
        }

        req.usuario = decode.usuario;
        next(); // Esto ira a dentro del "jwt.verify" ya que si NO lo hacemos, entonces este "next()" se EJECUTARA aunque el token sea INVALIDO
        // console.log(decode.usuario);
        // NOTA: Mientras yo NO ejecute la funcion "next" jamas se ejecutara lo que sigue dentro del "get('/usuarios')"
    });
};


// Verifica admin role

const verificaAdmin_role = (req, res, next) => {

    let usuario = req.usuario; // Aqui si podemos leer el usuario, ya que como vimos a la hora de poner los middlewares (en la parte de "usuarios.js" dentro de los metodos POST y PUT) el middleware "verificarToken" (que es el que envia el "req.usuario = decode.usuario" ESTA ANTES de ejecutar este middleware (osea el verificaAdmin_role) y por lo tanto ese dato ya FUE ENVIADO por el "verificarToken"
    const {role} = usuario;

    // console.log(usuario);

    if(role !== 'Admin'){ // En caso de que NO sea un admin
        return res.status(401).json({
            ok: false,
            message: 'Este usuario NO es un administrador.'
        })
    }

    next(); // Que siga con la ejecucion

};







module.exports = {
    verificarToken,
    verificaAdmin_role
};

// qwe