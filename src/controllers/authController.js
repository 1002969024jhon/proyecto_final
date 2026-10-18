import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    buscarUsuarioActivoPorCorreo,
    buscarUsuarioPorCorreo,
    crearUsuario
} from '../servicios/authService.js';

export const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const usuario = await buscarUsuarioActivoPorCorreo(correo);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      mensaje: 'Autenticación exitosa',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const ROLES_VALIDOS = ['administrador', 'operador', 'consulta', 'auditor'];

export const registrarUsuario = async (req, res) => {
  const { nombre, correo, password, rol } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({
      error: 'El rol es obligatorio y debe ser administrador, operador, consulta o auditor'
    });
  }

  try {
    const usuarioExiste = await buscarUsuarioPorCorreo(correo);
    if (usuarioExiste) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const usuario = await crearUsuario({ nombre, correo, passwordHash, rol });

    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
  }
};
