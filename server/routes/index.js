

// requires
const express = require('express');
const app = express();

// Middlewares
app.use(require('./usuarios'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));



module.exports = app;



// qwe