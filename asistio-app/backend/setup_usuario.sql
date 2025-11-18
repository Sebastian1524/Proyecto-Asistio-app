-- Obtener el ID del último usuario registrado
WITH ultimo_usuario AS (
  SELECT id_usuario FROM usuario ORDER BY id_usuario DESC LIMIT 1
),
institucion_existe AS (
  SELECT id_institucion FROM institucion WHERE id_institucion = 1
)
-- Insertar la relación usuario-institución si no existe
INSERT INTO usuario_institucion (id_usuario, id_institucion, rol, activo_en_la_institucion, fecha_de_ingreso_a_la_institucion)
SELECT lu.id_usuario, 1, 'estudiante', true, NOW()
FROM ultimo_usuario lu, institucion_existe ie
ON CONFLICT (id_usuario, id_institucion) DO UPDATE SET
  rol = 'estudiante',
  activo_en_la_institucion = true;
