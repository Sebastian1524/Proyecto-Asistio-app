const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function crearUsuarioPrueba() {
  try {
    const email = 'test@sena.edu.co';
    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 10);

    // Verificar si ya existe
    const existe = await query('SELECT id_usuario FROM usuario WHERE email = $1', [email]);
    
    if (existe.rows.length > 0) {
      console.log('✓ El usuario ya existe:', email);
      console.log('  Email:', email);
      console.log('  Contraseña:', password);
      return;
    }

    // Crear usuario
    const resultado = await query(
      `INSERT INTO usuario (nombre, primer_apellido, segundo_apellido, dni, email, fecha_de_nacimiento, password_hash, primer_acceso)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      ['Usuario', 'Prueba', 'Test', '1111111111', email, '2000-01-01', passwordHash, false]
    );

    console.log('✓ Usuario de prueba creado exitosamente!');
    console.log('  Email:', email);
    console.log('  Contraseña:', password);
    console.log('  ID:', resultado.rows[0].id_usuario);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

crearUsuarioPrueba();
