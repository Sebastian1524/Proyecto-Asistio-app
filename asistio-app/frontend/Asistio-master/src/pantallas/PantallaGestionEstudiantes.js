import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexto/AuthContext';
import { BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PantallaGestionEstudiantes({ route, navigation }) {
  const { idClase, nombreClase } = route.params;
  const { usuario } = useAuth();
  const [estudiantesInscritos, setEstudiantesInscritos] = useState([]);
  const [todosEstudiantes, setTodosEstudiantes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const token = await AsyncStorage.getItem('token');

      // Cargar estudiantes inscritos
      const resInscritos = await fetch(`${BASE_URL}/clases/${idClase}/estudiantes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataInscritos = await resInscritos.json();
      setEstudiantesInscritos(dataInscritos.data || []);

      // Cargar todos los estudiantes (para agregar)
      const resTodosEstudiantes = await fetch(`${BASE_URL}/usuarios/estudiantes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataTodos = await resTodosEstudiantes.json();
      setTodosEstudiantes(dataTodos.data || []);

    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const inscribirEstudiante = async (idEstudiante) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/clases/${idClase}/inscribir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_usuario: idEstudiante })
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert('Éxito', 'Estudiante inscrito correctamente');
        setMostrarAgregar(false);
        cargarDatos();
      } else {
        Alert.alert('Error', data.message || 'No se pudo inscribir al estudiante');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al inscribir estudiante');
    }
  };

  const desinscribirEstudiante = async (idEstudiante, nombreEstudiante) => {
    Alert.alert(
      'Confirmar',
      `¿Deseas desinscribir a ${nombreEstudiante} de esta clase?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desinscribir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const res = await fetch(`${BASE_URL}/clases/${idClase}/desinscribir`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_usuario: idEstudiante })
              });

              const data = await res.json();

              if (data.success) {
                Alert.alert('Éxito', 'Estudiante desinscrito');
                cargarDatos();
              } else {
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Error al desinscribir');
            }
          }
        }
      ]
    );
  };

  const estudiantesFiltrados = todosEstudiantes.filter(est => {
    const yaInscrito = estudiantesInscritos.some(ins => ins.id_usuario === est.id_usuario);
    const coincideBusqueda = 
      est.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.primer_apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      est.email?.toLowerCase().includes(busqueda.toLowerCase());
    
    return !yaInscrito && coincideBusqueda;
  });

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (mostrarAgregar) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Agregar Estudiantes</Text>
          <Text style={styles.subtitulo}>{nombreClase}</Text>
        </View>

        <View style={styles.contenido}>
          <TextInput
            style={styles.inputBusqueda}
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChangeText={setBusqueda}
          />

          <FlatList
            data={estudiantesFiltrados}
            keyExtractor={(item) => item.id_usuario?.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tarjetaEstudiante}
                onPress={() => inscribirEstudiante(item.id_usuario)}
              >
                <View style={styles.avatarContenedor}>
                  <Text style={styles.avatarTexto}>
                    {item.nombre?.[0]}{item.primer_apellido?.[0]}
                  </Text>
                </View>
                <View style={styles.infoEstudiante}>
                  <Text style={styles.nombreEstudiante}>
                    {item.nombre} {item.primer_apellido} {item.segundo_apellido}
                  </Text>
                  <Text style={styles.emailEstudiante}>{item.email}</Text>
                </View>
                <Text style={styles.iconoAgregar}>+</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.mensajeVacio}>
                {busqueda ? 'No se encontraron estudiantes' : 'Todos los estudiantes ya están inscritos'}
              </Text>
            }
          />

          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={() => setMostrarAgregar(false)}
          >
            <Text style={styles.botonCancelarTexto}>← Volver a la lista</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Estudiantes Inscritos</Text>
        <Text style={styles.subtitulo}>{nombreClase}</Text>
      </View>

      <View style={styles.contenido}>
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => setMostrarAgregar(true)}
        >
          <Text style={styles.botonAgregarTexto}>+ Agregar Estudiante</Text>
        </TouchableOpacity>

        <FlatList
          data={estudiantesInscritos}
          keyExtractor={(item) => item.id_usuario?.toString()}
          renderItem={({ item }) => (
            <View style={styles.tarjetaEstudiante}>
              <View style={styles.avatarContenedor}>
                <Text style={styles.avatarTexto}>
                  {item.nombre?.[0]}{item.primer_apellido?.[0]}
                </Text>
              </View>
              <View style={styles.infoEstudiante}>
                <Text style={styles.nombreEstudiante}>
                  {item.nombre} {item.primer_apellido} {item.segundo_apellido}
                </Text>
                <Text style={styles.emailEstudiante}>{item.email}</Text>
                {item.fecha_inscripcion && (
                  <Text style={styles.fechaInscripcion}>
                    Inscrito: {new Date(item.fecha_inscripcion).toLocaleDateString('es-CO')}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => desinscribirEstudiante(
                  item.id_usuario,
                  `${item.nombre} ${item.primer_apellido}`
                )}
              >
                <Text style={styles.iconoEliminar}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.mensajeVacio}>
              No hay estudiantes inscritos en esta clase
            </Text>
          }
        />

        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  contenido: {
    flex: 1,
    padding: 16,
  },
  botonAgregar: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonAgregarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputBusqueda: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  tarjetaEstudiante: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContenedor: {
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
    marginBottom: 4,
  },
  emailEstudiante: {
    fontSize: 14,
    color: '#6B7280',
  },
  fechaInscripcion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  iconoEliminar: {
    fontSize: 24,
    color: '#EF4444',
    paddingHorizontal: 8,
  },
  iconoAgregar: {
    fontSize: 32,
    color: '#10B981',
    paddingHorizontal: 8,
  },
  mensajeVacio: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 40,
  },
  botonVolver: {
    marginTop: 16,
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
  botonCancelar: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    fontSize: 16,
    color: '#6B7280',
  },
});
