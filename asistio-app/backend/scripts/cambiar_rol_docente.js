const { query } = require('../config/database');

async function cambiarRolUsuario() {
  try {
    // Cambiar el usuario test@sena.edu.co a docente
    const resultado = await query(
      `UPDATE usuario_institucion 
       SET rol = 'docente' 
       WHERE id_usuario = (SELECT id_usuario FROM usuario WHERE email = 'test@sena.edu.co')`,
      []
    );

    console.log('✓ Usuario actualizado a rol docente');
    console.log('  Email: test@sena.edu.co');
    console.log('  Nuevo rol: docente');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

cambiarRolUsuario();
