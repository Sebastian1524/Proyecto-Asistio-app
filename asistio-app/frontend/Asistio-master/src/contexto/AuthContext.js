import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar token y usuario al iniciar
  useEffect(() => {
    cargarDatosAlmacenados();
  }, []);

  const cargarDatosAlmacenados = async () => {
    try {
      const tokenGuardado = await AsyncStorage.getItem('token');
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      
      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const login = async (datosLogin) => {
    try {
      // datosLogin viene del backend: { success: true, token, usuario }
      await AsyncStorage.setItem('token', datosLogin.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(datosLogin.usuario));
      
      setToken(datosLogin.token);
      setUsuario(datosLogin.usuario);
      
      return { success: true };
    } catch (error) {
      console.error('Error guardando login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      setToken(null);
      setUsuario(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const value = {
    usuario,
    token,
    cargando,
    estaAutenticado: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
