// Ajusta BASE_URL según el dispositivo donde pruebas:
// - Emulador Android: http://10.0.2.2:3000/api
// - iOS simulator / web: http://localhost:3000/api
// - Dispositivo físico (Expo LAN): http://<TU_IP_LOCAL>:3000/api

export const BASE_URL = 'http://localhost:3000/api';

export const endpoints = {
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  crearClase: '/clases',
  eventos: '/asistencia/eventos'
};
