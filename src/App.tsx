import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./Pages/About/About";
import Home from "./Pages/Home/Home";
import "./App.css"
import Registrar from "./Pages/Registrar/Registrar";
import IniciarSesion from "./Pages/IniciarSesion/IniciarSesion";
import Perfil from "./Pages/Perfil/Perfil";
import ConfirmacionCorreo from "./Pages/ConfirmacionCorreo/ConfirmacionCorreo";
import AbrirSeccion from "./Pages/AbrirSeccion/AbrirSeccion";
import CrearEditarEliminarMateria from "./Pages/CrearEditarMateria/CrearEditarEliminarMateria";
import RecuperarContrasena from "./Components/RecuperarContrasena/RecuperarContrasena";
import ActualizarContrasena from "./Components/RecuperarContrasena/ActualizarContrasena";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/iniciarsesion" element={<IniciarSesion />} />
        <Route path="/Perfil" element={<Perfil />} />
        <Route path="/confirmacion-correo" element={<ConfirmacionCorreo />} />
        <Route path="/abrir-seccion" element={<AbrirSeccion />} />
        <Route path="/crear-editar-eliminar-materia" element={<CrearEditarEliminarMateria />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/actualizar-contrasena" element={<ActualizarContrasena />} />
      </Routes>
    </Router>
  );
}

export default App;
