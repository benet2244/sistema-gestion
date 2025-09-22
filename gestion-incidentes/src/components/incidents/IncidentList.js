import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            await axios.delete(`https://192.168.39.115/gestion-incidentes/backend/incidentes.php?id=${id}`);
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
        return <p className="text-center text-gray-500">Cargando incidentes...</p>;
    }

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Incidentes Registrados</h2>
            <div className="shadow-lg rounded-lg overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Tipo</th>
                            <th className="px-4 py-2 text-left">Prioridad</th>
                            <th className="px-4 py-2 text-left">Fecha</th>
                            <th className="px-4 py-2 text-left">Responsable</th>
                            <th className="px-4 py-2 text-left">Equipo Afectado</th>
                            <th className="px-4 py-2 text-left">MAC</th>
                            <th className="px-4 py-2 text-left">Dependencia</th>
                            <th className="px-4 py-2 text-left">Detecciones</th>
                            <th className="px-4 py-2 text-left">Estado</th>
                            <th className="px-4 py-2 text-left">Acciones Tomadas</th>
                            <th className="px-4 py-2 text-left">IOC</th>
                            <th className="px-4 py-2 text-left">Nivel Amenaza</th>
                            <th className="px-4 py-2 text-left">Detalles</th>
                            <th className="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {incidents.map(inc => (
                            <tr key={inc.id} className="border-b hover:bg-gray-100">
                                <td className="px-4 py-2">{inc.id}</td>
                                <td className="px-4 py-2">{inc.tipo_incidente}</td>
                                <td className="px-4 py-2">{inc.prioridad}</td>
                                <td className="px-4 py-2">{inc.fecha_incidente}</td>
                                <td className="px-4 py-2">{inc.responsable}</td>
                                <td className="px-4 py-2">{inc.equipo_afectado}</td>
                                <td className="px-4 py-2">{inc.direccion_mac}</td>
                                <td className="px-4 py-2">{inc.dependencia}</td>
                                <td className="px-4 py-2">{inc.cantidad_detecciones}</td>
                                <td className="px-4 py-2">{inc.estado_equipo}</td>
                                <td className="px-4 py-2">{inc.acciones_tomadas}</td>
                                <td className="px-4 py-2">{inc.hash_url}</td>
                                <td className="px-4 py-2">{inc.nivel_amenaza}</td>
                                <td className="px-4 py-2">{inc.detalles}</td>
                                <td className="px-4 py-2">
                                    <button onClick={() => onIncidentEdit(inc)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2">Editar</button>
                                    <button onClick={() => onIncidentDeleted(inc.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Eliminar</button>
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
