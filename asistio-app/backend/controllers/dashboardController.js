const { query } = require('../config/database');

// Obtener estadísticas del dashboard para una clase
exports.obtenerDashboardClase = async (req, res) => {
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

    // 1. Estadísticas generales
    const estadisticas = await query(
      `SELECT 
        COUNT(DISTINCT ce.id_usuario) as total_estudiantes,
        COUNT(DISTINCT e.id_evento) as total_eventos,
        COUNT(DISTINCT a.id_asistencia) as total_asistencias,
        ROUND(
          (COUNT(DISTINCT a.id_asistencia)::numeric / 
          NULLIF(COUNT(DISTINCT e.id_evento) * COUNT(DISTINCT ce.id_usuario), 0) * 100), 2
        ) as porcentaje_asistencia_general
       FROM clase c
       LEFT JOIN clase_estudiante ce ON c.id_clase = ce.id_clase
       LEFT JOIN evento_clase e ON c.id_clase = e.id_clase
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento
       WHERE c.id_clase = $1`,
      [id]
    );

    // 2. Top 5 estudiantes con mejor asistencia
    const topEstudiantes = await query(
      `SELECT 
        u.nombre || ' ' || u.primer_apellido || ' ' || COALESCE(u.segundo_apellido, '') as estudiante,
        COUNT(DISTINCT e.id_evento) as total_eventos,
        COUNT(DISTINCT a.id_asistencia) as asistencias,
        ROUND(
          (COUNT(DISTINCT a.id_asistencia)::numeric / 
          NULLIF(COUNT(DISTINCT e.id_evento), 0) * 100), 2
        ) as porcentaje
       FROM clase_estudiante ce
       INNER JOIN usuario u ON ce.id_usuario = u.id_usuario
       CROSS JOIN evento_clase e
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento AND u.id_usuario = a.id_usuario
       WHERE ce.id_clase = $1 AND e.id_clase = $1
       GROUP BY u.id_usuario, u.nombre, u.primer_apellido, u.segundo_apellido
       ORDER BY porcentaje DESC
       LIMIT 5`,
      [id]
    );

    // 3. Estudiantes con asistencia baja (menos del 70%)
    const estudiantesRiesgo = await query(
      `SELECT 
        u.nombre || ' ' || u.primer_apellido || ' ' || COALESCE(u.segundo_apellido, '') as estudiante,
        COUNT(DISTINCT e.id_evento) as total_eventos,
        COUNT(DISTINCT a.id_asistencia) as asistencias,
        ROUND(
          (COUNT(DISTINCT a.id_asistencia)::numeric / 
          NULLIF(COUNT(DISTINCT e.id_evento), 0) * 100), 2
        ) as porcentaje
       FROM clase_estudiante ce
       INNER JOIN usuario u ON ce.id_usuario = u.id_usuario
       CROSS JOIN evento_clase e
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento AND u.id_usuario = a.id_usuario
       WHERE ce.id_clase = $1 AND e.id_clase = $1
       GROUP BY u.id_usuario, u.nombre, u.primer_apellido, u.segundo_apellido
       HAVING ROUND(
          (COUNT(DISTINCT a.id_asistencia)::numeric / 
          NULLIF(COUNT(DISTINCT e.id_evento), 0) * 100), 2
        ) < 70
       ORDER BY porcentaje ASC
       LIMIT 5`,
      [id]
    );

    // 4. Próximos eventos (próximos 7 días)
    const proximosEventos = await query(
      `SELECT 
        e.id_evento,
        e.nombre_evento,
        e.fecha_evento,
        e.hora_inicio,
        e.estado,
        COUNT(DISTINCT a.id_asistencia) as asistencias_registradas
       FROM evento_clase e
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento
       WHERE e.id_clase = $1 
         AND e.fecha_evento >= CURRENT_DATE 
         AND e.fecha_evento <= CURRENT_DATE + INTERVAL '7 days'
       GROUP BY e.id_evento, e.nombre_evento, e.fecha_evento, e.hora_inicio, e.estado
       ORDER BY e.fecha_evento ASC, e.hora_inicio ASC
       LIMIT 5`,
      [id]
    );

    // 5. Asistencia por evento (para gráfico)
    const asistenciaPorEvento = await query(
      `SELECT 
        e.nombre_evento,
        e.fecha_evento,
        COUNT(DISTINCT ce.id_usuario) as total_estudiantes,
        COUNT(DISTINCT a.id_asistencia) as total_presentes,
        ROUND(
          (COUNT(DISTINCT a.id_asistencia)::numeric / 
          NULLIF(COUNT(DISTINCT ce.id_usuario), 0) * 100), 2
        ) as porcentaje
       FROM evento_clase e
       CROSS JOIN clase_estudiante ce
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento
       WHERE e.id_clase = $1 AND ce.id_clase = $1
       GROUP BY e.id_evento, e.nombre_evento, e.fecha_evento
       ORDER BY e.fecha_evento DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        nombreClase,
        estadisticas: estadisticas.rows[0],
        topEstudiantes: topEstudiantes.rows,
        estudiantesRiesgo: estudiantesRiesgo.rows,
        proximosEventos: proximosEventos.rows,
        asistenciaPorEvento: asistenciaPorEvento.rows
      }
    });

  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Obtener dashboard para estudiante
exports.obtenerDashboardEstudiante = async (req, res) => {
  try {
    const { id_usuario, id_institucion } = req.usuario;

    // 1. Estadísticas personales
    const misEstadisticas = await query(
      `SELECT 
        COUNT(DISTINCT c.id_clase) as total_clases,
        COUNT(DISTINCT e.id_evento) as total_eventos,
        COUNT(DISTINCT a.id_asistencia) as mis_asistencias,
        ROUND(
          (COUNT(DISTINCT a.id_asistencia)::numeric / 
          NULLIF(COUNT(DISTINCT e.id_evento), 0) * 100), 2
        ) as mi_porcentaje
       FROM clase_estudiante ce
       INNER JOIN clase c ON ce.id_clase = c.id_clase
       LEFT JOIN evento_clase e ON c.id_clase = e.id_clase
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento AND a.id_usuario = $1
       WHERE ce.id_usuario = $1 AND c.id_institucion = $2`,
      [id_usuario, id_institucion]
    );

    // 2. Mis próximos eventos
    const misProximosEventos = await query(
      `SELECT 
        e.id_evento,
        e.nombre_evento,
        e.fecha_evento,
        e.hora_inicio,
        c.nombre_clase,
        e.estado,
        CASE WHEN a.id_asistencia IS NOT NULL THEN true ELSE false END as ya_asisti
       FROM clase_estudiante ce
       INNER JOIN clase c ON ce.id_clase = c.id_clase
       INNER JOIN evento_clase e ON c.id_clase = e.id_clase
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento AND a.id_usuario = $1
       WHERE ce.id_usuario = $1 
         AND e.fecha_evento >= CURRENT_DATE
         AND e.fecha_evento <= CURRENT_DATE + INTERVAL '7 days'
       ORDER BY e.fecha_evento ASC, e.hora_inicio ASC
       LIMIT 5`,
      [id_usuario]
    );

    // 3. Mi asistencia por clase
    const miAsistenciaPorClase = await query(
      `SELECT 
        c.nombre_clase,
        COUNT(DISTINCT e.id_evento) as total_eventos,
        COUNT(DISTINCT a.id_asistencia) as mis_asistencias,
        ROUND(
          (COUNT(DISTINCT a.id_asistencia)::numeric / 
          NULLIF(COUNT(DISTINCT e.id_evento), 0) * 100), 2
        ) as porcentaje
       FROM clase_estudiante ce
       INNER JOIN clase c ON ce.id_clase = c.id_clase
       LEFT JOIN evento_clase e ON c.id_clase = e.id_clase
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento AND a.id_usuario = $1
       WHERE ce.id_usuario = $1 AND c.id_institucion = $2
       GROUP BY c.id_clase, c.nombre_clase
       ORDER BY porcentaje DESC`,
      [id_usuario, id_institucion]
    );

    res.json({
      success: true,
      data: {
        estadisticas: misEstadisticas.rows[0],
        proximosEventos: misProximosEventos.rows,
        asistenciaPorClase: miAsistenciaPorClase.rows
      }
    });

  } catch (error) {
    console.error('Error al obtener dashboard estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};
