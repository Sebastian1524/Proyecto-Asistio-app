import { BASE_URL, endpoints } from '../config/api';

export async function login(email, password) {
  const url = `${BASE_URL}${endpoints.authLogin}`;
  try {
    console.log('[authService] POST', url, { email });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    let data;
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text();
      console.log('[authService] response text:', text);
      throw new Error('Respuesta no JSON del servidor');
    }
    console.log('[authService] response', res.status, data);
    if (!res.ok) throw new Error(data.message || `Error en login (status ${res.status})`);
    return data; // contiene token y usuario según backend
  } catch (err) {
    console.error('[authService] error', err.message || err);
    throw err;
  }
}
