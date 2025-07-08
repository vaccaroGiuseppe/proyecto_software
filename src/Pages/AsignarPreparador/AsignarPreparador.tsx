import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaUserGraduate, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import './AsignarPreparador.css';

type Usuario = {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  tipo: string;
  es_preparador: boolean;
};

type Seccion = {
  id_seccion: string;
  codigo_materia: string;
  nombre_materia: string;
  id_preparador: string | null;
};

export default function AsignarPreparador() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>('');
  const [busquedaPreparador, setBusquedaPreparador] = useState('');
  const [preparadoresDisponibles, setPreparadoresDisponibles] = useState<Usuario[]>([]);
  const [preparadorSeleccionado, setPreparadorSeleccionado] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState({
    secciones: true,
    preparadores: false,
    guardando: false
  });
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  // Obtener secciones del profesor actual
useEffect(() => {
    const cargarSeccionesProfesor = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No hay usuario autenticado');

        // Paso 1: Obtener todas las secciones del profesor
        const { data: seccionesData, error: seccionesError } = await supabase
          .from('seccion')
          .select('id_seccion, codigo_materia, id_profesor, id_preparador')
          .eq('id_profesor', user.id);

        if (seccionesError) throw seccionesError;

        // Paso 2: Obtener datos relacionados
        const codigosMateria = [...new Set(seccionesData?.map(s => s.codigo_materia))];

        // Consulta para materias
        const { data: materiasData, error: materiasError } = await supabase
          .from('materia')
          .select('codigo_materia, nombre')
          .in('codigo_materia', codigosMateria);

        if (materiasError) throw materiasError;

        // Formatear los datos para mostrar
        const seccionesFormateadas = seccionesData?.map(seccion => {
          const materia = materiasData?.find(m => m.codigo_materia === seccion.codigo_materia);

          return {
            id_seccion: seccion.id_seccion,
            codigo_materia: seccion.codigo_materia,
            nombre_materia: materia?.nombre || 'Sin nombre',
            id_preparador: seccion.id_preparador
          };
        }) || [];

        setSecciones(seccionesFormateadas);
        setLoading(prev => ({ ...prev, secciones: false }));
      } catch (err) {
        console.error('Error al cargar secciones:', err);
        setMensaje({ texto: 'Error al cargar las secciones', tipo: 'error' });
        setLoading(prev => ({ ...prev, secciones: false }));
      }
    };

    cargarSeccionesProfesor();
}, []);

  // Buscar estudiantes mientras escribe (cambiamos el useEffect de búsqueda)
useEffect(() => {
    if (busquedaPreparador.trim().length < 2) {
        setPreparadoresDisponibles([]);
        return;
    }

    const buscarEstudiantes = async () => {
        setLoading(prev => ({ ...prev, preparadores: true }));
        try {
            const { data, error } = await supabase
                .from('usuario')
                .select('id_usuario, nombre, apellido, correo, tipo, es_preparador')
                .ilike('nombre', `%${busquedaPreparador}%`)
                .or(`apellido.ilike.%${busquedaPreparador}%,correo.ilike.%${busquedaPreparador}%`)
                .eq('tipo', 'estudiante')
                .limit(10);

            if (error) throw error;

            setPreparadoresDisponibles(data || []);
        } catch (err) {
            console.error('Error al buscar estudiantes:', err);
            setMensaje({ texto: 'Error al buscar estudiantes', tipo: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, preparadores: false }));
        }
    };

    const timer = setTimeout(buscarEstudiantes, 300);
    return () => clearTimeout(timer);
}, [busquedaPreparador]);

