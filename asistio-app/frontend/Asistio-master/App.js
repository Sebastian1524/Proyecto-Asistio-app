import 'react-native-get-random-values'; //Permite usar Math.random() seguro
import 'react-native-gesture-handler'; //Maneja gestos (toques, deslizes)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; //Contenedor de navegación
import { createNativeStackNavigator } from '@react-navigation/native-stack'; //Creador de pantallas
import { AnimacionProvider } from './src/contexto/AnimacionContext';  //Estado global para animaciones
import { AuthProvider } from './src/contexto/AuthContext';  //Estado global para autenticación

import PantallaBienvenida from './src/pantallas/PantallaBienvenida';
import PantallaLogin from './src/pantallas/PantallaLogin';
import PantallaActivacionCuenta from './src/pantallas/PantallaActivacionCuenta';
import PantallaActivacionContraseña from './src/pantallas/PantallaActivacionContrasena';
import PantallaHome from './src/pantallas/PantallaHome';
import PantallaClases from './src/pantallas/PantallaClases';
import PantallaEventos from './src/pantallas/PantallaEventos';
import PantallaEscanearQR from './src/pantallas/PantallaEscanearQR';
import PantallaCrearClase from './src/pantallas/PantallaCrearClase';
import PantallaCrearEvento from './src/pantallas/PantallaCrearEvento';

const Stack = createNativeStackNavigator(); //Crea el navegador de pantallas

export default function App() {
  return (
    <AuthProvider>
      <AnimacionProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              detachPreviousScreen: true,
            }}
          >
            <Stack.Screen 
              name="PantallaBienvenida"
              component={PantallaBienvenida}
              options={{
                animation: 'none',
                detachPreviousScreen: false,
              }}
            />
            <Stack.Screen 
              name="PantallaLogin" 
              component={PantallaLogin}
              options={{
                animation: 'none',
                detachPreviousScreen: false,
              }}
            />
            <Stack.Screen 
              name="PantallaActivacionCuenta" 
              component={PantallaActivacionCuenta}
              options={{ 
                animation: 'none',
                detachPreviousScreen: false,
              }}
            />
            <Stack.Screen 
              name="PantallaActivacionContraseña" 
              component={PantallaActivacionContraseña}
              options={{ 
                animation: 'none',
                detachPreviousScreen: false,
              }}
            />
            <Stack.Screen 
              name="Home" 
              component={PantallaHome}
              options={{ 
                animation: 'fade',
              }}
            />
            <Stack.Screen 
              name="Clases" 
              component={PantallaClases}
              options={{ 
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="Eventos" 
              component={PantallaEventos}
              options={{ 
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="EscanearQR" 
              component={PantallaEscanearQR}
              options={{ 
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="CrearClase" 
              component={PantallaCrearClase}
              options={{ 
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="CrearEvento" 
              component={PantallaCrearEvento}
              options={{ 
                animation: 'slide_from_right',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AnimacionProvider>
    </AuthProvider>
  );
}