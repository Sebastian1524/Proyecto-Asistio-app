const { query } = require('../config/database');

(async () => {
  try {
    const r = await query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conname = 'asistencia_estado_check'");
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
