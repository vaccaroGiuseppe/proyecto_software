import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

type HorarioClase = {
  id_horario_clase: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
};

type Props = {
  id_usuario: string;
};

export default function AddHorarioConsulta({ id_usuario }: Props) {
  const [horarios, setHorarios] = useState<HorarioClase[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarHorarios = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('horario_clase')
        .select('id_horario_clase, dia_semana, hora_inicio, hora_fin')
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true });
      if (error) setError('Error al cargar horarios');
      setHorarios(data || []);
      setLoading(false);
    };
    cargarHorarios();
  }, []);

  const formatHora = (hora: string) =>
    new Date(`1970-01-01T${hora}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleAgregar = async () => {
    setError(null);
    setSuccess(null);
    const horario = horarios.find(h => h.id_horario_clase === selected);
    if (!horario) {
      setError('Debes seleccionar un horario');
      return;
    }
    const { dia_semana, hora_inicio, hora_fin } = horario;
    console.log({ id_usuario, dia_semana, hora_inicio, hora_fin });
    const { error: insertError, data } = await supabase
      .from('horario_consulta')
      .insert([{ id_profesor: id_usuario, dia_semana, hora_inicio, hora_fin }]);
    if (insertError) {
      setError('Error al agregar horario de consulta');
    } else {
      setSuccess('¡Horario de consulta agregado correctamente!');
      setSelected('');
    }
    console.log('Insert response:', { insertError, data });

  };

  return (
    <div className="agregar-horario-consulta-card">
      <h3>Agregar horario de consulta</h3>
      {error && <div className="alert-message error-message">{error}</div>}
      {success && <div className="alert-message success-message">{success}</div>}
      <div className="form-group">
        <label htmlFor="horario-consulta-select" className="form-label">
          Selecciona un horario:
        </label>
        {loading ? (
          <div className="loading-profesores">Cargando horarios...</div>
        ) : (
          <select
            id="horario-consulta-select"
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="form-select"
          >
            <option value="">Seleccione un horario...</option>
            {horarios.map(horario => (
              <option key={horario.id_horario_clase} value={horario.id_horario_clase}>
                {horario.dia_semana} - {formatHora(horario.hora_inicio)} a {formatHora(horario.hora_fin)}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        type="button"
        className="submit-button"
        style={{ marginTop: 12 }}
        onClick={handleAgregar}
        disabled={loading || !selected}
      >
        Agregar
      </button>
    </div>
  );
}