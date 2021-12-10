var express = require('express');
require('dotenv').config()
var app = express();
var PORT = process.env.PORT;
require('./router/auth')
app.use(require('./router/auth'))
app.listen(PORT)
