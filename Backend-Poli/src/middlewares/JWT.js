import jwt from 'jsonwebtoken'
import Estudiante from '../models/Estudiante.js'

const createTokenJWT = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" })
}

const verifyTokenJWT = async (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) return res.status(401).json({ msg: "Token no proporcionado" });

    try {
        const token = authorization.split(' ')[1];
        const { id } = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Estudiante.findById(id).lean().select('-password');
        if (!usuario) return res.status(401).json({ msg: 'Usuario no existe' });

        req.estudianteBDD  = usuario;
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Token no valido o expirado" })
    }
}

export {
    createTokenJWT,
    verifyTokenJWT
}