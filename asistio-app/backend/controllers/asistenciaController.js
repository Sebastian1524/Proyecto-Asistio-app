const { query, transaction } = require('../config/database');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// ============================================
// FUNCIONES AUXILIARES - UTILIDADES
// ============================================
const normalizarHora = (hora) => {
  if (!hora) return null;
  // Si es formato HH:MM (24 horas), retornar tal cual
  if (/^\d{2}:\d{2}$/.test(hora)) return hora;
  // Si es formato con a.m./p.m., convertir a 24 horas
  if (hora.includes('a.m.') || hora.includes('p.m.')) {
    const partes = hora.split(' ');
    const [horas, minutos] = partes[0].split(':').map(Number);
    const periodo = partes[1];
    
    let horasConvertidas = horas;
    if (periodo === 'p.m.' && horas !== 12) {
      horasConvertidas = horas + 12;
    } else if (periodo === 'a.m.' && horas === 12) {
      horasConvertidas = 0;
    }
    
    return `${String(horasConvertidas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }
  return hora;
};

// ============================================
// Crear nuevo evento y generar QR
// ============================================
const crearEventoConQR = async (req, res) => {
  try {
    let { id_clase, nombre_evento, descripcion, fecha_evento, hora_inicio, hora_fin } = req.body;
    let { id_usuario, id_institucion } = req.usuario;

    // Si no tiene id_institucion, obtener la primera
    if (!id_institucion) {
      const instResult = await query(
        'SELECT id_institucion FROM usuario_institucion WHERE id_usuario = $1 LIMIT 1',
        [id_usuario]
      );
      if (instResult.rows.length > 0) {
        id_institucion = instResult.rows[0].id_institucion;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Usuario no asociado a ninguna institución'
        });
      }
    }

    // Normalizar horas a formato 24 horas
    hora_inicio = normalizarHora(hora_inicio);
    hora_fin = normalizarHora(hora_fin);

    if (!id_clase || !nombre_evento || !fecha_evento || !hora_inicio) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (id_clase, nombre_evento, fecha_evento, hora_inicio)'
      });
    }

    const claseExiste = await query(
      'SELECT id_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id_clase, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Clase con ID ${id_clase} no encontrada en la institución ${id_institucion}`
      });
    }

    const tokenUnico = uuidv4();

    const resultadoEvento = await query(
      `INSERT INTO evento_clase (id_clase, nombre_evento, descripcion, fecha_evento, 
                                 hora_inicio, hora_fin, token_unico, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'activo')
       RETURNING *`,
      [id_clase, nombre_evento, descripcion, fecha_evento, hora_inicio, hora_fin || null, tokenUnico]
    );

    const evento = resultadoEvento.rows[0];

    const datosQR = {
      id_evento: evento.id_evento,
      id_clase: evento.id_clase,
      nombre_evento: evento.nombre_evento,
      fecha_evento: evento.fecha_evento,
      hora_inicio: evento.hora_inicio,
      token: evento.token_unico
    };

    const codigoQR = await QRCode.toDataURL(JSON.stringify(datosQR));

    await query(
      'UPDATE evento_clase SET codigo_qr = $1 WHERE id_evento = $2',
      [codigoQR, evento.id_evento]
    );

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente con QR generado',
      data: {
        ...evento,
        codigo_qr: codigoQR,
        datosQR: datosQR
      }
    });

  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

