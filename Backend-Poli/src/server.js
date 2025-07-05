//
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerEstudiantes from './routers/estudiante_router.js'
import routerAdministrador from './routers/administrador_router.js'
import routerVendedor from './routers/vendedor_router.js'

// INICIAMOS

const app = express()
dotenv.config()

// CONFIGURAMOS

app.set('port', process.env.port || 3000)
app.use(cors())

//MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({ extended: true })); 




//rutas

app.get('/',(req,res)=>{
    res.send("Server on")
})


// Rutas 
app.use('/api',routerEstudiantes)
app.use('/api',routerAdministrador)
app.use('/api',routerVendedor)
// Rutas que no existen
app.use((req,res)=>{res.status(404).send("Endpoint no encontrado")})


export default app


