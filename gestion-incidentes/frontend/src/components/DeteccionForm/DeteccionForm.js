import React, { useState } from 'react';
import axios from 'axios';
import './DeteccionForm.css'; // Importa el archivo CSS

const DeteccionForm = () => {
    // Estado inicial del formulario
    const [formData, setFormData] = useState({
        source_ip: '',
        target_ip: '',
        hostname: '',
        detection_description: '',
        severity: 'Baja', // Valor por defecto
    });

    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // URL del endpoint de PHP para crear detecciones
    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/create_deteccion.php';

    // Manejador genérico de cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Manejador de envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Enviando detección...');
        setIsSuccess(false);

        try {
            const response = await axios.post(API_URL, formData);
            
            // Éxito: El servidor respondió con HTTP 200
            setMessage(response.data.mensaje || 'Detección registrada con éxito.');
            setIsSuccess(true);
            
            // Limpiar el formulario después del éxito
            setFormData({
                source_ip: '',
                target_ip: '',
                hostname: '',
                detection_description: '',
                severity: 'Baja',
            });

        } catch (error) {
            // Error: El servidor respondió con 4xx o error de red
            setIsSuccess(false);

            if (error.response) {
                // Error 400, 401, 500, etc.
                setMessage(`Error: ${error.response.data?.mensaje || 'Error al registrar la detección.'}`);
            } else if (error.request) {
                // Error de red o CORS
                setMessage('Error de conexión con el servidor. Verifica el estado del backend.');
            } else {
                setMessage('Ocurrió un error inesperado.');
            }
            console.error(error);
        }
    };

    return (
        <div className="deteccion-container">
            <h2>Registro de Detección de CrowdStrike</h2>
            
            {/* Mensaje de estado */}
            {message && (
                <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="deteccion-form">
                
                <div className="form-group">
                    <label htmlFor="source_ip">IP Origen:</label>
                    <input
                        type="text"
                        name="source_ip"
                        value={formData.source_ip}
                        onChange={handleChange}
                        required
                        placeholder="Ej. 192.168.1.10"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="target_ip">IP Destino:</label>
                    <input
                        type="text"
                        name="target_ip"
                        value={formData.target_ip}
                        onChange={handleChange}
                        required
                        placeholder="Ej. 10.0.0.5"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="hostname">Hostname:</label>
                    <input
                        type="text"
                        name="hostname"
                        value={formData.hostname}
                        onChange={handleChange}
                        required
                        placeholder="Ej. Servidor-Produccion-01"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="severity">Severidad:</label>
                    <select
                        name="severity"
                        value={formData.severity}
                        onChange={handleChange}
                        required
                    >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Crítica">Crítica</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="detection_description">Descripción de la Detección:</label>
                    <textarea
                        name="detection_description"
                        value={formData.detection_description}
                        onChange={handleChange}
                        required
                        rows="4"
                        placeholder="Detalle de la actividad o amenaza detectada."
                    />
                </div>

                <button type="submit" className="submit-btn">Registrar Detección</button>
            </form>
        </div>
    );
};

export default DeteccionForm;