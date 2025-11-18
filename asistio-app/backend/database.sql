-- ============================================
-- Script para crear la base de datos ASISTIO
-- ============================================

-- Crear extensión UUID (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabla: institucion
-- ============================================
CREATE TABLE IF NOT EXISTS institucion (
  id_institucion SERIAL PRIMARY KEY,
  nombre_institucion VARCHAR(255) NOT NULL UNIQUE,
  ciudad VARCHAR(100) NOT NULL,
  zona_horaria VARCHAR(50) DEFAULT 'America/Bogota',
  fecha_de_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabla: usuario
-- ============================================
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  primer_apellido VARCHAR(100) NOT NULL,
  segundo_apellido VARCHAR(100),
  dni VARCHAR(20) NOT NULL UNIQUE,
  fecha_de_nacimiento DATE,
  password_hash VARCHAR(255) NOT NULL,
  primer_acceso BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabla: usuario_institucion
-- ============================================
CREATE TABLE IF NOT EXISTS usuario_institucion (
  id_usuario_institucion SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_institucion INTEGER NOT NULL REFERENCES institucion(id_institucion) ON DELETE CASCADE,
  rol VARCHAR(50) NOT NULL DEFAULT 'estudiante', -- 'estudiante', 'docente', 'administrador'
  activo_en_la_institucion BOOLEAN DEFAULT true,
  fecha_de_ingreso_a_la_institucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_usuario, id_institucion)
);

-- ============================================
-- Tabla: clase
-- ============================================
CREATE TABLE IF NOT EXISTS clase (
  id_clase SERIAL PRIMARY KEY,
  id_institucion INTEGER NOT NULL REFERENCES institucion(id_institucion) ON DELETE CASCADE,
  nombre_clase VARCHAR(255) NOT NULL,
  descripcion TEXT,
  max_estudiantes INTEGER,
  estado VARCHAR(50) DEFAULT 'activo', -- 'activo', 'inactivo', 'cancelado'
  fecha_de_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabla: clase_estudiante
-- ============================================
CREATE TABLE IF NOT EXISTS clase_estudiante (
  id_clase_estudiante SERIAL PRIMARY KEY,
  id_clase INTEGER NOT NULL REFERENCES clase(id_clase) ON DELETE CASCADE,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_clase, id_usuario)
);

-- ============================================
-- Tabla: evento_clase
-- ============================================
CREATE TABLE IF NOT EXISTS evento_clase (
  id_evento SERIAL PRIMARY KEY,
  id_clase INTEGER NOT NULL REFERENCES clase(id_clase) ON DELETE CASCADE,
  nombre_evento VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_evento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME,
  codigo_qr VARCHAR(255) UNIQUE,
  token_unico UUID DEFAULT uuid_generate_v4() UNIQUE,
  estado VARCHAR(50) DEFAULT 'activo', -- 'activo', 'finalizado', 'cancelado'
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabla: asistencia
-- ============================================
CREATE TABLE IF NOT EXISTS asistencia (
  id_asistencia SERIAL PRIMARY KEY,
  id_evento INTEGER NOT NULL REFERENCES evento_clase(id_evento) ON DELETE CASCADE,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  hora_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hora_salida TIMESTAMP,
  presente BOOLEAN DEFAULT true,
  justificacion TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_evento, id_usuario)
);

-- ============================================
-- Tabla: reporte_asistencia
-- ============================================
CREATE TABLE IF NOT EXISTS reporte_asistencia (
  id_reporte SERIAL PRIMARY KEY,
  id_clase INTEGER NOT NULL REFERENCES clase(id_clase) ON DELETE CASCADE,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  total_eventos INTEGER DEFAULT 0,
  asistencias INTEGER DEFAULT 0,
  faltas INTEGER DEFAULT 0,
  porcentaje_asistencia DECIMAL(5,2) DEFAULT 0.00,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_clase, id_usuario)
);

-- ============================================
-- ÍNDICES para optimización
-- ============================================
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_dni ON usuario(dni);
CREATE INDEX idx_usuario_institucion ON usuario_institucion(id_usuario, id_institucion);
CREATE INDEX idx_clase_institucion ON clase(id_institucion);
CREATE INDEX idx_evento_clase ON evento_clase(id_clase);
CREATE INDEX idx_evento_token ON evento_clase(token_unico);
CREATE INDEX idx_asistencia_evento ON asistencia(id_evento);
CREATE INDEX idx_asistencia_usuario ON asistencia(id_usuario);
CREATE INDEX idx_asistencia_fecha ON asistencia(fecha_registro);
CREATE INDEX idx_reporte_clase_usuario ON reporte_asistencia(id_clase, id_usuario);

