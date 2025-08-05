//
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import routerUsuarios from './routers/usuarioRouter.js'
import routerVendedor from './routers/vendedorRouter.js'
import routerAdministrador from './routers/administradorRouter.js'
import routerEstudiante from './routers/estudianteRouter.js'
import routerServicio from './routers/servicioRouter.js'
import cloudinary from 'cloudinary'
import fileUpload from 'express-fileupload'
// INICIAMOS

const app = express()
dotenv.config()

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configuración de fileUpload
// Esto permite manejar archivos subidos en las rutas
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads',
}))

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


