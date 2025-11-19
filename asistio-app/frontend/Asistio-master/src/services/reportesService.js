import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

// Descargar reporte CSV de toda la clase
export const descargarReporteClase = async (idClase, nombreClase) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const url = `${API_URL}/reportes/clase/${idClase}/csv?token=${token}`;
    
    // Abrir el URL en el navegador para descargar
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return { success: true, message: 'Abriendo reporte en navegador...' };
    } else {
      throw new Error('No se puede abrir el navegador');
    }

  } catch (error) {
    console.error('Error al descargar reporte de clase:', error);
    throw error;
  }
};

// Descargar reporte CSV de un evento específico
export const descargarReporteEvento = async (idEvento, nombreEvento) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const url = `${API_URL}/reportes/evento/${idEvento}/csv?token=${token}`;
    
    // Abrir el URL en el navegador para descargar
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return { success: true, message: 'Abriendo reporte en navegador...' };
    } else {
      throw new Error('No se puede abrir el navegador');
    }

  } catch (error) {
    console.error('Error al descargar reporte de evento:', error);
    throw error;
  }
};

// Descargar reporte CSV de estadísticas por estudiante
export const descargarReporteEstudiantes = async (idClase, nombreClase) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const url = `${API_URL}/reportes/clase/${idClase}/estudiantes/csv?token=${token}`;
    
    // Abrir el URL en el navegador para descargar
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return { success: true, message: 'Abriendo reporte en navegador...' };
    } else {
      throw new Error('No se puede abrir el navegador');
    }

  } catch (error) {
    console.error('Error al descargar reporte de estudiantes:', error);
    throw error;
  }
};
