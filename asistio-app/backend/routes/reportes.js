const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Generar reporte CSV de toda la clase (todos los eventos y estudiantes)
router.get('/clase/:id/csv', reportesController.generarReporteClase);

// Generar reporte CSV de un evento específico (lista de asistencia)
router.get('/evento/:id/csv', reportesController.generarReporteEvento);

// Generar reporte CSV de estadísticas por estudiante
router.get('/clase/:id/estudiantes/csv', reportesController.generarReporteEstudiante);

module.exports = router;
