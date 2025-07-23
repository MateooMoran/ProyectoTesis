//
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerUsuarios from './routers/usuarioRouter.js'
import routerVendedor from './routers/vendedorRouter.js'
import routerAdministrador from './routers/administradorRouter.js'
import routerEstudiante from './routers/estudianteRouter.js'
import routerServicio from './routers/servicioRouter.js'
// INICIAMOS

const app = express()
dotenv.config()

// CONFIGURAMOS

app.set('port', process.env.port || 3000)
app.use(cors())

//MIDDLEWARES
app.use(express.json())


//rutas

app.get('/',(req,res)=>{
    res.send("Server on")
})


// Rutas 
app.use('/api',routerUsuarios)
app.use('/api',routerVendedor)
app.use('/api',routerAdministrador)
app.use('/api',routerEstudiante)
app.use('/api',routerServicio)





// Rutas que no existen
app.use((req,res)=>{res.status(404).send("Endpoint no encontrado")})


export default app


