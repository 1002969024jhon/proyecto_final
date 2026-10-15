const pool = require('../config/db');

const registrarAuditoria = (recurso) => {
  return async (req, res, next) => {
    // Interceptamos la finalización de la respuesta HTTP
    const originalJson = res.json;

    res.json = function (data) {
      // Solo auditar acciones de modificación exitosas (POST, PUT, DELETE)
      if (['POST', 'PUT', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
        const usuarioId = req.usuario ? req.usuario.id : null;
        const accion = req.method === 'POST' ? 'CREAR' : req.method === 'PUT' ? 'ACTUALIZAR' : 'ELIMINAR';
        const recursoId = req.params.id || (data && data.id ? String(data.id) : null);

        pool.query(
          `INSERT INTO auditoria (usuario_id, accion, metodo, ruta, recurso, recurso_id, datos_nuevos, codigo_http, ip, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            usuarioId,
            accion,
            req.method,
            req.originalUrl,
            recurso,
            recursoId,
            JSON.stringify(req.body || {}),
            res.statusCode,
            req.ip,
            req.headers['user-agent']
          ]
        ).catch(err => console.error('Error guardando auditoría:', err));
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = registrarAuditoria;