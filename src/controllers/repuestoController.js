import pool from '../config/db.js';

export const getRepuestos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM repuestos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar repuestos:', error);
        res.status(500).json({ error: 'Error interno al listar repuestos.' });
    }
};

export const getRepuestoById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM repuestos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Repuesto no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al buscar repuesto:', error);
        res.status(500).json({ error: 'Error interno al buscar el repuesto.' });
    }
};

export const crearRepuesto = async (req, res) => {
    const { codigo, nombre, descripcion, precio_unitario, stock, stock_minimo } = req.body;
    try {
        const nuevo = await pool.query(
            `INSERT INTO repuestos (codigo, nombre, descripcion, precio_unitario, stock, stock_minimo, activo) 
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, 0), true) RETURNING *`,
            [codigo, nombre, descripcion, precio_unitario, stock, stock_minimo]
        );
        res.status(201).json({
            mensaje: 'Repuesto creado exitosamente.',
            repuesto: nuevo.rows[0]
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
        const actualizado = await pool.query(
            `UPDATE repuestos 
             SET codigo = COALESCE($1, codigo), 
                 nombre = COALESCE($2, nombre), 
                 descripcion = COALESCE($3, descripcion), 
                 precio_unitario = COALESCE($4, precio_unitario), 
                 stock = COALESCE($5, stock), 
                 stock_minimo = COALESCE($6, stock_minimo), 
                 activo = COALESCE($7, activo) 
             WHERE id = $8 RETURNING *`,
            [codigo, nombre, descripcion, precio_unitario, stock, stock_minimo, activo, id]
        );

        if (actualizado.rows.length === 0) {
            return res.status(404).json({ error: 'Repuesto no encontrado para actualizar.' });
        }

        res.json({
            mensaje: 'Repuesto actualizado exitosamente.',
            repuesto: actualizado.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar repuesto:', error);
        res.status(500).json({ error: 'Error interno al actualizar el repuesto.' });
    }
};

export const desactivarRepuesto = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            'UPDATE repuestos SET activo = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Repuesto no encontrado.' });
        }

        res.json({
            mensaje: 'Repuesto desactivado exitosamente.',
            repuesto: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error al desactivar repuesto:', error);
        res.status(500).json({ error: 'Error interno al desactivar el repuesto.' });
    }
};