-- ============================================
-- DATOS INICIALES DE PRUEBA
-- ============================================

-- Insertar institución de prueba
INSERT INTO institucion (nombre_institucion, ciudad, zona_horaria) 
VALUES ('SENA Cúcuta', 'Cúcuta', 'America/Bogota')
ON CONFLICT (nombre_institucion) DO NOTHING;

-- Insertar usuario administrador de prueba
INSERT INTO usuario (email, nombre, primer_apellido, segundo_apellido, dni, fecha_de_nacimiento, password_hash, primer_acceso)
VALUES ('admin@sena.gov.co', 'Admin', 'SENA', 'Sistema', '0000000001', '1990-01-01', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KV9xB5yHyDVU1VlNKfCm9.XXFYHE5S', false)
ON CONFLICT (email) DO NOTHING;

-- Vincular administrador a la institución
INSERT INTO usuario_institucion (id_usuario, id_institucion, rol)
SELECT u.id_usuario, i.id_institucion, 'administrador'
FROM usuario u, institucion i
WHERE u.email = 'admin@sena.gov.co' AND i.nombre_institucion = 'SENA Cúcuta'
ON CONFLICT (id_usuario, id_institucion) DO NOTHING;

-- Insertar usuario docente de prueba
INSERT INTO usuario (email, nombre, primer_apellido, segundo_apellido, dni, fecha_de_nacimiento, password_hash, primer_acceso)
VALUES ('docente@sena.gov.co', 'Juan', 'Pérez', 'García', '0000000002', '1985-05-15', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KV9xB5yHyDVU1VlNKfCm9.XXFYHE5S', false)
ON CONFLICT (email) DO NOTHING;

-- Vincular docente a la institución
INSERT INTO usuario_institucion (id_usuario, id_institucion, rol)
SELECT u.id_usuario, i.id_institucion, 'docente'
FROM usuario u, institucion i
WHERE u.email = 'docente@sena.gov.co' AND i.nombre_institucion = 'SENA Cúcuta'
ON CONFLICT (id_usuario, id_institucion) DO NOTHING;

-- Insertar estudiantes de prueba
INSERT INTO usuario (email, nombre, primer_apellido, segundo_apellido, dni, fecha_de_nacimiento, password_hash, primer_acceso)
VALUES 
  ('estudiante1@sena.gov.co', 'Carlos', 'López', 'Martínez', '0000000003', '2004-03-20', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KV9xB5yHyDVU1VlNKfCm9.XXFYHE5S', false),
  ('estudiante2@sena.gov.co', 'María', 'González', 'Rodríguez', '0000000004', '2003-07-10', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KV9xB5yHyDVU1VlNKfCm9.XXFYHE5S', false),
  ('estudiante3@sena.gov.co', 'Pedro', 'Ramírez', 'Santos', '0000000005', '2004-11-25', '$2a$10$N9qo8uLOickgx2ZMRZoMye.KV9xB5yHyDVU1VlNKfCm9.XXFYHE5S', false)
ON CONFLICT (email) DO NOTHING;

-- Vincular estudiantes a la institución
INSERT INTO usuario_institucion (id_usuario, id_institucion, rol)
SELECT u.id_usuario, i.id_institucion, 'estudiante'
FROM usuario u, institucion i
WHERE u.email IN ('estudiante1@sena.gov.co', 'estudiante2@sena.gov.co', 'estudiante3@sena.gov.co')
  AND i.nombre_institucion = 'SENA Cúcuta'
ON CONFLICT (id_usuario, id_institucion) DO NOTHING;

-- Insertar clase de prueba
INSERT INTO clase (id_institucion, nombre_clase, descripcion, max_estudiantes, estado)
SELECT i.id_institucion, 'Programación en Python', 'Clase introductoria de Python', 30, 'activo'
FROM institucion i
WHERE i.nombre_institucion = 'SENA Cúcuta'
ON CONFLICT DO NOTHING;

-- Insertar estudiantes a la clase
INSERT INTO clase_estudiante (id_clase, id_usuario)
SELECT c.id_clase, u.id_usuario
FROM clase c, usuario u, usuario_institucion ui
WHERE c.nombre_clase = 'Programación en Python'
  AND u.email IN ('estudiante1@sena.gov.co', 'estudiante2@sena.gov.co', 'estudiante3@sena.gov.co')
  AND ui.id_usuario = u.id_usuario
  AND ui.rol = 'estudiante'
ON CONFLICT (id_clase, id_usuario) DO NOTHING;

COMMIT;
