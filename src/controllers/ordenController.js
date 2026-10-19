import * as ordenService from '../services/ordenService.js';

export const getOrdenes = async (req, res) => {
    try {
        
        const ordenes = await ordenService.listarOrdenes(req.query);
        res.json(ordenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar las órdenes.' });
    }
};

export const getOrdenById = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await ordenService.obtenerOrdenPorId(id);
        if (!resultado) {
            return res.status(404).json({ error: 'Orden no encontrada.' });
        }
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el detalle de la orden.' });
    }
};

export const crearOrden = async (req, res) => {
    const { vehiculo_id, tecnico_id, descripcion, tipo, mano_obra, repuestos } = req.body;
    const usuario_id = req.usuario ? req.usuario.id : 1;

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '::1';
    const user_agent = req.headers['user-agent'] || 'PostmanRuntime';

    try {
        const { orden, detalles } = await ordenService.crearOrden({
            vehiculo_id,
            tecnico_id,
            usuario_id,
            descripcion,
            tipo,
            mano_obra,
            repuestos,
            ip,
            user_agent
        });

        res.status(201).json({
            mensaje: 'Orden creada exitosamente con número consecutivo.',
            orden,
            detalles
        });
    } catch (error) {
        console.error('Error transaccional en orden (ROLLBACK ejecutado):', error.message);
        res.status(400).json({ error: error.message || 'Error al procesar la orden transaccional.' });
    }
};