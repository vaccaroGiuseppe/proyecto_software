import { useState, useEffect } from 'react';
import { supabase } from '../lib/../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaBook, FaEdit, FaSave, FaSpinner, FaSearch, FaTrash } from 'react-icons/fa';
import "./CrearEditarEliminarMateria.css";

type Materia = {
  codigo_materia: string;
  nombre: string;
  trimestre: string;
  creditos: string;
};

type Modo = 'crear' | 'editar' | 'eliminar';

export default function CrearEditarEliminarMateria() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [selectedMateriaCodigo, setSelectedMateriaCodigo] = useState<string>('');
  const [inputEliminarCodigo, setInputEliminarCodigo] = useState<string>('');
  const [formData, setFormData] = useState<Materia>({
    codigo_materia: '',
    nombre: '',
    trimestre: '',
    creditos: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<Modo>('crear');

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const { data, error } = await supabase
          .from('materia')
          .select('*')
          .order('codigo_materia', { ascending: true });

        if (error) throw error;
        setMaterias(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las materias');
      }
    };

    fetchMaterias();
  }, []);

  useEffect(() => {
    if (selectedMateriaCodigo && (mode === 'editar' || mode === 'eliminar')) {
      const materia = materias.find(m => m.codigo_materia === selectedMateriaCodigo);
      if (materia) {
        setFormData({
          codigo_materia: materia.codigo_materia,
          nombre: materia.nombre,
          trimestre: materia.trimestre,
          creditos: materia.creditos
        });
        setInputEliminarCodigo(materia.codigo_materia);
      }
    } else {
      setFormData({
        codigo_materia: '',
        nombre: '',
        trimestre: '',
        creditos: ''
      });
      setInputEliminarCodigo('');
    }
  }, [selectedMateriaCodigo, mode, materias]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEliminarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputEliminarCodigo(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'crear') {
        // Validar campos para creación
        if (!formData.codigo_materia.trim()) throw new Error('El código de la materia es requerido');
        if (!formData.nombre.trim()) throw new Error('El nombre de la materia es requerido');
        if (!formData.trimestre.trim()) throw new Error('El trimestre es requerido');
        if (!formData.creditos.trim()) throw new Error('Los créditos son requeridos');

        // Verificar si el código ya existe
        const { data: existing } = await supabase
          .from('materia')
          .select('codigo_materia')
          .eq('codigo_materia', formData.codigo_materia)
          .single();

        if (existing) throw new Error('Ya existe una materia con este código');

        // Crear nueva materia
        const { error } = await supabase
          .from('materia')
          .insert([formData]);

        if (error) throw error;
        setSuccess('Materia creada exitosamente!');
      } 
      else if (mode === 'editar') {
        // Validar campos para edición
        /*if (!selectedMateriaCodigo) throw new Error('Debe seleccionar una materia para editar');
        if (!formData.nombre.trim()) throw new Error('El nombre de la materia es requerido');
        if (!formData.trimestre.trim()) throw new Error('El trimestre es requerido');
        if (!formData.creditos.trim()) throw new Error('Los créditos son requeridos');*/

        // Editar materia existente
        const { error } = await supabase
          .from('materia')
          .update({
            nombre: formData.nombre,
            trimestre: formData.trimestre,
            creditos: formData.creditos
          })
          .eq('codigo_materia', selectedMateriaCodigo);

        if (error) throw error;
        setSuccess('Materia actualizada exitosamente!');
      }
      else if (mode === 'eliminar') {
        // Validar para eliminación
        const codigoAEliminar = selectedMateriaCodigo || inputEliminarCodigo;
        if (!codigoAEliminar) throw new Error('Debe seleccionar o ingresar un código de materia');

        // Verificar que la materia existe
        const { data: materiaExistente } = await supabase
          .from('materia')
          .select('codigo_materia')
          .eq('codigo_materia', codigoAEliminar)
          .single();

        if (!materiaExistente) throw new Error('No existe una materia con este código');

        // Eliminar materia
        const { error } = await supabase
          .from('materia')
          .delete()
          .eq('codigo_materia', codigoAEliminar);

        if (error) throw error;
        setSuccess('Materia eliminada exitosamente!');
      }

      // Recargar la lista de materias
      const { data } = await supabase
        .from('materia')
        .select('*')
        .order('codigo_materia', { ascending: true });

      setMaterias(data || []);
      
      // Resetear formularios según el modo
      if (mode === 'crear') {
        setFormData({
          codigo_materia: '',
          nombre: '',
          trimestre: '',
          creditos: ''
        });
      } else if (mode === 'eliminar') {
        setSelectedMateriaCodigo('');
        setInputEliminarCodigo('');
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (newMode: Modo) => {
    setMode(newMode);
    setSelectedMateriaCodigo('');
    setInputEliminarCodigo('');
    setError(null);
    setSuccess(null);
    setFormData({
      codigo_materia: '',
      nombre: '',
      trimestre: '',
      creditos: ''
    });
  };

  return (
    <div className="crear-editar-eliminar-materia-page">
      <Navbar />
      
      <div className="crear-editar-eliminar-materia-container">
        <div className="header-section">
          <h1 className="main-title">Gestión de Materias</h1>
          <p className="subtitle">Crea, edita o elimina materias académicas</p>
        </div>

        <div className="form-container">
          <div className="crear-editar-eliminar-materia-card">
            <div className="mode-selector">
              <button
                className={`mode-button ${mode === 'crear' ? 'active' : ''}`}
                onClick={() => handleModeChange('crear')}
              >
                Crear Nueva Materia
              </button>
              <button
                className={`mode-button ${mode === 'editar' ? 'active' : ''}`}
                onClick={() => handleModeChange('editar')}
              >
                Editar Materia
              </button>
              <button
                className={`mode-button ${mode === 'eliminar' ? 'active' : ''}`}
                onClick={() => handleModeChange('eliminar')}
              >
                Eliminar Materia
              </button>
            </div>

            {error && (
              <div className="alert-message error-message">
                Error: {error}
              </div>
            )}

            {success && (
              <div className="alert-message success-message">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="crear-editar-eliminar-materia-form">
              {mode === 'eliminar' && (
                <>
                  <div className="form-group">
                    <label htmlFor="selectMateriaEliminar" className="form-label">
                      <FaSearch /> Seleccionar Materia a Eliminar:
                    </label>
                    <select
                      id="selectMateriaEliminar"
                      value={selectedMateriaCodigo}
                      onChange={(e) => setSelectedMateriaCodigo(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Seleccione una materia...</option>
                      {materias.map((materia) => (
                        <option key={materia.codigo_materia} value={materia.codigo_materia}>
                          {materia.codigo_materia} - {materia.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="separator">O</div>

                  <div className="form-group">
                    <label htmlFor="inputEliminarCodigo" className="form-label">
                      <FaBook /> Ingresar Código de Materia:
                    </label>
                    <input
                      type="text"
                      id="inputEliminarCodigo"
                      value={inputEliminarCodigo}
                      onChange={handleEliminarInputChange}
                      className="form-input"
                      placeholder="Ej: MAT-101"
                    />
                  </div>
                </>
              )}

              {mode === 'editar' && (
                <div className="form-group">
                  <label htmlFor="selectMateria" className="form-label">
                    <FaSearch /> Seleccionar Materia a Editar:
                  </label>
                  <select
                    id="selectMateria"
                    value={selectedMateriaCodigo}
                    onChange={(e) => setSelectedMateriaCodigo(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione una materia...</option>
                    {materias.map((materia) => (
                      <option key={materia.codigo_materia} value={materia.codigo_materia}>
                        {materia.codigo_materia} - {materia.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(mode === 'crear' || mode === 'editar') && (
                <>
                  <div className="form-group">
                    <label htmlFor="codigo_materia" className="form-label">
                      <FaBook /> Código de la Materia:
                    </label>
                    <input
                      type="text"
                      id="codigo_materia"
                      name="codigo_materia"
                      value={formData.codigo_materia}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: MAT-101"
                      required={mode === 'crear'}
                      disabled={mode === 'editar'}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nombre" className="form-label">
                      <FaBook /> Nombre:
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: Matemáticas Básicas"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="trimestre" className="form-label">
                      <FaBook /> Trimestre:
                    </label>
                    <input
                      type="text"
                      id="trimestre"
                      name="trimestre"
                      value={formData.trimestre}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: 1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="creditos" className="form-label">
                      <FaBook /> Créditos:
                    </label>
                    <input
                      type="text"
                      id="creditos"
                      name="creditos"
                      value={formData.creditos}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: 4"
                      required
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className={`submit-button ${mode === 'eliminar' ? 'delete-button' : ''}`}
                disabled={isSubmitting || 
                  (mode === 'editar' && !selectedMateriaCodigo) ||
                  (mode === 'eliminar' && !selectedMateriaCodigo && !inputEliminarCodigo)}
              >
                {isSubmitting ? (
                  <FaSpinner className="spinner" />
                ) : mode === 'crear' ? (
                  <FaSave />
                ) : mode === 'editar' ? (
                  <FaEdit />
                ) : (
                  <FaTrash />
                )}
                {isSubmitting ? ' Procesando...' : 
                 mode === 'crear' ? ' Crear Materia' : 
                 mode === 'editar' ? ' Actualizar Materia' : 
                 ' Eliminar Materia'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}