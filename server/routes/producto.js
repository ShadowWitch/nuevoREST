
const express = require('express');
const router = express.Router();
const {verificarToken} = require('../middlewares/autenticacion');

const Producto = require('../models/producto');


// Obtener productos 
router.get('/productos', verificarToken, (req, res) =>{
    // trae todos los productos
    // populate: usuario y categoria
    // paginado

    Producto.find({})
            .sort('descripcion')
            .populate('usuario', 'nombre email')
            .populate('categoria', 'nombre')
            .exec((err, productosDB) =>{

                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    productosDB
                })


            })

})


// Obtener un producto por Id
router.get('/productos/:id', verificarToken, (req, res) =>{
    // populate: usuario y categoria
    const id = req.params.id;

    Producto.findById(id)
            .populate('usuario', 'nombre email')
            .populate('categoria', 'nombre')
            .exec((err, productoDB) =>{

                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                if(!productoDB){
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Producto no encontrado.'
                        }
                    })
                }

                res.json({
                    ok: true,
                    productoDB
                })

            })

})


// ======= Buscar Productos =======

router.get('/productos/buscar/:termino', verificarToken, (req, res) =>{

    const termino = req.params.termino;
    // Esto es excelente para hacer busquedas mas flexibles
    const regex = new RegExp(termino, 'i') // Estoy diciendo que quiero crear una nueva expresion regular basada en el termino, luego como segundo parametro le paso una "i" para que sea INSENSIBLE a las mayusculas, minusculas y todo eso...

    Producto.find({nombre: regex}) // Si escribo por ejemplo "churro", me traera todo lo que lleve en alguna de sus partes la palabra churro... Y si pongo "ra", me traera todo lo que tenga "ra" (siempre haciendo referencia al nombre) en su escritura
            .populate('categoria', 'nombre')
            .exec((err, productoDB) =>{
                
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    productoDB
                })


            })

})

// ======= Fin Buscar Productos ===


// Crear un nuevo producto
router.post('/productos', verificarToken, (req, res) =>{
    // grabar el usuario
    // grabar una categoria del listado
    const usuario = req.usuario._id;
    const {nombre, precioUni, descripcion, img, categoria} = req.body;

    const producto = new Producto({
        nombre,
        precioUni,
        descripcion,
        img,
        categoria,
        usuario
    })

    // Guardar producto
    producto.save((err, productoGuardado) =>{

        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            productoGuardado
        })

    })



})


// Actualizar un nuevo producto por Id
router.put('/productos/:id', verificarToken, (req, res) =>{

    const id = req.params.id;
    const {nombre, precioUni, descripcion, img, categoria, disponible} = req.body;
    const opcionesDeUpdate = {
        nombre, 
        precioUni, 
        descripcion, 
        img, 
        categoria,
        disponible
    }


    Producto.findByIdAndUpdate(id, opcionesDeUpdate, {new: true, runValidators: true}, (err, productoDB) =>{

        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado.'
                }
            })
        }

        res.json({
            ok: true,
            productoDB
        })
    })

})


// Borrar un producto por Id
router.delete('/productos/:id', verificarToken, (req, res) =>{

    // En lugar de borrarlo fisicamente, solo cambiaremos el campo "disponible" a "false"
    const id = req.params.id;

    Producto.findByIdAndUpdate(id, {disponible: false}, {new: true, runValidators: true}, (err, productoBorrado) =>{ // Yo lo hice asi, aunque en el video lo hacen de otra manera (Pero creo que la mia es la mas optima)
        if(err){
            return res.status(500).json({
                ok: false,
                err
            })
        }
        
        if(!productoBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado.'
                }
            })
        }

        res.json({
            ok: true,
            productoBorrado
        })

    })

})





module.exports = router;


// qwe