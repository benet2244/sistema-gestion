import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale, BarElement, PointElement, LineElement, Title
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

// --- COMPONENTES (sin cambios) ---
const TodayIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const TotalIncidentsIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m-9 8h12a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const HighPriorityIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const PendingIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ResolvedIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const DashboardCard = ({ title, value, icon, borderColor }) => (
    <div className={`dashboard-card ${borderColor}`}>
        <div className="card-content"><p className="card-title">{title}</p><p className="card-value">{value}</p></div>
        <div className="card-icon">{icon}</div>
    </div>
);

const ChartBox = ({ title, children }) => (
    <div className="chart-box">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-content-wrapper">{children}</div>
    </div>
);

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
            <h2 className="recent-incidents-title">Incidentes Recientes (Últimos 5)</h2>
            <table className="incidents-table">
                <thead><tr><th>ID</th><th>Tipo</th><th>Prioridad</th><th>Fecha</th><th>Responsable</th><th>Estado</th></tr></thead>
                <tbody>
                    {incidents.map(inc => (
                        <tr key={inc.id}>
                            <td>{inc.id}</td><td>{inc.tipo_incidente}</td>
                            <td><span className={`status-pill ${getPriorityPillClass(inc.prioridad)}`}>{inc.prioridad || 'N/A'}</span></td>
                            <td>{new Date(inc.fecha_incidente).toLocaleDateString()}</td><td>{inc.responsable}</td><td>{inc.estado_equipo || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Dashboard = () => {
    // --- ESTADO ---
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [recentIncidents, setRecentIncidents] = useState([]);
    const [stats, setStats] = useState({ total: 0, high: 0, pending: 0, resolved: 0, today: 0 });
    
    const [threatsByTypeData, setThreatsByTypeData] = useState({ labels: [], datasets: [] });
    const [detectionsByStatusData, setDetectionsByStatusData] = useState({ labels: [], datasets: [] });
    const [monthlyTrendData, setMonthlyTrendData] = useState({ labels: [], datasets: [] });
    const [monthlyThreatsDataBar, setMonthlyThreatsDataBar] = useState({ labels: [], datasets: [] });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- LÓGICA DE OBTENCIÓN DE DATOS ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [detectionsRes, threatsRes] = await axios.all([
                axios.get(`${API_BASE_URL}/obtener_detecciones.php?summary=dashboard&month=${selectedMonth}&year=${selectedYear}`),
                axios.get(`${API_BASE_URL}/obtener_amenazas.php?month=${selectedMonth}&year=${selectedYear}`)
            ]);

            const detectionsData = detectionsRes.data || {};
            setStats(detectionsData.kpis || { total: 0, high: 0, pending: 0, resolved: 0, today: 0 });
            setRecentIncidents(detectionsData.recentIncidents || []);

            const statusSummary = detectionsData.statusSummary || [];
            setDetectionsByStatusData({
                labels: statusSummary.map(s => s.estado),
                datasets: [{
                    data: statusSummary.map(s => s.total),
                    backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#6B7280'],
                    borderColor: '#fff',
                    borderWidth: 2,
                }],
            });

            const threatsData = threatsRes.data || {};
            const threatsBySubclass = threatsData.threatsBySubclass || [];
            setThreatsByTypeData({
                labels: threatsBySubclass.map(t => t.name),
                datasets: [{
                    label: 'Nº de Amenazas',
                    data: threatsBySubclass.map(t => t.value),
                    backgroundColor: '#3B82F6',
                }],
            });

            // --- ACTUALIZACIÓN PARA EL NUEVO GRÁFICO DINÁMICO ---
            const monthlyAccumulated = threatsData.monthlyAccumulated || { labels: [], data: [] };
            setMonthlyThreatsDataBar({
                labels: monthlyAccumulated.labels,
                datasets: [
                  {
                    label: 'Amenazas Mitigadas',
                    data: monthlyAccumulated.data,
                    backgroundColor: [
                      '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#007bff',
                    ],
                    borderColor: [
                        '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#007bff',
                    ],
                    borderWidth: 1,
                  },
                ],
            });

            const trendData = threatsData.threatsPerMonth || [];
            setMonthlyTrendData({
                labels: trendData.map(m => new Date(`${m.anio}-${m.mes_num}-01`).toLocaleString('default', { month: 'short', year: '2-digit' })),
                datasets: [{
                    label: 'Amenazas por Mes',
                    data: trendData.map(m => m.total_amenazas),
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3B82F6',
                    tension: 0.3,
                }],
            });

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Error al cargar los datos del dashboard.");
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- RENDERIZADO ---
    if (loading) return <div className="loading-message">Cargando Dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('es-ES', { month: 'long' }) }));
    const monthName = months.find(m => m.value === selectedMonth)?.name || '';

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Panel de Operaciones de Seguridad</h1>
                <div className="controls">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={fetchData} className="refresh-button" disabled={loading}>{loading ? 'Cargando...' : 'Actualizar'}</button>
                </div>
            </div>

            <div className="stats-grid">
                <DashboardCard title={`Incidentes de Hoy`} value={stats.today} icon={<TodayIcon />} borderColor="border-purple" />
                <DashboardCard title={`Incidentes (${monthName})`} value={stats.total} icon={<TotalIncidentsIcon />} borderColor="border-blue" />
                <DashboardCard title={`Prioridad Alta (${monthName})`} value={stats.high} icon={<HighPriorityIcon />} borderColor="border-red" />
                <DashboardCard title={`Pendientes (${monthName})`} value={stats.pending} icon={<PendingIcon />} borderColor="border-yellow" />
                <DashboardCard title={`Cerrados (${monthName})`} value={stats.resolved} icon={<ResolvedIcon />} borderColor="border-green" />
            </div>

            <div className="main-charts-grid">
                 <ChartBox title={`Amenazas por Tipo (${monthName} ${selectedYear})`}>
                    {(threatsByTypeData.datasets[0]?.data.reduce((a, b) => a + b, 0) > 0)
                        ? <Bar data={threatsByTypeData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { x: { ticks: { stepSize: 1 }}}}} />
                        : <p className="chart-placeholder">No hay datos de amenazas para este mes</p>}
                </ChartBox>
                
                <ChartBox title={`Detecciones por Estado (${monthName} ${selectedYear})`}>
                     {(detectionsByStatusData.datasets[0]?.data.reduce((a, b) => a + b, 0) > 0)
                        ? <Doughnut data={detectionsByStatusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' }}}} />
                        : <p className="chart-placeholder">No hay datos de detecciones para este mes</p>}
                </ChartBox>

                <div className="line-chart-container">
                    <ChartBox title="Evolución de Amenazas (Global)">
                        {monthlyTrendData.datasets[0]?.data.length > 0
                            ? <Line data={monthlyTrendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
                            : <p className="chart-placeholder">No hay datos de tendencia</p>}
                    </ChartBox>
                </div>
            </div>

            <RecentIncidentsTable incidents={recentIncidents} />

            {/* Gráfico de Amenazas Acumuladas por Mes */}
            <div className="chart-box" style={{ marginTop: '2rem' }}>
                 {(monthlyThreatsDataBar.datasets[0]?.data.reduce((a, b) => a + b, 0) > 0)
                    ? <Bar
                    data={monthlyThreatsDataBar}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            title: {
                                display: true,
                                text: `ACUMULADO DEL MES DE ${monthName.toUpperCase()}`,
                                font: {
                                    size: 18,
                                    weight: 'bold',
                                },
                                padding: {
                                    top: 10,
                                    bottom: 30,
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'AMENAZAS MITIGADAS',
                                    font: {
                                        weight: 'bold',
                                    },
                                },
                                ticks: {
                                    callback: function(value) {
                                        return Number(value).toLocaleString('es-ES');
                                    },
                                },
                            },
                            x: {
                                ticks: {
                                    font: {
                                        weight: 'bold',
                                    },
                                },
                            },
                        },
                    }}
                />
                : <p className="chart-placeholder">No hay datos de amenazas para este mes</p>}
            </div>
        </div>
    );
};

export default Dashboard;
