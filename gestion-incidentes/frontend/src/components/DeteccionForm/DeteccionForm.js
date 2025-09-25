import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeteccionForm.css';

const API_BASE_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend';

const DeteccionForm = ({ currentDeteccion, onSave, onClose }) => {
    const getInitialFormData = () => ({
        hostname: '',
        source_ip: '',
        target_ip: '',
        detection_description: '',
        severity: 'Media',
        estado: 'Nuevo',
        tipo_incidente: '',
        fecha_incidente: new Date().toISOString().split('T')[0],
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

    const [formData, setFormData] = useState(getInitialFormData());
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (currentDeteccion) {
            const formattedDate = currentDeteccion.fecha_incidente 
                ? new Date(currentDeteccion.fecha_incidente).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            setFormData({ ...getInitialFormData(), ...currentDeteccion, fecha_incidente: formattedDate });
        } else {
            setFormData(getInitialFormData());
        }
    }, [currentDeteccion]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAnalyze = async () => {
        if (!formData.hash_url) {
            setMessage('Por favor, ingrese un Hash, URL o IP para analizar.');
            setIsError(true);
            return;
        }
        setIsAnalyzing(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await axios.post(`${API_BASE_URL}/analizar_hash.php`, { hash: formData.hash_url });
            
            if (response.data.success) {
                if (response.data.data && response.data.data.nivel_compromiso) {
                    setFormData(prev => ({ ...prev, nivel_amenaza: response.data.data.nivel_compromiso }));
                }
                setMessage(response.data.message || 'Análisis completado.');
                setIsError(false);
            } else {
                setMessage(response.data.message || 'Ocurrió un error durante el análisis.');
                setIsError(true);
            }
        } catch (error) {
            let detailedError = `Error de red: ${error.message}`;
            if (error.response && error.response.data && error.response.data.message) {
                detailedError = error.response.data.message;
            } else if (error.response) {
                detailedError = `Error del servidor (${error.response.status}): ${JSON.stringify(error.response.data)}`;
            }
            setMessage(detailedError);
            setIsError(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        const url = `${API_BASE_URL}/ingresar_deteccion.php${currentDeteccion ? `?id=${currentDeteccion.id_deteccion}` : ''}`;
        const method = currentDeteccion ? 'put' : 'post';

        try {
            const response = await axios[method](url, formData);
            if (response.data.success) {
                setMessage(response.data.message);
                onSave();
                setTimeout(() => { onClose(); }, 1500);
            } else {
                setMessage(response.data.message || 'Ocurrió un error al guardar.');
                setIsError(true);
            }
        } catch (error) {
            let detailedError = `Error de red: ${error.message}`;
            if (error.response && error.response.data && error.response.data.message) {
                detailedError = error.response.data.message;
            } else if (error.response) {
                detailedError = `Error del servidor (${error.response.status}): ${JSON.stringify(error.response.data)}`;
            }
            setMessage(detailedError);
            setIsError(true);
        }
    };

    return (
        <div className="incident-form-container">
            <form onSubmit={handleSubmit} className="incident-form">
                <h2 className="form-title">{currentDeteccion ? 'Editar Incidente' : 'Registrar Nuevo Incidente'}</h2>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tipo de Incidente</label>
                        <input type="text" name="tipo_incidente" value={formData.tipo_incidente} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Fecha del Incidente</label>
                        <input type="date" name="fecha_incidente" value={formData.fecha_incidente} onChange={handleChange} required />
                    </div>
                     <div className="form-group">
                        <label>Severidad</label>
                        <select name="severity" value={formData.severity} onChange={handleChange}>
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Estado del Incidente</label>
                        <select name="estado" value={formData.estado} onChange={handleChange}>
                            <option value="Nuevo">Nuevo</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Cerrado">Cerrado</option>
                        </select>
                    </div>
                     <div className="form-group">
                        <label>Responsable</label>
                        <input type="text" name="responsable" value={formData.responsable} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Equipo Afectado</label>
                        <input type="text" name="equipo_afectado" value={formData.equipo_afectado} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Nombre del Host</label>
                        <input type="text" name="hostname" value={formData.hostname} onChange={handleChange} />
                    </div>
                     <div className="form-group">
                        <label>Dependencia</label>
                        <input type="text" name="dependencia" value={formData.dependencia} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Dirección IP Origen</label>
                        <input type="text" name="source_ip" value={formData.source_ip} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Dirección IP Destino</label>
                        <input type="text" name="target_ip" value={formData.target_ip} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Dirección MAC</label>
                        <input type="text" name="direccion_mac" value={formData.direccion_mac} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Cantidad de Detecciones</label>
                        <input type="number" name="cantidad_detecciones" value={formData.cantidad_detecciones} onChange={handleChange} />
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
                    <div className="form-group full-width">
                        <label>Nivel de Amenaza (Resultado Análisis)</label>
                        <input type="text" name="nivel_amenaza" value={formData.nivel_amenaza} onChange={handleChange} readOnly placeholder="Se autocompleta con el análisis"/>
                    </div>
                     <div className="form-group full-width">
                        <label>Descripción de la Detección</label>
                        <textarea name="detection_description" value={formData.detection_description} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group full-width">
                        <label>Acciones Tomadas</label>
                        <textarea name="acciones_tomadas" value={formData.acciones_tomadas} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group full-width">
                        <label>Detalles Adicionales</label>
                        <textarea name="detalles" value={formData.detalles} onChange={handleChange}></textarea>
                    </div>
                </div>
                {message && <div className={`form-message ${isError ? 'error' : 'success'}`}>{message}</div>}
                <div className="form-actions">
                    <button type="submit" className="submit-button">{currentDeteccion ? 'Actualizar Incidente' : 'Guardar Incidente'}</button>
                    <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default DeteccionForm;
