const express = require('express');
const router = express.Router();
const clasesController = require('../controllers/clasesController');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Crear clase
router.post('/', clasesController.crearClase);

// Listar clases
router.get('/', clasesController.listarClases);

// Obtener clase específica
router.get('/:id', clasesController.obtenerClase);

// Actualizar clase
router.put('/:id', clasesController.actualizarClase);

// Eliminar clase
router.delete('/:id', clasesController.eliminarClase);

// Obtener estudiantes
router.get('/:id/estudiantes', clasesController.obtenerEstudiantes);

// Inscribir estudiante en una clase
router.post('/:id/inscribir', clasesController.inscribirEstudiante);

// Desinscribir estudiante de una clase
router.post('/:id/desinscribir', clasesController.desinscribirEstudiante);

module.exports = router;
