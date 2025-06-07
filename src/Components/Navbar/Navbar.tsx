import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Logo_Blanco from "../../Images/Logo_Blanco.png";
import "./Navbar.css";
import { supabase } from '../lib/../../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  // Verificar el estado de autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      // No necesitas navegar aquí, el listener de onAuthStateChange ya manejará el estado
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <nav className="Navbar">
        <div className="Navbar_Contenedor_Logo">
          <Link to="/">
            <img src={Logo_Blanco} alt="Logo Unimet" className="Logo" />
          </Link>
        </div>
      </nav>
    );
  }

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
        
        {isAuthenticated ? (
          <div 
            className="dropdown-container" 
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="Link Link_Acceder">
              Perfil
            </button>
            
            <div className="dropdown-menu">
              <Link to="/perfil" className="dropdown-item">
                Perfil
              </Link>
              <Link 
                to="#" 
                className="dropdown-item" 
                onClick={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
              >
                Cerrar Sesión
              </Link>
            </div>
          </div>
        ) : (
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
              <Link to="/iniciarsesion" className="dropdown-item">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;