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
import session from "express-session";
import passport from "passport";
import './Auth/passport.js';

// INICIAMOS

const app = express()
dotenv.config()

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configuración de fileUpload
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads',
    // Permitir archivos grandes (ajusta según tus necesidades)
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
}))

// CONFIGURAMOS

app.set('port', process.env.port || 3000)
app.use(cors())

//MIDDLEWARES
// Aumentar límites para JSON y urlencoded en caso de que se envíen imágenes en base64
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))


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


