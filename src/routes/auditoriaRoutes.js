import express from 'express';
import { getAuditoria } from '../controllers/auditoriaController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, verificarRol('administrador', 'auditor'), getAuditoria);

export default router;