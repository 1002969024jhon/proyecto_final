import { Router } from 'express';
import { login,registrarUsuario } from '../controllers/authController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';

const router = Router();

// Ruta pública
router.post('/login', login);
router.post('/registro', registrarUsuario); 
// Ruta protegida (requiere token)
router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Acceso concedido a perfil de usuario',
    usuario: req.usuario
  });
});

// Ruta exclusiva para administradores
router.get('/admin', verificarToken, verificarRol('administrador'), (req, res) => {
  res.json({
    mensaje: 'Bienvenido al panel de administración',
    usuario: req.usuario
  });
});

export default router;