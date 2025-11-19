import { BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function obtenerToken() {
  return await AsyncStorage.getItem('token');
}

export async function obtenerEventos() {
  const token = await obtenerToken();
  const url = `${BASE_URL}/asistencia/eventos`;
  
  try {
    console.log('[eventosService] GET', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log('[eventosService] response', res.status, data);
    
    if (!res.ok) throw new Error(data.message || 'Error al obtener eventos');
    
    return data.data || data;
  } catch (err) {
    console.error('[eventosService] error', err.message);
    throw err;
  }
}

export async function obtenerEventoPorId(idEvento) {
  const token = await obtenerToken();
  const url = `${BASE_URL}/asistencia/eventos/${idEvento}`;
  
  try {
    console.log('[eventosService] GET', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log('[eventosService] response', res.status, data);
    
    if (!res.ok) throw new Error(data.message || 'Error al obtener evento');
    
    return data.data || data;
  } catch (err) {
    console.error('[eventosService] error', err.message);
    throw err;
  }
}

export async function registrarAsistencia(tokenQR) {
  const token = await obtenerToken();
  const url = `${BASE_URL}/asistencia/asistencia-qr`;
  
  try {
    console.log('[eventosService] POST registrar asistencia', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token: tokenQR })
    });
    
    const data = await res.json();
    console.log('[eventosService] response', res.status, data);
    
    if (!res.ok) throw new Error(data.message || 'Error al registrar asistencia');
    
    return data.data || data;
  } catch (err) {
    console.error('[eventosService] error', err.message);
    throw err;
  }
}