// ============================================
// Obtener código QR de un evento
// ============================================
const obtenerQR = async (req, res) => {
  try {
    const { id_evento } = req.params;
    const { id_institucion } = req.usuario;

    const resultadoEvento = await query(
      `SELECT e.*, c.id_institucion
       FROM evento_clase e
       INNER JOIN clase c ON e.id_clase = c.id_clase
       WHERE e.id_evento = $1 AND c.id_institucion = $2`,
      [id_evento, id_institucion]
    );

    if (resultadoEvento.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    const evento = resultadoEvento.rows[0];

    if (!evento.codigo_qr) {
      return res.status(404).json({ success: false, message: 'El evento no tiene QR generado' });
    }

    res.json({
      success: true,
      data: {
        id_evento: evento.id_evento,
        nombre_evento: evento.nombre_evento,
        codigo_qr: evento.codigo_qr,
        token_unico: evento.token_unico
      }
    });

  } catch (error) {
    console.error('Error al obtener QR:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ============================================
// Registrar asistencia por QR
// ============================================
const registrarAsistenciaQR = async (req, res) => {
  try {
    const { id_evento, token_unico } = req.body;
    const { id_usuario } = req.usuario;

    if (!id_evento || !token_unico) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (id_evento, token_unico)' });
    }

    const resultadoEvento = await query(
      `SELECT e.*, c.id_clase
       FROM evento_clase e
       INNER JOIN clase c ON e.id_clase = c.id_clase
       WHERE e.id_evento = $1 AND e.token_unico = $2`,
      [id_evento, token_unico]
    );

    if (resultadoEvento.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evento o token inválido' });
    }

    const evento = resultadoEvento.rows[0];

    if (evento.estado !== 'activo') {
      return res.status(400).json({ success: false, message: 'El evento no está activo para recibir asistencias' });
    }

    const estudianteEnClase = await query(
      'SELECT id_clase_estudiante FROM clase_estudiante WHERE id_clase = $1 AND id_usuario = $2',
      [evento.id_clase, id_usuario]
    );

    if (estudianteEnClase.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'No estás inscrito en esta clase' });
    }

    const asistenciaExistente = await query(
      'SELECT id_asistencia FROM asistencia WHERE id_evento = $1 AND id_usuario = $2',
      [id_evento, id_usuario]
    );

    if (asistenciaExistente.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya has registrado tu asistencia en este evento' });
    }

    const estadoValor = 'presente';
    const resultadoAsistencia = await query(
      `INSERT INTO asistencia (id_evento, id_usuario, presente, hora_entrada, estado)
       VALUES ($1, $2, true, CURRENT_TIMESTAMP, $3)
       RETURNING id_asistencia, id_evento, id_usuario, hora_entrada, presente, estado`,
      [id_evento, id_usuario, estadoValor]
    );

    const asistencia = resultadoAsistencia.rows[0];

    await actualizarReporteAsistencia(evento.id_clase, id_usuario);

    res.status(201).json({
      success: true,
      message: 'Asistencia registrada exitosamente',
      data: {
        ...asistencia,
        evento: {
          nombre: evento.nombre_evento,
          fecha: evento.fecha_evento,
          hora_inicio: evento.hora_inicio
        }
      }
    });

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

// ============================================
// Registrar asistencia manual
// ============================================
const registrarAsistenciaManual = async (req, res) => {
  try {
    const { id_evento, id_usuario, presente, justificacion } = req.body;
    const { id_institucion, rol } = req.usuario;

    if (!['docente', 'administrador'].includes(rol)) {
      return res.status(403).json({ success: false, message: 'Solo docentes y administradores pueden registrar asistencias manualmente' });
    }

    if (!id_evento || !id_usuario) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (id_evento, id_usuario)' });
    }

    const resultadoEvento = await query(
      `SELECT e.*, c.id_institucion
       FROM evento_clase e
       INNER JOIN clase c ON e.id_clase = c.id_clase
       WHERE e.id_evento = $1 AND c.id_institucion = $2`,
      [id_evento, id_institucion]
    );

    if (resultadoEvento.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    const evento = resultadoEvento.rows[0];

    const asistenciaExistente = await query(
      'SELECT id_asistencia FROM asistencia WHERE id_evento = $1 AND id_usuario = $2',
      [id_evento, id_usuario]
    );

    if (asistenciaExistente.rows.length > 0) {
      const estadoUpdate = (presente !== undefined ? (presente ? 'presente' : (justificacion ? 'justificado' : 'ausente')) : 'presente');
      const resultado = await query(
        `UPDATE asistencia
         SET presente = $1, justificacion = $2, fecha_registro = CURRENT_TIMESTAMP, estado = $5
         WHERE id_evento = $3 AND id_usuario = $4
         RETURNING *`,
        [presente !== undefined ? presente : true, justificacion || null, id_evento, id_usuario, estadoUpdate]
      );

      await actualizarReporteAsistencia(evento.id_clase, id_usuario);

      return res.json({ success: true, message: 'Asistencia actualizada exitosamente', data: resultado.rows[0] });
    }

    const estadoInsert = (presente !== undefined ? (presente ? 'presente' : (justificacion ? 'justificado' : 'ausente')) : 'presente');
    const resultadoAsistencia = await query(
      `INSERT INTO asistencia (id_evento, id_usuario, presente, justificacion, hora_entrada, estado)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
       RETURNING *`,
      [id_evento, id_usuario, presente !== undefined ? presente : true, justificacion || null, estadoInsert]
    );

    await actualizarReporteAsistencia(evento.id_clase, id_usuario);

    res.status(201).json({ success: true, message: 'Asistencia registrada exitosamente', data: resultadoAsistencia.rows[0] });

  } catch (error) {
    console.error('Error al registrar asistencia manual:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

// ============================================
// Obtener asistencias de un evento
// ============================================
const obtenerAsistenciasEvento = async (req, res) => {
  try {
    const { id_evento } = req.params;
    const { id_institucion } = req.usuario;

    const resultadoEvento = await query(
      `SELECT e.*, c.id_institucion
       FROM evento_clase e
       INNER JOIN clase c ON e.id_clase = c.id_clase
       WHERE e.id_evento = $1 AND c.id_institucion = $2`,
      [id_evento, id_institucion]
    );

    if (resultadoEvento.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    const resultado = await query(
      `SELECT a.*, u.nombre, u.primer_apellido, u.segundo_apellido, u.email
       FROM asistencia a
       INNER JOIN usuario u ON a.id_usuario = u.id_usuario
       WHERE a.id_evento = $1
       ORDER BY a.hora_entrada DESC`,
      [id_evento]
    );

    res.json({ success: true, data: resultado.rows });

  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ============================================
// Obtener reporte de estudiante
// ============================================
const obtenerReporteEstudiante = async (req, res) => {
  try {
    const { id_clase } = req.params;
    const { id_usuario } = req.usuario;
    const { id_institucion } = req.usuario;

    const claseExiste = await query(
      'SELECT id_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id_clase, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clase no encontrada' });
    }

    const resultado = await query(
      `SELECT r.* FROM reporte_asistencia r
       WHERE r.id_clase = $1 AND r.id_usuario = $2`,
      [id_clase, id_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          id_clase,
          id_usuario,
          total_eventos: 0,
          asistencias: 0,
          faltas: 0,
          porcentaje_asistencia: 0
        }
      });
    }

    res.json({ success: true, data: resultado.rows[0] });

  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ============================================
// Obtener reporte completo de una clase
// ============================================
const obtenerReporteClase = async (req, res) => {
  try {
    const { id_clase } = req.params;
    const { id_institucion } = req.usuario;

    const claseExiste = await query(
      'SELECT id_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id_clase, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Clase no encontrada' });
    }

    const resultado = await query(
      `SELECT r.*, u.nombre, u.primer_apellido, u.segundo_apellido, u.email
       FROM reporte_asistencia r
       INNER JOIN usuario u ON r.id_usuario = u.id_usuario
       WHERE r.id_clase = $1
       ORDER BY u.primer_apellido, u.segundo_apellido, u.nombre`,
      [id_clase]
    );

    res.json({ success: true, data: resultado.rows });

  } catch (error) {
    console.error('Error al obtener reporte de clase:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================
const actualizarReporteAsistencia = async (id_clase, id_usuario) => {
  try {
    const resultado = await query(
      `SELECT 
        COUNT(DISTINCT e.id_evento) as total_eventos,
        SUM(CASE WHEN a.presente = true THEN 1 ELSE 0 END) as asistencias,
        SUM(CASE WHEN a.presente = false THEN 1 ELSE 0 END) as faltas
       FROM evento_clase e
       LEFT JOIN asistencia a ON e.id_evento = a.id_evento AND a.id_usuario = $2
       WHERE e.id_clase = $1`,
      [id_clase, id_usuario]
    );

    const stats = resultado.rows[0];
    const totalEventos = parseInt(stats.total_eventos) || 0;
    const asistencias = parseInt(stats.asistencias) || 0;
    const faltas = parseInt(stats.faltas) || 0;
    const porcentaje = totalEventos > 0 ? ((asistencias / totalEventos) * 100).toFixed(2) : 0;

    await query(
      `INSERT INTO reporte_asistencia (id_clase, id_usuario, total_eventos, asistencias, faltas, porcentaje_asistencia)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id_clase, id_usuario) DO UPDATE SET
         total_eventos = $3,
         asistencias = $4,
         faltas = $5,
         porcentaje_asistencia = $6,
         fecha_actualizacion = CURRENT_TIMESTAMP`,
      [id_clase, id_usuario, totalEventos, asistencias, faltas, porcentaje]
    );

  } catch (error) {
    console.error('Error al actualizar reporte:', error);
  }
};

module.exports = {
  crearEventoConQR,
  obtenerQR,
  registrarAsistenciaQR,
  registrarAsistenciaManual,
  obtenerAsistenciasEvento,
  obtenerReporteEstudiante,
  obtenerReporteClase
};
