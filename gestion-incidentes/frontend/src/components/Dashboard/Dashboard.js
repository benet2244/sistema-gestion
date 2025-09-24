import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend
);

const KpiCard = ({ icon, title, value }) => (
    <div className="kpi-card">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-info">
            <h3>{title}</h3>
            <p className="value">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    // --- Estados para KPIs ---
    const [threatKpis, setThreatKpis] = useState({ total: 0, avg: 0 });
    const [detectionKpis, setDetectionKpis] = useState({ total: 0 });

    // --- Estados para Gráficos ---
    const [threatsPerMonthData, setThreatsPerMonthData] = useState({ datasets: [] });
    const [topThreatsData, setTopThreatsData] = useState({ datasets: [] });
    const [detectionsByPriorityData, setDetectionsByPriorityData] = useState({ datasets: [] });
    const [detectionsByStatusData, setDetectionsByStatusData] = useState({ datasets: [] });

    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [threatsRes, detectionsRes] = await axios.all([
                    axios.get(`${API_URL}obtener_amenazas.php`), 
                    axios.get(`${API_URL}obtener_detecciones.php?summary=dashboard`)
                ]);

                if (threatsRes.data) {
                    const { kpis, threatsBySubclass, threatsPerMonth } = threatsRes.data;
                    setThreatKpis({ total: kpis.totalThreats, avg: kpis.avgThreatsPerDay });
                    setThreatsPerMonthData({
                        labels: threatsPerMonth.map(d => `${String(d.mes_num).padStart(2, '0')}/${d.anio}`),
                        datasets: [{ label: 'Total', data: threatsPerMonth.map(d => d.total_amenazas), borderColor: '#4a90e2', fill: true, backgroundColor: 'rgba(74, 144, 226, 0.2)' }]
                    });
                    setTopThreatsData({
                        labels: threatsBySubclass.map(d => d.name),
                        datasets: [{ label: 'Eventos', data: threatsBySubclass.map(d => d.value), backgroundColor: '#4a90e2' }]
                    });
                }

                if (detectionsRes.data) {
                    const { kpis, prioritySummary, statusSummary } = detectionsRes.data;
                    setDetectionKpis({ total: kpis.totalDetections });
                    setDetectionsByPriorityData({
                        labels: prioritySummary.map(p => p.prioridad),
                        datasets: [{ data: prioritySummary.map(p => p.total), backgroundColor: ['#d9534f', '#f0ad4e', '#5cb85c'] }]
                    });
                     setDetectionsByStatusData({
                        labels: statusSummary.map(s => s.estado),
                        datasets: [{ data: statusSummary.map(s => s.total), backgroundColor: ['#0275d8', '#5bc0de', '#888'] }]
                    });
                }

            } catch (error) {
                console.error("Error al obtener los datos del dashboard:", error);
            }
        };
        fetchData();
    }, []);

    // --- Opciones comunes para los gráficos --- //
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // <-- LA CORRECCIÓN MÁS IMPORTANTE
        plugins: {
            legend: {
                display: false
            }
        }
    };
    
    const doughnutPieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header"><h1>Panel de Seguridad Cibernética</h1></div>
            <div className="kpi-container">
                <KpiCard icon="🛡️" title="Threats" value={threatKpis.total.toLocaleString()} />
                <KpiCard icon="📊" title="Avg Threats/Day" value={threatKpis.avg} />
                <KpiCard icon="🚨" title="Total Detections" value={detectionKpis.total.toLocaleString()} />
            </div>
            <div className="charts-grid">
                <div className="chart-panel">
                    <h3>Top Amenazas por Subclase</h3>
                    <Bar data={topThreatsData} options={{ ...chartOptions, indexAxis: 'y' }} />
                </div>
                 <div className="chart-panel">
                    <h3>Detecciones por Prioridad</h3>
                    <Doughnut data={detectionsByPriorityData} options={doughnutPieOptions} />
                </div>
                <div className="chart-panel">
                    <h3>Amenazas por Mes</h3>
                    <Line data={threatsPerMonthData} options={chartOptions} />
                </div>
                <div className="chart-panel">
                    <h3>Detecciones por Estado</h3>
                    <Pie data={detectionsByStatusData} options={doughnutPieOptions} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
