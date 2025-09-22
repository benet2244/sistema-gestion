import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../IncidentCss/IncidentList.css';

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
            const response = await axios.get('https://192.168.39.115/gestion-incidentes/backend/incidentes.php');
            setIncidents(response.data);
        } catch (err) {
            console.error("Error al cargar los incidentes:", err);
            setError("No se pudieron cargar los incidentes. Intenta de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const onIncidentDeleted = async (id) => {
        setError(null);
        try {
            await axios.delete(`https://localhost/gestion-incidentes/backend/incidentes.php?id=${id}`);
            fetchIncidents();
        } catch (err) {
            console.error("Error al eliminar el incidente:", err);
            setError("No se pudo eliminar el incidente. Intenta de nuevo.");
        }
    };

    const onIncidentEdit = (incident) => {
        navigate(`/incidents/edit/${incident.id}`);
    };

    if (loading) {
        return <p>Cargando incidentes...</p>;
    }

    if (error) {
        return <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>;
    }

    return (
        <div className="incident-list bitacora-content-box">
            <h2 className="bitacora-section-heading">Incidentes Registrados</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo de Incidente</th>
                            <th>Prioridad</th>
                            <th>Fecha</th>
                            <th>Responsable</th>
                            <th>Equipo Afectado</th>
                            <th>Dirección MAC</th>
                            <th>Dependencia</th>
                            <th>Detecciones</th>
                            <th>Estado</th>
                            <th>Acciones Tomadas</th>
                            <th>Hash/URL/Archivo</th>
                            <th>Nivel de Amenaza</th>
                            <th>Detalles</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map(inc => (
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
                                <td>
                                    <button onClick={() => onIncidentEdit(inc)} className="edit-btn">Editar</button>
                                    <button onClick={() => onIncidentDeleted(inc.id)} className="delete-btn">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncidentList;
