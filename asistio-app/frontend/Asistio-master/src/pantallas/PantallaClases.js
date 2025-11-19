import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { useAuth } from '../contexto/AuthContext';
import { obtenerClases } from '../services/clasesService';
import { descargarReporteClase, descargarReporteEstudiantes } from '../services/reportesService';

const { width } = Dimensions.get('window');

export default function PantallaClases({ navigation }) {
  const { usuario } = useAuth();
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerClases();
      setClases(data);
    } catch (err) {
      setError(err.message || 'Error al cargar clases');
      console.error('Error:', err);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarClases();
  };

  const handleExportarReportes = (clase) => {
    Alert.alert(
      '📊 Exportar Reportes',
      `¿Qué reporte deseas exportar de ${clase.nombre_clase}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '📋 Asistencias completas',
          onPress: async () => {
            try {
              const resultado = await descargarReporteClase(clase.id_clase, clase.nombre_clase);
              if (resultado.success) {
                Alert.alert('✅ Éxito', 'Reporte descargado correctamente');
              }
            } catch (error) {
              Alert.alert('❌ Error', error.message || 'No se pudo descargar el reporte');
            }
          }
        },
        {
          text: '📊 Estadísticas por estudiante',
          onPress: async () => {
            try {
              const resultado = await descargarReporteEstudiantes(clase.id_clase, clase.nombre_clase);
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
  };

  const renderClase = ({ item }) => (
    <View style={styles.tarjetaClase}>
      <TouchableOpacity
        style={styles.contenidoClase}
        onPress={() => navigation.navigate('Eventos', { 
          idClase: item.id_clase,
          nombreClase: item.nombre_clase 
        })}
      >
        <View style={styles.headerClase}>
          <Text style={styles.nombreClase}>{item.nombre_clase}</Text>
          <View style={[
            styles.badge,
            (item.estado === 'activo' || item.estado === 'activa') ? styles.badgeActivo : styles.badgeInactivo
          ]}>
            <Text style={styles.badgeTexto}>
              {(item.estado === 'activo' || item.estado === 'activa') ? 'Activa' : item.estado}
            </Text>
          </View>
        </View>
        
        {item.descripcion && (
          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estudiantes</Text>
            <Text style={styles.infoValor}>
              {item.total_estudiantes || 0}/{item.max_estudiantes || '∞'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Eventos</Text>
            <Text style={styles.infoValor}>{item.total_eventos || 0}</Text>
          </View>
        </View>

        <View style={styles.accionContainer}>
          <Text style={styles.textoAccion}>
            {usuario?.rol === 'estudiante' 
              ? '📅 Toca aquí para ver eventos y escanear QR →'
              : '👁️ Ver detalles de la clase →'
            }
          </Text>
        </View>
      </TouchableOpacity>

      {(usuario?.rol === 'docente' || usuario?.rol === 'administrador') && (
        <View style={styles.botonesInferiores}>
          <TouchableOpacity
            style={styles.botonDashboard}
            onPress={() => navigation.navigate('DashboardClase', {
              idClase: item.id_clase,
              nombreClase: item.nombre_clase
            })}
          >
            <Text style={styles.textoBotonDashboard}>📊 Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonGestionarEstudiantes}
            onPress={() => navigation.navigate('GestionEstudiantes', {
              idClase: item.id_clase,
              nombreClase: item.nombre_clase
            })}
          >
            <Text style={styles.textoBotonGestionar}>👥 Estudiantes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonExportarClase}
            onPress={() => handleExportarReportes(item)}
          >
            <Text style={styles.textoBotonExportar}>📄 Exportar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.textoCargando}>Cargando clases...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Mis Clases</Text>
          <Text style={styles.subtitulo}>
            {usuario?.nombre} • {usuario?.rol || 'estudiante'}
          </Text>
        </View>
        
        {usuario?.rol === 'docente' && (
          <TouchableOpacity
            style={styles.botonCrear}
            onPress={() => navigation.navigate('CrearClase')}
          >
            <Text style={styles.botonCrearTexto}>+ Nueva</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.centrado}>
          <Text style={styles.textoError}>❌ {error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarClases}>
            <Text style={styles.botonReintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : clases.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>📚 No tienes clases registradas</Text>
          {usuario?.rol === 'docente' && (
            <TouchableOpacity
              style={styles.botonCrearPrimera}
              onPress={() => navigation.navigate('CrearClase')}
            >
              <Text style={styles.botonCrearPrimeraTexto}>Crear primera clase</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={clases}
          renderItem={renderClase}
          keyExtractor={(item) => item.id_clase.toString()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  botonCrear: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  botonCrearTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 20,
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
  botonCrearPrimera: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  botonCrearPrimeraTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lista: {
    padding: 16,
  },
  tarjetaClase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    overflow: 'hidden',
  },
  contenidoClase: {
    padding: 20,
  },
  headerClase: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nombreClase: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActivo: {
    backgroundColor: '#D1FAE5',
  },
  badgeInactivo: {
    backgroundColor: '#FEE2E2',
  },
  badgeTexto: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  descripcion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  accionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textoAccion: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '500',
  },
  botonesInferiores: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  botonDashboard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#E5E7EB',
  },
  botonGestionarEstudiantes: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#E5E7EB',
  },
  botonExportarClase: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  textoBotonDashboard: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  textoBotonGestionar: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  textoBotonExportar: {
    fontSize: 13,
    color: '#10B981',
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
