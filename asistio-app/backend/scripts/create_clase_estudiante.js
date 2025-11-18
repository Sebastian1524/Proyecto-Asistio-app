const { query } = require('../config/database');

(async () => {
  try {
    await query(`CREATE TABLE IF NOT EXISTS clase_estudiante (
      id_clase_estudiante SERIAL PRIMARY KEY,
      id_clase INTEGER NOT NULL REFERENCES clase(id_clase) ON DELETE CASCADE,
      id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
      fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(id_clase, id_usuario)
    );`);

    console.log('Tabla clase_estudiante creada (si no existía).');

    // Intentar inscribir al usuario E2E en la clase E2E Clase
    await query(`INSERT INTO clase_estudiante (id_clase, id_usuario)
      SELECT c.id_clase, u.id_usuario
      FROM clase c, usuario u
      WHERE c.nombre_clase = 'E2E Clase' AND u.email = 'e2euser@sena.gov.co'
      ON CONFLICT (id_clase, id_usuario) DO NOTHING;`);

    console.log('Inscripción E2E creada (si no existía).');
  } catch (err) {
    console.error('Error creando/incribiendo clase_estudiante:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
