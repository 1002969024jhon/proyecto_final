import * as inventarioService from '../services/inventarioService.js';

export const getMovimientos = async (req, res) => {
    try {
        const movimientos = await inventarioService.listarMovimientos(req.query);
        res.json(movimientos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los movimientos.' });
    }
};