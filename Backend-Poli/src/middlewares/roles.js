export const esAdmin = (req, res, next) => {
  if (req.estudianteBDD.rol !== 'admin') {
    return res.status(403).json({ msg: 'Acceso denegado solo administradores' });
  }
  next();
};

export const esVendedor = (req, res, next) => {
  if (req.estudianteBDD.rol !== 'vendedor') {
    return res.status(403).json({ msg: 'Acceso denegado solo vendedores' });
  }
  next();
};

export const esEstudiante = (req, res, next) => {
  if (req.estudianteBDD.rol !== 'estudiante') {
    return res.status(403).json({ msg: 'Acceso denegado solo estudiantes' });
  }
  next();
};

export const esEstudianteOrVendedor = (req, res,next) =>{
  if (req.estudianteBDD.rol !== 'estudiante' && req.estudianteBDD.rol !== 'vendedor') {
    return res.status(403).json({ msg: 'Acceso denegado solo para estudiantes y vendedores' });
  }
  next()
}

export const esVendedorOrAdmin = (req,res, next) =>{
  if(req.estudianteBDD.rol !== 'vendedor' && req.estudianteBDD.rol !== 'admin'){
    return res.status(403).json({msg:'Acceso denegado solo para administradores y vendedores'})
  }
  next()
}
export const tieneRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.estudianteBDD.rol)) {
      return res.status(403).json({ msg: 'Acceso denegado no tiene ningun rol en el sistema' });
    }
    next();
  };
};

export const puedeComprar = (req, res, next) => {
  if (req.estudianteBDD.rol !== 'estudiante' && req.estudianteBDD.rol !== 'vendedor' && req.estudianteBDD.rol !== 'admin') {
    return res.status(403).json({ msg: 'Acceso denegado solo para estudiantes, vendedores y administradores' });
  }
  next();
};
