const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Dashboard de una clase específica (para docentes/admins)
router.get('/clase/:id', dashboardController.obtenerDashboardClase);

// Dashboard personal (para estudiantes)
router.get('/estudiante', dashboardController.obtenerDashboardEstudiante);

module.exports = router;
