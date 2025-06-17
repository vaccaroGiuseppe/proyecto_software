import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Logo_Blanco from "../../Images/Logo_Blanco.png";
import "./Navbar.css";
import { supabase } from '../lib/../../supabaseClient';
import {useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar el estado de autenticación y tipo de usuario
  useEffect(() => {
    const checkAuthAndUserType = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authenticated = !!session;
        setIsAuthenticated(authenticated);

        if (authenticated && session?.user?.id) {
          // Consulta directa usando el UID de auth como id_usuario
          const { data: userData, error } = await supabase
            .from('usuario')
            .select('tipo')
            .eq('id_usuario', session.user.id)
            .single();

          if (error) {
            console.error('Error al obtener tipo de usuario:', error);
          } else if (userData) {
            setUserType(userData.tipo);
          }
        } else {
          setUserType(null);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      }
    };

    checkAuthAndUserType();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_,session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);

      if (authenticated && session?.user?.id) {
        // Obtener el tipo de usuario cuando cambia la autenticación
        const { data: userData, error } = await supabase
          .from('usuario')
          .select('tipo')
          .eq('id_usuario', session.user.id)
          .single();

        if (error) {
          console.error('Error al obtener tipo de usuario:', error);
        } else if (userData) {
          setUserType(userData.tipo);
        }
      } else {
        setUserType(null);
      }
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
    // 1. Cerrar sesión en Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // 2. Limpiar estados locales inmediatamente
    setIsAuthenticated(false);
    setUserType(null);
    
    // 3. Redirigir a la página de inicio
    navigate('/');
    
    // 4. Forzar recarga si es necesario (opcional)
    window.location.reload();
    
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
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
        
        {/* Mostrar enlaces adicionales para admin */}
        {isAuthenticated && location.pathname !== '/actualizar-contrasena'&& userType === 'admin' && (
          <>
            <Link className="Link Link_Nosotros" to="/crear-editar-eliminar-materia">
              Materias
            </Link>
            <Link className="Link Link_Nosotros" to="/abrir-seccion">
              Secciones
            </Link>
          </>
        )}
        
        {isAuthenticated && location.pathname !== '/actualizar-contrasena'? (
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
              <Link to="/Perfil" className="dropdown-item">
                Perfil
              </Link>
              <Link 
                to="/" 
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