import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { registrarAsistenciaQR } from '../services/asistenciaService';

const { width } = Dimensions.get('window');

export default function PantallaEscanearQR({ navigation }) {
  const [tokenQR, setTokenQR] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleEscanear = async () => {
    if (!tokenQR.trim()) {
      Alert.alert('Error', 'Por favor ingresa el token del QR');
      return;
    }

    try {
      setCargando(true);
      setResultado(null);
      const data = await registrarAsistenciaQR(tokenQR.trim());
      
      setResultado({
        exito: true,
        mensaje: data.message || 'Asistencia registrada exitosamente',
        evento: data.data?.evento
      });
      
      setTokenQR('');
    } catch (err) {
      setResultado({
        exito: false,
        mensaje: err.message || 'Error al registrar asistencia'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Escanear QR</Text>
        <Text style={styles.subtitulo}>Registra tu asistencia</Text>
      </View>

      <View style={styles.contenido}>
        <View style={styles.scannerPlaceholder}>
          <Text style={styles.scannerIcono}>📷</Text>
          <Text style={styles.scannerTexto}>
            Escáner de cámara disponible solo en dispositivo móvil
          </Text>
        </View>

        <View style={styles.separador}>
          <View style={styles.lineaSeparador} />
          <Text style={styles.textoSeparador}>O ingresa el token manualmente</Text>
          <View style={styles.lineaSeparador} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el token del evento"
            value={tokenQR}
            onChangeText={setTokenQR}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TouchableOpacity
            style={[styles.botonEscanear, cargando && styles.botonDeshabilitado]}
            onPress={handleEscanear}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonEscanearTexto}>✓ Registrar Asistencia</Text>
            )}
          </TouchableOpacity>
        </View>

        {resultado && (
          <View style={[
            styles.resultadoContainer,
            resultado.exito ? styles.resultadoExito : styles.resultadoError
          ]}>
            <Text style={styles.resultadoIcono}>
              {resultado.exito ? '✅' : '❌'}
            </Text>
            <Text style={styles.resultadoMensaje}>{resultado.mensaje}</Text>
            {resultado.evento && (
              <View style={styles.eventoInfo}>
                <Text style={styles.eventoNombre}>{resultado.evento.nombre_evento}</Text>
                <Text style={styles.eventoClase}>{resultado.evento.nombre_clase}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.instrucciones}>
          <Text style={styles.instruccionesTitulo}>💡 Instrucciones:</Text>
          <Text style={styles.instruccionesTexto}>
            1. Ve a la pantalla de Eventos{'\n'}
            2. Selecciona un evento activo{'\n'}
            3. Toca "Ver código QR"{'\n'}
            4. Copia el token y pégalo aquí{'\n'}
            5. O escanea el QR con tu celular
          </Text>
        </View>
      </View>

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
  contenido: {
    flex: 1,
    padding: 20,
  },
  scannerPlaceholder: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  scannerIcono: {
    fontSize: 64,
    marginBottom: 16,
  },
  scannerTexto: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  lineaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  textoSeparador: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 16,
  },
  botonEscanear: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonEscanearTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultadoContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultadoExito: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  resultadoError: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resultadoIcono: {
    fontSize: 40,
    marginBottom: 8,
  },
  resultadoMensaje: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  eventoInfo: {
    alignItems: 'center',
  },
  eventoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  eventoClase: {
    fontSize: 12,
    color: '#6B7280',
  },
  instrucciones: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  instruccionesTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  instruccionesTexto: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
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
