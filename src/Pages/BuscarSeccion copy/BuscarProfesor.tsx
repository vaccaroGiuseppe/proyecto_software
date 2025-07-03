import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaSearch, FaSpinner } from 'react-icons/fa';

import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import "./BuscarProfesor.css";

type Profesor = {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  tipo: string;
};

export default function BuscarProfesor() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Profesor[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar profesores al montar el componente
  useEffect(() => {
    const cargarProfesores = async () => {
      try {
        const { data, error } = await supabase
          .from('usuario')
          .select('id_usuario, nombre, apellido, correo, tipo')
          .eq('tipo', 'profesor');

        if (error) throw error;
        setProfesores(data || []);
      } catch (err) {
        setError('Error al cargar los profesores');
        console.error('Error al cargar profesores:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarProfesores();
  }, []);

  // Filtrar resultados según la búsqueda
  useEffect(() => {
    if (busqueda.trim() === '' && !mostrarTodos) {
      setResultados([]);
      return;
    }

    const termino = busqueda.toLowerCase();
    const filtrados = profesores.filter(profesor =>
      profesor.nombre.toLowerCase().includes(termino) ||
      profesor.apellido.toLowerCase().includes(termino) ||
      profesor.correo.toLowerCase().includes(termino)
    );

    setResultados(mostrarTodos ? profesores : filtrados);
  }, [busqueda, profesores, mostrarTodos]);

  const toggleMostrarTodos = () => {
    setMostrarTodos(!mostrarTodos);
    if (!mostrarTodos && busqueda.trim() === '') {
      setResultados(profesores);
    } else if (!mostrarTodos) {
      const termino = busqueda.toLowerCase();
      const filtrados = profesores.filter(profesor =>
        profesor.nombre.toLowerCase().includes(termino) ||
        profesor.apellido.toLowerCase().includes(termino) ||
        profesor.correo.toLowerCase().includes(termino)
      );
      setResultados(filtrados);
    } else {
      setResultados([]);
    }
  };

  return (
    <div className='fullpues1'>
      

      <div className="buscar-profe-container">
        <div className="header-section">
          <h1 className="main-title">Buscar Profesores</h1>
          <p className="subtitle">Encuentra los profesores registrados</p>
        </div>

        <div className="search-container">
          <div className="search-card">
            {error && (
              <div className="alert-message error-message">
                Error: {error}
              </div>
            )}

            <div className="search-form">
              <div className="form-group search-group">
                <div className="search-input-container">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setMostrarTodos(false);
                    }}
                    className="form-input search-input"
                    placeholder="Buscar por nombre, apellido o correo..."
                  />
                  <button
                    type="button"
                    className={`show-all-button ${mostrarTodos ? 'active' : ''}`}
                    onClick={toggleMostrarTodos}
                    title={mostrarTodos ? 'Ocultar resultados' : 'Mostrar todos los profesores'}
                  >
                    {mostrarTodos ? 'Ocultar' : 'Mostrar todos'}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading-secciones">
                  <FaSpinner className="spinner" /> Cargando profesores...
                </div>
              ) : (
                resultados.length > 0 && (
                  <div className="results-container">
                    <div className="results-list">
                      {resultados.map((profesor) => (
                        <div
                          key={profesor.id_usuario}
                          className="result-item"
                          // Puedes cambiar la navegación si tienes una página de perfil de profesor
                          onClick={() => navigate(`/perfilprofesor/${profesor.id_usuario}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="result-header">
                            <span className="materia-codigo">{profesor.nombre} {profesor.apellido}</span>
                          </div>
                          <div className="result-details">
                            <span><strong>Correo:</strong> {profesor.correo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}