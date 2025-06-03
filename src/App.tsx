import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./Pages/About/About";
import Home from "./Pages/Home/Home";
import "./App.css"
import Registrar from "./Pages/Registrar/Registrar";
import IniciarSesion from "./Pages/IniciarSesion/IniciarSesion";
import UserAccountPage from "./Pages/StudentProfile/UserAccountPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/iniciarsesion" element={<IniciarSesion />} />
        <Route path="/Perfil" element={<UserAccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;
