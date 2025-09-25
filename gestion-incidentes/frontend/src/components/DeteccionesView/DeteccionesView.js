import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DeteccionForm from '../DeteccionForm/DeteccionForm';
import './DeteccionesView.css';

const DeteccionesView = () => {
    const [detecciones, setDetecciones] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentDeteccion, setCurrentDeteccion] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/';

    const fetchDetecciones = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}obtener_detecciones.php?month=${selectedMonth}&year=${selectedYear}`);
            setDetecciones(response.data.registros || []);
        } catch (error) {
            console.error("Error al obtener las detecciones:", error);
            setDetecciones([]);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        fetchDetecciones();
    }, [fetchDetecciones]);

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
                    fetchDetecciones(); // Recargar datos
                } else {
                    alert('Error al eliminar la detección: ' + response.data.message);
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert('Error al conectar con el servidor para eliminar.');
            }
        }
    };
    
    // Esta función combina el cierre del formulario y la recarga de datos.
    const handleSaveSuccess = () => {
        fetchDetecciones();
        setIsFormVisible(false);
    };

    const getStatusClass = (estado) => {
        switch (estado) {
            case 'Abierta': return 'status-abierta';
            case 'En Proceso': return 'status-pendiente';
            case 'Cerrada': return 'status-cerrada';
            default: return '';
        }
    };
    
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('es-ES', { month: 'long' }) }));

    return (
        <div className="detecciones-view-container">
            {isFormVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setIsFormVisible(false)}>X</button>
                        {/* CORRECCIÓN: Se pasan las props con los nombres correctos: onSave, onClose, y currentDeteccion */}
                        <DeteccionForm 
                            onSave={handleSaveSuccess} 
                            onClose={() => setIsFormVisible(false)}
                            currentDeteccion={currentDeteccion} 
                        />
                    </div>
                </div>
            )}

            <div className="detecciones-header">
                <h1>Gestión de Detecciones</h1>
                <div className="header-controls">
                    <div className="filter-controls">
                        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button className="add-button" onClick={handleAddClick}>Ingresar Nueva Detección</button>
                </div>
            </div>

            <table className="detecciones-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tipo Incidente</th>
                        <th>IP Origen</th>
                        <th>Responsable</th>
                        <th>Severidad</th>
                        <th>Estado</th>
                        <th>Fecha Incidente</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {detecciones.length > 0 ? (
                        detecciones.map(d => (
                            <tr key={d.id_deteccion}>
                                <td>{d.id_deteccion}</td>
                                <td>{d.tipo_incidente}</td>
                                <td>{d.source_ip}</td>
                                <td>{d.responsable}</td>
                                <td>{d.severity}</td>
                                <td><span className={`status-badge ${getStatusClass(d.estado)}`}>{d.estado}</span></td>
                                <td>{new Date(d.fecha_incidente).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <button className="edit-button" onClick={() => handleEditClick(d)}>Editar</button>
                                    <button className="delete-button" onClick={() => handleDeleteClick(d.id_deteccion)}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">No se encontraron detecciones para el período seleccionado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DeteccionesView;
