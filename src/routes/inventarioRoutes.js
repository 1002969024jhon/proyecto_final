import express from 'express';
import { getMovimientos } from '../controllers/inventarioController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, verificarRol('administrador', 'operador', 'auditor'), getMovimientos);

export default router;