import React, { useState } from 'react';
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
import { crearClase } from '../services/clasesService';

const { width } = Dimensions.get('window');

export default function PantallaCrearClase({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [maxEstudiantes, setMaxEstudiantes] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre de la clase es obligatorio');
      return;
    }

    try {
      setCargando(true);
      
      const datosClase = {
        nombre_clase: nombre.trim(),
        descripcion: descripcion.trim() || null,
        max_estudiantes: maxEstudiantes ? parseInt(maxEstudiantes) : null,
      };

      await crearClase(datosClase);
      
      Alert.alert(
        'Éxito',
        'Clase creada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo crear la clase');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Nueva Clase</Text>
        <Text style={styles.subtitulo}>Completa la información</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formulario}>
          <View style={styles.campo}>
            <Text style={styles.label}>Nombre de la clase *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Programación en Python"
              value={nombre}
              onChangeText={setNombre}
              editable={!cargando}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Descripción de la clase (opcional)"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!cargando}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Máximo de estudiantes</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 30 (opcional)"
              value={maxEstudiantes}
              onChangeText={setMaxEstudiantes}
              keyboardType="numeric"
              editable={!cargando}
            />
          </View>

          <TouchableOpacity
            style={[styles.botonCrear, cargando && styles.botonDeshabilitado]}
            onPress={handleCrear}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonCrearTexto}>✓ Crear Clase</Text>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    minHeight: 100,
    paddingTop: 16,
  },
  botonCrear: {
    backgroundColor: '#6366F1',
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
