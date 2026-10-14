-- Limpieza previa en orden inverso para evitar fallos de claves foráneas
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS detalle_orden;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS repuestos;
DROP TABLE IF EXISTS tecnicos;
DROP TABLE IF EXISTS vehiculos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;

-- 1. Tabla de Usuarios (Soporta Hash Bcrypt y Roles)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(160) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('administrador', 'operador', 'consulta', 'auditor')),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    documento VARCHAR(40) UNIQUE NOT NULL,
    nombre VARCHAR(140) NOT NULL,
    correo VARCHAR(160) NULL,
    telefono VARCHAR(40) NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Tabla de Vehículos
CREATE TABLE vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(80) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anio SMALLINT CHECK (anio >= 1900 AND anio <= 2100),
    cliente_id INTEGER REFERENCES clientes(id),
    kilometraje INTEGER CHECK (kilometraje >= 0),
    estado VARCHAR(20) CHECK (estado IN ('disponible', 'en_taller', 'fuera_servicio')),
    activo BOOLEAN DEFAULT TRUE
);

-- 4. Tabla de Técnicos
CREATE TABLE tecnicos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(40) UNIQUE NOT NULL,
    nombre VARCHAR(140) NOT NULL,
    especialidad VARCHAR(100) NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 5. Tabla de Repuestos
CREATE TABLE repuestos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(40) UNIQUE NOT NULL,
    nombre VARCHAR(140) NOT NULL,
    descripcion TEXT NULL,
    precio_unitario NUMERIC(12,2) CHECK (precio_unitario >= 0),
    stock INTEGER CHECK (stock >= 0),
    stock_minimo INTEGER DEFAULT 0 CHECK (stock_minimo >= 0),
    activo BOOLEAN DEFAULT TRUE
);

-- 6. Tabla de Órdenes de Mantenimiento
CREATE TABLE ordenes (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(40) UNIQUE NOT NULL,
    vehiculo_id INTEGER REFERENCES vehiculos(id),
    tecnico_id INTEGER REFERENCES tecnicos(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    descripcion TEXT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('preventivo', 'correctivo')),
    estado VARCHAR(20) CHECK (estado IN ('abierta', 'en_proceso', 'finalizada', 'anulada')),
    mano_obra NUMERIC(12,2) DEFAULT 0 CHECK (mano_obra >= 0),
    total_repuestos NUMERIC(12,2) CHECK (total_repuestos >= 0),
    total NUMERIC(12,2) CHECK (total >= 0),
    creada_en TIMESTAMPTZ DEFAULT NOW(),
    finalizada_en TIMESTAMPTZ NULL
);

-- 7. Tabla Detalle de Orden (Items de Repuestos)
CREATE TABLE detalle_orden (
    id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT REFERENCES ordenes(id),
    repuesto_id INTEGER REFERENCES repuestos(id),
    cantidad INTEGER CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12,2) CHECK (subtotal >= 0)
);

-- 8. Tabla de Movimientos de Inventario
CREATE TABLE inventario (
    id BIGSERIAL PRIMARY KEY,
    repuesto_id INTEGER REFERENCES repuestos(id),
    orden_id BIGINT REFERENCES ordenes(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo VARCHAR(20) CHECK (tipo IN ('entrada', 'consumo', 'ajuste', 'reversión')),
    cantidad INTEGER CHECK (cantidad > 0),
    stock_antes INTEGER CHECK (stock_antes >= 0),
    stock_despues INTEGER CHECK (stock_despues >= 0),
    motivo TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabla de Auditoría
CREATE TABLE auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(20) NOT NULL,
    metodo VARCHAR(10) NOT NULL,
    ruta TEXT NOT NULL,
    recurso VARCHAR(80) NOT NULL,
    recurso_id VARCHAR(80) NULL,
    datos_anteriores JSONB NULL,
    datos_nuevos JSONB NULL,
    codigo_http INTEGER NOT NULL,
    ip INET NULL,
    user_agent TEXT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW()
);