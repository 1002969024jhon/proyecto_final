import * as vehiculoService from '../services/vehiculoService.js';
import pool from '../config/db.js';

export const getVehiculos = async (req, res) => {
    try {
        const vehiculos = await vehiculoService.listarVehiculos(req.query);
        res.json(vehiculos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los vehículos.' });
    }
};

export const getVehiculoById = async (req, res) => {
    const { id } = req.params;
    try {
        const vehiculo = await vehiculoService.obtenerVehiculoPorId(id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }
        res.json(vehiculo);
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

export const crearVehiculo = async (req, res) => {
    const { placa, marca, modelo, anio, cliente_id, kilometraje, estado } = req.body;
    try {
        const vehiculo = await vehiculoService.crearVehiculo({ placa, marca, modelo, anio, cliente_id, kilometraje, estado });
        res.status(201).json({
            mensaje: 'Vehículo creado exitosamente.',
            vehiculo
        });
    } catch (error) {
        console.error('Error al crear vehículo:', error);
        res.status(500).json({ error: 'Error interno al crear el vehículo.' });
    }
};

export const updateVehiculo = async (req, res) => {
    const { id } = req.params;
    const { placa, marca, modelo, anio, cliente_id } = req.body;
    try {
        const vehiculo = await vehiculoService.actualizarVehiculo(id, { placa, marca, modelo, anio, cliente_id });
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }
        res.json(vehiculo);
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        res.status(500).json({ error: 'Error interno al actualizar el vehículo.', detalle: error.message });
    }
};

export const deleteVehiculo = async (req, res) => {
    const { id } = req.params;
    try {
        // 1.Verificar si tiene órdenes abiertas
        const ordenesAbiertas = await pool.query(
            "SELECT * FROM ordenes WHERE vehiculo_id = $1 AND estado = 'abierta'",
            [id]
        );

        if (ordenesAbiertas.rows.length > 0) {
            return res.status(400).json({ 
                error: "No se puede desactivar el vehículo porque tiene órdenes de mantenimiento abiertas." 
            });
        }

        // Si no tiene órdenes abiertas, procede con el Soft Delete
        const result = await pool.query(
            "UPDATE vehiculos SET activo = false WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vehículo no encontrado." });
        }

        res.json({ mensaje: "Vehículo desactivado correctamente", vehiculo: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al desactivar el vehículo." });
    }
};
