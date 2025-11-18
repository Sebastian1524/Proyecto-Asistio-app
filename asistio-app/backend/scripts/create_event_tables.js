const { query } = require('../config/database');

(async () => {
  try {
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await query(`
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
        estado VARCHAR(50) DEFAULT 'activo',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
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
      )
    `);

    await query(`
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
      )
    `);

    console.log('Tablas de eventos/asistencia creadas (si no existían).');
  } catch (err) {
    console.error('Error creando tablas:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
