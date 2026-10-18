import pool from '../config/db.js';

// Listar todos los clientes
export const getClientes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar clientes:', error);
        res.status(500).json({ error: 'Error interno al listar clientes.' });
    }
};

// Buscar cliente por ID
export const getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al buscar cliente:', error);
        res.status(500).json({ error: 'Error interno al buscar el cliente.' });
    }
};

// Crear cliente
export const crearCliente = async (req, res) => {
    const { documento, nombre, correo, telefono } = req.body;
    try {
        const nuevo = await pool.query(
            `INSERT INTO clientes (documento, nombre, correo, telefono, activo) 
             VALUES ($1, $2, $3, $4, true) RETURNING *`,
            [documento, nombre, correo, telefono]
        );
        res.status(201).json({
            mensaje: 'Cliente creado exitosamente.',
            cliente: nuevo.rows[0]
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ error: 'Error interno al crear el cliente.' });
    }
};

// Actualizar cliente
export const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { documento, nombre, correo, telefono, activo } = req.body;
    try {
        const actualizado = await pool.query(
            `UPDATE clientes 
             SET documento = COALESCE($1, documento), 
                 nombre = COALESCE($2, nombre), 
                 correo = COALESCE($3, correo), 
                 telefono = COALESCE($4, telefono), 
                 activo = COALESCE($5, activo) 
             WHERE id = $6 RETURNING *`,
            [documento, nombre, correo, telefono, activo, id]
        );

        if (actualizado.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado para actualizar.' });
        }

        res.json({
            mensaje: 'Cliente actualizado exitosamente.',
            cliente: actualizado.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: 'Error interno al actualizar el cliente.' });
    }
};

// Desactivar cliente (Soft Delete)
export const desactivarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            'UPDATE clientes SET activo = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        res.json({
            mensaje: 'Cliente desactivado exitosamente.',
            cliente: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error al desactivar cliente:', error);
        res.status(500).json({ error: 'Error interno al desactivar el cliente.' });
    }
};