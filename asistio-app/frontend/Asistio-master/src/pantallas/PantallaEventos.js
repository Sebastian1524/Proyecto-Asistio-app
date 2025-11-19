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
  Modal,
  Image,
} from 'react-native';
import { useAuth } from '../contexto/AuthContext';
import { obtenerEventos } from '../services/eventosService';

const { width } = Dimensions.get('window');

export default function PantallaEventos({ navigation }) {
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalQRVisible, setModalQRVisible] = useState(false);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerEventos();
      setEventos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar eventos');
      console.error('Error:', err);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarEventos();
  };

  const formatearFecha = (fecha) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return '';
    return hora.substring(0, 5);
  };

  const mostrarQR = (evento) => {
    setEventoSeleccionado(evento);
    setModalQRVisible(true);
  };

  const renderEvento = ({ item }) => {
    const esFuturo = new Date(item.fecha_evento) > new Date();
    const esActivo = item.estado === 'activo';

    return (
      <View style={styles.tarjetaEvento}>
        <View style={styles.headerEvento}>
          <View style={styles.infoEvento}>
            <Text style={styles.nombreEvento}>{item.nombre_evento}</Text>
            <Text style={styles.nombreClase}>📚 {item.nombre_clase}</Text>
          </View>
          
          <View style={[
            styles.badge,
            esActivo ? styles.badgeActivo : styles.badgeInactivo
          ]}>
            <Text style={styles.badgeTexto}>{item.estado}</Text>
          </View>
        </View>

        {item.descripcion && (
          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}

        <View style={styles.detallesEvento}>
          <View style={styles.detalleItem}>
            <Text style={styles.detalleIcono}>📅</Text>
            <Text style={styles.detalleTexto}>{formatearFecha(item.fecha_evento)}</Text>
          </View>
          
          <View style={styles.detalleItem}>
            <Text style={styles.detalleIcono}>🕐</Text>
            <Text style={styles.detalleTexto}>
              {formatearHora(item.hora_inicio)}
              {item.hora_fin && ` - ${formatearHora(item.hora_fin)}`}
            </Text>
          </View>
        </View>

        {esActivo && item.codigo_qr && (
          <TouchableOpacity
            style={styles.botonVerQR}
            onPress={() => mostrarQR(item)}
          >
            <Text style={styles.botonVerQRTexto}>📱 Ver código QR</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.textoCargando}>Cargando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Eventos</Text>
          <Text style={styles.subtitulo}>
            Próximos eventos de asistencia
          </Text>
        </View>
        
        {usuario?.rol === 'docente' && (
          <TouchableOpacity
            style={styles.botonCrear}
            onPress={() => navigation.navigate('CrearEvento')}
          >
            <Text style={styles.botonCrearTexto}>+ Nuevo</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.centrado}>
          <Text style={styles.textoError}>❌ {error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarEventos}>
            <Text style={styles.botonReintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : eventos.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>📅 No hay eventos programados</Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          renderItem={renderEvento}
          keyExtractor={(item) => item.id_evento.toString()}
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

      {/* Modal QR */}
      <Modal
        visible={modalQRVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalQRVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>{eventoSeleccionado?.nombre_evento}</Text>
            <Text style={styles.modalSubtitulo}>Escanea este código para registrar asistencia</Text>
            
            {eventoSeleccionado?.codigo_qr && (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: eventoSeleccionado.codigo_qr }}
                  style={styles.imagenQR}
                  resizeMode="contain"
                />
              </View>
            )}

            <Text style={styles.tokenTexto}>Token: {eventoSeleccionado?.token_unico?.substring(0, 8)}...</Text>

            <TouchableOpacity
              style={styles.botonCerrarModal}
              onPress={() => setModalQRVisible(false)}
            >
              <Text style={styles.botonCerrarModalTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tarjetaEvento: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  headerEvento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoEvento: {
    flex: 1,
    marginRight: 8,
  },
  nombreEvento: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  nombreClase: {
    fontSize: 14,
    color: '#6B7280',
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
    marginBottom: 12,
    lineHeight: 20,
  },
  detallesEvento: {
    gap: 8,
    marginBottom: 12,
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detalleIcono: {
    fontSize: 16,
  },
  detalleTexto: {
    fontSize: 14,
    color: '#374151',
  },
  botonVerQR: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonVerQRTexto: {
    color: '#FFFFFF',
    fontSize: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContenido: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  imagenQR: {
    width: 250,
    height: 250,
  },
  tokenTexto: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  botonCerrarModal: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
  },
  botonCerrarModalTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
