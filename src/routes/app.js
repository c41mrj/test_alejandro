const express = require('express')
const router = express.Router()
const fs = require("fs")
const path = require('path')
const exceljs = require('exceljs')
let editorServer = require('datatables.net-editor-server')

const mysql = require('mysql2');

const connection = mysql.createConnection(
    {
        host:'localhost',
        user:'root',
        password:'Hestia1103@.',
        database: 'examen_alejandro_martinez'
    }
)

//Declaración de funciones para Base de datos

function conectar()
{
    connection.connect((error)=>
    {
        if(error)
        {
            console.log(error)
        }
        else{
            console.log('Conexión establecida')
        }
    })
}

function cerrar()
{
    connection.end((error)=>{
        if(error)
        {
            console.log(error)
        }
        else{
            console.log('Conexión cerrada')
        }
    })
}

function addClient(cliente,res)
{
    conectar();
        connection.query('INSERT INTO t_clientes SET ?',cliente,(error,result,fields)=>
        {
            if(error)
            {
                console.log(error)
                flag=false
            }
            else{
                console.log('Inserción exitosa')
                flag=true
                setTimeout(() => {
                    res.render('index',{flag:true})
                }, 3000);
            }
        })

}

function setClient(cliente,res)
{
    conectar();
        connection.query('UPDATE t_clientes SET Nombre=?, Domicilio=?, email=? WHERE IdClient = ?',[cliente.nombre,cliente.Domicilio,cliente.email,cliente.IdClient],(error,result,fields)=>
        {
            if(error)
            {
                console.log(error)
                flag=false
            }
            else{
                console.log('Inserción exitosa')
                flag=true
                setTimeout(() => {
                    res.render('index',{flag:true})
                }, 3000);
            }
        })
 
}

function addProducto(producto,res,next)
{
    let flag;
    conectar();
        connection.query('INSERT INTO t_productos SET ?',producto,(error,result,fields)=>
        {
            if(error)
            {
                console.log(error)
                flag=false
            }
            else{
                console.log('Inserción exitosa')
                flag=true
                setTimeout(() => {
                    res.render('index',{flag:true})
                }, 3000);
            }
        })
        return flag

}

function setProducto(producto,res)
{
    conectar();
        connection.query('UPDATE t_productos SET Nombre=?, Marca=?, Costo=?, PrecioVenta=? WHERE IdProducto = ?',[producto.nombre,producto.marca,producto.Costo,producto.PrecioVenta,producto.idProducto],(error,result,fields)=>
        {
            if(error)
            {
                console.log(error)
                flag=false
            }
            else{
                console.log('Inserción exitosa')
                flag=true
                setTimeout(() => {
                    res.render('index',{flag:true})
                }, 3000);
            }
        })
 
}

function setFactura(factura,res)
{

    conectar();
        connection.query('INSERT INTO t_facturas (NumeroFactura,FechaHora,IdClient) VALUES (?, ?, ?) ',[factura.NumeroFactura,factura.FechaHora,factura.IdClient],(error,result,fields)=>
        {
            if(error)
            {
                console.log(error)
            }
            else{
                let id = result
                //console.log(id.insertId)
                connection.query('SELECT idProducto from t_productos where Nombre = ?',[factura.idProducto],(error,resultado)=>
                {
                    try {
                        //console.log(id.insertId)
                        console.log("Resultado")
                        //console.log(resultado)
                        setDetalle(factura,resultado,id,res)

                    } catch (error) {
                        console.log(error)
                    }
                })
            }
        })
}

function setDetalle(factura,resultado,id,res)
{

   //console.log(id.insertId)
   let flag;
   console.log(resultado[0].idProducto)
   connection.query('INSERT INTO t_detalleFactura (IdFactura,idProducto,Cantidad) values (?,?,?)',[id.insertId,resultado[0].idProducto,factura.Cantidad],(error,results)=>
   {
    try {
        console.log(results)
        console.log('Inserción exitosa')
        flag=true
        setTimeout(() => {
            res.render('index',{flag:true})
        }, 3000);
    } catch (error) {
        console.log(error)
    }
   }
   )
}


