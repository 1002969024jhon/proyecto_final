import * as inventarioService from '../services/inventarioService.js';
import { responderErrorBd } from '../utils/erroresHttp.js';

export const getMovimientos = async (req, res) => {
    try {
        const movimientos = await inventarioService.listarMovimientos(req.query);
        res.json(movimientos);
    } catch (error) {
        return responderErrorBd(res, error, 'Error al consultar los movimientos.');
    }
};