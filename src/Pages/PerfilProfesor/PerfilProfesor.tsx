import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import './PerfilProfesor.css';

type Profesor = {
  id_usuario: string;
  nombre: string;
  correo: string;
};

type Seccion = {
  id_seccion: string;
  codigo_materia: string;
  salon: string;
};

type HorarioConsulta = {
  id_consulta: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  disponibilidad: boolean;
};

export default function PerfilProfesor() {
  const { id } = useParams<{ id: string }>();
  const [profesor, setProfesor] = useState<Profesor | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [horariosConsulta, setHorariosConsulta] = useState<HorarioConsulta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      // Datos del profesor
      const { data: profeData, error: profeError } = await supabase
        .from('usuario')
        .select('id_usuario, nombre, correo')
        .eq('id_usuario', id)
        .single();

      // Materias asignadas
      const { data: seccionesData, error: seccionesError } = await supabase
        .from('seccion')
        .select('id_seccion, codigo_materia, salon')
        .eq('id_profesor', id);

      // Horarios de consulta con disponibilidad TRUE
      const { data: horariosData, error: horariosError } = await supabase
        .from('horario_consulta')
        .select('id_consulta, dia_semana, hora_inicio, hora_fin, disponibilidad')
        .eq('id_profesor', id)
        .eq('disponibilidad', true);
        

      if (!profeError) setProfesor(profeData);
      if (!seccionesError) setSecciones(seccionesData || []);
      if (!horariosError) setHorariosConsulta(horariosData || []);
      setLoading(false);
    };

    if (id) fetchPerfil();
  }, [id]);

  // Formatear hora para mostrar solo HH:mm
  const formatHora = (hora: string) =>
    new Date(`1970-01-01T${hora}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="perfil-profesor-bg">
      <Navbar />
      <div className="perfil-profesor-main">
        {loading ? (
          <div className="perfil-profesor-loading">Cargando perfil del profesor...</div>
        ) : !profesor ? (
          <div className="perfil-profesor-error">No se encontró el profesor.</div>
        ) : (
          <div className="perfil-profesor-container">
            <h2>Perfil del Profesor</h2>
            <p><strong>Nombre:</strong> {profesor.nombre}</p>
            <p><strong>Correo:</strong> {profesor.correo}</p>
            <h3>Materias Asignadas</h3>
            {secciones.length === 0 ? (
              <p>No tiene materias asignadas.</p>
            ) : (
              <ul>
                {secciones.map(seccion => (
                  <li key={seccion.id_seccion}>
                    <strong>Código Materia:</strong> {seccion.codigo_materia} | <strong>Salón:</strong> {seccion.salon}
                  </li>
                ))}
              </ul>
            )}
            <h3>Horarios de Consulta Disponibles</h3>
            {horariosConsulta.length === 0 ? (
              <p>No tiene horarios de consulta disponibles.</p>
            ) : (
              <ul>
                {horariosConsulta.map(horario => (
                  <li key={horario.id_consulta}>
                    <strong>{horario.dia_semana}:</strong> {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="Centrar_Footer">
        <Footer />
      </div>
    </div>
  );
}