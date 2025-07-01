import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import "./BuscadorSeccion.css";
import { useNavigate } from 'react-router-dom';


type SeccionFormateada = {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  nombre_profesor: string;
  horario: string;
  modalidad: string;
  salon: string | null;
};

type BuscadorSeccionesProps = {
  onSeccionSelect?: (idSeccion: string) => void;
};

export default function BuscadorSecciones({ onSeccionSelect }: BuscadorSeccionesProps) {
  const [secciones, setSecciones] = useState<SeccionFormateada[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<SeccionFormateada[]>([]);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();


  // Cargar secciones al montar el componente
  useEffect(() => {
    const cargarSecciones = async () => {
      try {
        const { data: seccionesData, error: seccionesError } = await supabase
          .from('seccion')
          .select('id_seccion, codigo_materia, id_profesor, id_horario, salon');

        if (seccionesError) throw seccionesError;

        const codigosMateria = [...new Set(seccionesData?.map(s => s.codigo_materia))];
        const idsProfesores = [...new Set(seccionesData?.map(s => s.id_profesor))];
        const idsHorarios = [...new Set(seccionesData?.map(s => s.id_horario))];

        const [
          { data: materiasData },
          { data: profesoresData },
          { data: horariosData }
        ] = await Promise.all([
          supabase.from('materia').select('codigo_materia, nombre').in('codigo_materia', codigosMateria),
          supabase.from('usuario').select('id_usuario, nombre, apellido').in('id_usuario', idsProfesores),
          supabase.from('horario_clase').select('id_horario_clase, dia_semana, hora_inicio, hora_fin, modalidad').in('id_horario_clase', idsHorarios)
        ]);

        const seccionesFormateadas = seccionesData?.map(seccion => {
          const materia = materiasData?.find(m => m.codigo_materia === seccion.codigo_materia);
          const profesor = profesoresData?.find(p => p.id_usuario === seccion.id_profesor);
          const horario = horariosData?.find(h => h.id_horario_clase === seccion.id_horario);

          return {
            id_seccion: seccion.id_seccion,
            codigo_materia: seccion.codigo_materia,
            nombre_materia: materia?.nombre || 'Sin nombre',
            nombre_profesor: profesor ? `${profesor.nombre} ${profesor.apellido}` : 'Sin profesor',
            horario: horario ? `${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}` : 'Sin horario',
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
    }

  };
const handleClickSeccion = (idSeccion: string) => {
    if (onSeccionSelect) {
      onSeccionSelect(idSeccion);
    } else {
      // Redirección por defecto si no se proporciona onSeccionSelect
      navigate(`/verseccion/${idSeccion}`);
    }
  };
  return (
    <div className="buscador">
            <h1 className="dashboar-title">Busca tu Sección</h1>

        <div className="buscador-simplificado">
        <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
            type="text"
            value={busqueda}
            onChange={(e) => {
                setBusqueda(e.target.value);
                setMostrarTodas(false);
            }}
            className="search-input"
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

        {loading && (
            <div className="loading-secciones">
            <FaSpinner className="spinner" /> Cargando secciones...
            </div>
        )}

        {error && (
            <div className="alert-message error-message">
            Error: {error}
            </div>
        )}

        {resultados.length > 0 && (
            <div className="results-container">
            <div className="results-list">
                {resultados.map((seccion) => (
                <div 
                    key={seccion.id_seccion} 
                    className="result-item"
                    onClick={() => handleClickSeccion(seccion.id_seccion)}
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
        )}
        </div>
    </div>
  );
}