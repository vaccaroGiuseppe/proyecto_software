import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaSpinner } from 'react-icons/fa';
import "./SeccionesProfesor.css";
import { useNavigate } from 'react-router-dom';

type SeccionFormateada = {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  nombre_profesor: string;
  horario: string;
  modalidad: string;
  salon: string | null;
  preparador?: {
    nombre: string;
    apellido: string;
    correo: string;
  } | null;
};

type SeccionesProfesorProps = {
  onSeccionSelect?: (idSeccion: string) => void;
};

export default function SeccionesProfesor({ onSeccionSelect }: SeccionesProfesorProps) {
  const [secciones, setSecciones] = useState<SeccionFormateada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idProfesor, setIdProfesor] = useState<string | null>(null);
  const navigate = useNavigate();

  // Obtener el ID del profesor de la sesión actual
  useEffect(() => {
    const obtenerIdProfesor = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIdProfesor(user.id);
        } else {
          setError('No se pudo obtener la información del usuario');
          setLoading(false);
        }
      } catch (err) {
        setError('Error al obtener la sesión del usuario');
        console.error('Error al obtener sesión:', err);
        setLoading(false);
      }
    };

    obtenerIdProfesor();
  }, []);

  // Cargar secciones del profesor cuando se obtenga el ID
  useEffect(() => {
    if (!idProfesor) return;

    const cargarSecciones = async () => {
      try {
        // Obtener las secciones del profesor
        const { data: seccionesData, error: seccionesError } = await supabase
          .from('seccion')
          .select('id_seccion, codigo_materia, id_profesor, id_horario, salon, id_preparador')
          .eq('id_profesor', idProfesor);

        if (seccionesError) throw seccionesError;

        if (!seccionesData || seccionesData.length === 0) {
          setSecciones([]);
          setLoading(false);
          return;
        }

        const codigosMateria = [...new Set(seccionesData?.map(s => s.codigo_materia))];
        const idsHorarios = [...new Set(seccionesData?.map(s => s.id_horario))];
        const idsPreparadores = seccionesData
          .map(s => s.id_preparador)
          .filter(id => id !== null) as string[];

        // Obtener información adicional en paralelo
        const [
          { data: materiasData },
          { data: profesorData },
          { data: horariosData },
          { data: preparadoresData }
        ] = await Promise.all([
          supabase.from('materia').select('codigo_materia, nombre').in('codigo_materia', codigosMateria),
          supabase.from('usuario').select('id_usuario, nombre, apellido').eq('id_usuario', idProfesor),
          supabase.from('horario_clase').select('id_horario_clase, dia_semana, hora_inicio, hora_fin, modalidad').in('id_horario_clase', idsHorarios),
          idsPreparadores.length > 0 
            ? supabase.from('usuario').select('id_usuario, nombre, apellido, correo').in('id_usuario', idsPreparadores)
            : { data: [] }
        ]);

        const preparadoresMap = new Map(
          preparadoresData?.map(prep => [prep.id_usuario, prep]) || []
        );

        const seccionesFormateadas = seccionesData?.map(seccion => {
          const materia = materiasData?.find(m => m.codigo_materia === seccion.codigo_materia);
          const profesor = profesorData?.[0];
          const horario = horariosData?.find(h => h.id_horario_clase === seccion.id_horario);
          const preparador = seccion.id_preparador 
            ? preparadoresMap.get(seccion.id_preparador) 
            : null;

          return {
            id_seccion: seccion.id_seccion,
            codigo_materia: seccion.codigo_materia,
            nombre_materia: materia?.nombre || 'Sin nombre',
            nombre_profesor: profesor ? `${profesor.nombre} ${profesor.apellido}` : 'Sin profesor',
            horario: horario ? `${horario.dia_semana} ${horario.hora_inicio}-${horario.hora_fin}` : 'Sin horario',
            modalidad: horario?.modalidad || '',
            salon: seccion.salon,
            preparador: preparador ? {
              nombre: preparador.nombre,
              apellido: preparador.apellido,
              correo: preparador.correo
            } : null
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
  }, [idProfesor]);

  const handleClickSeccion = (idSeccion: string) => {
    if (onSeccionSelect) {
      onSeccionSelect(idSeccion);
    } else {
      navigate(`/verseccion/${idSeccion}`);
    }
  };

  return (
    <div className="buscador1">
      <h1 className="dashboar-title1">Mis Secciones</h1>

      <div className="buscador-simplificado1">
        {loading && (
          <div className="loading-secciones1">
            <FaSpinner className="spinner" /> Cargando secciones...
          </div>
        )}

        {error && (
          <div className="alert-message error-message">
            Error: {error}
          </div>
        )}

        {!loading && !error && secciones.length === 0 && (
          <div className="alert-message">
            No tienes secciones asignadas.
          </div>
        )}

        {secciones.length > 0 && (
          <div className="results-container1">
            <div className="results-list1">
              {secciones.map((seccion) => (
                <div 
                  key={seccion.id_seccion} 
                  className="result-item1"
                  onClick={() => handleClickSeccion(seccion.codigo_materia)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="result-header1">
                    <span className="materia-codigo1">{seccion.codigo_materia}</span>
                    <span className="materia-nombre1">{seccion.nombre_materia}</span>
                  </div>
                  <div className="result-details1">
                    <span><strong>Profesor:</strong> {seccion.nombre_profesor}</span>
                    <span><strong>Horario:</strong> {seccion.horario} ({seccion.modalidad})</span>
                    <span><strong>Salón:</strong> {seccion.salon || 'No asignado'}</span>
                    <span>
                      <strong>Preparador:</strong> 
                      {seccion.preparador 
                        ? ` ${seccion.preparador.nombre} ${seccion.preparador.apellido} (${seccion.preparador.correo})`
                        : ' No asignado'}
                    </span>
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