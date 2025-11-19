import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexto/AuthContext';
import { obtenerAsistenciasEvento } from '../services/asistenciaService';
import { descargarReporteEvento } from '../services/reportesService';

export default function PantallaAsistenciasEvento({ route, navigation }) {
  const { idEvento, nombreEvento } = route.params;
  const { usuario } = useAuth();
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  const esEstudiante = usuario?.rol === 'estudiante';

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const cargarAsistencias = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerAsistenciasEvento(idEvento);
      
      // Si es estudiante, filtrar solo su asistencia
      if (esEstudiante) {
        const miAsistencia = data.filter(a => a.id_usuario === usuario.id_usuario);
        setAsistencias(miAsistencia);
      } else {
        setAsistencias(data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar asistencias');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarAsistencias();
  };

  const handleDescargarReporte = async () => {
    try {
      Alert.alert(
        '📊 Exportar a Excel',
        '¿Deseas descargar el reporte de asistencia de este evento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descargar',
            onPress: async () => {
              try {
                const resultado = await descargarReporteEvento(idEvento, nombreEvento);
                if (resultado.success) {
                  Alert.alert('✅ Éxito', 'Reporte descargado correctamente');
                }
              } catch (error) {
                Alert.alert('❌ Error', error.message || 'No se pudo descargar el reporte');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo generar el reporte');
    }
  };

  const formatearHora = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderAsistencia = ({ item }) => {
    const nombreCompleto = `${item.nombre} ${item.primer_apellido} ${item.segundo_apellido || ''}`.trim();
    
    return (
      <View style={styles.tarjetaAsistencia}>
        <View style={styles.headerAsistencia}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarTexto}>
              {item.nombre[0]}{item.primer_apellido[0]}
            </Text>
          </View>
          
          <View style={styles.infoEstudiante}>
            <Text style={styles.nombreEstudiante}>{nombreCompleto}</Text>
            <Text style={styles.emailEstudiante}>{item.email}</Text>
          </View>
          
          <View style={[
            styles.estadoBadge,
            item.presente ? styles.estadoPresente : styles.estadoAusente
          ]}>
            <Text style={styles.estadoTexto}>
              {item.presente ? '✓' : '✗'}
            </Text>
          </View>
        </View>
        
        {item.hora_entrada && (
          <View style={styles.horaContainer}>
            <Text style={styles.horaLabel}>Hora de entrada:</Text>
            <Text style={styles.horaValor}>{formatearHora(item.hora_entrada)}</Text>
          </View>
        )}
        
        {item.justificacion && (
          <View style={styles.justificacionContainer}>
            <Text style={styles.justificacionLabel}>Justificación:</Text>
            <Text style={styles.justificacionTexto}>{item.justificacion}</Text>
          </View>
        )}
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.textoCargando}>Cargando asistencias...</Text>
      </View>
    );
  }

  const totalAsistentes = asistencias.filter(a => a.presente).length;
  const porcentajeAsistencia = asistencias.length > 0 
    ? ((totalAsistentes / asistencias.length) * 100).toFixed(1)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{nombreEvento}</Text>
        <Text style={styles.subtitulo}>
          {esEstudiante ? 'Mi asistencia' : 'Lista de asistencia'}
        </Text>
      </View>

      {!esEstudiante && (
        <View style={styles.estadisticas}>
          <View style={styles.estadItem}>
            <Text style={styles.estadValor}>{totalAsistentes}</Text>
            <Text style={styles.estadLabel}>Presentes</Text>
          </View>
          
          <View style={styles.estadSeparador} />
          
          <View style={styles.estadItem}>
            <Text style={styles.estadValor}>{asistencias.length - totalAsistentes}</Text>
            <Text style={styles.estadLabel}>Ausentes</Text>
          </View>
          
          <View style={styles.estadSeparador} />
          
          <View style={styles.estadItem}>
            <Text style={[styles.estadValor, { color: '#10B981' }]}>{porcentajeAsistencia}%</Text>
            <Text style={styles.estadLabel}>Asistencia</Text>
          </View>
        </View>
      )}

      {!esEstudiante && asistencias.length > 0 && (
        <View style={styles.botonesAccion}>
          <TouchableOpacity
            style={styles.botonExportar}
            onPress={handleDescargarReporte}
          >
            <Text style={styles.botonExportarTexto}>📊 Exportar a Excel</Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? (
        <View style={styles.centrado}>
          <Text style={styles.textoError}>❌ {error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarAsistencias}>
            <Text style={styles.botonReintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : asistencias.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>
            {esEstudiante 
              ? '⚠️ No has registrado asistencia en este evento' 
              : '👥 No hay asistencias registradas'
            }
          </Text>
          {esEstudiante && (
            <Text style={styles.mensajeAyuda}>
              Usa el menú "Escanear QR" para registrar tu asistencia
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={asistencias}
          renderItem={renderAsistencia}
          keyExtractor={(item) => item.id_asistencia.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
          }
        />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
  },
  estadisticas: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  estadItem: {
    flex: 1,
    alignItems: 'center',
  },
  estadValor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  estadLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  estadSeparador: {
    width: 1,
    backgroundColor: '#E5E7EB',
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
  tarjetaAsistencia: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerAsistencia: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
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
  estadoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  estadoPresente: {
    backgroundColor: '#D1FAE5',
  },
  estadoAusente: {
    backgroundColor: '#FEE2E2',
  },
  estadoTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  horaContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  horaLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
  },
  horaValor: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  justificacionContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FBBF24',
  },
  justificacionLabel: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 4,
  },
  justificacionTexto: {
    fontSize: 13,
    color: '#78350F',
  },
  botonesAccion: {
    padding: 16,
    paddingTop: 0,
  },
  botonExportar: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botonExportarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
