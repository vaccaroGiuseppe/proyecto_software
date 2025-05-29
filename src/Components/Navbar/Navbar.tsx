import { Link } from "react-router-dom";
import { useRef } from "react";
import Logo_Blanco from "../../Images/Logo_Blanco.png";
import "./Navbar.css";

function Navbar() {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mostrar u ocultar el dropdown al pasar el mouse
  const handleMouseEnter = () => {
    if (dropdownRef.current) {
      dropdownRef.current.classList.add("dropdown-visible");
    }
  };

  const handleMouseLeave = () => {
    if (dropdownRef.current) {
      dropdownRef.current.classList.remove("dropdown-visible");
    }
  };

  return (
    <nav className="Navbar">
      <div className="Navbar_Contenedor_Logo">
        <Link to="/">
          <img src={Logo_Blanco} alt="Logo Unimet" className="Logo" />
        </Link>
      </div>

      <div className="Navbar_Contenedor_Links">
        <Link className="Link Link_Nosotros" to="/about">
          Nosotros
        </Link>
        <div 
          className="dropdown-container" 
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="Link Link_Acceder">
            Acceder
          </button>
          
          <div className="dropdown-menu">
            <Link to="/registrar" className="dropdown-item">
              Registrarme
            </Link>
            <Link to="/login" className="dropdown-item">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;