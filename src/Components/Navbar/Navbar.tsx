import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Logo_Blanco from "../../Images/Logo_Blanco.png";
import "./Navbar.css";

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="dropdown-container" ref={dropdownRef}>
          <button 
            className="Link Link_Acceder"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Acceder
          </button>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/registrar" className="dropdown-item">
                Registrarme
              </Link>
              <Link to="/login" className="dropdown-item">
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;