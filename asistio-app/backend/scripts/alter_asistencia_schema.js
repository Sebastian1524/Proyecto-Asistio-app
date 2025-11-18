const { query } = require('../config/database');

(async () => {
  try {
    // Añadir columnas que espera el código
    await query("ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS presente BOOLEAN DEFAULT true");
    await query("ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS justificacion TEXT");
    await query("ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS hora_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    await query("ALTER TABLE asistencia ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

    // Añadir índice único para evitar duplicados
    await query("CREATE UNIQUE INDEX IF NOT EXISTS idx_asistencia_evento_usuario ON asistencia(id_evento, id_usuario)");

    console.log('Esquema de asistencia actualizado.');
  } catch (err) {
    console.error('Error alterando asistencia:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
