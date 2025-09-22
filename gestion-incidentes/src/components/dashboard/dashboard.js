
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './dashboard.css'; // Importamos el CSS

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Iconos SVG para las Tarjetas ---
const TotalIncidentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m-9 8h12a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const HighPriorityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ResolvedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Componente de Tarjeta del Dashboard ---
const DashboardCard = ({ title, value, icon, borderColor }) => (
    <div className={`dashboard-card ${borderColor}`}>
        <div className="card-content">
            <p className="card-title">{title}</p>
            <p className="card-value">{value}</p>
        </div>
        <div className="card-icon">{icon}</div>
    </div>
);

// --- Gráficos ---
const Chart = ({ title, chartId, data, incidents }) => (
    <div className={`chart-container ${chartId}`}>
        <h3 className="chart-title">{title}</h3>
        <div className="chart-wrapper">
            {incidents.length > 0 
                ? <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} /> 
                : <p className="chart-placeholder">No hay datos disponibles</p>
            }
        </div>
    </div>
);

// --- Tabla de Incidentes Recientes ---
const RecentIncidentsTable = ({ incidents }) => {
    const getPriorityPillClass = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'alta': return 'pill-high';
            case 'media': return 'pill-medium';
            case 'baja': return 'pill-low';
            default: return '';
        }
    };

    const getStatusPillClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'limpio': return 'pill-clean';
            case 'infectado': return 'pill-infected';
            default: return '';
        }
    };

    return (
        <div className="recent-incidents-container">
            <h2 className="recent-incidents-title">Incidentes Recientes</h2>
            <table className="incidents-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Prioridad</th>
                        <th>Fecha</th>
                        <th>Responsable</th>
                        <th>Estado Equipo</th>
                    </tr>
                </thead>
                <tbody>
                    {incidents.slice(0, 5).map(inc => (
                        <tr key={inc.id}>
                            <td>{inc.id}</td>
                            <td>{inc.tipo_incidente}</td>
                            <td><span className={`status-pill ${getPriorityPillClass(inc.prioridad)}`}>{inc.prioridad || 'N/A'}</span></td>
                            <td>{inc.fecha_incidente}</td>
                            <td>{inc.responsable}</td>
                            <td><span className={`status-pill ${getStatusPillClass(inc.estado_equipo)}`}>{inc.estado_equipo || 'N/A'}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Componente Principal del Dashboard ---
const Dashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState({ totalIncidents: 0, highPriority: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const calculateStats = useCallback((data) => {
        setStats({
            totalIncidents: data.length,
            highPriority: data.filter(inc => inc.prioridad?.toLowerCase() === 'alta').length,
            resolved: data.filter(inc => inc.estado_equipo?.toLowerCase() === 'limpio').length,
        });
    }, []);

    const fetchIncidents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://192.168.39.115/gestion-incidentes/backend/incidentes.php');
            if (Array.isArray(response.data)) {
                setIncidents(response.data);
                calculateStats(response.data);
            } else {
                throw new Error("Formato de datos incorrecto.");
            }
        } catch (err) {
            console.error("Error fetching incidents:", err);
            setError("Error al cargar los incidentes. Por favor, verifica la conexión.");
            setIncidents([]);
        } finally {
            setLoading(false);
        }
    }, [calculateStats]);

    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    // --- Preparación de datos para los gráficos ---
    const incidentTypeData = {
        labels: Object.keys(incidents.reduce((acc, inc) => ({...acc, [inc.tipo_incidente || 'Desconocido']: 0 }), {})),
        datasets: [{
            data: Object.values(incidents.reduce((acc, inc) => ({...acc, [inc.tipo_incidente || 'Desconocido']: (acc[inc.tipo_incidente] || 0) + 1 }), {})),
            backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'],
            borderColor: '#fff',
            borderWidth: 2,
        }],
    };

    const incidentStatusData = {
        labels: Object.keys(incidents.reduce((acc, inc) => ({...acc, [inc.estado_equipo || 'Desconocido']: 0 }), {})),
        datasets: [{
            data: Object.values(incidents.reduce((acc, inc) => ({...acc, [inc.estado_equipo || 'Desconocido']: (acc[inc.estado_equipo] || 0) + 1 }), {})),
            backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'],
            borderColor: '#fff',
            borderWidth: 2,
        }],
    };

    if (loading) {
        return <div className="loading-message">Cargando Dashboard...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <button onClick={fetchIncidents} className="refresh-button">
                    Actualizar
                </button>
            </div>

            <div className="stats-grid">
                <DashboardCard title="Total de Incidentes" value={stats.totalIncidents} icon={<TotalIncidentsIcon />} borderColor="border-blue" />
                <DashboardCard title="Prioridad Alta" value={stats.highPriority} icon={<HighPriorityIcon />} borderColor="border-red" />
                <DashboardCard title="Equipos Limpios" value={stats.resolved} icon={<ResolvedIcon />} borderColor="border-green" />
            </div>

            <div className="charts-grid">
                <Chart title="Incidentes por Tipo" chartId="chart-container-types" data={incidentTypeData} incidents={incidents} />
                <Chart title="Estado de los Equipos" chartId="chart-container-status" data={incidentStatusData} incidents={incidents} />
            </div>

            <RecentIncidentsTable incidents={incidents} />
        </div>
    );
};

export default Dashboard;
