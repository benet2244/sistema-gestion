import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './IncidentForm.css'; // Asegúrate de que los estilos estén bien definidos

// Estandarización de la URL del backend
const API_BASE_URL = 'http://localhost/gestion-incidentes/backend';

const IncidentForm = ({ currentIncident, onFormSubmit }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tipo_incidente: '', prioridad: 'media', fecha_incidente: '', responsable: '',
        equipo_afectado: '', direccion_mac: '', dependencia: '', cantidad_detecciones: '',
        estado_equipo: '', acciones_tomadas: '', hash_url: '', nivel_amenaza: '', detalles: '',
    });

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Efecto para poblar el formulario si es una edición
    useEffect(() => {
        if (currentIncident) {
            const formattedDate = currentIncident.fecha_incidente 
                ? new Date(currentIncident.fecha_incidente).toISOString().split('T')[0] 
                : '';
            setFormData({ ...currentIncident, fecha_incidente: formattedDate });
        } else {
            setFormData({
                tipo_incidente: '', prioridad: 'media', fecha_incidente: '', responsable: '',
                equipo_afectado: '', direccion_mac: '', dependencia: '', cantidad_detecciones: '',
                estado_equipo: '', acciones_tomadas: '', hash_url: '', nivel_amenaza: '', detalles: '',
            });
        }
    }, [currentIncident]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAnalyze = async () => {
        if (!formData.hash_url) {
            setMessage('Por favor, ingrese un Hash o URL para analizar.');
            setIsError(true);
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setMessage('');
        setIsError(false);

        try {
            // CORREGIDO: Usando el nombre de archivo y la clave JSON correctos para el backend
            const response = await fetch(`${API_BASE_URL}/analizar_hash.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash: formData.hash_url }), // La clave ahora es 'hash'
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('La respuesta del servidor de análisis no fue correcta.');
            }

            const data = await response.json();
            if (data.success) {
                // Actualizamos el estado con los datos específicos que devuelve el backend
                setAnalysisResult(data.data); // El backend devuelve los resultados en 'data'
                // Opcional: Rellenar campos del formulario con los resultados
                if (data.data && data.data.nivel_compromiso) {
                    setFormData(prev => ({ ...prev, nivel_amenaza: data.data.nivel_compromiso }));
                }
            } else {
                setMessage(data.message || 'No se pudo completar el análisis.');
                setIsError(true);
            }
        } catch (error) {
            setMessage(`Error de conexión con el servidor de análisis: ${error.message}`);
            setIsError(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
            const response = await fetch(`${API_BASE_URL}/incidentes.php${currentIncident ? `?id=${currentIncident.id}` : ''}`, {
                method: currentIncident ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setMessage(data.message);
                if (onFormSubmit) onFormSubmit(data.incident);
                setTimeout(() => navigate('/'), 1500); // Redirigir después de un momento
            } else {
                setMessage(data.message || 'Ocurrió un error al guardar el incidente.');
                setIsError(true);
            }
        } catch (error) {
            setMessage('Error de conexión. No se pudo guardar el incidente.');
            setIsError(true);
        }
    };

    return (
        <div className="incident-form-container">
            <form onSubmit={handleSubmit} className="incident-form">
                <h2 className="form-title">{currentIncident ? 'Editar Incidente' : 'Registrar Nuevo Incidente'}</h2>

                {/* ... (resto del JSX del formulario sin cambios) ... */}
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tipo de Incidente</label>
                        <input type="text" name="tipo_incidente" value={formData.tipo_incidente} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Prioridad</label>
                        <select name="prioridad" value={formData.prioridad} onChange={handleChange}>
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Fecha del Incidente</label>
                        <input type="date" name="fecha_incidente" value={formData.fecha_incidente} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Responsable</label>
                        <input type="text" name="responsable" value={formData.responsable} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Equipo Afectado</label>
                        <input type="text" name="equipo_afectado" value={formData.equipo_afectado} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Dirección MAC</label>
                        <input type="text" name="direccion_mac" value={formData.direccion_mac} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Dependencia</label>
                        <input type="text" name="dependencia" value={formData.dependencia} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Cantidad de Detecciones</label>
                        <input type="number" name="cantidad_detecciones" value={formData.cantidad_detecciones} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Estado del Equipo</label>
                        <input type="text" name="estado_equipo" value={formData.estado_equipo} onChange={handleChange} />
                    </div>
                    <div className="form-group full-width">
                        <label>Nivel de Amenaza (IOC)</label>
                        <input type="text" name="nivel_amenaza" value={formData.nivel_amenaza} onChange={handleChange} readOnly placeholder="Se autocompleta con el análisis"/>
                    </div>
                    <div className="form-group full-width">
                        <label>Acciones Tomadas</label>
                        <textarea name="acciones_tomadas" value={formData.acciones_tomadas} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group full-width">
                        <label>Detalles Adicionales</label>
                        <textarea name="detalles" value={formData.detalles} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group full-width ioc-analysis-section">
                        <label>Indicador de Compromiso (Hash, URL, IP)</label>
                        <div className="ioc-input-group">
                            <input type="text" name="hash_url" value={formData.hash_url} onChange={handleChange} placeholder="Ingrese el IOC a analizar" />
                            <button type="button" onClick={handleAnalyze} disabled={isAnalyzing} className="analyze-button">
                                {isAnalyzing ? 'Analizando...' : 'Analizar IOC'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">{currentIncident ? 'Actualizar Incidente' : 'Guardar Incidente'}</button>
                    <button type="button" onClick={() => navigate('/')} className="cancel-button">Cancelar</button>
                </div>
            </form>

            {message && <div className={`form-message ${isError ? 'error' : 'success'}`}>{message}</div>}

            {analysisResult && (
                <div className="analysis-results">
                    <h3>Resultado del Análisis</h3>
                    <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default IncidentForm;
