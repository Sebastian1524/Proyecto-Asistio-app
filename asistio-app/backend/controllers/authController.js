const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generarToken } = require('../middleware/auth');

// Registro de nuevo usuario
exports.registro = async (req, res) => {
  try {
    const {
      nombre,
      primerApellido,
      segundoApellido,
      dni,
      fechaNacimiento,
      email,
      password
    } = req.body;

    // Validar que todos los campos estén presentes
    if (!nombre || !primerApellido || !segundoApellido || !dni || !fechaNacimiento || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Verificar si el email ya existe
    const emailExiste = await query(
      'SELECT id_usuario FROM usuario WHERE email = $1',
      [email]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este correo electrónico ya está registrado'
      });
    }

    // Verificar si el DNI ya existe
    const dniExiste = await query(
      'SELECT id_usuario FROM usuario WHERE dni = $1',
      [dni]
    );

    if (dniExiste.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este DNI ya está registrado'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar usuario en la base de datos
    const resultado = await query(
      `INSERT INTO usuario 
       (email, nombre, primer_apellido, segundo_apellido, fecha_de_nacimiento, dni, password_hash, primer_acceso) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
       RETURNING id_usuario, email, nombre, primer_apellido, segundo_apellido`,
      [email, nombre, primerApellido, segundoApellido, fechaNacimiento, dni, passwordHash]
    );

    const usuario = resultado.rows[0];

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nombre_completo: `${usuario.nombre} ${usuario.primer_apellido} ${usuario.segundo_apellido}`
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son obligatorios'
      });
    }

    // Buscar usuario
    const resultado = await query(
      `SELECT u.id_usuario, u.email, u.nombre, u.primer_apellido, u.segundo_apellido, 
              u.password_hash, u.primer_acceso, u.dni, u.fecha_de_nacimiento
       FROM usuario u
       WHERE u.email = $1`,
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const usuario = resultado.rows[0];

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Obtener rol e institución del usuario
    let rolResult = await query(
      `SELECT ui.id_institucion, ui.rol, i.nombre_institucion, i.zona_horaria
       FROM usuario_institucion ui
       INNER JOIN institucion i ON ui.id_institucion = i.id_institucion
       WHERE ui.id_usuario = $1 AND ui.activo_en_la_institucion = true
       LIMIT 1`,
      [usuario.id_usuario]
    );

    // Si no tiene institución, asignarlo automáticamente a la primera institución disponible.
    if (rolResult.rows.length === 0) {
      // Buscar una institución existente
      const inst = await query(`SELECT id_institucion FROM institucion LIMIT 1`);
      let idInst = null;
      if (inst.rows.length > 0) {
        idInst = inst.rows[0].id_institucion;
      } else {
        // Si no existe ninguna institución, crear una por defecto
        const nuevoInst = await query(
          `INSERT INTO institucion (nombre_institucion, zona_horaria, fecha_creacion)
           VALUES ($1, $2, NOW()) RETURNING id_institucion`,
          ['Institución Demo', 'America/Bogota']
        );
        idInst = nuevoInst.rows[0].id_institucion;
      }

      // Insertar relación usuario -> institución (si no existe) o activar si existe
      await query(
        `INSERT INTO usuario_institucion (id_usuario, id_institucion, rol, activo_en_la_institucion, fecha_de_ingreso_a_la_institucion)
         VALUES ($1, $2, 'estudiante', true, NOW())
         ON CONFLICT (id_usuario, id_institucion) DO UPDATE SET activo_en_la_institucion = true, rol = EXCLUDED.rol`,
        [usuario.id_usuario, idInst]
      );

      // Obtener de nuevo
      rolResult = await query(
        `SELECT ui.id_institucion, ui.rol, i.nombre_institucion, i.zona_horaria
         FROM usuario_institucion ui
         INNER JOIN institucion i ON ui.id_institucion = i.id_institucion
         WHERE ui.id_usuario = $1 AND ui.activo_en_la_institucion = true
         LIMIT 1`,
        [usuario.id_usuario]
      );
    }

    let rol = 'estudiante';
    let idInstitucion = null;
    let nombreInstitucion = null;
    let zonaHoraria = 'America/Bogota';

    if (rolResult.rows.length > 0) {
      rol = rolResult.rows[0].rol;
      idInstitucion = rolResult.rows[0].id_institucion;
      nombreInstitucion = rolResult.rows[0].nombre_institucion;
      zonaHoraria = rolResult.rows[0].zona_horaria;
    }

    // Generar token JWT
    const token = generarToken({
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      rol: rol,
      id_institucion: idInstitucion
    });

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          nombre: usuario.nombre,
          primer_apellido: usuario.primer_apellido,
          segundo_apellido: usuario.segundo_apellido,
          nombre_completo: `${usuario.nombre} ${usuario.primer_apellido} ${usuario.segundo_apellido}`,
          dni: usuario.dni,
          fecha_de_nacimiento: usuario.fecha_de_nacimiento,
          rol: rol,
          id_institucion: idInstitucion,
          nombre_institucion: nombreInstitucion,
          zona_horaria: zonaHoraria,
          primer_acceso: usuario.primer_acceso
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Obtener perfil del usuario autenticado
exports.perfil = async (req, res) => {
  try {
    const { id_usuario } = req.usuario;

    const resultado = await query(
      `SELECT u.id_usuario, u.email, u.nombre, u.primer_apellido, u.segundo_apellido,
              u.dni, u.fecha_de_nacimiento, u.fecha_registro,
              ui.rol, ui.id_institucion, i.nombre_institucion
       FROM usuario u
       LEFT JOIN usuario_institucion ui ON u.id_usuario = ui.id_usuario AND ui.activo_en_la_institucion = true
       LEFT JOIN institucion i ON ui.id_institucion = i.id_institucion
       WHERE u.id_usuario = $1`,
      [id_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuario = resultado.rows[0];

    res.json({
      success: true,
      data: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nombre_completo: `${usuario.nombre} ${usuario.primer_apellido} ${usuario.segundo_apellido}`,
        dni: usuario.dni,
        fecha_de_nacimiento: usuario.fecha_de_nacimiento,
        rol: usuario.rol || 'sin asignar',
        institucion: usuario.nombre_institucion || 'Sin institución',
        fecha_registro: usuario.fecha_registro
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};