//TODO AGREGAR FACTURA


router.get('/',(req,res)=>
{
    res.render('index')
})

router.post('/setClient',(req,res)=>
{
    let cliente =
    {
        IdClient: parseInt(req.body.IdCliente),
        nombre: req.body.nombre,
        Domicilio: req.body.Domicilio,
        email: req.body.email
    }
    setClient(cliente,res)}
)

router.post('/createFactura',(req,res)=>
{
    let factura = req.body
    console.log(req.body)
    setFactura(factura,res)
})

router.post('/setProducto',(req,res)=>


{
    console.log(req.body)
    setProducto(req.body,res)
}
)
    
router.post('/addClient',(req,res,next)=>
{
    let client = req.body
    addClient(client,res)
})

router.post('/addProduct',(req,res,next)=>
{
    let product = req.body
    addProducto(product,res,next)
    
})

router.get('/getClients',(req,res)=>{
    
    conectar(); 
     connection.query('SELECT * FROM t_clientes',(error,result,fields)=>
        {
            if(error)
            {
                console.log(error)
            }
            else{
                
                res.send(result)
                
            }
        })


    //addClient(cliente)
    //setClient(cliente)
})

router.get('/getProductos',(req,res)=>
{
    conectar(); 
    connection.query('SELECT * FROM t_productos',(error,result,fields)=>
       {
           if(error)
           {
               console.log(result)
           }
           else{
               
               res.send(result)
           }
       })

})

router.get('/download',(req,res)=>
{
    conectar();
    let query="SELECT t_facturas.idFactura as 'Factura',t_facturas.FechaHora as 'Fecha',t_clientes.Nombre as 'Cliente',t_detalleFactura.Cantidad as 'Productos',CAST(SUM(t_productos.PrecioVenta * t_detalleFactura.Cantidad) AS DECIMAL(10, 2)) AS 'Monto' FROM t_facturas INNER JOIN t_clientes ON t_facturas.IdClient = t_clientes.IdClient INNER JOIN t_detalleFactura ON t_facturas.idFactura = t_detalleFactura.idFactura INNER JOIN t_productos ON t_detalleFactura.idProducto = t_productos.IdProducto GROUP BY t_facturas.idFactura, t_facturas.FechaHora, t_clientes.Nombre, t_detalleFactura.Cantidad;"
    connection.query(query,(error,result)=>
    {
        const workbook = exportData(result)
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename="+"factura.xlsx"
        )
        return workbook.xlsx.write(res).then(()=>{
            res.status(200).end()
        })
        
    })
    
})

const exportData = (data)=>{
    let workbook = new exceljs.Workbook()
    let worksheet = workbook.addWorksheet("Worksheet");
    let columns = data.reduce((acc,obj)=>acc=Object.getOwnPropertyNames(obj),[])

    worksheet.columns=columns.map((el)=>{
        return{header:el,key:el,width:20}
    })
    worksheet.addRows(data);
    return workbook
}

router.get('/getFacturas',(req,res)=>
{
    conectar();
    let query="SELECT t_facturas.idFactura as 'Factura',t_facturas.FechaHora as 'Fecha',t_clientes.Nombre as 'Cliente',t_detalleFactura.Cantidad as 'Productos',CAST(SUM(t_productos.PrecioVenta * t_detalleFactura.Cantidad) AS DECIMAL(10, 2)) AS 'Monto' FROM t_facturas INNER JOIN t_clientes ON t_facturas.IdClient = t_clientes.IdClient INNER JOIN t_detalleFactura ON t_facturas.idFactura = t_detalleFactura.idFactura INNER JOIN t_productos ON t_detalleFactura.idProducto = t_productos.IdProducto GROUP BY t_facturas.idFactura, t_facturas.FechaHora, t_clientes.Nombre, t_detalleFactura.Cantidad;"
    connection.query(query,(error,result)=>
    {
        try {
            res.send(result)
        } catch (error) {
            res.send('Error')
        }
    })
})
module.exports=router