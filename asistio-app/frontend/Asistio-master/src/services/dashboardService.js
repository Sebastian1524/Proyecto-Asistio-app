import { BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function obtenerToken() {
  return await AsyncStorage.getItem('token');
}

export async function obtenerDashboardClase(idClase) {
  const token = await obtenerToken();
  const url = `${BASE_URL}/dashboard/clase/${idClase}`;
  
  try {
    console.log('[dashboardService] GET', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log('[dashboardService] response', res.status, data);
    
    if (!res.ok) throw new Error(data.message || 'Error al cargar dashboard de clase');
    
    return data.data || data;
  } catch (err) {
    console.error('[dashboardService] error', err.message);
    throw err;
  }
}

export async function obtenerDashboardEstudiante() {
  const token = await obtenerToken();
  const url = `${BASE_URL}/dashboard/estudiante`;
  
  try {
    console.log('[dashboardService] GET', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    console.log('[dashboardService] response', res.status, data);
    
    if (!res.ok) throw new Error(data.message || 'Error al cargar dashboard de estudiante');
    
    return data.data || data;
  } catch (err) {
    console.error('[dashboardService] error', err.message);
    throw err;
  }
}
