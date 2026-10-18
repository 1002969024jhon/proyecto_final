import pool from '../config/db.js';

export const getVehiculos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT v.*, c.nombre AS cliente_nombre, c.documento AS cliente_documento 
            FROM vehiculos v 
            JOIN clientes c ON v.cliente_id = c.id 
            ORDER BY v.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar vehículos:', error);
        res.status(500).json({ error: 'Error interno al listar vehículos.' });
    }
};

export const getVehiculoById = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('SELECT * FROM vehiculos WHERE id = $1', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

export const crearVehiculo = async (req, res) => {
    const { placa, marca, modelo, anio, cliente_id, kilometraje, estado } = req.body;
    try {
        const nuevo = await pool.query(
            `INSERT INTO vehiculos (placa, marca, modelo, anio, cliente_id, kilometraje, estado, activo) 
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'disponible'), true) RETURNING *`,
            [placa, marca, modelo, anio, cliente_id, kilometraje, estado]
        );
        res.status(201).json({
            mensaje: 'Vehículo creado exitosamente.',
            vehiculo: nuevo.rows[0]
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
        const resultado = await pool.query(
            'UPDATE vehiculos SET placa = $1, marca = $2, modelo = $3, anio = $4, cliente_id = $5 WHERE id = $6 RETURNING *',
            [placa, marca, modelo, anio, cliente_id, id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        res.status(500).json({ error: 'Error interno al actualizar el vehículo.', detalle: error.message });
    }
};

export const deleteVehiculo = async (req, res) => {
    const { id } = req.params;
    try {
        // En lugar de cambiar el estado a un texto no permitido, ponemos activo en false
        const resultado = await pool.query(
            'UPDATE vehiculos SET activo = false WHERE id = $1 RETURNING *',
            [id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Vehículo no encontrado.' });
        }
        res.json({ mensaje: 'Vehículo desactivado correctamente', vehiculo: resultado.rows[0] });
    } catch (error) {
        console.error('Error al desactivar vehículo:', error);
        res.status(500).json({ error: 'Error interno al desactivar el vehículo.', detalle: error.message });
    }
};