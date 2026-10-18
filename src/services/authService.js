import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const ROLES_VALIDOS = ['administrador', 'operador', 'consulta', 'auditor'];

export class ErrorSolicitud extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const buscarUsuarioActivoPorCorreo = async (correo) => {
    const result = await pool.query(
        'SELECT * FROM usuarios WHERE correo = $1 AND activo = true',
        [correo]
    );
    return result.rows[0] || null;
};

const buscarUsuarioPorCorreo = async (correo) => {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    return result.rows[0] || null;
};

const crearUsuario = async ({ nombre, correo, passwordHash, rol }) => {
    const result = await pool.query(
        `INSERT INTO usuarios (nombre, correo, password_hash, rol, activo)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, nombre, correo, rol, activo`,
        [nombre, correo, passwordHash, rol]
    );
    return result.rows[0];
};

export const iniciarSesion = async (correo, password) => {
    if (!correo || !password) {
        throw new ErrorSolicitud(400, 'Correo y contraseña son obligatorios');
    }

    const usuario = await buscarUsuarioActivoPorCorreo(correo);
    if (!usuario) {
        throw new ErrorSolicitud(401, 'Credenciales inválidas');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
        throw new ErrorSolicitud(401, 'Credenciales inválidas');
    }

    const token = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        }
    };
};

export const registrarCuenta = async ({ nombre, correo, password, rol }) => {
    if (!nombre || !correo || !password) {
        throw new ErrorSolicitud(400, 'Todos los campos son obligatorios');
    }

    if (!ROLES_VALIDOS.includes(rol)) {
        throw new ErrorSolicitud(400, 'El rol es obligatorio y debe ser administrador, operador, consulta o auditor');
    }

    const usuarioExiste = await buscarUsuarioPorCorreo(correo);
    if (usuarioExiste) {
        throw new ErrorSolicitud(400, 'El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return crearUsuario({ nombre, correo, passwordHash, rol });
};
