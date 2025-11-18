const { query } = require('../config/database');

(async () => {
  try {
    const r = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='asistencia' ORDER BY ordinal_position");
    console.log('Columns:', JSON.stringify(r.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
