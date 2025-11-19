const { pool } = require('../config/database');

async function listarUsuarios() {
  const client = await pool.connect();
  
  try {
    console.log('👥 Usuarios en la base de datos:\n');

    const usuarios = await client.query(
      `SELECT u.id_usuario, u.email, u.nombre, u.primer_apellido, ui.rol
       FROM usuario u
       LEFT JOIN usuario_institucion ui ON u.id_usuario = ui.id_usuario
       ORDER BY u.email`
    );

    usuarios.rows.forEach(u => {
      console.log(`- ${u.email} | ${u.nombre} ${u.primer_apellido} | Rol: ${u.rol || 'sin rol'} | ID: ${u.id_usuario}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

listarUsuarios();
