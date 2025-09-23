import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale,
    LinearScale,   
    BarElement, 
    PointElement,
    LineElement,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import './dashboard.css';
import BitacoraGraficas from '../BitacoraGraficas/BitacoraGraficas'; // <-- PASO 1: IMPORTAR EL COMPONENTE

// Registrar todos los elementos de Chart.js necesarios
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

// --- Iconos para las tarjetas ---
const TodayIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const TotalIncidentsIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m-9 8h12a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const HighPriorityIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const PendingIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ResolvedIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

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

// --- Componentes de Gráficas Específicas ---
const ChartBox = ({ title, children }) => (
    <div className="chart-box">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-content-wrapper">{children}</div>
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
    return (
        <div className="recent-incidents-container">
            <h2 className="recent-incidents-title">Incidentes Recientes</h2>
            <table className="incidents-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Tipo</th><th>Prioridad</th><th>Fecha</th><th>Responsable</th><th>Estado Equipo</th>
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
                            <td>{inc.estado_equipo || 'N/A'}</td>
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
    const [stats, setStats] = useState({ total: 0, high: 0, pending: 0, resolved: 0, today: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const calculateStats = useCallback((data) => {
        const resolvedCount = data.filter(inc => inc.estado_equipo?.toLowerCase() === 'limpio').length;
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const todayCount = data.filter(inc => {
            try {
                const incidentDate = new Date(inc.fecha_incidente);
                return incidentDate > twentyFourHoursAgo;
            } catch(e) { return false; }
        }).length;

        setStats({
            total: data.length,
            high: data.filter(inc => inc.prioridad?.toLowerCase() === 'alta').length,
            resolved: resolvedCount,
            pending: data.length - resolvedCount,
            today: todayCount,
        });
    }, []);

    const fetchIncidents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://192.168.39.115/gestion-incidentes/backend/incidentes.php');
            if (Array.isArray(response.data)) {
                setIncidents(response.data);
                calculateStats(response.data);
            } else { throw new Error("Formato de datos incorrecto."); }
        } catch (err) {
            console.error("Error fetching incidents:", err);
            setError("Error al cargar los incidentes.");
            setIncidents([]);
        } finally { setLoading(false); }
    }, [calculateStats]);

    useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

    const incidentTypeData = (() => {
        const counts = incidents.reduce((acc, inc) => {
            const type = inc.tipo_incidente || 'Desconocido';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        const sortedTypes = Object.entries(counts).sort(([,a],[,b]) => b-a).slice(0, 5);
        return {
            labels: sortedTypes.map(([label]) => label),
            datasets: [{
                label: 'Nº de Incidentes',
                data: sortedTypes.map(([,data]) => data),
                backgroundColor: '#3B82F6',
            }],
        };
    })();

    const equipmentStatusData = (() => {
        const counts = incidents.reduce((acc, inc) => {
            const status = inc.estado_equipo || 'Desconocido';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        return {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#6B7280'],
                borderColor: '#fff',
                borderWidth: 2,
            }],
        };
    })();
    
    const monthlyTrendData = (() => {
        const last12Months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }).reverse();

        const counts = incidents.reduce((acc, inc) => {
            try {
                const month = inc.fecha_incidente.substring(0, 7);
                if (acc[month] !== undefined) acc[month]++;
            } catch(e) {}
            return acc;
        }, last12Months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {}));

        return {
            labels: last12Months.map(m => new Date(m).toLocaleString('default', { month: 'short', year: '2-digit' })),
            datasets: [{
                label: 'Incidentes por Mes',
                data: Object.values(counts),
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3B82F6',
                tension: 0.3,
            }],
        };
    })();

    if (loading) return <div className="loading-message">Cargando Dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Panel de Operaciones de Seguridad</h1>
                <button onClick={fetchIncidents} className="refresh-button">Actualizar</button>
            </div>

            <div className="stats-grid">
                <DashboardCard title="Incidentes de Hoy" value={stats.today} icon={<TodayIcon />} borderColor="border-purple" />
                <DashboardCard title="Total de Incidentes" value={stats.total} icon={<TotalIncidentsIcon />} borderColor="border-blue" />
                <DashboardCard title="Prioridad Alta" value={stats.high} icon={<HighPriorityIcon />} borderColor="border-red" />
                <DashboardCard title="Pendientes" value={stats.pending} icon={<PendingIcon />} borderColor="border-yellow" />
                <DashboardCard title="Equipos Limpios" value={stats.resolved} icon={<ResolvedIcon />} borderColor="border-green" />
            </div>

            <div className="main-charts-grid">
                <ChartBox title="Top 5 Tipos de Incidentes">
                    {incidents.length > 0 
                        ? <Bar data={incidentTypeData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { x: { ticks: { stepSize: 1 }}}}} />
                        : <p className="chart-placeholder">No hay datos</p>}
                </ChartBox>
                
                <ChartBox title="Estado de los Equipos">
                     {incidents.length > 0 
                        ? <Doughnut data={equipmentStatusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' }}}} />
                        : <p className="chart-placeholder">No hay datos</p>}
                </ChartBox>

                <div className="line-chart-container">
                    <ChartBox title="Evolución de Incidentes (Últimos 12 Meses)">
                        {incidents.length > 0 
                            ? <Line data={monthlyTrendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
                            : <p className="chart-placeholder">No hay datos</p>}
                    </ChartBox>
                </div>
            </div>

            <RecentIncidentsTable incidents={incidents} />

 
        </div>
    );
};

export default Dashboard;
