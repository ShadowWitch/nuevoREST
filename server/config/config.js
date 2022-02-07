
// NOTA: Esto se suele usar mucho para configurar el proyecto y que el mismo detecte si esta en ambiente de "Produccion" o de "Desarrollo"

// ==============================
// Puerto
// ==============================
process.env.PORT = process.env.PORT || 3000;


// ==============================
// Entorno
// ==============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; // NODE_ENV es una variable que ya nos proporciona heroku para usarla y saber si estamos en entorno de "produccion" o "desarrollo"


// ==============================
// Vencimiento del Token
// ==============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = '3 days';


// ==============================
// SEED de autenticacion
// ==============================
process.env.SEED =  process.env.SEED || 'secretito';



// ==============================
// Google Client ID
// ==============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '262400476400-dornbmbpvub9qdjv8ha7q0dahcb4iu5f.apps.googleusercontent.com';
// 262400476400-41djk3vudi46v5gjc60dv9481n422023.apps.googleusercontent.com
// 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

// Para el HTTPS
// 262400476400-dornbmbpvub9qdjv8ha7q0dahcb4iu5f.apps.googleusercontent.com
// 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


// ==============================
// Base de datos
// ==============================
let urlDB;

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe2';
}else{

    urlDB = process.env.URIDB;

}


process.env.URLDB = urlDB; // Aqui nos estamos inventando una variable de entorno, llamada "URLDB"




// qwe