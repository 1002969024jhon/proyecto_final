import {
    listarRepuestos,
    obtenerRepuestoPorId,
    crearRepuesto as guardarRepuesto,
    actualizarRepuesto as guardarCambiosRepuesto,
    desactivarRepuesto as desactivarRepuestoEnBd
} from '../servicios/repuestoService.js';

export const getRepuestos = async (req, res) => {
    try {
        const repuestos = await listarRepuestos();
        res.json(repuestos);
    } catch (error) {
        console.error('Error al listar repuestos:', error);
        res.status(500).json({ error: 'Error interno al listar repuestos.' });
    }
};

export const getRepuestoById = async (req, res) => {
    const { id } = req.params;
    try {
        const repuesto = await obtenerRepuestoPorId(id);
        if (!repuesto) {
            return res.status(404).json({ error: 'Repuesto no encontrado.' });
        }
        res.json(repuesto);
    } catch (error) {
        console.error('Error al buscar repuesto:', error);
        res.status(500).json({ error: 'Error interno al buscar el repuesto.' });
    }
};

export const crearRepuesto = async (req, res) => {
    const { codigo, nombre, descripcion, precio_unitario, stock, stock_minimo } = req.body;
    try {
        const repuesto = await guardarRepuesto({ codigo, nombre, descripcion, precio_unitario, stock, stock_minimo });
        res.status(201).json({
            mensaje: 'Repuesto creado exitosamente.',
            repuesto
        });
    } catch (error) {
        console.error('Error al crear repuesto:', error);
        res.status(500).json({ error: 'Error interno al crear el repuesto.' });
    }
};

export const actualizarRepuesto = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, descripcion, precio_unitario, stock, stock_minimo, activo } = req.body;
    try {
        const repuesto = await guardarCambiosRepuesto(id, {
            codigo, nombre, descripcion, precio_unitario, stock, stock_minimo, activo
        });
        if (!repuesto) {
            return res.status(404).json({ error: 'Repuesto no encontrado para actualizar.' });
        }
        res.json({
            mensaje: 'Repuesto actualizado exitosamente.',
            repuesto
        });
    } catch (error) {
        console.error('Error al actualizar repuesto:', error);
        res.status(500).json({ error: 'Error interno al actualizar el repuesto.' });
    }
};

export const desactivarRepuesto = async (req, res) => {
    const { id } = req.params;
    try {
        const repuesto = await desactivarRepuestoEnBd(id);
        if (!repuesto) {
            return res.status(404).json({ error: 'Repuesto no encontrado.' });
        }
        res.json({
            mensaje: 'Repuesto desactivado exitosamente.',
            repuesto
        });
    } catch (error) {
        console.error('Error al desactivar repuesto:', error);
        res.status(500).json({ error: 'Error interno al desactivar el repuesto.' });
    }
};
