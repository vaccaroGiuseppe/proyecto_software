import { useState, useEffect, useRef } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { useForm } from "react-hook-form";
import { supabase } from '../lib/../../supabaseClient';
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import { FaUserEdit, FaEye, FaEyeSlash, FaCalendarAlt, FaVenusMars, FaCamera, FaTimes, FaSpinner } from 'react-icons/fa';
import "./Registrar.css";
import { useNavigate } from 'react-router-dom';

type UsuarioFormData = {
  nombre: string;
  apellido: string;
  correo: string;
  tipo: string;
  contrasena: string;
  confirmar_contrasena: string;
  foto_perfil: string | null;
  fecha_nacimiento: string;
  sexo: string;
};

export default function UsuarioForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<UsuarioFormData>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const determinarTipoUsuario = (correo: string): string => {
    const profesor = /@unimet\.edu\.ve$/i;
    return profesor.test(correo) ? "profesor" : "estudiante";
  };

  const correo = watch("correo");
  useEffect(() => {
    if (correo) setValue("tipo", determinarTipoUsuario(correo));
  }, [correo, setValue]);

  useEffect(() => {
    if (startDate) setValue('fecha_nacimiento', startDate.toISOString());
  }, [startDate, setValue]);

  const contrasena = watch("contrasena");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede superar los 5MB');
        return;
      }

      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Subir la imagen al bucket de Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      throw new Error('Error al subir la imagen: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (formData: UsuarioFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Validar que las contraseñas coincidan
      if (formData.contrasena !== formData.confirmar_contrasena) {
        throw new Error('Las contraseñas no coinciden');
      }

      // 2. Subir imagen si existe
      let imageUrl = null;
      if (previewImage && fileInputRef.current?.files?.[0]) {
        imageUrl = await uploadImageToSupabase(fileInputRef.current.files[0]);
      }

      // 3. Registrar usuario en Auth de Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.contrasena,
        options: {
          data: {
            nombre: formData.nombre,
            apellido: formData.apellido,
          }
        }
      });

      if (authError) throw new Error(authError.message);

      // 4. Insertar datos adicionales en la tabla usuario
      const { error: insertError } = await supabase
        .from('usuario')
        .insert([{
          id_usuario: authData.user?.id,
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          tipo: formData.tipo,
          fecha_creacion: new Date().toISOString(),
          fecha_nacimiento: startDate?.toISOString(),
          sexo: formData.sexo,
          foto_perfil: imageUrl
        }]);

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      reset();
      setStartDate(null);
      setPreviewImage(null);
      
      setTimeout(() => {
        navigate('/confirmacion-correo');
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error durante el registro');
      console.error('Error detallado:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='registro-page'>
      <Navbar />
      
      <div className="registro-container">
        <div className="form-container">
          <div className="registro-card">
            {success && (
              <div className="alert-message success-message">
                ¡Usuario registrado exitosamente! Redirigiendo...
                <button onClick={() => setSuccess(false)} className="close-alert">
                  <FaTimes />
                </button>
              </div>
            )}
            
            {error && (
              <div className="alert-message error-message">
                Error: {error}
                <button onClick={() => setError(null)} className="close-alert">
                  <FaTimes />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="foto_perfil">Foto de Perfil</label>
                  <div className="photo-upload-container">
                    {previewImage ? (
                      <div className="photo-preview">
                        <img src={previewImage} alt="Vista previa" />
                        <button 
                          type="button" 
                          className="remove-photo"
                          onClick={() => {
                            setPreviewImage(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          disabled={isUploadingImage}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="photo-placeholder"
                        onClick={triggerFileInput}
                      >
                        <FaCamera />
                      </div>
                    )}
                    <input
                      type="file"
                      id="foto_perfil"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="upload-button"
                      onClick={triggerFileInput}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <FaSpinner className="spinner" />
                      ) : previewImage ? (
                        'Cambiar imagen'
                      ) : (
                        'Seleccionar imagen'
                      )}
                    </button>
                    <p className="file-hint">Formatos: JPG, PNG (Máx. 5MB)</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input 
                    type="text" 
                    id="nombre"
                    {...register("nombre", {required: "Este campo es obligatorio"})} 
                  />
                  {errors.nombre && <span className="error-message">{errors.nombre.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="apellido">Apellido</label>
                  <input 
                    type="text" 
                    id="apellido"
                    {...register("apellido", {required: "Este campo es obligatorio"})} 
                  />
                  {errors.apellido && <span className="error-message">{errors.apellido.message}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="correo">Correo Unimet</label>
                  <input 
                    type="email" 
                    id="correo"
                    {...register("correo", {
                      required: "Este campo es obligatorio", 
                      pattern: {
                        value: /@(correo\.unimet\.edu\.ve|unimet\.edu\.ve)$/i,
                        message: "Debe ser un correo institucional",
                      } 
                    })}
                  />
                  {errors.correo && <span className="error-message">{errors.correo.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="contrasena">Contraseña</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="contrasena"
                      {...register('contrasena', {
                        required: 'La contraseña es obligatoria',
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                          message: 'Debe contener mayúscula, minúscula, número y carácter especial'
                        }
                      })} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.contrasena && <span className="error-message">{errors.contrasena.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmar_contrasena">Confirmar Contraseña</label>
                  <div className="password-input">
                    <input 
                      type={showConfirmation ? 'text' : 'password'}
                      id="confirmar_contrasena"
                      {...register("confirmar_contrasena", {
                        required: "Por favor confirma tu contraseña", 
                        validate: (value) => 
                          value === contrasena || 'Las contraseñas no coinciden'
                      })} 
                    />
                    <button type="button" onClick={() => setShowConfirmation(!showConfirmation)}>
                      {showConfirmation ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmar_contrasena && <span className="error-message">{errors.confirmar_contrasena.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="fecha_nacimiento">
                    <FaCalendarAlt /> Fecha de Nacimiento
                  </label>
                  <DatePicker
                    id="fecha_nacimiento"
                    selected={startDate}
                    onChange={setStartDate}
                    dateFormat="yyyy/MM/dd"
                    placeholderText="Selecciona una fecha"
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    customInput={
                      <input onKeyDown={(e) => e.preventDefault()} />
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sexo">
                    <FaVenusMars /> Sexo
                  </label>
                  <select
                    id="sexo"
                    {...register("sexo", { required: "Este campo es obligatorio" })}
                    style={{ height: '52px' }}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiero no decir">Prefiero no decir</option>
                  </select>
                  {errors.sexo && <span className="error-message">{errors.sexo.message}</span>}
                </div>
              </div>
              <button 
                type="submit" 
                className="submit-button" 
                disabled={loading || isUploadingImage}
              >
                {(loading || isUploadingImage) ? (
                  <FaSpinner className="spinner" />
                ) : (
                  'Registrarse'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="orange-panel">
          <div className="panel-content">
            <FaUserEdit className="hero-icon" />
            <h1 className="hero-title">Registro de Usuario</h1>
            <p className="hero-subtitle">Únete a nuestra comunidad académica</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}