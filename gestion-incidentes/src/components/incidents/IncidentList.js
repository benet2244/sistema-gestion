import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './IncidentList.css'; // Estilos para la lista de incidentes

// Estandarización de la URL del backend
const API_BASE_URL = 'http://localhost/gestion-incidentes/backend';

const IncidentList = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        setLoading(true);
        setError(null);
        try {
            // Usando fetch y la URL estandarizada
            const response = await fetch(`${API_BASE_URL}/incidentes.php`);
            if (!response.ok) {
                throw new Error('La respuesta de la red no fue correcta');
            }
            const data = await response.json();
            setIncidents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar los incidentes:", err);
            setError("No se pudieron cargar los incidentes. Intenta de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const onIncidentDeleted = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este incidente?')) {
            return;
        }

        setError(null);
        try {
            // Usando fetch para el método DELETE
            const response = await fetch(`${API_BASE_URL}/incidentes.php?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Error al eliminar el incidente');
            }
            setIncidents(prevIncidents => prevIncidents.filter(inc => inc.id !== id));
        } catch (err) {
            console.error("Error al eliminar el incidente:", err);
            setError("No se pudo eliminar el incidente. Intenta de nuevo.");
        }
    };

    const onIncidentEdit = (incident) => {
        // La navegación ya es correcta, no necesita cambios
        navigate(`/incidents/edit/${incident.id}`);
    };

    if (loading) {
        return <p className="loading-message">Cargando incidentes...</p>;
    }

    if (error) {
        return <div className="error-alert" role="alert">{error}</div>;
    }

    return (
        <div className="incident-list-container">
            <h2 className="incident-list-header">Incidentes Registrados</h2>
            <div className="table-wrapper">
                <table className="incidents-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Prioridad</th>
                            <th>Fecha</th>
                            <th>Responsable</th>
                            <th>Equipo Afectado</th>
                            <th>MAC</th>
                            <th>Dependencia</th>
                            <th>Detecciones</th>
                            <th>Estado</th>
                            <th>Acciones Tomadas</th>
                            <th>IOC</th>
                            <th>Nivel Amenaza</th>
                            <th>Detalles</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.length > 0 ? (
                            incidents.map(inc => (
                                <tr key={inc.id}>
                                    <td>{inc.id}</td>
                                    <td>{inc.tipo_incidente}</td>
                                    <td>{inc.prioridad}</td>
                                    <td>{inc.fecha_incidente}</td>
                                    <td>{inc.responsable}</td>
                                    <td>{inc.equipo_afectado}</td>
                                    <td>{inc.direccion_mac}</td>
                                    <td>{inc.dependencia}</td>
                                    <td>{inc.cantidad_detecciones}</td>
                                    <td>{inc.estado_equipo}</td>
                                    <td>{inc.acciones_tomadas}</td>
                                    <td>{inc.hash_url}</td>
                                    <td>{inc.nivel_amenaza}</td>
                                    <td>{inc.detalles}</td>
                                    <td className="action-buttons">
                                        <button onClick={() => onIncidentEdit(inc)} className="action-button edit-button">Editar</button>
                                        <button onClick={() => onIncidentDeleted(inc.id)} className="action-button delete-button">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="15" style={{ textAlign: 'center', padding: '2rem' }}>No hay incidentes registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncidentList;
