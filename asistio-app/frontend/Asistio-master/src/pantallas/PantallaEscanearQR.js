import React, { useState, useEffect } from 'react';
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import { registrarAsistenciaQR } from '../services/asistenciaService';

const { width } = Dimensions.get('window');

export default function PantallaEscanearQR({ navigation }) {
  const [tokenQR, setTokenQR] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setScanning(false);
      setTokenQR(data);
      handleEscanear(data);
    }
  };

  const handleEscanear = async (token = tokenQR) => {
    if (!token.trim()) {
      Alert.alert('Error', 'Por favor ingresa el token del QR');
      return;
    }

    try {
      setCargando(true);
      setResultado(null);
      const dataRes = await registrarAsistenciaQR(token.trim());
      
      setResultado({
        exito: true,
        mensaje: dataRes.message || '✅ Asistencia registrada exitosamente',
        evento: dataRes.data?.evento
      });
      
      setTokenQR('');
      setScanned(false);
    } catch (err) {
      console.log('Error al registrar:', err.message);
      
      let mensajeError = err.message || 'Error al registrar asistencia';
      
      // Mensajes amigables según el tipo de error
      if (mensajeError.includes('Ya has registrado')) {
        mensajeError = '✓ Ya registraste tu asistencia en este evento';
      } else if (mensajeError.includes('No estás inscrito')) {
        mensajeError = '❌ No estás inscrito en esta clase';
      } else if (mensajeError.includes('no está activo')) {
        mensajeError = '⏰ Este evento ya no está activo';
      } else if (mensajeError.includes('inválido')) {
        mensajeError = '❌ Código QR inválido';
      } else if (mensajeError.includes('Error en el servidor')) {
        mensajeError = '⚠️ Error temporal. Intenta nuevamente';
      }
      
      setResultado({
        exito: mensajeError.includes('Ya registraste'), // Si ya registró, mostrarlo como éxito
        mensaje: mensajeError
      });
      setScanned(false);
    } finally {
      setCargando(false);
    }
  };

  const toggleScanning = async () => {
    if (!permission) {
      return;
    }
    
    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Sin permisos', 'No tienes permisos para usar la cámara. Por favor habilítalos en la configuración de tu dispositivo.');
        return;
      }
    }
    
    setScanning(!scanning);
    setScanned(false);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Escanear QR</Text>
          <Text style={styles.subtitulo}>Registra tu asistencia</Text>
        </View>
        <View style={styles.contenido}>
          <Text style={styles.mensajePermiso}>Solicitando permisos de cámara...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Escanear QR</Text>
        <Text style={styles.subtitulo}>Registra tu asistencia</Text>
      </View>

      <View style={styles.contenido}>
        {scanning ? (
          <View style={styles.scannerContainer}>
            <CameraView
              style={styles.scanner}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerInstruccion}>
                Apunta la cámara al código QR
              </Text>
            </View>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.botonCancelarTexto}>✕ Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.botonCamara}
              onPress={toggleScanning}
            >
              <Text style={styles.camaraIcono}>📷</Text>
              <Text style={styles.botonCamaraTexto}>
                📱 Escanear con cámara
              </Text>
            </TouchableOpacity>

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
                onPress={() => handleEscanear()}
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
                1. Toca "Escanear con cámara" para usar la cámara{'\n'}
                2. Apunta la cámara al código QR{'\n'}
                3. O copia el token manualmente{'\n'}
                4. Tu asistencia se registrará automáticamente
              </Text>
            </View>
          </>
        )}
      </View>

      {!scanning && (
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
      )}
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
  mensajePermiso: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#6366F1',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scannerInstruccion: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  botonCancelar: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    marginLeft: -75,
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    width: 150,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botonCamara: {
    backgroundColor: '#6366F1',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  camaraIcono: {
    fontSize: 48,
    marginBottom: 12,
  },
  botonCamaraTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
