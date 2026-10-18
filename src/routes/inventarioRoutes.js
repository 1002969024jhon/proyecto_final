import express from 'express';
import { getMovimientosInventario } from '../controllers/inventarioController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, verificarRol('administrador', 'operador', 'auditor'), getMovimientosInventario);

export default router;