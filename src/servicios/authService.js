import pool from '../config/db.js';

export const buscarUsuarioActivoPorCorreo = async (correo) => {
    const result = await pool.query(
        'SELECT * FROM usuarios WHERE correo = $1 AND activo = true',
        [correo]
    );
    return result.rows[0] || null;
};

export const buscarUsuarioPorCorreo = async (correo) => {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    return result.rows[0] || null;
};

export const crearUsuario = async ({ nombre, correo, passwordHash, rol }) => {
    const result = await pool.query(
        `INSERT INTO usuarios (nombre, correo, password_hash, rol, activo)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, nombre, correo, rol, activo`,
        [nombre, correo, passwordHash, rol]
    );
    return result.rows[0];
};
