import { listarAuditoria } from '../servicios/auditoriaService.js';

const getAuditoria = async (req, res) => {
    try {
        const registros = await listarAuditoria();
        res.json(registros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los registros de auditoría.' });
    }
};

export { getAuditoria };
