import express from 'express';
import { getOrdenes, getOrdenById, crearOrden, finalizarOrden } from '../controllers/ordenController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';
import registrarAuditoria from '../middleware/auditMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getOrdenes);
router.get('/:id', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getOrdenById);
router.post('/', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('ordenes'), crearOrden);
router.put('/:id/finalizar', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('ordenes'), finalizarOrden);

export default router;