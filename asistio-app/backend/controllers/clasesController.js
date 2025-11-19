const { query } = require('../config/database');

// Crear nueva clase
exports.crearClase = async (req, res) => {
  try {
    const { nombre_clase, max_estudiantes } = req.body;
    const { id_institucion } = req.usuario;

    // Validar campos obligatorios
    if (!nombre_clase) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la clase es obligatorio'
      });
    }

    // Insertar clase
    const resultado = await query(
      `INSERT INTO clase (id_institucion, nombre_clase, max_estudiantes, estado, fecha_de_creacion)
       VALUES ($1, $2, $3, 'activo', NOW())
       RETURNING *`,
      [id_institucion, nombre_clase, max_estudiantes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Clase creada exitosamente',
      data: resultado.rows[0]
    });

  } catch (error) {
    console.error('Error al crear clase:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Listar todas las clases de una institución
exports.listarClases = async (req, res) => {
  try {
    const { id_institucion } = req.usuario;
    const { estado } = req.query; // Filtro opcional por estado

    let queryStr = `
      SELECT c.*, 
             COUNT(DISTINCT ce.id_usuario) as total_estudiantes,
             COUNT(DISTINCT e.id_evento) as total_eventos
      FROM clase c
      LEFT JOIN clase_estudiante ce ON c.id_clase = ce.id_clase
      LEFT JOIN evento_clase e ON c.id_clase = e.id_clase
      WHERE c.id_institucion = $1
    `;

    const params = [id_institucion];

    if (estado) {
      queryStr += ` AND c.estado = $2`;
      params.push(estado);
    }

    queryStr += ` GROUP BY c.id_clase ORDER BY c.fecha_de_creacion DESC`;

    const resultado = await query(queryStr, params);

    res.json({
      success: true,
      data: resultado.rows
    });

  } catch (error) {
    console.error('Error al listar clases:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Obtener una clase específica
exports.obtenerClase = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_institucion } = req.usuario;

    const resultado = await query(
      `SELECT c.*, 
              COUNT(DISTINCT ui.id_usuario) as total_estudiantes
       FROM clase c
       LEFT JOIN usuario_institucion ui ON c.id_clase = ui.id_usuario 
         AND ui.rol = 'estudiante' 
         AND ui.activo_en_la_institucion = true
       WHERE c.id_clase = $1 AND c.id_institucion = $2
       GROUP BY c.id_clase`,
      [id, id_institucion]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    res.json({
      success: true,
      data: resultado.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener clase:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Actualizar clase
exports.actualizarClase = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_clase, max_estudiantes, estado } = req.body;
    const { id_institucion } = req.usuario;

    // Verificar que la clase existe y pertenece a la institución
    const claseExiste = await query(
      'SELECT id_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    // Construir query dinámicamente
    const updates = [];
    const valores = [];
    let contador = 1;

    if (nombre_clase !== undefined) {
      updates.push(`nombre_clase = $${contador}`);
      valores.push(nombre_clase);
      contador++;
    }

    if (max_estudiantes !== undefined) {
      updates.push(`max_estudiantes = $${contador}`);
      valores.push(max_estudiantes);
      contador++;
    }

    if (estado !== undefined) {
      updates.push(`estado = $${contador}`);
      valores.push(estado);
      contador++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    valores.push(id);

    const resultado = await query(
      `UPDATE clase 
       SET ${updates.join(', ')}
       WHERE id_clase = $${contador}
       RETURNING *`,
      valores
    );

    res.json({
      success: true,
      message: 'Clase actualizada exitosamente',
      data: resultado.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar clase:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Eliminar clase
exports.eliminarClase = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_institucion } = req.usuario;

    // Verificar que la clase existe
    const claseExiste = await query(
      'SELECT id_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    // Eliminar clase (esto eliminará en cascada eventos y asistencias)
    await query('DELETE FROM clase WHERE id_clase = $1', [id]);

    res.json({
      success: true,
      message: 'Clase eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar clase:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Obtener estudiantes de una clase
exports.obtenerEstudiantes = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_institucion } = req.usuario;

    // Verificar que la clase existe
    const claseExiste = await query(
      'SELECT id_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    // Obtener estudiantes inscritos en esta clase
    const resultado = await query(
      `SELECT u.id_usuario, u.nombre, u.primer_apellido, u.segundo_apellido, 
              u.email, u.dni, ce.fecha_inscripcion
       FROM usuario u
       INNER JOIN clase_estudiante ce ON u.id_usuario = ce.id_usuario
       WHERE ce.id_clase = $1
       ORDER BY u.primer_apellido, u.segundo_apellido, u.nombre`,
      [id]
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
};

// Inscribir estudiante en una clase
exports.inscribirEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario } = req.body;
    const { id_institucion } = req.usuario;

    if (!id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'El ID del usuario es obligatorio'
      });
    }

    // Verificar que la clase existe
    const claseExiste = await query(
      'SELECT id_clase, max_estudiantes FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    const clase = claseExiste.rows[0];

    // Verificar si hay cupo
    if (clase.max_estudiantes) {
      const totalInscritos = await query(
        'SELECT COUNT(*) FROM clase_estudiante WHERE id_clase = $1',
        [id]
      );
      
      if (parseInt(totalInscritos.rows[0].count) >= clase.max_estudiantes) {
        return res.status(400).json({
          success: false,
          message: 'La clase ha alcanzado el máximo de estudiantes'
        });
      }
    }

    // Verificar si ya está inscrito
    const yaInscrito = await query(
      'SELECT * FROM clase_estudiante WHERE id_clase = $1 AND id_usuario = $2',
      [id, id_usuario]
    );

    if (yaInscrito.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El estudiante ya está inscrito en esta clase'
      });
    }

    // Inscribir estudiante
    await query(
      'INSERT INTO clase_estudiante (id_clase, id_usuario, fecha_inscripcion) VALUES ($1, $2, CURRENT_DATE)',
      [id, id_usuario]
    );

    res.json({
      success: true,
      message: 'Estudiante inscrito exitosamente'
    });

  } catch (error) {
    console.error('Error al inscribir estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Desinscribir estudiante de una clase
exports.desinscribirEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario } = req.body;
    const { id_institucion } = req.usuario;

    if (!id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'El ID del usuario es obligatorio'
      });
    }

    // Verificar que la clase existe
    const claseExiste = await query(
      'SELECT id_clase FROM clase WHERE id_clase = $1 AND id_institucion = $2',
      [id, id_institucion]
    );

    if (claseExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    // Desinscribir estudiante
    const resultado = await query(
      'DELETE FROM clase_estudiante WHERE id_clase = $1 AND id_usuario = $2',
      [id, id_usuario]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'El estudiante no está inscrito en esta clase'
      });
    }

    res.json({
      success: true,
      message: 'Estudiante desinscrito exitosamente'
    });

  } catch (error) {
    console.error('Error al desinscribir estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Obtener todos los estudiantes disponibles para inscribir
exports.obtenerEstudiantesDisponibles = async (req, res) => {
  try {
    const { id_institucion } = req.usuario;

    // Obtener todos los estudiantes de la institución
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
    console.error('Error al obtener estudiantes disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};