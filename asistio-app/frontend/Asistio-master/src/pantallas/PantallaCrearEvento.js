import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { obtenerClases } from '../services/clasesService';
import { BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function PantallaCrearEvento({ navigation }) {
  const [clases, setClases] = useState([]);
  const [idClaseSeleccionada, setIdClaseSeleccionada] = useState('');
  const [nombreEvento, setNombreEvento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoClases, setCargandoClases] = useState(true);

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    try {
      const data = await obtenerClases();
      setClases(data);
      if (data.length > 0) {
        setIdClaseSeleccionada(data[0].id_clase.toString());
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar las clases');
    } finally {
      setCargandoClases(false);
    }
  };

  const handleCrear = async () => {
    if (!idClaseSeleccionada || !nombreEvento.trim() || !fechaEvento.trim() || !horaInicio.trim()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    try {
      setCargando(true);
      
      const token = await AsyncStorage.getItem('token');
      const url = `${BASE_URL}/asistencia/eventos`;

      const datosEvento = {
        id_clase: parseInt(idClaseSeleccionada),
        nombre_evento: nombreEvento.trim(),
        descripcion: descripcion.trim() || null,
        fecha_evento: fechaEvento.trim(),
        hora_inicio: horaInicio.trim(),
        hora_fin: horaFin.trim() || null,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosEvento)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al crear evento');
      }
      
      Alert.alert(
        'Éxito',
        'Evento creado exitosamente con código QR',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo crear el evento');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoClases) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.textoCargando}>Cargando...</Text>
      </View>
    );
  }

  if (clases.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Nuevo Evento</Text>
        </View>
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>📚 Primero debes crear una clase</Text>
          <TouchableOpacity
            style={styles.botonCrearClase}
            onPress={() => navigation.navigate('CrearClase')}
          >
            <Text style={styles.botonCrearClaseTexto}>Crear Clase</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Nuevo Evento</Text>
        <Text style={styles.subtitulo}>Genera un código QR para asistencia</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formulario}>
          <View style={styles.campo}>
            <Text style={styles.label}>Clase *</Text>
            <View style={styles.selectContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {clases.map((clase) => (
                  <TouchableOpacity
                    key={clase.id_clase}
                    style={[
                      styles.claseOpcion,
                      idClaseSeleccionada === clase.id_clase.toString() && styles.claseSeleccionada
                    ]}
                    onPress={() => setIdClaseSeleccionada(clase.id_clase.toString())}
                  >
                    <Text style={[
                      styles.claseOpcionTexto,
                      idClaseSeleccionada === clase.id_clase.toString() && styles.claseSeleccionadaTexto
                    ]}>
                      {clase.nombre_clase}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Nombre del evento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Clase del 18 de Noviembre"
              value={nombreEvento}
              onChangeText={setNombreEvento}
              editable={!cargando}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Descripción del evento (opcional)"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!cargando}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Fecha del evento *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (Ej: 2025-11-18)"
              value={fechaEvento}
              onChangeText={setFechaEvento}
              editable={!cargando}
            />
          </View>

          <View style={styles.campoDoble}>
            <View style={[styles.campo, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Hora inicio *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (Ej: 14:00)"
                value={horaInicio}
                onChangeText={setHoraInicio}
                editable={!cargando}
              />
            </View>

            <View style={[styles.campo, { flex: 1 }]}>
              <Text style={styles.label}>Hora fin</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (Ej: 16:00)"
                value={horaFin}
                onChangeText={setHoraFin}
                editable={!cargando}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.botonCrear, cargando && styles.botonDeshabilitado]}
            onPress={handleCrear}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonCrearTexto}>📱 Crear Evento con QR</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.botonCancelar}
        onPress={() => navigation.goBack()}
        disabled={cargando}
      >
        <Text style={styles.botonCancelarTexto}>Cancelar</Text>
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
  textoVacio: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  botonCrearClase: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  botonCrearClaseTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  campo: {
    marginBottom: 20,
  },
  campoDoble: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectContainer: {
    marginBottom: 8,
  },
  claseOpcion: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  claseSeleccionada: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  claseOpcionTexto: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  claseSeleccionadaTexto: {
    color: '#6366F1',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    color: '#1F2937',
  },
  inputMultilinea: {
    minHeight: 80,
    paddingTop: 16,
  },
  botonCrear: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonCrearTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botonCancelar: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  botonCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});
