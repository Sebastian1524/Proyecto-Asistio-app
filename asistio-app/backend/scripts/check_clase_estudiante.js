const { query } = require('../config/database');

(async () => {
  try {
    const r = await query("SELECT to_regclass('public.clase_estudiante') as t");
    console.log('Resultado:', r.rows);
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
