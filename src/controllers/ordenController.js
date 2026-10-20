import * as ordenService from '../services/ordenService.js';
import { responderErrorBd } from '../utils/erroresHttp.js';

export const getOrdenes = async (req, res) => {
    try {
        
        const ordenes = await ordenService.listarOrdenes(req.query);
        res.json(ordenes);
    } catch (error) {
        return responderErrorBd(res, error, 'Error al consultar las órdenes.');
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
        return responderErrorBd(res, error, 'Error al consultar el detalle de la orden.');
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
        if (error.code) {
            return responderErrorBd(res, error, 'Error al procesar la orden transaccional.');
        }

        console.error('Error transaccional en orden (ROLLBACK ejecutado):', error.message);
        return res.status(400).json({ error: error.message || 'Error al procesar la orden transaccional.' });
    }
};

export const finalizarOrden = async (req, res) => {
    try {
        const resultado = await ordenService.finalizarOrden(req.params.id);

        if (resultado.motivo === 'no_encontrada') {
            return res.status(404).json({ error: 'Orden no encontrada.' });
        }

        if (resultado.motivo === 'ya_finalizada') {
            return res.status(400).json({ error: 'La orden ya está finalizada y no se puede modificar.' });
        }

        if (resultado.motivo === 'anulada') {
            return res.status(400).json({ error: 'No se puede finalizar una orden anulada.' });
        }

        if (!resultado.orden) {
            return res.status(400).json({ error: 'No se pudo finalizar la orden.' });
        }

        return res.json({
            mensaje: 'Orden finalizada exitosamente.',
            orden: resultado.orden
        });
    } catch (error) {
        return responderErrorBd(res, error, 'Error al finalizar la orden.');
    }
};