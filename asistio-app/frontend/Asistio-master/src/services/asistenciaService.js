import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    throw new Error('Error al obtener token de autenticación');
  }
};

// Registrar asistencia por QR
export const registrarAsistenciaQR = async (tokenQR) => {
  try {
    // El token puede venir como string o como JSON
    let datosQR;
    try {
      datosQR = JSON.parse(tokenQR);
    } catch (e) {
      // Si no es JSON, asumir que es solo el token
      datosQR = { token: tokenQR };
    }

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/asistencia/asistencia-qr`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id_evento: datosQR.id_evento,
        token_unico: datosQR.token || tokenQR
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar asistencia');
    }

    return data;
  } catch (error) {
    console.error('Error en registrarAsistenciaQR:', error);
    throw error;
  }
};

// Obtener asistencias de un evento (para docentes)
export const obtenerAsistenciasEvento = async (idEvento) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/asistencia/eventos/${idEvento}/asistencias`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener asistencias');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error en obtenerAsistenciasEvento:', error);
    throw error;
  }
};

// Obtener reporte de asistencia del estudiante
export const obtenerReporteEstudiante = async (idClase) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/asistencia/reporte/estudiante/${idClase}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener reporte');
    }

    return data.data;
  } catch (error) {
    console.error('Error en obtenerReporteEstudiante:', error);
    throw error;
  }
};

// Obtener reporte completo de la clase (para docentes)
export const obtenerReporteClase = async (idClase) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/asistencia/reporte/clase/${idClase}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener reporte de clase');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error en obtenerReporteClase:', error);
    throw error;
  }
};

// Registrar asistencia manual (solo docentes)
export const registrarAsistenciaManual = async (idEvento, idUsuario, presente, justificacion) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/asistencia/asistencia-manual`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id_evento: idEvento,
        id_usuario: idUsuario,
        presente,
        justificacion
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar asistencia manual');
    }

    return data;
  } catch (error) {
    console.error('Error en registrarAsistenciaManual:', error);
    throw error;
  }
};
