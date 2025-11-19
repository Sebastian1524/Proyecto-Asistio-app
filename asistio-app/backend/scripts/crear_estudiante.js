const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function crearEstudiante() {
  try {
    const email = 'estudiante@sena.edu.co';
    const password = '123456';
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Intentar crear el usuario
    // Primero crear el usuario base
    const userResult = await db.query(
      `INSERT INTO usuario (
        nombre, primer_apellido, segundo_apellido, 
        email, password_hash, dni, fecha_de_nacimiento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash
      RETURNING id_usuario, email`,
      [
        'Estudiante',
        'Prueba',
        'Test',
        email,
        hashedPassword,
        '9999999',
        '2000-01-01'
      ]
    );
    
    const userId = userResult.rows[0].id_usuario;
    
    // Luego asociar con la institución con rol estudiante
    await db.query(
      `INSERT INTO usuario_institucion (id_usuario, id_institucion, rol)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_usuario, id_institucion) DO UPDATE
       SET rol = EXCLUDED.rol`,
      [userId, 1, 'estudiante']
    );
    
    const result = { rows: [{ ...userResult.rows[0], rol: 'estudiante' }] };
    
    console.log('✓ Usuario estudiante creado/actualizado:');
    console.log('  Email:', email);
    console.log('  Contraseña:', password);
    console.log('  ID:', result.rows[0].id_usuario);
    console.log('  Rol:', result.rows[0].rol);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

crearEstudiante();
