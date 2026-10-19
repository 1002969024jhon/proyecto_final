import * as clienteService from '../services/clienteService.js';
import pool from '../config/db.js';
import { responderErrorBd } from '../utils/erroresHttp.js';

export const getClientes = async (req, res) => {
    try {
        const clientes = await clienteService.listarClientes(req.query);
        res.json(clientes);
    } catch (error) {
        return responderErrorBd(res, error, 'Error al consultar los clientes.');
    }
};

export const getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await clienteService.obtenerClientePorId(id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        res.json(cliente);
    } catch (error) {
        return responderErrorBd(res, error, 'Error interno al buscar el cliente.');
    }
};

export const crearCliente = async (req, res) => {
    const { documento, nombre, correo, telefono } = req.body;
    try {
        const cliente = await clienteService.crearCliente({ documento, nombre, correo, telefono });
        res.status(201).json({
            mensaje: 'Cliente creado exitosamente.',
            cliente
        });
    } catch (error) {
        return responderErrorBd(res, error, 'Error interno al crear el cliente.');
    }
};

export const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { documento, nombre, correo, telefono, activo } = req.body;
    try {
        const cliente = await clienteService.actualizarCliente(id, { documento, nombre, correo, telefono, activo });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado para actualizar.' });
        }
        res.json({
            mensaje: 'Cliente actualizado exitosamente.',
            cliente
        });
    } catch (error) {
        return responderErrorBd(res, error, 'Error interno al actualizar el cliente.');
    }
};

export const desactivarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Validar si el cliente tiene vehículos asociados con órdenes activas
        const vehiculosAsociados = await pool.query(
            "SELECT v.id FROM vehiculos v JOIN ordenes o ON v.id = o.vehiculo_id WHERE v.cliente_id = $1 AND o.estado = 'abierta'",
            [id]
        );

        if (vehiculosAsociados.rows.length > 0) {
            return res.status(400).json({ 
                error: "No se puede desactivar el cliente porque tiene vehículos con órdenes de mantenimiento abiertas." 
            });
        }

        // 2. Si no tiene restricciones, se procede con el Soft Delete
        const result = await pool.query(
            "UPDATE clientes SET activo = false WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado." });
        }

        res.json({ mensaje: "Cliente desactivado exitosamente.", cliente: result.rows[0] });
    } catch (error) {
        return responderErrorBd(res, error, 'Error al desactivar el cliente.');
    }
};
