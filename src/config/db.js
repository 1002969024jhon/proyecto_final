
import pg from 'pg';
import dotenv from 'dotenv';

// Cargar las variables del archivo .env
dotenv.config();

const { Pool } = pg;

// Configuración de la conexión con PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Informar errores inesperados de conexión
pool.on('error', (error) => {
    console.error('Error inesperado en PostgreSQL:', error.message);
});

export default pool;
