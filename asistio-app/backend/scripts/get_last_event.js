const { query } = require('../config/database');

(async () => {
  try {
    const r = await query("SELECT id_evento, token_unico FROM evento_clase ORDER BY id_evento DESC LIMIT 1");
    console.log(JSON.stringify(r.rows[0] || {}));
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
