import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaSearch, FaSpinner } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import "./BuscarProfesor.css";

type Profesor = {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  tipo: string;
};

type HorarioConsulta = {
  id_consulta: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  id_profesor: string;
};

type HorarioAgendadoConProfesor = HorarioConsulta & {
  nombreProfesor?: string;
  apellidoProfesor?: string;
};

export default function BuscarProfesor() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Profesor[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Para horarios agendados
  const [idEstudiante, setIdEstudiante] = useState<string | null>(null);
  const [horariosAgendados, setHorariosAgendados] = useState<HorarioAgendadoConProfesor[]>([]);
  const [loadingHorario, setLoadingHorario] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);

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

  // Obtener id del estudiante logueado y cargar horarios agendados
  useEffect(() => {
    const getUserAndHorarios = async () => {
      setLoadingHorario(true);
      const { data: { user } } = await supabase.auth.getUser();
      setIdEstudiante(user?.id ?? null);
      if (user?.id) {
        console.log('idEstudiante:', idEstudiante);
        // Traer todos los horarios agendados por el estudiante
        const { data: horarios, error } = await supabase
          .from('horario_consulta')
          .select('id_consulta, dia_semana, hora_inicio, hora_fin, id_profesor')
          .eq('id_estudiante', user.id);

        if (error || !horarios || horarios.length === 0) {
          setHorariosAgendados([]);
        } else {
          // Obtener los ids únicos de profesores
          const idsProfesores = [...new Set(horarios.map(h => h.id_profesor))];
          // Traer los datos de los profesores
          const { data: datosProfesores, error: errorProfesores } = await supabase
            .from('usuario')
            .select('id_usuario, nombre, apellido')
            .in('id_usuario', idsProfesores);
            console.log(errorProfesores)

          // Mapear los nombres a los horarios
          const horariosConProfesor = horarios.map(horario => {
            const profe = datosProfesores?.find(p => p.id_usuario === horario.id_profesor);
            return {
              ...horario,
              nombreProfesor: profe?.nombre || '',
              apellidoProfesor: profe?.apellido || '',
            };
          });
          setHorariosAgendados(horariosConProfesor);
        }
      } else {
        setHorariosAgendados([]);
      }
      setLoadingHorario(false);
    };
    getUserAndHorarios();
  }, [mensaje]);

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

  const formatHora = (hora: string) =>
    new Date(`1970-01-01T${hora}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Eliminar horario agendado
  const handleEliminarAgendado = async (id_consulta: string) => {
    setMensaje(null);
    setLoadingHorario(true);
    const { error } = await supabase
      .from('horario_consulta')
      .update({ disponibilidad: true, id_estudiante: null })
      .eq('id_consulta', id_consulta);
    if (error) {
      setMensaje('Error al eliminar el horario agendado');
    } else {
      setMensaje('¡Horario agendado eliminado correctamente!');
    }
    setLoadingHorario(false);
    setTimeout(() => setMensaje(null), 3000);
  };

  return (
    <div className='fullpues1'>
      <div className="buscar-profe-container">
        <div className="header-section">
          <h1 className="main-title1">Buscar Profesores</h1>
        </div>

        {/* Horarios de consulta agendados */}
        <div className="agendado-section">
          <h1 className="mini">Horarios de consulta agendados:</h1>
          {mensaje && <div className="alert-message success-message">{mensaje}</div>}
          {loadingHorario ? (
            <div className="loading-secciones">
              <FaSpinner className="spinner" /> Cargando horarios agendados...
            </div>
          ) : horariosAgendados.length > 0 ? (
            <ul style={{ paddingLeft: 0 }}>
              {horariosAgendados.map((horario) => (
                <li key={horario.id_consulta} className="horario-agendado" style={{ listStyle: 'none', marginBottom: 10 }}>
                  <span>
                    <strong>{horario.dia_semana}:</strong> {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                    {' | '}
                    <strong>Profesor:</strong> {horario.nombreProfesor} {horario.apellidoProfesor}
                  </span>
                  <button
                    className="submit-button"
                    style={{ marginLeft: 16 }}
                    onClick={() => handleEliminarAgendado(horario.id_consulta)}
                    disabled={loadingHorario}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-horario-agendado">No tienes ningún horario de consulta agendado.</div>
          )}
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
    </div>
  );
}