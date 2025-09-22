import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './dashboard.css';

// Registra los elementos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Componente para las tarjetas de estadísticas (KPIs)
const DashboardCard = ({ title, value }) => {
    return (
        <div className="dashboard-card">
            <span className="card-title">{title}</span>
            <span className="card-value">{value}</span>
        </div>
    );
};

// Componente para el gráfico de tipo de incidente
const IncidentTypeChart = ({ incidents }) => {
    // Asegura que los incidentes sean un array antes de procesar
    if (!Array.isArray(incidents) || incidents.length === 0) {
        return <p>No hay datos de incidentes para mostrar.</p>;
    }

    const types = incidents.reduce((acc, inc) => {
        const type = inc.tipo_incidente ? inc.tipo_incidente.toLowerCase() : 'desconocido';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(types),
        datasets: [{
            data: Object.values(types),
            backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e'],
        }],
    };

    return (
        <div className="chart-container">
            <h3>Incidentes por Tipo</h3>
            <Doughnut data={data} />
        </div>
    );
};

// Componente para el gráfico de estado del equipo
const IncidentStatusChart = ({ incidents }) => {
    // Asegura que los incidentes sean un array antes de procesar
    if (!Array.isArray(incidents) || incidents.length === 0) {
        return <p>No hay datos de estado de equipos para mostrar.</p>;
    }

    const statuses = incidents.reduce((acc, inc) => {
        const status = inc.estado_equipo ? inc.estado_equipo.toLowerCase() : 'desconocido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(statuses),
        datasets: [{
            data: Object.values(statuses),
            backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f', '#3498db', '#9b59b6'],
        }],
    };

    return (
        <div className="chart-container">
            <h3>Estado de los Equipos</h3>
            <Doughnut data={data} />
        </div>
    );
};

// Componente para la tabla de incidentes recientes
const RecentIncidentsTable = ({ incidents }) => {
    // Asegura que los incidentes sean un array antes de procesar
    if (!Array.isArray(incidents) || incidents.length === 0) {
        return (
            <div className="dashboard-section">
                <h2>Incidentes Recientes</h2>
                <div className="table-container">
                    <p style={{ textAlign: 'center' }}>No hay incidentes recientes para mostrar.</p>
                </div>
            </div>
        );
    }
    
    // Muestra solo los 5 incidentes más recientes
    const recentIncidents = incidents.slice(0, 5);

    return (
        <div className="dashboard-section">
            <h2>Incidentes Recientes</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo de Incidente</th>
                            <th>Prioridad</th>
                            <th>Fecha</th>
                            <th>Responsable</th>
                            <th>Estado del Equipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentIncidents.map(inc => (
                            <tr key={inc.id}>
                                <td>{inc.id}</td>
                                <td>{inc.tipo_incidente}</td>
                                <td>{inc.prioridad}</td>
                                <td>{inc.fecha_incidente}</td>
                                <td>{inc.responsable}</td>
                                <td>{inc.estado_equipo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Componente principal del Dashboard
const Dashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState({
        totalIncidents: 0,
        highPriority: 0,
        resolved: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const calculateStats = useCallback((data) => {
        const total = data.length;
        const highPriority = data.filter(inc => inc.prioridad && inc.prioridad.toLowerCase() === 'alta').length;
        const resolved = data.filter(inc => inc.estado_equipo && inc.estado_equipo.toLowerCase() === 'limpio').length; // Se corrige el estado de 'resuelto' a 'limpio'

        setStats({
            totalIncidents: total,
            highPriority: highPriority,
            resolved: resolved
        });
    }, []);

    const fetchIncidents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // **CORRECCIÓN:** Se elimina `?id=${id}` ya que se necesita obtener todos los incidentes para el dashboard
            const response = await axios.get('https://192.168.39.115/gestion-incidentes/backend/incidentes.php');
            
            // **CORRECCIÓN:** Verifica si la respuesta es un array antes de actualizar el estado
            if (Array.isArray(response.data)) {
                setIncidents(response.data);
                calculateStats(response.data);
            } else {
                console.error("Error: La respuesta de la API no es un array.", response.data);
                setError("No se pudieron cargar los datos de incidentes. Formato de datos incorrecto.");
                setIncidents([]); // Asegura que el estado sea un array vacío para evitar errores
            }
        } catch (err) {
            console.error("Error al cargar los incidentes:", err);
            setError("Error al cargar los incidentes. Por favor, revisa la conexión con el backend.");
            setIncidents([]); // Asegura que el estado sea un array vacío para evitar errores
        } finally {
            setLoading(false);
        }
    }, [calculateStats]);

    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    if (loading) {
        return <div className="loading-message">Cargando datos del dashboard...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard">
            <h1>Dashboard de Incidentes</h1>
            <div className="dashboard-kpis">
                <DashboardCard title="Total de Incidentes" value={stats.totalIncidents} />
                <DashboardCard title="Prioridad Alta" value={stats.highPriority} />
                <DashboardCard title="Equipos Limpios" value={stats.resolved} />
            </div>

            <div className="dashboard-charts">
                <IncidentTypeChart incidents={incidents} />
                <IncidentStatusChart incidents={incidents} />
            </div>

            <RecentIncidentsTable incidents={incidents} />
        </div>
    );
};

export default Dashboard;