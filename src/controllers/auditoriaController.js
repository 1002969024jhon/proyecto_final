import * as auditoriaService from '../services/auditoriaService.js';
import { responderErrorBd } from '../utils/erroresHttp.js';

export const getAuditoria = async (req, res) => {
    try {
        const registros = await auditoriaService.listarAuditoria(req.query);
        res.json(registros);
    } catch (error) {
        return responderErrorBd(res, error, 'Error al consultar los registros de auditoría.');
    }
};