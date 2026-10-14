CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS estudiantes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  programa VARCHAR(120) NOT NULL,
  semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 10),
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'graduado')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO estudiantes (codigo, nombre, correo, programa, semestre, estado)
VALUES
  ('EST001', 'Ana López', 'ana.lopez@correo.edu.co', 'Ingeniería de Sistemas', 5, 'activo'),
  ('EST002', 'Carlos Pérez', 'carlos.perez@correo.edu.co', 'Ingeniería Industrial', 7, 'activo'),
  ('EST003', 'Laura Gómez', 'laura.gomez@correo.edu.co', 'Administración de Empresas', 4, 'activo'),
  ('EST004', 'Miguel Torres', 'miguel.torres@correo.edu.co', 'Ingeniería de Sistemas', 9, 'activo'),
  ('EST005', 'Sofía Martínez', 'sofia.martinez@correo.edu.co', 'Contaduría Pública', 8, 'activo')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'usuario'
        CHECK (rol IN ('usuario', 'docente', 'administrador')),
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, correo, password_hash, rol)
SELECT 'Administrador',
       'administrador@correo.com',
       crypt('admin123', gen_salt('bf', 10)),
       'administrador'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo = 'administrador@correo.com'
);

INSERT INTO usuarios (nombre, correo, password_hash, rol)
SELECT 'Docente de Prueba',
       'docente@correo.com',
       crypt('docente123', gen_salt('bf', 10)),
       'docente'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo = 'docente@correo.com'
);

INSERT INTO usuarios (nombre, correo, password_hash, rol)
SELECT 'Usuario de Prueba',
       'usuario@correo.com',
       crypt('123456', gen_salt('bf', 10)),
       'usuario'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo = 'usuario@correo.com'
);