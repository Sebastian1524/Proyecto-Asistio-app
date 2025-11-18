const { query } = require('../config/database');

(async () => {
  try {
    const r = await query(`INSERT INTO asistencia (id_evento, id_usuario, presente, hora_entrada) VALUES (5, 7, true, NOW()) RETURNING *`);
    console.log('Inserted asistencia:', r.rows[0]);
  } catch (err) {
    console.error('Error inserting asistencia:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
