
// requires descargados
const express = require('express')

// requires del sistema
const fs = require('fs');
const app = require('./uploads');
const path = require('path')

const {verificarTokenImg} = require('../middlewares/autenticacion')

const router = express.Router();

router.get('/imagen/:tipo/:img', verificarTokenImg, (req, res) =>{
    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    const imgNotFound = path.resolve(__dirname, '../assets/imgnotfound.png');

    // console.log(pathImg)
    
    if(fs.existsSync(pathImg)){
        res.sendFile(pathImg) // "sendFile()" tiene algo muy interesante que lee el 'Content-type' del archivo y eso es lo que regresa, por ejemplo si es una imagen lo que le ingresamos, pues regresa una imagen. Si es un html pues regresa una html y asi de esa manera...
    }else{
        res.sendFile(imgNotFound)
    }


})






module.exports = router;

// qwe