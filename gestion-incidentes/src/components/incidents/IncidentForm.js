import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IncidentForm.css'; // Importar el CSS

const IncidentForm = ({ currentIncident, onIncidentAdded, onIncidentEdited }) => {
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
        // Formatear la fecha para el input type="date"
        const formattedDate = currentIncident.fecha_incidente 
            ? new Date(currentIncident.fecha_incidente).toISOString().split('T')[0] 
            : '';

        setFormData({ ...currentIncident, fecha_incidente: formattedDate });
    } else {
        // Limpiar el formulario si no hay incidente actual
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

  const handleAnalyzeHash = async () => {
    if (!formData.hash_url) {
        setMessage('Por favor, ingresa un hash o URL para analizar.');
        setIsError(true);
        return;
    }
    setIsAnalyzing(true);
    setMessage('');
    setIsError(false);
    setAnalysisResult(null);
    try {
        const response = await axios.post('https://192.168.39.115/gestion-incidentes/backend/analizar_hash.php', { hash: formData.hash_url });
        if (response.data.success) {
            setAnalysisResult(response.data.data);
            setFormData(prev => ({
                 ...prev, 
                 nivel_amenaza: response.data.data.nivel_compromiso, 
                 cantidad_detecciones: response.data.data.estadisticas.malicious || 0
            }));
            setMessage('Análisis completado exitosamente.');
            setIsError(false);
        } else {
            setMessage(response.data.message || 'Error al analizar el hash.');
            setIsError(true);
        }
    } catch (error) {
        setMessage('Error de conexión con el servidor de análisis.');
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
        if (currentIncident && currentIncident.id) {
            await axios.put(`https://192.168.39.115/gestion-incidentes/backend/incidentes.php?id=${currentIncident.id}`, formData);
            setMessage('Incidente actualizado exitosamente.');
            if (onIncidentEdited) onIncidentEdited();
        } else {
            await axios.post('https://192.168.39.115/gestion-incidentes/backend/incidentes.php', formData);
            setMessage('Incidente registrado exitosamente.');
            if (onIncidentAdded) onIncidentAdded();
        }
    } catch (error) {
        setMessage(`Error al ${currentIncident ? 'actualizar' : 'registrar'} el incidente. Inténtalo de nuevo.`);
        setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">{currentIncident ? 'Editar Incidente' : 'Registrar Nuevo Incidente'}</h2>
      <form onSubmit={handleSubmit}>
        
        <div className="analysis-section">
            <label htmlFor="hash_url" className="analysis-label">Análisis de Hash / URL (VirusTotal)</label>
            <div className="analysis-input-group">
                <input type="text" id="hash_url" name="hash_url" value={formData.hash_url} onChange={handleChange} className="form-input" placeholder="Ingresa SHA256, MD5, URL..." />
                <button type="button" onClick={handleAnalyzeHash} disabled={isAnalyzing} className="analyze-button">
                    {isAnalyzing ? 'Analizando...' : 'Analizar'}
                </button>
            </div>
        </div>

        {analysisResult && (
            <div className="analysis-result">
                <h4 className="analysis-result-title">Resultados del Análisis</h4>
                <p><strong>Nivel de Amenaza:</strong> {analysisResult.nivel_compromiso}</p>
                <p><strong>Tipo de Virus:</strong> {analysisResult.tipo_virus || 'No disponible'}</p>
                <p><strong>Detecciones:</strong> {analysisResult.estadisticas.malicious || 0} / {analysisResult.estadisticas.total || 0}</p>
            </div>
        )}

        <div className="form-grid">
            <div className="form-group">
                <label htmlFor="tipo_incidente" className="form-label">Tipo de Incidente</label>
                <select id="tipo_incidente" name="tipo_incidente" value={formData.tipo_incidente} onChange={handleChange} required className="form-select">
                    <option value="">Selecciona un tipo</option>
                    <option value="Malware">Malware</option>
                    <option value="Phishing">Phishing</option>
                    <option value="Denegacion de servicio">Denegación de Servicio</option>
                    <option value="Intrusion">Intrusión</option>
                    <option value="Fuga de datos">Fuga de Datos</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="prioridad" className="form-label">Prioridad</label>
                <select id="prioridad" name="prioridad" value={formData.prioridad} onChange={handleChange} className="form-select">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="fecha_incidente" className="form-label">Fecha del Incidente</label>
                <input type="date" id="fecha_incidente" name="fecha_incidente" value={formData.fecha_incidente} onChange={handleChange} required className="form-input"/>
            </div>
            <div className="form-group">
                <label htmlFor="responsable" className="form-label">Responsable</label>
                <input type="text" id="responsable" name="responsable" value={formData.responsable} onChange={handleChange} required placeholder="Ej: Analista SOC" className="form-input"/>
            </div>
            <div className="form-group">
                <label htmlFor="equipo_afectado" className="form-label">Equipo Afectado</label>
                <input type="text" id="equipo_afectado" name="equipo_afectado" value={formData.equipo_afectado} onChange={handleChange} required className="form-input"/>
            </div>
            <div className="form-group">
                <label htmlFor="direccion_mac" className="form-label">Dirección MAC</label>
                <input type="text" id="direccion_mac" name="direccion_mac" value={formData.direccion_mac} onChange={handleChange} className="form-input"/>
            </div>
            <div className="form-group">
                <label htmlFor="dependencia" className="form-label">Dependencia</label>
                <input type="text" id="dependencia" name="dependencia" value={formData.dependencia} onChange={handleChange} required className="form-input"/>
            </div>
            <div className="form-group">
                <label htmlFor="estado_equipo" className="form-label">Estado del Equipo</label>
                <input type="text" id="estado_equipo" name="estado_equipo" value={formData.estado_equipo} onChange={handleChange} placeholder="Ej: Limpio, Contenido" className="form-input"/>
            </div>
            <div className="form-group">
                <label htmlFor="nivel_amenaza" className="form-label">Nivel de Amenaza</label>
                <input type="text" id="nivel_amenaza" name="nivel_amenaza" value={formData.nivel_amenaza} onChange={handleChange} readOnly className="form-input" style={{ backgroundColor: '#f3f4f6' }}/>
            </div>
            <div className="form-group col-span-2">
                <label htmlFor="acciones_tomadas" className="form-label">Acciones Tomadas</label>
                <textarea id="acciones_tomadas" name="acciones_tomadas" rows="4" value={formData.acciones_tomadas} onChange={handleChange} className="form-textarea"></textarea>
            </div>
            <div className="form-group col-span-3">
                <label htmlFor="detalles" className="form-label">Detalles Adicionales</label>
                <textarea id="detalles" name="detalles" rows="4" value={formData.detalles} onChange={handleChange} className="form-textarea"></textarea>
            </div>
        </div>

        <div className="form-actions">
            <button type="submit" className="form-button submit-button">
                {currentIncident ? 'Guardar Cambios' : 'Registrar Incidente'}
            </button>
        </div>
      </form>
      {message && <p className={`feedback-message ${isError ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
};

export default IncidentForm;
