const { query } = require('../config/database');

(async () => {
  try {
    await query("ALTER TABLE evento_clase ALTER COLUMN codigo_qr TYPE TEXT");
    console.log('Columna codigo_qr alterada a TEXT.');
  } catch (err) {
    console.error('Error alterando columna:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
