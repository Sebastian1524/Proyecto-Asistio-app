import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexto/AuthContext';

const { width, height } = Dimensions.get('window');

export default function PantallaHome({ navigation }) {
  const { usuario, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('PantallaBienvenida');
  };

  return (
    <View style={estilos.contenedor}>
      <ScrollView contentContainerStyle={estilos.scroll}>
        {/* Header */}
        <View style={estilos.header}>
          <Text style={estilos.saludo}>
            Hola, <Text style={estilos.nombreUsuario}>{usuario?.nombre || 'Usuario'}</Text>
          </Text>
          <Text style={estilos.subtitulo}>
            {usuario?.rol || 'estudiante'} • {usuario?.institucion?.nombre || 'SENA'}
          </Text>
        </View>

        {/* Tarjetas de acceso rápido */}
        <View style={estilos.tarjetas}>
          <TouchableOpacity
            style={estilos.tarjeta}
            onPress={() => navigation.navigate('Clases')}
          >
            <View style={[estilos.iconoCirculo, { backgroundColor: '#DBEAFE' }]}>
              <Text style={estilos.icono}>📚</Text>
            </View>
            <Text style={estilos.tarjetaTitulo}>Mis Clases</Text>
            <Text style={estilos.tarjetaDescripcion}>Ver y gestionar clases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.tarjeta}
            onPress={() => navigation.navigate('Eventos')}
          >
            <View style={[estilos.iconoCirculo, { backgroundColor: '#DCFCE7' }]}>
              <Text style={estilos.icono}>📅</Text>
            </View>
            <Text style={estilos.tarjetaTitulo}>Eventos</Text>
            <Text style={estilos.tarjetaDescripcion}>Próximos eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.tarjeta}
            onPress={() => navigation.navigate('EscanearQR')}
          >
            <View style={[estilos.iconoCirculo, { backgroundColor: '#FEF3C7' }]}>
              <Text style={estilos.icono}>📷</Text>
            </View>
            <Text style={estilos.tarjetaTitulo}>Escanear QR</Text>
            <Text style={estilos.tarjetaDescripcion}>Registrar asistencia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.tarjeta}
            onPress={() => navigation.navigate('DashboardEstudiante')}
          >
            <View style={[estilos.iconoCirculo, { backgroundColor: '#E9D5FF' }]}>
              <Text style={estilos.icono}>📊</Text>
            </View>
            <Text style={estilos.tarjetaTitulo}>Dashboard</Text>
            <Text style={estilos.tarjetaDescripcion}>Mis estadísticas</Text>
          </TouchableOpacity>
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity
          style={estilos.botonCerrarSesion}
          onPress={handleLogout}
        >
          <Text style={estilos.textoCerrarSesion}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    padding: width * 0.05,
    paddingTop: height * 0.06,
  },
  header: {
    marginBottom: height * 0.03,
  },
  saludo: {
    fontSize: width * 0.07,
    fontWeight: '700',
    color: '#111827',
  },
  nombreUsuario: {
    color: '#2563EB',
  },
  subtitulo: {
    fontSize: width * 0.04,
    color: '#6B7280',
    marginTop: height * 0.005,
  },
  tarjetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tarjeta: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: width * 0.05,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconoCirculo: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.015,
  },
  icono: {
    fontSize: width * 0.08,
  },
  tarjetaTitulo: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#111827',
    marginBottom: height * 0.005,
  },
  tarjetaDescripcion: {
    fontSize: width * 0.035,
    color: '#6B7280',
  },
  botonCerrarSesion: {
    marginTop: height * 0.03,
    backgroundColor: '#FEE2E2',
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoCerrarSesion: {
    color: '#DC2626',
    fontSize: width * 0.042,
    fontWeight: '600',
  },
});
