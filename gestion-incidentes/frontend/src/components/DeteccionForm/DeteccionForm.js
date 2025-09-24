import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeteccionForm.css';

const DeteccionForm = ({ onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        id: '',
        hostname: '',
        source_ip: '',
        target_ip: '',
        detection_description: '',
        severity: 'Baja',
        estado: 'Abierta', // Valor por defecto
    });

    const isEditMode = initialData && initialData.id;

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                id: initialData.id,
                hostname: initialData.hostname, // Corregido de titulo a hostname
                source_ip: initialData.source_ip || '',
                target_ip: initialData.target_ip || '',
                detection_description: initialData.descripcion,
                severity: initialData.prioridad,
                estado: initialData.estado || 'Abierta', // Cargar estado existente
            });
        }
    }, [initialData, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditMode 
            ? 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/actualizar_deteccion.php' 
            : 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/ingresar_deteccion.php';

        try {
            const response = await axios.post(url, formData);
            if (response.data.success) {
                alert(`Detección ${isEditMode ? 'actualizada' : 'ingresada'} con éxito`);
                if (onSuccess) onSuccess();
            } else {
                alert(`Error al ${isEditMode ? 'actualizar' : 'ingresar'} la detección. Message: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error en el formulario:', error);
            alert('Hubo un problema de conexión.');
        }
    };

    return (
        <div className="deteccion-form-container">
            <h2>{isEditMode ? 'Editar Detección' : 'Ingresar Nueva Detección'}</h2>
            <form onSubmit={handleSubmit} className="deteccion-form">
                <div className="form-group">
                    <label>Hostname</label>
                    <input type="text" name="hostname" value={formData.hostname} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>IP Origen</label>
                        <input type="text" name="source_ip" value={formData.source_ip} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>IP Destino</label>
                        <input type="text" name="target_ip" value={formData.target_ip} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-row">
                     <div className="form-group">
                        <label>Severidad</label>
                        <select name="severity" value={formData.severity} onChange={handleChange}>
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                            <option value="Crítica">Crítica</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Estado</label>
                        <select name="estado" value={formData.estado} onChange={handleChange}>
                            <option value="Abierta">Abierta</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Cerrada">Cerrada</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Descripción de la Detección</label>
                    <textarea name="detection_description" value={formData.detection_description} onChange={handleChange} required></textarea>
                </div>

                <button type="submit" className="submit-button">{isEditMode ? 'Actualizar' : 'Ingresar'}</button>
            </form>
        </div>
    );
};

export default DeteccionForm;
