import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeteccionForm.css';

const API_BASE_URL = 'http://192.168.39.75/gestion-incidentes/sistema/backend';

// Este componente se reconstruyó basándose en el esquema de la base de datos para asegurar una correspondencia 1:1.
const DeteccionForm = ({ currentDeteccion, onSave, onClose }) => {
    
    // El estado inicial del formulario ahora refleja exactamente las columnas de la tabla 'detecciones'.
    const getInitialFormData = () => ({
        // Columnas de la DB
        source_ip: '',
        target_ip: '',
        hostname: '',
        detection_description: '',
        severity: 'Media', // Valor por defecto del ENUM
        estado: 'Abierta', // Valor por defecto de la DB
        acciones_tomadas: '',
        cantidad_detecciones: '', // Será un número, pero el input lo maneja como string inicialmente
        dependencia: '',
        detalles: '',
        direccion_mac: '',
        equipo_afectado: '',
        estado_equipo: '',
        fecha_incidente: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
        hash_url: '',
        nivel_amenaza: '', // Se llena con el análisis
        responsable: '',
        tipo_incidente: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (currentDeteccion) {
            const formattedData = { ...currentDeteccion };
            // Asegurar que la fecha tenga el formato YYYY-MM-DD para el input type="date"
            if (formattedData.fecha_incidente) {
                formattedData.fecha_incidente = new Date(formattedData.fecha_incidente).toISOString().split('T')[0];
            }
            setFormData({ ...getInitialFormData(), ...formattedData });
        } else {
            setFormData(getInitialFormData());
        }
    }, [currentDeteccion]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // La lógica de análisis de IOC permanece igual, ya funciona correctamente.
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
                setFormData(prev => ({ ...prev, nivel_amenaza: response.data.data?.nivel_compromiso || 'Desconocido' }));
                setMessage(response.data.message || 'Análisis completado.');
                setIsError(false);
            } else {
                setMessage(response.data.message || 'Ocurrió un error durante el análisis.');
                setIsError(true);
            }
        } catch (error) {
            const detailedError = error.response?.data?.message || error.message;
            setMessage(`Error en análisis: ${detailedError}`);
            setIsError(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // El handleSubmit ahora enviará un objeto formData perfectamente alineado con la DB.
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
                onSave(); // Refresca la tabla de detecciones
                setTimeout(() => { onClose(); }, 1500);
            } else {
                setMessage(response.data.message || 'Ocurrió un error al guardar.');
                setIsError(true);
            }
        } catch (error) {
            const detailedError = error.response?.data?.message || error.message;
            setMessage(`Error al guardar: ${detailedError}`);
            setIsError(true);
        }
    };

    // El JSX del formulario ahora tiene un campo para cada columna de la tabla 'detecciones'
    return (
        <div className="incident-form-container">
            <form onSubmit={handleSubmit} className="incident-form">
                <h2 className="form-title">{currentDeteccion ? 'Editar Incidente' : 'Registrar Nuevo Incidente'}</h2>
                <div className="form-grid">

                    {/* Campos requeridos por lógica de negocio */}
                    <div className="form-group"><label>Tipo de Incidente</label><input type="text" name="tipo_incidente" value={formData.tipo_incidente} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Fecha del Incidente</label><input type="date" name="fecha_incidente" value={formData.fecha_incidente} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Responsable</label><input type="text" name="responsable" value={formData.responsable} onChange={handleChange} required /></div>

                    {/* Campos de Red */}
                    <div className="form-group"><label>IP Origen</label><input type="text" name="source_ip" value={formData.source_ip} onChange={handleChange} /></div>
                    <div className="form-group"><label>IP Destino</label><input type="text" name="target_ip" value={formData.target_ip} onChange={handleChange} /></div>
                    
                    {/* Campos de Clasificación */}
                    <div className="form-group"><label>Severidad</label><select name="severity" value={formData.severity} onChange={handleChange}><option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option><option value="Crítica">Crítica</option></select></div>
                    <div className="form-group"><label>Estado del Incidente</label><select name="estado" value={formData.estado} onChange={handleChange}><option value="Abierta">Abierta</option><option value="En Proceso">En Proceso</option><option value="Cerrada">Cerrada</option></select></div>
                    
                    {/* Campos del Equipo Afectado */}
                    <div className="form-group"><label>Nombre del Host</label><input type="text" name="hostname" value={formData.hostname} onChange={handleChange} /></div>
                    <div className="form-group"><label>Equipo Afectado</label><input type="text" name="equipo_afectado" value={formData.equipo_afectado} onChange={handleChange} /></div>
                    <div className="form-group"><label>Dirección MAC</label><input type="text" name="direccion_mac" value={formData.direccion_mac} onChange={handleChange} /></div>
                    <div className="form-group"><label>Estado del Equipo</label><input type="text" name="estado_equipo" value={formData.estado_equipo} onChange={handleChange} /></div>
                    <div className="form-group"><label>Dependencia</label><input type="text" name="dependencia" value={formData.dependencia} onChange={handleChange} /></div>
                    <div className="form-group"><label>Cantidad de Detecciones</label><input type="number" name="cantidad_detecciones" value={formData.cantidad_detecciones} onChange={handleChange} /></div>

                    {/* Sección de Análisis de IOC */}
                    <div className="form-group full-width ioc-analysis-section">
                        <label>Indicador de Compromiso (Hash, URL, IP)</label>
                        <div className="ioc-input-group">
                            <input type="text" name="hash_url" value={formData.hash_url} onChange={handleChange} placeholder="Ingrese el IOC a analizar" />
                            <button type="button" onClick={handleAnalyze} disabled={isAnalyzing} className="analyze-button">{isAnalyzing ? 'Analizando...' : 'Analizar IOC'}</button>
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>Nivel de Amenaza (Resultado Análisis)</label>
                        <input type="text" name="nivel_amenaza" value={formData.nivel_amenaza} onChange={handleChange} readOnly placeholder="Se autocompleta con el análisis"/>
                    </div>

                    {/* Campos de Texto Largo */}
                    <div className="form-group full-width"><label>Descripción de la Detección</label><textarea name="detection_description" value={formData.detection_description} onChange={handleChange}></textarea></div>
                    <div className="form-group full-width"><label>Acciones Tomadas</label><textarea name="acciones_tomadas" value={formData.acciones_tomadas} onChange={handleChange}></textarea></div>
                    <div className="form-group full-width"><label>Detalles Adicionales</label><textarea name="detalles" value={formData.detalles} onChange={handleChange}></textarea></div>
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
