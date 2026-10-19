import * as auditoriaService from '../services/auditoriaService.js';

export const getAuditoria = async (req, res) => {
    try {
        const registros = await auditoriaService.listarAuditoria(req.query);
        res.json(registros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los registros de auditoría.' });
    }
};