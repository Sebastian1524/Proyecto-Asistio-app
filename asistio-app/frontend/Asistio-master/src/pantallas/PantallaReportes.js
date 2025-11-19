import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexto/AuthContext';
import { obtenerReporteEstudiante, obtenerReporteClase } from '../services/asistenciaService';
import { obtenerClases } from '../services/clasesService';

export default function PantallaReportes({ navigation }) {
  const { usuario } = useAuth();
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const esDocente = usuario?.rol === 'docente' || usuario?.rol === 'administrador';

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerClases();
      setClases(data);
      
      // Seleccionar automáticamente la primera clase
      if (data.length > 0) {
        seleccionarClase(data[0]);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar clases');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const seleccionarClase = async (clase) => {
    try {
      setClaseSeleccionada(clase);
      setCargando(true);
      
      if (esDocente) {
        // Cargar reporte completo de la clase
        const data = await obtenerReporteClase(clase.id_clase);
        setReporte(data);
      } else {
        // Cargar reporte individual del estudiante
        const data = await obtenerReporteEstudiante(clase.id_clase);
        setReporte(data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar reporte');
      setReporte(null);
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    if (claseSeleccionada) {
      seleccionarClase(claseSeleccionada);
    } else {
      cargarClases();
    }
  };

  const renderClaseTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tabClase,
        claseSeleccionada?.id_clase === item.id_clase && styles.tabClaseActiva
      ]}
      onPress={() => seleccionarClase(item)}
    >
      <Text style={[
        styles.tabClaseTexto,
        claseSeleccionada?.id_clase === item.id_clase && styles.tabClaseTextoActivo
      ]}>
        {item.nombre_clase}
      </Text>
    </TouchableOpacity>
  );

  const renderEstudianteReporte = ({ item }) => {
    const nombreCompleto = `${item.nombre} ${item.primer_apellido} ${item.segundo_apellido || ''}`.trim();
    const porcentaje = parseFloat(item.porcentaje_asistencia || 0);
    const color = porcentaje >= 80 ? '#10B981' : porcentaje >= 60 ? '#FBBF24' : '#EF4444';

    return (
      <View style={styles.tarjetaEstudiante}>
        <View style={styles.headerEstudiante}>
          <View style={[styles.avatarContainer, { backgroundColor: color }]}>
            <Text style={styles.avatarTexto}>
              {item.nombre[0]}{item.primer_apellido[0]}
            </Text>
          </View>
          
          <View style={styles.infoEstudiante}>
            <Text style={styles.nombreEstudiante}>{nombreCompleto}</Text>
            <Text style={styles.emailEstudiante}>{item.email}</Text>
          </View>
          
          <View style={styles.porcentajeContainer}>
            <Text style={[styles.porcentajeValor, { color }]}>
              {porcentaje.toFixed(1)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.estadisticasEstudiante}>
          <View style={styles.estatItem}>
            <Text style={styles.estatValor}>{item.total_eventos || 0}</Text>
            <Text style={styles.estatLabel}>Eventos</Text>
          </View>
          
          <View style={styles.estatItem}>
            <Text style={[styles.estatValor, { color: '#10B981' }]}>
              {item.asistencias || 0}
            </Text>
            <Text style={styles.estatLabel}>Asistencias</Text>
          </View>
          
          <View style={styles.estatItem}>
            <Text style={[styles.estatValor, { color: '#EF4444' }]}>
              {item.faltas || 0}
            </Text>
            <Text style={styles.estatLabel}>Faltas</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderReporteEstudiante = () => {
    if (!reporte) return null;

    const porcentaje = parseFloat(reporte.porcentaje_asistencia || 0);
    const color = porcentaje >= 80 ? '#10B981' : porcentaje >= 60 ? '#FBBF24' : '#EF4444';

    return (
      <View style={styles.contenido}>
        <View style={styles.tarjetaResumen}>
          <View style={[styles.porcentajeGrande, { borderColor: color }]}>
            <Text style={[styles.porcentajeGrandeValor, { color }]}>
              {porcentaje.toFixed(1)}%
            </Text>
            <Text style={styles.porcentajeGrandeLabel}>de asistencia</Text>
          </View>

          <View style={styles.estadisticasGrid}>
            <View style={styles.estadGridItem}>
              <Text style={styles.estadGridValor}>{reporte.total_eventos || 0}</Text>
              <Text style={styles.estadGridLabel}>Total Eventos</Text>
            </View>

            <View style={styles.estadGridItem}>
              <Text style={[styles.estadGridValor, { color: '#10B981' }]}>
                {reporte.asistencias || 0}
              </Text>
              <Text style={styles.estadGridLabel}>Asistencias</Text>
            </View>

            <View style={styles.estadGridItem}>
              <Text style={[styles.estadGridValor, { color: '#EF4444' }]}>
                {reporte.faltas || 0}
              </Text>
              <Text style={styles.estadGridLabel}>Faltas</Text>
            </View>
          </View>

          <View style={styles.mensajeContainer}>
            {porcentaje >= 80 ? (
              <View style={[styles.mensaje, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.mensajeIcono}>✅</Text>
                <Text style={styles.mensajeTexto}>
                  ¡Excelente asistencia! Sigue así.
                </Text>
              </View>
            ) : porcentaje >= 60 ? (
              <View style={[styles.mensaje, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.mensajeIcono}>⚠️</Text>
                <Text style={styles.mensajeTexto}>
                  Asistencia regular. Procura no faltar más.
                </Text>
              </View>
            ) : (
              <View style={[styles.mensaje, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.mensajeIcono}>❌</Text>
                <Text style={styles.mensajeTexto}>
                  Asistencia baja. Es importante mejorar.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (cargando && clases.length === 0) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.textoCargando}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Reportes de Asistencia</Text>
        <Text style={styles.subtitulo}>
          {esDocente ? 'Seguimiento por clase' : 'Tu rendimiento'}
        </Text>
      </View>

      {clases.length > 0 && (
        <View style={styles.tabsContainer}>
          <FlatList
            horizontal
            data={clases}
            renderItem={renderClaseTab}
            keyExtractor={(item) => item.id_clase.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsList}
          />
        </View>
      )}

      {error ? (
        <View style={styles.centrado}>
          <Text style={styles.textoError}>❌ {error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={onRefresh}>
            <Text style={styles.botonReintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : !reporte || (Array.isArray(reporte) && reporte.length === 0) ? (
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>📊 No hay datos de asistencia</Text>
        </View>
      ) : esDocente ? (
        <FlatList
          data={reporte}
          renderItem={renderEstudianteReporte}
          keyExtractor={(item) => item.id_usuario.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
          }
        />
      ) : (
        renderReporteEstudiante()
      )}

      <TouchableOpacity
        style={styles.botonVolver}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.botonVolverTexto}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsList: {
    padding: 16,
    gap: 12,
  },
  tabClase: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  tabClaseActiva: {
    backgroundColor: '#6366F1',
  },
  tabClaseTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabClaseTextoActivo: {
    color: '#FFFFFF',
  },
  contenido: {
    flex: 1,
    padding: 16,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  textoError: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  textoVacio: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  botonReintentar: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  botonReintentarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lista: {
    padding: 16,
  },
  tarjetaResumen: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  porcentajeGrande: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 2,
    marginBottom: 24,
  },
  porcentajeGrandeValor: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  porcentajeGrandeLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  estadisticasGrid: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  estadGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  estadGridValor: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  estadGridLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  mensajeContainer: {
    marginTop: 8,
  },
  mensaje: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  mensajeIcono: {
    fontSize: 24,
    marginRight: 12,
  },
  mensajeTexto: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  tarjetaEstudiante: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerEstudiante: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoEstudiante: {
    flex: 1,
  },
  nombreEstudiante: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  emailEstudiante: {
    fontSize: 13,
    color: '#6B7280',
  },
  porcentajeContainer: {
    alignItems: 'center',
  },
  porcentajeValor: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  estadisticasEstudiante: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  estatItem: {
    flex: 1,
    alignItems: 'center',
  },
  estatValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 2,
  },
  estatLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  botonVolver: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  botonVolverTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
});
