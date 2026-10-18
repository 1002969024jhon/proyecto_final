import express from 'express';
import { 
    getRepuestos, 
    getRepuestoById, 
    crearRepuesto, 
    actualizarRepuesto, 
    desactivarRepuesto 
} from '../controllers/repuestoController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';
import registrarAuditoria from '../middleware/auditMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getRepuestos);
router.get('/:id', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getRepuestoById);

router.post('/', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('repuestos'), crearRepuesto);
router.put('/:id', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('repuestos'), actualizarRepuesto);

// Solo administrador puede desactivar repuestos
router.delete('/:id', verifyToken, verificarRol('administrador'), registrarAuditoria('repuestos'), desactivarRepuesto);

export default router;