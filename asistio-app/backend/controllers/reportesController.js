const { query } = require('../config/database');
const { Parser } = require('json2csv');

// Generar reporte CSV de asistencias por clase
exports.generarReporteClase = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_institucion } = req.usuario;

    // Verificar que la clase existe y pertenece a la institución
    const claseExiste = await query(
      'SELECT nombre_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    const nombreClase = claseExiste.rows[0].nombre_clase;

    // Obtener todos los eventos y asistencias de la clase
    const resultado = await query(
      `SELECT 
        e.nombre_evento,
        e.fecha_evento,
        e.hora_inicio,
        e.hora_fin,
        u.nombre || ' ' || u.primer_apellido || ' ' || COALESCE(u.segundo_apellido, '') as estudiante,
        u.dni,
        u.email,
        CASE 
          WHEN a.id_asistencia IS NOT NULL THEN 'Presente'
          ELSE 'Ausente'
        END as estado,
        a.fecha_registro as fecha_registro_asistencia
       FROM evento_clase e
       CROSS JOIN clase_estudiante ce
       INNER JOIN usuario u ON ce.id_usuario = u.id_usuario
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento AND u.id_usuario = a.id_usuario
       WHERE e.id_clase = $1 AND ce.id_clase = $1
       ORDER BY e.fecha_evento DESC, u.primer_apellido, u.nombre`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay datos de asistencia para esta clase'
      });
    }

    // Configurar campos del CSV
    const fields = [
      { label: 'Evento', value: 'nombre_evento' },
      { label: 'Fecha', value: 'fecha_evento' },
      { label: 'Hora Inicio', value: 'hora_inicio' },
      { label: 'Hora Fin', value: 'hora_fin' },
      { label: 'Estudiante', value: 'estudiante' },
      { label: 'DNI', value: 'dni' },
      { label: 'Email', value: 'email' },
      { label: 'Estado', value: 'estado' },
      { label: 'Fecha Registro', value: 'fecha_registro_asistencia' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(resultado.rows);

    // Enviar CSV como descarga
    const filename = `Reporte_${nombreClase.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM para que Excel reconozca UTF-8

  } catch (error) {
    console.error('Error al generar reporte de clase:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte'
    });
  }
};

// Generar reporte CSV de asistencias por evento
exports.generarReporteEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_institucion } = req.usuario;

    // Verificar que el evento existe y pertenece a la institución
    const eventoExiste = await query(
      `SELECT e.nombre_evento, e.fecha_evento, c.nombre_clase 
       FROM evento_clase e
       INNER JOIN clase c ON e.id_clase = c.id_clase
       WHERE e.id_evento = $1 AND c.id_institucion = $2`,
      [id, id_institucion]
    );

    if (eventoExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    const { nombre_evento, fecha_evento, nombre_clase } = eventoExiste.rows[0];

    // Obtener asistencias del evento
    const resultado = await query(
      `SELECT 
        u.nombre || ' ' || u.primer_apellido || ' ' || COALESCE(u.segundo_apellido, '') as estudiante,
        u.dni,
        u.email,
        CASE 
          WHEN a.id_asistencia IS NOT NULL THEN 'Presente'
          ELSE 'Ausente'
        END as estado,
        a.fecha_registro as fecha_registro_asistencia
       FROM clase_estudiante ce
       INNER JOIN usuario u ON ce.id_usuario = u.id_usuario
       LEFT JOIN asistencia a ON a.id_evento = $1 AND a.id_usuario = u.id_usuario
       WHERE ce.id_clase = (SELECT id_clase FROM evento_clase WHERE id_evento = $1)
       ORDER BY u.primer_apellido, u.nombre`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay estudiantes inscritos en esta clase'
      });
    }

    // Configurar campos del CSV
    const fields = [
      { label: 'Estudiante', value: 'estudiante' },
      { label: 'DNI', value: 'dni' },
      { label: 'Email', value: 'email' },
      { label: 'Estado', value: 'estado' },
      { label: 'Fecha Registro', value: 'fecha_registro_asistencia' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(resultado.rows);

    // Enviar CSV como descarga
    const filename = `Asistencia_${nombre_evento.replace(/\s+/g, '_')}_${fecha_evento}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);

  } catch (error) {
    console.error('Error al generar reporte de evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte'
    });
  }
};

// Generar reporte CSV de estadísticas por estudiante
exports.generarReporteEstudiante = async (req, res) => {
  try {
    const { id } = req.params; // id_clase
    const { id_institucion } = req.usuario;

    // Verificar que la clase existe
    const claseExiste = await query(
      'SELECT nombre_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    const nombreClase = claseExiste.rows[0].nombre_clase;

    // Obtener estadísticas por estudiante
    const resultado = await query(
      `SELECT 
        u.nombre || ' ' || u.primer_apellido || ' ' || COALESCE(u.segundo_apellido, '') as estudiante,
        u.dni,
        u.email,
        COUNT(DISTINCT e.id_evento) as total_eventos,
        COUNT(DISTINCT a.id_asistencia) as asistencias,
        ROUND(
          (COUNT(DISTINCT a.id_asistencia)::numeric / 
          NULLIF(COUNT(DISTINCT e.id_evento), 0) * 100), 2
        ) as porcentaje_asistencia
       FROM clase_estudiante ce
       INNER JOIN usuario u ON ce.id_usuario = u.id_usuario
       CROSS JOIN evento_clase e
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento AND u.id_usuario = a.id_usuario
       WHERE ce.id_clase = $1 AND e.id_clase = $1
       GROUP BY u.id_usuario, u.nombre, u.primer_apellido, u.segundo_apellido, u.dni, u.email
       ORDER BY porcentaje_asistencia DESC, u.primer_apellido, u.nombre`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay datos de estudiantes para esta clase'
      });
    }

    // Configurar campos del CSV
    const fields = [
      { label: 'Estudiante', value: 'estudiante' },
      { label: 'DNI', value: 'dni' },
      { label: 'Email', value: 'email' },
      { label: 'Total Eventos', value: 'total_eventos' },
      { label: 'Asistencias', value: 'asistencias' },
      { label: 'Porcentaje', value: 'porcentaje_asistencia' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(resultado.rows);

    // Enviar CSV como descarga
    const filename = `Estadisticas_${nombreClase.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);

  } catch (error) {
    console.error('Error al generar reporte de estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte'
    });
  }
};
