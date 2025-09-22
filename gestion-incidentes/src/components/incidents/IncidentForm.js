import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../IncidentCss/IncidentForm.css';

const IncidenteForm = ({ onIncidentAdded, onIncidentEdited, currentIncident, setCurrentIncident }) => {
  const [formData, setFormData] = useState({
    tipo_incidente: '',
    prioridad: 'media',
    fecha_incidente: '',
    responsable: '',
    equipo_afectado: '',
    direccion_mac: '',
    dependencia: '',
    cantidad_detecciones: '',
    estado_equipo: '',
    acciones_tomadas: '',
    hash_url: '',
    nivel_amenaza: '',
    detalles: '',
  });

  const [message, setMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (currentIncident) {
      setFormData({
        tipo_incidente: currentIncident.tipo_incidente,
        prioridad: currentIncident.prioridad,
        fecha_incidente: currentIncident.fecha_incidente,
        responsable: currentIncident.responsable,
        equipo_afectado: currentIncident.equipo_afectado,
        direccion_mac: currentIncident.direccion_mac,
        dependencia: currentIncident.dependencia,
        cantidad_detecciones: currentIncident.cantidad_detecciones || '',
        estado_equipo: currentIncident.estado_equipo || '',
        acciones_tomadas: currentIncident.acciones_tomadas || '',
        hash_url: currentIncident.hash_url || '',
        nivel_amenaza: currentIncident.nivel_amenaza || '',
        detalles: currentIncident.detalles || '',
      });
      setMessage('');
    } else {
      setFormData({
        tipo_incidente: '',
        prioridad: 'media',
        fecha_incidente: '',
        responsable: '',
        equipo_afectado: '',
        direccion_mac: '',
        dependencia: '',
        cantidad_detecciones: '',
        estado_equipo: '',
        acciones_tomadas: '',
        hash_url: '',
        nivel_amenaza: '',
        detalles: '',
      });
    }
  }, [currentIncident]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAnalyzeHash = async () => {
    if (!formData.hash_url) {
      setMessage('Por favor, ingresa un hash o URL para analizar.');
      return;
    }

    setIsAnalyzing(true);
    setMessage('');
    setAnalysisResult(null);

    try {
      const response = await axios.post(
        'https://192.168.39.115/gestion-incidentes/backend/analizar_hash.php',
        { hash: formData.hash_url }
      );
      
      const data = response.data;

      if (data.success) {
        setAnalysisResult(data.data);
        setFormData(prev => ({ ...prev, nivel_amenaza: data.data.nivel_compromiso }));
        setMessage('Análisis completado exitosamente.');
      } else {
        setMessage(data.message || 'Error al analizar el hash.');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor de análisis.');
      console.error('Error al analizar hash:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentIncident) {
        await axios.put(
          `https://192.168.39.115/gestion-incidentes/backend/incidentes.php?id=${currentIncident.id}`,
          formData
        );
        setMessage('Incidente actualizado exitosamente.');
        onIncidentEdited();
      } else {
        await axios.post(
          'https://192.168.39.115/gestion-incidentes/backend/incidentes.php',
          formData
        );
        setMessage('Incidente registrado exitosamente.');
        onIncidentAdded();
      }
      
      setFormData({
        tipo_incidente: '',
        prioridad: 'media',
        fecha_incidente: '',
        responsable: '',
        equipo_afectado: '',
        direccion_mac: '',
        dependencia: '',
        cantidad_detecciones: '',
        estado_equipo: '',
        acciones_tomadas: '',
        hash_url: '',
        nivel_amenaza: '',
        detalles: '',
      });
      setCurrentIncident(null);
      setAnalysisResult(null);
      
    } catch (error) {
      setMessage(`Error al ${currentIncident ? 'actualizar' : 'registrar'} el incidente. Inténtalo de nuevo.`);
      console.error(`Error al ${currentIncident ? 'actualizar' : 'registrar'} incidente:`, error);
    }
  };

  return (
    <div className="incidente-form bitacora-content-box">
      <h2 className="bitacora-section-heading">{currentIncident ? 'Editar Incidente' : 'Registrar Nuevo Incidente'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Sección de Análisis de Hash */}
          <div className="form-group form-textarea-full">
            <label>Hash / URL / Archivo para analizar</label>
            <div className="hash-input-container">
              <input
                type="text"
                name="hash_url"
                value={formData.hash_url}
                onChange={handleChange}
                className="form-input"
                placeholder="Ingresa el hash (SHA256, MD5) o URL"
              />
              <button
                type="button"
                onClick={handleAnalyzeHash}
                disabled={isAnalyzing}
                className="bitacora-analyze-button"
              >
                {isAnalyzing ? 'Analizando...' : 'Analizar Hash'}
              </button>
            </div>
          </div>
          
          {/* Sección de resultados del análisis */}
          {analysisResult && (
            <div className="analysis-results form-textarea-full">
              <h4>Resultados del Análisis de Amenaza:</h4>
              <p>
                Nivel de Amenaza: 
                <span className={`threat-level threat-level-${analysisResult.nivel_compromiso.toLowerCase()}`}>
                  {analysisResult.nivel_compromiso}
                </span>
              </p>
              <p>
                Tipo de Virus: <span>{analysisResult.tipo_virus || 'No disponible'}</span>
              </p>
              <p>
                Detecciones: <span>{analysisResult.estadisticas.malicious || 0} / {analysisResult.estadisticas.total || 0}</span>
              </p>
            </div>
          )}

          {/* Resto del formulario */}
          <div className="form-group">
            <label>Tipo de Incidente</label>
            <select
              name="tipo_incidente"
              value={formData.tipo_incidente}
              onChange={handleChange}
              className="form-input"
              required
            >
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
            <label>Prioridad</label>
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              className="form-input"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha del Incidente</label>
            <input
              type="date"
              name="fecha_incidente"
              value={formData.fecha_incidente}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Responsable</label>
            <input
              type="text"
              name="responsable"
              placeholder="Ej: Analista SOC"
              value={formData.responsable}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Equipo Afectado</label>
            <input
              type="text"
              name="equipo_afectado"
              value={formData.equipo_afectado}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Dirección MAC</label>
            <input
              type="text"
              name="direccion_mac"
              value={formData.direccion_mac}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Dependencia</label>
            <input
              type="text"
              name="dependencia"
              value={formData.dependencia}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Cantidad de Detecciones</label>
            <input
              type="number"
              name="cantidad_detecciones"
              value={formData.cantidad_detecciones}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Estado del Equipo</label>
            <input
              type="text"
              name="estado_equipo"
              value={formData.estado_equipo}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group form-textarea-full">
            <label>Acciones Tomadas</label>
            <textarea
              name="acciones_tomadas"
              rows="4"
              value={formData.acciones_tomadas}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Nivel de Amenaza</label>
            <input
              type="text"
              name="nivel_amenaza"
              value={formData.nivel_amenaza}
              onChange={handleChange}
              className="form-input"
              readOnly
            />
          </div>
          <div className="form-group form-textarea-full">
            <label>Detalles Adicionales</label>
            <textarea
              name="detalles"
              rows="4"
              value={formData.detalles}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="button-container">
          <button type="submit" className="bitacora-save-button">
            {currentIncident ? 'Guardar Cambios' : 'Registrar Incidente'}
          </button>
          {currentIncident && (
            <button type="button" onClick={() => setCurrentIncident(null)} className="bitacora-new-button">
              Cancelar Edición
            </button>
          )}
        </div>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default IncidenteForm;