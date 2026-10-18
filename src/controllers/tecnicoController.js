import pool from '../config/db.js';

export const getTecnicos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tecnicos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al listar técnicos:', error);
        res.status(500).json({ error: 'Error interno al listar técnicos.' });
    }
};

export const getTecnicoById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM tecnicos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Técnico no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al buscar técnico:', error);
        res.status(500).json({ error: 'Error interno al buscar el técnico.' });
    }
};

export const crearTecnico = async (req, res) => {
    const { codigo, nombre, especialidad } = req.body;
    try {
        const nuevo = await pool.query(
            `INSERT INTO tecnicos (codigo, nombre, especialidad, activo) 
             VALUES ($1, $2, $3, true) RETURNING *`,
            [codigo, nombre, especialidad]
        );
        res.status(201).json({
            mensaje: 'Técnico creado exitosamente.',
            tecnico: nuevo.rows[0]
        });
    } catch (error) {
        console.error('Error al crear técnico:', error);
        res.status(500).json({ error: 'Error interno al crear el técnico.' });
    }
};

export const actualizarTecnico = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, especialidad, activo } = req.body;
    try {
        const actualizado = await pool.query(
            `UPDATE tecnicos 
             SET codigo = COALESCE($1, codigo), 
                 nombre = COALESCE($2, nombre), 
                 especialidad = COALESCE($3, especialidad), 
                 activo = COALESCE($4, activo) 
             WHERE id = $5 RETURNING *`,
            [codigo, nombre, especialidad, activo, id]
        );

        if (actualizado.rows.length === 0) {
            return res.status(404).json({ error: 'Técnico no encontrado para actualizar.' });
        }

        res.json({
            mensaje: 'Técnico actualizado exitosamente.',
            tecnico: actualizado.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar técnico:', error);
        res.status(500).json({ error: 'Error interno al actualizar el técnico.' });
    }
};

export const desactivarTecnico = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query(
            'UPDATE tecnicos SET activo = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Técnico no encontrado.' });
        }

        res.json({
            mensaje: 'Técnico desactivado exitosamente.',
            tecnico: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error al desactivar técnico:', error);
        res.status(500).json({ error: 'Error interno al desactivar el técnico.' });
    }
};