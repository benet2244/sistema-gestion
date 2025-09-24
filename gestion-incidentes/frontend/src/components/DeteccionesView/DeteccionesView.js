import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeteccionForm from '../DeteccionForm/DeteccionForm';
import './DeteccionesView.css';

const DeteccionesView = () => {
    const [detecciones, setDetecciones] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentDeteccion, setCurrentDeteccion] = useState(null);

    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/';

    useEffect(() => {
        fetchDetecciones();
    }, []);

    const fetchDetecciones = async () => {
        try {
            const response = await axios.get(`${API_URL}obtener_incidentes.php`);
            if (response.data.registros) {
                setDetecciones(response.data.registros);
            } else {
                setDetecciones([]);
            }
        } catch (error) {
            console.error("Error al obtener las detecciones:", error);
            setDetecciones([]);
        }
    };

    const handleAddClick = () => {
        setCurrentDeteccion(null);
        setIsFormVisible(true);
    };

    const handleEditClick = (deteccion) => {
        setCurrentDeteccion(deteccion);
        setIsFormVisible(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta detección?')) {
            try {
                const response = await axios.post(`${API_URL}eliminar_deteccion.php`, { id: id });
                if (response.data.success) {
                    fetchDetecciones();
                } else {
                    alert('Error al eliminar la detección.');
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert('Error al conectar con el servidor para eliminar.');
            }
        }
    };

    const handleFormSuccess = () => {
        setIsFormVisible(false);
        fetchDetecciones();
    };

    const getStatusClass = (estado) => {
        switch (estado) {
            case 'Abierta': return 'status-abierta';
            case 'Pendiente': return 'status-pendiente';
            case 'Cerrada': return 'status-cerrada';
            default: return '';
        }
    };

    return (
        <div className="detecciones-view-container">
            {isFormVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setIsFormVisible(false)}>X</button>
                        <DeteccionForm onSuccess={handleFormSuccess} initialData={currentDeteccion} />
                    </div>
                </div>
            )}

            <div className="detecciones-header">
                <h1>Gestión de Detecciones</h1>
                <button className="add-button" onClick={handleAddClick}>Ingresar Nueva Detección</button>
            </div>

            <table className="detecciones-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Hostname</th>
                        <th>IP Origen</th>
                        <th>IP Destino</th>
                        <th>Descripción</th>
                        <th>Severidad</th>
                        <th>Estado</th>
                        <th>Fecha de Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {detecciones.length > 0 ? (
                        detecciones.map(d => (
                            <tr key={d.id}>
                                <td>{d.id}</td>
                                <td>{d.hostname}</td>
                                <td>{d.source_ip}</td>
                                <td>{d.target_ip}</td>
                                <td>{d.descripcion}</td>
                                <td>{d.prioridad}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(d.estado)}`}>{d.estado}</span>
                                </td>
                                <td>{new Date(d.fecha_reporte).toLocaleString()}</td>
                                <td className="actions-cell">
                                    <button className="edit-button" onClick={() => handleEditClick(d)}>Editar</button>
                                    <button className="delete-button" onClick={() => handleDeleteClick(d.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">No se encontraron detecciones.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DeteccionesView;
