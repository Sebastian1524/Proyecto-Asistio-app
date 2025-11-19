const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener todos los estudiantes de la institución
router.get('/estudiantes', async (req, res) => {
  try {
    const { id_institucion } = req.usuario;

    const resultado = await query(
      `SELECT u.id_usuario, u.nombre, u.primer_apellido, u.segundo_apellido, u.email, u.dni
       FROM usuario u
       INNER JOIN usuario_institucion ui ON u.id_usuario = ui.id_usuario
       WHERE ui.id_institucion = $1 
         AND ui.rol = 'estudiante' 
         AND ui.activo_en_la_institucion = true
       ORDER BY u.primer_apellido, u.segundo_apellido, u.nombre`,
      [id_institucion]
    );

    res.json({
      success: true,
      data: resultado.rows
    });

  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

module.exports = router;
