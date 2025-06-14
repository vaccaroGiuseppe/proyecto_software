import { useState, useEffect } from 'react';
import { supabase } from '../lib/../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaBook, FaEdit, FaSave, FaSpinner, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "./CrearEditarMateria.css";

type Materia = {
  codigo_materia: string;
  nombre: string;
  trimestre: string;
  creditos: string;
};

export default function CrearEditarMateria() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [selectedMateriaCodigo, setSelectedMateriaCodigo] = useState<string>('');
  const [formData, setFormData] = useState<Materia>({
    codigo_materia: '',
    nombre: '',
    trimestre: '',
    creditos: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'crear' | 'editar'>('crear');
  const navigate = useNavigate();

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
    if (selectedMateriaCodigo && mode === 'editar') {
      const materia = materias.find(m => m.codigo_materia === selectedMateriaCodigo);
      if (materia) {
        setFormData({
          codigo_materia: materia.codigo_materia,
          nombre: materia.nombre,
          trimestre: materia.trimestre,
          creditos: materia.creditos
        });
      }
    } else {
      setFormData({
        codigo_materia: '',
        nombre: '',
        trimestre: '',
        creditos: ''
      });
    }
  }, [selectedMateriaCodigo, mode, materias]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      /* Validar campos
      if (!formData.codigo_materia.trim()) {
        throw new Error('El código de la materia es requerido');
      }
      if (!formData.nombre.trim()) {
        throw new Error('El nombre de la materia es requerido');
      }
      if (!formData.trimestre.trim()) {
        throw new Error('El trimestre es requerido');
      }
      if (!formData.creditos.trim()) {
        throw new Error('Los créditos son requeridos');
      }*/

      if (mode === 'crear') {
        // Verificar si el código ya existe
        const { data: existing, error: fetchError } = await supabase
          .from('materia')
          .select('codigo_materia')
          .eq('codigo_materia', formData.codigo_materia)
          .single();

        if (fetchError && !fetchError.message.includes('No rows found')) {
          throw fetchError;
        }

        if (existing) {
          throw new Error('Ya existe una materia con este código');
        }

        // Crear nueva materia
        const { error } = await supabase
          .from('materia')
          .insert([formData]);

        if (error) throw error;
        setSuccess('Materia creada exitosamente!');
      } else {
        // Editar materia existente
        const { error } = await supabase
          .from('materia')
          .update(formData)
          .eq('codigo_materia', selectedMateriaCodigo);

        if (error) throw error;
        setSuccess('Materia actualizada exitosamente!');
      }

      // Recargar la lista de materias
      const { data } = await supabase
        .from('materia')
        .select('*')
        .order('codigo_materia', { ascending: true });

      setMaterias(data || []);
      
      if (mode === 'crear') {
        // Reset form after creation
        setFormData({
          codigo_materia: '',
          nombre: '',
          trimestre: '',
          creditos: ''
        });
      } else {
        // Actualizar el código seleccionado si cambió
        setSelectedMateriaCodigo(formData.codigo_materia);
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la materia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (newMode: 'crear' | 'editar') => {
    setMode(newMode);
    setSelectedMateriaCodigo('');
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
    <div className="crear-editar-materia-page">
      <Navbar />
      
      <div className="crear-editar-materia-container">
        <div className="header-section">
          <h1 className="main-title">Gestión de Materias</h1>
          <p className="subtitle">Crea o edita las materias académicas</p>
        </div>

        <div className="form-container">
          <div className="crear-editar-materia-card">
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
                Editar Materia Existente
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

            <form onSubmit={handleSubmit} className="crear-editar-materia-form">
              {mode === 'editar' && (
                <div className="form-group">
                  <label htmlFor="selectMateria" className="form-label">
                    <FaSearch /> Seleccionar Materia:
                  </label>
                  <select
                    id="selectMateria"
                    value={selectedMateriaCodigo}
                    onChange={(e) => setSelectedMateriaCodigo(e.target.value)}
                    className="form-select"
                    required={mode === 'editar'}
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
                  required
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

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting || (mode === 'editar' && !selectedMateriaCodigo)}
              >
                {isSubmitting ? <FaSpinner className="spinner" /> : mode === 'crear' ? <FaSave /> : <FaEdit />}
                {isSubmitting ? ' Guardando...' : mode === 'crear' ? ' Crear Materia' : ' Actualizar Materia'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}