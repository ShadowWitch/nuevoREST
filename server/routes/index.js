

// requires
const express = require('express');
const app = express();

// Middlewares
app.use(require('./usuarios'));
app.use(require('./login'));



module.exports = app;



// qwe