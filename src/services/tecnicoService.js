import pool from '../config/db.js';

export const listarTecnicos = async (filtros = {}) => {
    let query = `SELECT * FROM tecnicos WHERE 1=1`;
    const values = [];
    let paramIndex = 1;
    
    const columnasValidas = ['codigo', 'nombre', 'especialidad', 'activo'];

    for (const [key, value] of Object.entries(filtros)) {
        if (value !== undefined && value !== '' && columnasValidas.includes(key)) {
            
            if (key === 'activo') {
                query += ` AND activo = $${paramIndex++}`;
                values.push(value === 'true' || value === true);
            } else {
                
                query += ` AND ${key} ILIKE $${paramIndex++}`;
                values.push(`%${value}%`);
            }
        }
    }

    query += ` ORDER BY id DESC`;
    const result = await pool.query(query, values);
    return result.rows;
};

export const obtenerTecnicoPorId = async (id) => {
    const result = await pool.query('SELECT * FROM tecnicos WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const crearTecnico = async ({ codigo, nombre, especialidad }) => {
    const result = await pool.query(
        `INSERT INTO tecnicos (codigo, nombre, especialidad, activo)
         VALUES ($1, $2, $3, true) RETURNING *`,
        [codigo, nombre, especialidad]
    );
    return result.rows[0];
};

export const actualizarTecnico = async (id, { codigo, nombre, especialidad, activo }) => {
    const result = await pool.query(
        `UPDATE tecnicos
         SET codigo = COALESCE($1, codigo),
             nombre = COALESCE($2, nombre),
             especialidad = COALESCE($3, especialidad),
             activo = COALESCE($4, activo)
         WHERE id = $5 RETURNING *`,
        [codigo, nombre, especialidad, activo, id]
    );
    return result.rows[0] || null;
};

export const desactivarTecnico = async (id) => {
    const result = await pool.query(
        'UPDATE tecnicos SET activo = false WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
};
