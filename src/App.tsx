import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./Pages/About/About";
import Home from "./Pages/Home/Home";
import "./App.css";
import Registrar from "./Pages/Registrar/Registrar";
import IniciarSesion from "./Pages/IniciarSesion/IniciarSesion";
import Perfil from "./Pages/Perfil/Perfil";
import ConfirmacionCorreo from "./Pages/ConfirmacionCorreo/ConfirmacionCorreo";
import AbrirSeccion from "./Pages/AbrirSeccion/AbrirSeccion";
import CrearEditarEliminarMateria from "./Pages/CrearEditarMateria/CrearEditarEliminarMateria";
import RecuperarContrasena from "./Components/RecuperarContrasena/RecuperarContrasena";
import ActualizarContrasena from "./Components/RecuperarContrasena/ActualizarContrasena";
import { AuthProvider } from './context/AuthContext';
import { AuthCallback } from './context/AuthCallBack';
import { PrivateRoute } from './Components/PrivateRoute';
import { CompletarPerfil } from './Pages/CompletarPerfil/CompletarPerfil';




function App() {
  return (
    
      <Router>
        <AuthProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/registrar" element={<Registrar />} />
            <Route path="/iniciarsesion" element={<IniciarSesion />} />
            <Route path="/confirmacion-correo" element={<ConfirmacionCorreo />} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
            <Route path="/actualizar-contrasena" element={<ActualizarContrasena />} />
            
            {/* Ruta de callback para autenticación con Google*/}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Rutas protegidas (requieren autenticación) */}
            <Route 
              path="/perfil" 
              element={
                <PrivateRoute>
                  <Perfil />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/abrir-seccion" 
              element={
                <PrivateRoute>
                  <AbrirSeccion />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/crear-editar-eliminar-materia" 
              element={
                <PrivateRoute>
                  <CrearEditarEliminarMateria />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/completar-perfil" 
              element={
                <PrivateRoute>
                  <CompletarPerfil />
                </PrivateRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </Router>
   
  );
}

export default App;