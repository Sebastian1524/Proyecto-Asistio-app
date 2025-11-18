const { query } = require('../config/database');

(async () => {
  try {
    await query("ALTER TABLE asistencia ALTER COLUMN estado SET DEFAULT 'activo'");
    await query("UPDATE asistencia SET estado='activo' WHERE estado IS NULL");
    await query("ALTER TABLE asistencia ALTER COLUMN estado DROP NOT NULL");
    console.log('Columna estado ajustada en asistencia');
  } catch (err) {
    console.error('Error ajustando estado:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
