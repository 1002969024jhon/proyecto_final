import { listarMovimientos } from '../servicios/inventarioService.js';

const getMovimientosInventario = async (req, res) => {
    try {
        const movimientos = await listarMovimientos();
        res.json(movimientos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los movimientos de inventario.' });
    }
};

export { getMovimientosInventario };
