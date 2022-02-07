

const express = require('express');
const {verificarToken, verificaAdmin_role} = require('../middlewares/autenticacion');

const router = express.Router();

const Categoria = require('../models/categoria');



// NOTA: En todas se piden token normales

// Mostrar todas las categorias
router.get('/categoria', verificarToken, (req, res) =>{

    Categoria.find({})
        .sort('descripcion') // Para que me los ordene (segun el ABCedario) pero usando su "descripcion" de referencia
        .populate('usuario', 'nombre email') // "populate" lo que hara es revisar que "objects id" existen en la categoria que estamos solicitando y nos va a permitir cargar informacion...  Se usa asi .populate('nombreQueLePusimosEnElModal -> En este caso pusimos usuario:{Schema.Types.ObjectId, ref: 'Usuario;}', 'camposQueQueremosMostrar -> En este caso solo nombre y email, el _id siempre se enviara por defecto...')
        // En resumen lo que hara "populate" es hacer una especie de consulta a travez del "id" del "usuario" almacenado en "categorias", hara una busqueda con ese "id" y luego traera los datos de ese mismo usuario (en este caso solo el "nombre y email")
        
        // En caso de que tuvieramos mas colecciones que nosotros necesitaramos llenar, simplemente creamos otro "populate", ejemplo:
        // .populate('personas', 'nombre edad city')

        .exec((err, categoriasDB) =>{

            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
    
            res.json({
                ok: true,
                categoria: categoriasDB
            })
        })


});


// Mostrar una categoria por ID
router.get('/categoria/:id', verificarToken, (req, res) =>{
    const id = req.params.id;

    console.log(id)

    Categoria.findById({_id: id}, (err, categoriaDB) =>{
        
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe esa Categoria.'
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })

    })



});


// Crear nueva categoria
router.post('/categoria',  [verificarToken, verificaAdmin_role], (req, res) =>{

    const body = req.body;
    const {nombre, descripcion} = body;

    const usuario = req.usuario; // Usuario que creo la categoria
    // console.log(usuario);


    const categoria = new Categoria({
        nombre,
        usuario: usuario._id,
        descripcion
    })

    
    categoria.save((err, categoriaDB) =>{
        
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
            creador: usuario
        })

    })

    //regresa la nueva categoria
    // req.usuario._id
});



// Actualizar una categoria
router.put('/categoria/:id', [verificarToken, verificaAdmin_role], (req, res) =>{
    
    const body = req.body;
    const id = req.params.id;

    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, categoriaDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }


        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha actualizado la Categoria.'
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        })

    })



});


// Borrar una categoria (Que solo la puedan borrar los Admin) que la elimine FISICAMENTE
router.delete('/categoria/:id', [verificarToken, verificaAdmin_role], (req, res) =>{
    
    const id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) =>{

        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }


        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha elimnado la Categoria.'
                }
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        })
    })

});








module.exports = router;


// qwe