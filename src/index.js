const express = require('express');
const PORT = 3000;
const app = express();
const path = require('path')
const hbs = require('express-handlebars');

//Inicialización del servidor
const server = app.listen(PORT,()=>
{
    console.log('Sever is listening on PORT: '+PORT);
})

app.set('port',process.env.PORT || 3000)
app.set('views',path.join(__dirname,'views'))
app.engine('.hbs',hbs.engine({
    defaultLayout:'main',
    extname:'.hbs'
}))

app.set('view engine','.hbs')

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')))
app.use(require('./routes/app'))