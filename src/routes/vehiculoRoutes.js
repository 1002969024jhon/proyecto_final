import express from 'express';
import { getVehiculos, crearVehiculo, getVehiculoById,updateVehiculo,deleteVehiculo } from '../controllers/vehiculoController.js'; 
import verifyToken from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';
import registrarAuditoria from '../middleware/auditMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getVehiculos);
router.post('/', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('vehiculos'), crearVehiculo);
router.get('/:id', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getVehiculoById);
router.put('/:id', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('vehiculos'), updateVehiculo);
router.delete('/:id', verifyToken, verificarRol('administrador'), registrarAuditoria('vehiculos'), deleteVehiculo);

export default router;