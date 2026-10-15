export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: `Acceso denegado: se requiere rol de [${rolesPermitidos.join(' o ')}]` 
      });
    }

    next();
  };
};