// Función para verificar y actualizar el estado de preparador de un usuario
const actualizarEstadoPreparador = async (idUsuario: string) => {
  try {
    // Verificar si el usuario es preparador en alguna sección
    const { data: seccionesData, error: seccionesError } = await supabase
      .from('seccion')
      .select('id_seccion')
      .eq('id_preparador', idUsuario);

    if (seccionesError) throw seccionesError;

    // Si no es preparador en ninguna sección, actualizar es_preparador a false
    if (seccionesData.length === 0) {
      const { error: updateError } = await supabase
        .from('usuario')
        .update({ es_preparador: false })
        .eq('id_usuario', idUsuario);

      if (updateError) throw updateError;
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error al actualizar estado de preparador:', err);
    throw err;
  }
};

// Modificamos la función de asignar preparador
const asignarPreparador = async () => {
  if (!seccionSeleccionada || !preparadorSeleccionado) return;

  setLoading(prev => ({ ...prev, guardando: true }));
  setMensaje(null);

  try {
    // 1. Obtener el preparador actual de la sección (si existe)
    const seccionActual = secciones.find(s => s.id_seccion === seccionSeleccionada);
    const idPreparadorAnterior = seccionActual?.id_preparador;

    // 2. Actualizar al nuevo usuario como preparador
    const { error: errorUsuario } = await supabase
      .from('usuario')
      .update({ es_preparador: true })
      .eq('id_usuario', preparadorSeleccionado.id_usuario);

    if (errorUsuario) throw errorUsuario;

    // 3. Asignar el nuevo preparador a la sección
    const { error: errorSeccion } = await supabase
      .from('seccion')
      .update({ id_preparador: preparadorSeleccionado.id_usuario })
      .eq('id_seccion', seccionSeleccionada);

    if (errorSeccion) throw errorSeccion;

    // 4. Si había un preparador anterior, verificar si sigue siendo preparador
    if (idPreparadorAnterior) {
      await actualizarEstadoPreparador(idPreparadorAnterior);
    }

    // Actualizar estado local
    setSecciones(prev => prev.map(seccion => 
      seccion.id_seccion === seccionSeleccionada 
        ? { ...seccion, id_preparador: preparadorSeleccionado.id_usuario } 
        : seccion
    ));

    setPreparadorSeleccionado(prev => prev ? { ...prev, es_preparador: true } : null);
    setMensaje({ texto: 'Preparador asignado correctamente', tipo: 'exito' });
  } catch (err) {
    console.error('Error al asignar preparador:', err);
    setMensaje({ texto: 'Error al asignar preparador', tipo: 'error' });
  } finally {
    setLoading(prev => ({ ...prev, guardando: false }));
  }
};

// Modificamos la función para quitar preparador
const quitarPreparador = async () => {
  if (!seccionSeleccionada) return;

  setLoading(prev => ({ ...prev, guardando: true }));
  setMensaje(null);

  try {
    // 1. Obtener el preparador actual de la sección
    const seccionActual = secciones.find(s => s.id_seccion === seccionSeleccionada);
    const idPreparadorActual = seccionActual?.id_preparador;
    if (!idPreparadorActual) return;

    // 2. Quitar el preparador de la sección
    const { error: errorSeccion } = await supabase
      .from('seccion')
      .update({ id_preparador: null })
      .eq('id_seccion', seccionSeleccionada);

    if (errorSeccion) throw errorSeccion;

    // 3. Verificar si el preparador sigue siendo preparador en otras secciones
    await actualizarEstadoPreparador(idPreparadorActual);

    // Actualizar estado local
    setSecciones(prev => prev.map(seccion => 
      seccion.id_seccion === seccionSeleccionada 
        ? { ...seccion, id_preparador: null } 
        : seccion
    ));

    setPreparadorSeleccionado(null);
    setMensaje({ texto: 'Preparador removido de la sección', tipo: 'exito' });
  } catch (err) {
    console.error('Error al remover preparador:', err);
    setMensaje({ texto: 'Error al remover preparador', tipo: 'error' });
  } finally {
    setLoading(prev => ({ ...prev, guardando: false }));
  }
};

  return (
    <div className="fullpues">
      <Navbar />
      
      <div className="asignar-preparador-container">
        <div className="header-section">
          <h1 className="main-title">Asignar Preparador</h1>
          <p className="subtitle">Selecciona un estudiante preparador para tus secciones</p>
        </div>

        <div className="form-container1">
          <div className="asignar-preparador-card">
            {mensaje && (
              <div className={`alert-message ${mensaje.tipo}-message`}>
                {mensaje.tipo === 'exito' ? <FaCheck /> : <FaTimes />}
                {mensaje.texto}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="seccion" className="form-label">
                Seleccionar Sección:
              </label>
              {loading.secciones ? (
                <div className="loading-message">
                  <FaSpinner className="spinner" /> Cargando secciones...
                </div>
              ) : (
                <select
                  id="seccion"
                  value={seccionSeleccionada}
                  onChange={(e) => setSeccionSeleccionada(e.target.value)}
                  className="form-select"
                  disabled={loading.secciones}
                >
                  <option value="">Seleccione una sección...</option>
                  {secciones.map((seccion) => (
                    <option key={seccion.id_seccion} value={seccion.id_seccion}>
                      {seccion.codigo_materia} - {seccion.nombre_materia}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {seccionSeleccionada && (
              <div className="form-group">
                <label htmlFor="preparador" className="form-label">
                  Buscar Preparador:
                </label>
                <div className="search-input-container">
                    <input
                        type="text"
                        id="preparador"
                        value={busquedaPreparador}
                        onChange={(e) => setBusquedaPreparador(e.target.value)}
                        className="form-input"
                        placeholder="Escribe el nombre del estudiante preparador..."
                        disabled={loading.preparadores}
                    />
                    {loading.preparadores && (
                        <FaSpinner className="spinner search-spinner" />
                    )}
                </div>

                {preparadoresDisponibles.length > 0 && (
                  <div className="suggestions-container">
                    {preparadoresDisponibles.map((preparador) => (
                      <div
                        key={preparador.id_usuario}
                        className={`suggestion-item ${preparadorSeleccionado?.id_usuario === preparador.id_usuario ? 'selected' : ''}`}
                        onClick={() => setPreparadorSeleccionado(preparador)}
                      >
                        <FaUserGraduate className="suggestion-icon" />
                        <div className="suggestion-info">
                          <span className="suggestion-name">
                            {preparador.nombre} {preparador.apellido}
                          </span>
                          <span className="suggestion-email">{preparador.correo}</span>
                        </div>
                        {preparador.es_preparador && (
                          <span className="preparador-badge">Preparador</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {preparadorSeleccionado && (
              <div className="selected-preparador">
                <h3>Preparador seleccionado:</h3>
                <div className="preparador-info">
                  <FaUserGraduate className="preparador-icon" />
                  <div>
                    <p>
                      <strong>Nombre:</strong> {preparadorSeleccionado.nombre} {preparadorSeleccionado.apellido}
                    </p>
                    <p>
                      <strong>Email:</strong> {preparadorSeleccionado.correo}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="action-button save-button"
                onClick={asignarPreparador}
                disabled={!seccionSeleccionada || !preparadorSeleccionado || loading.guardando}
              >
                {loading.guardando ? (
                  <FaSpinner className="spinner" />
                ) : (
                  'Asignar Preparador'
                )}
              </button>

              {seccionSeleccionada && secciones.find(s => s.id_seccion === seccionSeleccionada)?.id_preparador && (
                <button
                  type="button"
                  className="action-button remove-button"
                  onClick={quitarPreparador}
                  disabled={loading.guardando}
                >
                  {loading.guardando ? (
                    <FaSpinner className="spinner" />
                  ) : (
                    'Quitar Preparador'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}