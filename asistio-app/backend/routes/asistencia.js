const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas de asistencia requieren autenticación
router.use(verificarToken);

// Obtener todos los eventos del usuario
router.get('/eventos', asistenciaController.obtenerEventos);

// Eventos: crear evento con QR
router.post('/eventos', asistenciaController.crearEventoConQR);

// Obtener QR de un evento
router.get('/eventos/:id_evento/qr', asistenciaController.obtenerQR);

// Registrar asistencia por QR
router.post('/asistencia-qr', asistenciaController.registrarAsistenciaQR);

// Registrar asistencia manual (solo docentes/administradores)
router.post('/asistencia-manual', verificarRol('docente', 'administrador'), asistenciaController.registrarAsistenciaManual);

// Obtener asistencias de un evento
router.get('/eventos/:id_evento/asistencias', asistenciaController.obtenerAsistenciasEvento);

// Reportes
router.get('/reporte/estudiante/:id_clase', asistenciaController.obtenerReporteEstudiante);
router.get('/reporte/clase/:id_clase', asistenciaController.obtenerReporteClase);

module.exports = router;
