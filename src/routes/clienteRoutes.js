import express from 'express';
import {
    getClientes,
    getClienteById,
    crearCliente,
    actualizarCliente,
    desactivarCliente
} from '../controllers/clienteController.js';
import verifyToken from '../middleware/authMiddleware.js';
import { verificarRol } from '../middleware/rolMiddleware.js';
import registrarAuditoria from '../middleware/auditMiddleware.js';

const router = express.Router();



router.get('/', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getClientes);
router.get('/:id', verifyToken, verificarRol('administrador', 'operador', 'consulta', 'auditor'), getClienteById);
router.post('/', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('clientes'), crearCliente);
router.put('/:id', verifyToken, verificarRol('administrador', 'operador'), registrarAuditoria('clientes'), actualizarCliente);
router.delete('/:id', verifyToken, verificarRol('administrador'), registrarAuditoria('clientes'), desactivarCliente);

export default router;