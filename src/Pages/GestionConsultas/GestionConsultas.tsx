import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import AddHorarioConsulta from '../AddHorarioConsulta/AddHorarioConsulta';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './GestionConsultas.css';

type HorarioConsulta = {
  id_consulta: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  disponibilidad: boolean;
  id_estudiante: string | null;
};

type Usuario = {
  id_usuario: string;
  nombre: string;
  apellido: string;
};

export default function GestionConsultas() {
  const [horarios, setHorarios] = useState<HorarioConsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<Record<string, Usuario>>({});

  // Obtener el id del usuario autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIdUsuario(user?.id ?? null);
    };
    getUser();
  }, []);

  // Cargar horarios de consulta del profesor
  const cargarHorarios = async () => {
    if (!idUsuario) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('horario_consulta')
      .select('id_consulta, dia_semana, hora_inicio, hora_fin, disponibilidad, id_estudiante')
      .eq('id_profesor', idUsuario)
      .order('dia_semana', { ascending: true })
      .order('hora_inicio', { ascending: true });
    if (error) {
      setMensaje({ texto: 'Error al cargar los horarios', tipo: 'error' });
      setHorarios([]);
      setEstudiantes({});
    } else {
      setHorarios(data || []);
      // Buscar los estudiantes solo si hay horarios agendados
      const idsEstudiantes = (data || [])
        .filter((h: HorarioConsulta) => !h.disponibilidad && h.id_estudiante)
        .map((h: HorarioConsulta) => h.id_estudiante as string);

      if (idsEstudiantes.length > 0) {
        const { data: usuarios, error: errorUsuarios } = await supabase
          .from('usuario')
          .select('id_usuario, nombre, apellido')
          .in('id_usuario', idsEstudiantes);

        if (!errorUsuarios && usuarios) {
          // Crear un diccionario para acceso rápido
          const diccionario: Record<string, Usuario> = {};
          usuarios.forEach((u: Usuario) => {
            diccionario[u.id_usuario] = u;
          });
          setEstudiantes(diccionario);
        } else {
          setEstudiantes({});
        }
      } else {
        setEstudiantes({});
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (idUsuario) cargarHorarios();
    // eslint-disable-next-line
  }, [idUsuario]);

  // Borrar horario de consulta
  const borrarHorario = async (id_consulta: string) => {
    setLoading(true);
    setMensaje(null);
    const { error } = await supabase
      .from('horario_consulta')
      .delete()
      .eq('id_consulta', id_consulta);
    if (error) {
      setMensaje({ texto: 'Error al borrar el horario', tipo: 'error' });
    } else {
      setMensaje({ texto: 'Horario borrado exitosamente', tipo: 'exito' });
      await cargarHorarios();
    }
    setLoading(false);
  };

  // Formatear hora
  const formatHora = (hora: string) =>
    new Date(`1970-01-01T${hora}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Función para refrescar horarios después de agregar
  const handleHorarioAgregado = async () => {
    await cargarHorarios();
  };

  return (
    <div className="fullpues">
      <Navbar />
      <div className="gestion-consultas-container">
        <div className="header-section">
          <h1 className="main-title">Gestión de Horarios de Consulta</h1>
          <p className="subtitle">Agrega, visualiza y elimina tus horarios de consulta</p>
        </div>

        <div className="form-container1">
          <div className="gestion-consultas-card">
            {mensaje && (
              <div className={`alert-message ${mensaje.tipo}-message`}>
                {mensaje.tipo === 'exito' ? <FaCheck /> : <FaTimes />}
                {mensaje.texto}
              </div>
            )}

            {/* Componente para agregar horario */}
            {idUsuario && (
              <AddHorarioConsulta id_usuario={idUsuario} onHorarioAgregado={handleHorarioAgregado} />
            )}

            <h2 className="horarios-title">Tus horarios de consulta</h2>
            {loading ? (
              <div className="loading-message">Cargando horarios...</div>
            ) : horarios.length === 0 ? (
              <div className="no-horarios-message">No tienes horarios de consulta registrados.</div>
            ) : (
              <ul className="horarios-list">
                {horarios.map(horario => (
                  <li key={horario.id_consulta} className="horario-item">
                    <span>
                      <strong>{horario.dia_semana}:</strong> {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                      {' | '}
                      <strong>Estado:</strong>{' '}
                      {horario.disponibilidad
                        ? 'Disponible'
                        : estudiantes[horario.id_estudiante || '']
                          ? `Agendado por: ${estudiantes[horario.id_estudiante || ''].nombre} ${estudiantes[horario.id_estudiante || ''].apellido}`
                          : `Agendado por: ${horario.id_estudiante ?? 'Desconocido'}`}
                    </span>
                    <button
                      className="delete-horario-btn"
                      onClick={() => borrarHorario(horario.id_consulta)}
                      disabled={loading}
                      title="Eliminar horario"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}