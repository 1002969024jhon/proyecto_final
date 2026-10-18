import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import vehiculoRoutes from './routes/vehiculoRoutes.js';
import repuestoRoutes from './routes/repuestoRoutes.js';
import tecnicoRoutes from './routes/tecnicoRoutes.js';
import ordenRoutes from './routes/ordenRoutes.js';
import inventarioRoutes from './routes/inventarioRoutes.js';
import auditoriaRoutes from './routes/auditoriaRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3001' }));


app.use(express.json({ limit: '1mb' }));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
}));


app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/repuestos', repuestoRoutes);
app.use('/api/tecnicos', tecnicoRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/movimientos-inventario', inventarioRoutes);
app.use('/api/auditoria', auditoriaRoutes)

// Ruta base
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'API REST AutoServi funcionando',
        estado: 'correcto'
    });
});

// Comprobar conexión a PostgreSQL
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`API AutoServi ejecutándose en http://localhost:${PORT}`);
});