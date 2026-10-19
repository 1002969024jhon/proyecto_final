import { iniciarSesion, registrarCuenta, ErrorSolicitud } from '../services/authService.js';

const responderError = (res, error, mensajeInterno) => {
    if (error instanceof ErrorSolicitud) {
        return res.status(error.status).json({ error: error.message });
    }

    console.error(mensajeInterno, error);
    return res.status(500).json({ error: mensajeInterno });
};

export const login = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const { token, usuario } = await iniciarSesion(correo, password);
        return res.json({
            mensaje: 'Autenticación exitosa',
            token,
            usuario
        });
    } catch (error) {
        return responderError(res, error, 'Error interno del servidor');
    }
};

export const registrarUsuario = async (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    try {
        const usuario = await registrarCuenta({ nombre, correo, password, rol });
        return res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario
        });
    } catch (error) {
        return responderError(res, error, 'Error interno del servidor al registrar usuario');
    }
};
