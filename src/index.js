
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Seguridad básica del servidor
app.use(helmet());

// Permitir solicitudes desde el frontend que configuraremos después
app.use(cors({
    origin: 'http://localhost:3001'
}));

// Permitir recibir datos JSON
app.use(express.json({ limit: '1mb' }));

// Limitar solicitudes para reducir abusos
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
}));

// Ruta inicial para comprobar que Express funciona
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'API REST AutoServi funcionando',
        estado: 'correcto'
    });
});

// Ruta para comprobar la conexión con PostgreSQL
app.get('/api/health', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT current_database() AS base_datos, NOW() AS fecha_servidor'
        );

        res.status(200).json({
            estado: 'correcto',
            mensaje: 'Conexión con PostgreSQL exitosa',
            baseDatos: resultado.rows[0].base_datos,
            fechaServidor: resultado.rows[0].fecha_servidor
        });
    } catch (error) {
        console.error('Error al comprobar PostgreSQL:', error.message);

        res.status(500).json({
            estado: 'error',
            mensaje: 'No fue posible conectar con la base de datos'
        });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`API AutoServi ejecutándose en http://localhost:${PORT}`);
});
