import express from 'express';
import { 
    getTecnicos, 
    getTecnicoById, 
    crearTecnico, 
    actualizarTecnico, 
    desactivarTecnico 
} from '../controllers/tecnicoController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';
import registrarAuditoria from '../middleware/auditMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getTecnicos);
router.get('/:id', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getTecnicoById);
router.post('/', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('tecnicos'), crearTecnico);
router.put('/:id', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('tecnicos'), actualizarTecnico);
router.delete('/:id', verifyToken, verificarRol('administrador'), registrarAuditoria('tecnicos'), desactivarTecnico);

export default router;