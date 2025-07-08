import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import "./BuscarSeccion.css";

type SeccionFormateada = {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  nombre_profesor: string;
  horario: string;
  modalidad: string;
  salon: string | null;
};

export default function BuscarSeccion() {
  const [secciones, setSecciones] = useState<SeccionFormateada[]>([]);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<SeccionFormateada[]>([]);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar secciones al montar el componente
  useEffect(() => {
    const cargarSecciones = async () => {
      try {
        // Obtener todas las secciones con datos relacionados
        const { data: seccionesData, error: seccionesError } = await supabase
          .from('seccion')
          .select('id_seccion, codigo_materia, id_profesor, id_horario, salon');

        if (seccionesError) throw seccionesError;

        // Obtener datos relacionados
        const codigosMateria = [...new Set(seccionesData?.map(s => s.codigo_materia))];
        const idsProfesores = [...new Set(seccionesData?.map(s => s.id_profesor))];
        const idsHorarios = [...new Set(seccionesData?.map(s => s.id_horario))];

        const [
          { data: materiasData },
          { data: profesoresData },
          { data: horariosData }
        ] = await Promise.all([
          supabase
            .from('materia')
            .select('codigo_materia, nombre')
            .in('codigo_materia', codigosMateria),
          supabase
            .from('usuario')
            .select('id_usuario, nombre, apellido')
            .in('id_usuario', idsProfesores),
          supabase
            .from('horario_clase')
            .select('id_horario_clase, dia_semana, hora_inicio, hora_fin, modalidad')
            .in('id_horario_clase', idsHorarios)
        ]);

        // Formatear los datos
        const seccionesFormateadas = seccionesData?.map(seccion => {
          const materia = materiasData?.find(m => m.codigo_materia === seccion.codigo_materia);
          const profesor = profesoresData?.find(p => p.id_usuario === seccion.id_profesor);
          const horario = horariosData?.find(h => h.id_horario_clase === seccion.id_horario);

          return {
            id_seccion: seccion.id_seccion,
            codigo_materia: seccion.codigo_materia,
            nombre_materia: materia?.nombre || 'Sin nombre',
            nombre_profesor: profesor 
              ? `${profesor.nombre} ${profesor.apellido}` 
              : 'Sin profesor',
            horario: horario
              ? `${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}`
              : 'Sin horario',
            modalidad: horario?.modalidad || '',
            salon: seccion.salon
          };
        }) || [];

        setSecciones(seccionesFormateadas);
      } catch (err) {
        setError('Error al cargar las secciones');
        console.error('Error al cargar secciones:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarSecciones();
  }, []);

  // Filtrar resultados según la búsqueda
  useEffect(() => {
    if (busqueda.trim() === '' && !mostrarTodas) {
      setResultados([]);
      return;
    }

    const termino = busqueda.toLowerCase();
    const filtrados = secciones.filter(seccion => 
      seccion.codigo_materia.toLowerCase().includes(termino) ||
      seccion.nombre_materia.toLowerCase().includes(termino) ||
      seccion.nombre_profesor.toLowerCase().includes(termino) ||
      seccion.horario.toLowerCase().includes(termino)
    );

    setResultados(mostrarTodas ? secciones : filtrados);
  }, [busqueda, secciones, mostrarTodas]);

  const toggleMostrarTodas = () => {
    setMostrarTodas(!mostrarTodas);
    if (!mostrarTodas && busqueda.trim() === '') {
      setResultados(secciones);
    } else if (!mostrarTodas) {
      // Mantener los resultados filtrados si hay búsqueda
      const termino = busqueda.toLowerCase();
      const filtrados = secciones.filter(seccion => 
        seccion.codigo_materia.toLowerCase().includes(termino) ||
        seccion.nombre_materia.toLowerCase().includes(termino) ||
        seccion.nombre_profesor.toLowerCase().includes(termino) ||
        seccion.horario.toLowerCase().includes(termino)
      );
      setResultados(filtrados);
    } else {
      setResultados([]);
    }
  };

  return (
    <div className='fullpues'>
    <Navbar/>

    <div className="buscar-seccion-container">
     <div className="header-section">
        <h1 className="main-title">Buscar Secciones</h1>
        <p className="subtitle">Encuentra las secciones disponibles</p>
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
                    setMostrarTodas(false);
                  }}
                  className="form-input search-input"
                  placeholder="Buscar por código, materia, profesor..."
                />
                <button
                  type="button"
                  className={`show-all-button ${mostrarTodas ? 'active' : ''}`}
                  onClick={toggleMostrarTodas}
                  title={mostrarTodas ? 'Ocultar resultados' : 'Mostrar todas las secciones'}
                >
                  {mostrarTodas ? 'Ocultar' : 'Mostrar todas'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-secciones">
                <FaSpinner className="spinner" /> Cargando secciones...
              </div>
            ) : (
              resultados.length > 0 && (
                <div className="results-container">
                  <div className="results-list">
                    {resultados.map((seccion) => (
                      <div 
                        key={seccion.id_seccion} 
                        className="result-item"
                        onClick={() => navigate(`/verseccion/${seccion.id_seccion}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="result-header">
                          <span className="materia-codigo">{seccion.id_seccion}</span>
                          <span className="materia-nombre">{seccion.nombre_materia}</span>
                        </div>
                        <div className="result-details">
                          <span><strong>Profesor:</strong> {seccion.nombre_profesor}</span>
                          <span><strong>Horario:</strong> {seccion.horario} ({seccion.modalidad})</span>
                          <span><strong>Salón:</strong> {seccion.salon || 'No asignado'}</span>
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
    <Footer/>
    </div>
    
  );
}