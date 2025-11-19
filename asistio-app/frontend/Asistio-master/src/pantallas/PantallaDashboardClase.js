import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useAuth } from '../contexto/AuthContext';
import { obtenerDashboardClase } from '../services/dashboardService';

const { width } = Dimensions.get('window');

export default function PantallaDashboardClase({ route, navigation }) {
  const { idClase, nombreClase } = route.params;
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerDashboardClase(idClase);
      setDatos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar dashboard');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarDashboard();
  };

  const renderEstadistica = (titulo, valor, icono, color) => (
    <View style={[styles.tarjetaEstadistica, { borderLeftColor: color }]}>
      <Text style={styles.iconoEstad}>{icono}</Text>
      <View style={styles.contenidoEstad}>
        <Text style={styles.tituloEstad}>{titulo}</Text>
        <Text style={[styles.valorEstad, { color }]}>{valor}</Text>
      </View>
    </View>
  );

  const renderBarraProgreso = (porcentaje) => {
    const color = porcentaje >= 80 ? '#10B981' : porcentaje >= 60 ? '#F59E0B' : '#EF4444';
    return (
      <View style={styles.barraContenedor}>
        <View style={[styles.barraProgreso, { width: `${porcentaje}%`, backgroundColor: color }]} />
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.textoCargando}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.textoError}>❌ {error}</Text>
        <TouchableOpacity style={styles.botonReintentar} onPress={cargarDashboard}>
          <Text style={styles.botonReintentarTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { estadisticas, topEstudiantes, estudiantesRiesgo, proximosEventos, asistenciaPorEvento } = datos;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>📊 Dashboard</Text>
        <Text style={styles.subtitulo}>{nombreClase}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
      >
        {/* Estadísticas principales */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Resumen General</Text>
          <View style={styles.filaEstadisticas}>
            {renderEstadistica('Estudiantes', estadisticas.total_estudiantes, '👥', '#6366F1')}
            {renderEstadistica('Eventos', estadisticas.total_eventos, '📅', '#8B5CF6')}
          </View>
          <View style={styles.filaEstadisticas}>
            {renderEstadistica('Asistencias', estadisticas.total_asistencias, '✓', '#10B981')}
            {renderEstadistica('Promedio', `${estadisticas.porcentaje_asistencia_general || 0}%`, '📈', '#F59E0B')}
          </View>
        </View>

        {/* Top Estudiantes */}
        {topEstudiantes && topEstudiantes.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>🏆 Mejores Asistencias</Text>
            {topEstudiantes.map((est, index) => (
              <View key={index} style={styles.itemLista}>
                <View style={styles.posicion}>
                  <Text style={styles.numeroPosicion}>{index + 1}</Text>
                </View>
                <View style={styles.infoEstudiante}>
                  <Text style={styles.nombreEst}>{est.estudiante}</Text>
                  <Text style={styles.detalleEst}>{est.asistencias}/{est.total_eventos} eventos</Text>
                </View>
                <View style={styles.porcentajeContainer}>
                  <Text style={[styles.porcentajeTexto, { color: est.porcentaje >= 80 ? '#10B981' : '#F59E0B' }]}>
                    {est.porcentaje}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Estudiantes en Riesgo */}
        {estudiantesRiesgo && estudiantesRiesgo.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>⚠️ Asistencia Baja (&lt; 70%)</Text>
            {estudiantesRiesgo.map((est, index) => (
              <View key={index} style={[styles.itemLista, styles.itemRiesgo]}>
                <View style={styles.infoEstudiante}>
                  <Text style={styles.nombreEst}>{est.estudiante}</Text>
                  <Text style={styles.detalleEst}>{est.asistencias}/{est.total_eventos} eventos</Text>
                </View>
                <View style={styles.porcentajeContainer}>
                  <Text style={[styles.porcentajeTexto, { color: '#EF4444' }]}>
                    {est.porcentaje}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Próximos Eventos */}
        {proximosEventos && proximosEventos.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>📅 Próximos 7 días</Text>
            {proximosEventos.map((evento) => (
              <View key={evento.id_evento} style={styles.itemEvento}>
                <View style={styles.fechaEvento}>
                  <Text style={styles.diaEvento}>{new Date(evento.fecha_evento).getDate()}</Text>
                  <Text style={styles.mesEvento}>
                    {new Date(evento.fecha_evento).toLocaleDateString('es', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.infoEvento}>
                  <Text style={styles.nombreEvento}>{evento.nombre_evento}</Text>
                  <Text style={styles.horaEvento}>🕐 {evento.hora_inicio}</Text>
                  <Text style={styles.asistenciasEvento}>
                    ✓ {evento.asistencias_registradas} asistencias registradas
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Gráfico de barras simple */}
        {asistenciaPorEvento && asistenciaPorEvento.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>📊 Asistencia por Evento</Text>
            {asistenciaPorEvento.slice(0, 5).map((evento, index) => (
              <View key={index} style={styles.itemGrafico}>
                <Text style={styles.nombreGrafico} numberOfLines={1}>
                  {evento.nombre_evento}
                </Text>
                {renderBarraProgreso(evento.porcentaje || 0)}
                <Text style={styles.valorGrafico}>{evento.porcentaje || 0}%</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
    backgroundColor: '#6366F1',
    padding: 20,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 80,
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
  seccion: {
    marginBottom: 24,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  filaEstadisticas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tarjetaEstadistica: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconoEstad: {
    fontSize: 32,
    marginRight: 12,
  },
  contenidoEstad: {
    flex: 1,
  },
  tituloEstad: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  valorEstad: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemLista: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemRiesgo: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  posicion: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numeroPosicion: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoEstudiante: {
    flex: 1,
  },
  nombreEst: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  detalleEst: {
    fontSize: 13,
    color: '#6B7280',
  },
  porcentajeContainer: {
    paddingLeft: 8,
  },
  porcentajeTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemEvento: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  fechaEvento: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
  },
  diaEvento: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  mesEvento: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  infoEvento: {
    flex: 1,
  },
  nombreEvento: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  horaEvento: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  asistenciasEvento: {
    fontSize: 12,
    color: '#10B981',
  },
  itemGrafico: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  nombreGrafico: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  barraContenedor: {
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barraProgreso: {
    height: '100%',
    borderRadius: 12,
  },
  valorGrafico: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  botonVolver: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  botonVolverTexto: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
});
