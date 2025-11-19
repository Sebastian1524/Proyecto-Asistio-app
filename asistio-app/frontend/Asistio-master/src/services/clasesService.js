import { BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function obtenerToken() {
  return await AsyncStorage.getItem('token');
}

export async function obtenerClases() {
  const token = await obtenerToken();
  const url = `${BASE_URL}/clases`;
  
  try {
    console.log('[clasesService] GET', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log('[clasesService] response', res.status, data);
    
    if (!res.ok) throw new Error(data.message || 'Error al obtener clases');
    
    return data.data || data;
  } catch (err) {
    console.error('[clasesService] error', err.message);
    throw err;
  }
}

export async function crearClase(datosClase) {
  const token = await obtenerToken();
  const url = `${BASE_URL}/clases`;
  
  try {
    console.log('[clasesService] POST', url, datosClase);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(datosClase)
    });
    
    const data = await res.json();
    console.log('[clasesService] response', res.status, data);
    
    if (!res.ok) throw new Error(data.message || 'Error al crear clase');
    
    return data.data || data;
  } catch (err) {
    console.error('[clasesService] error', err.message);
    throw err;
  }
}

export async function obtenerDetalleClase(idClase) {
  const token = await obtenerToken();
  const url = `${BASE_URL}/clases/${idClase}`;
  
  try {
    console.log('[clasesService] GET', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log('[clasesService] response', res.status, data);
    
    if (!res.ok) throw new Error(data.message || 'Error al obtener detalles');
    
    return data.data || data;
  } catch (err) {
    console.error('[clasesService] error', err.message);
    throw err;
  }
}
