const { query } = require('../config/database');

(async () => {
  try {
    // Eliminar constraint/índice único sobre codigo_qr si existe
    await query("ALTER TABLE evento_clase DROP CONSTRAINT IF EXISTS evento_clase_codigo_qr_key");
    // También eliminar índice si fue creado como idx_evento_codigo_qr
    await query("DROP INDEX IF EXISTS idx_evento_codigo_qr");
    console.log('Constraint/índice único sobre codigo_qr eliminado (si existía).');
  } catch (err) {
    console.error('Error eliminando índice/constraint:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
