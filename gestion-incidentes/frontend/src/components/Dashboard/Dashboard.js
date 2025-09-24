import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = ({ onNavigateToDeteccion }) => {
    const [incidentes, setIncidentes] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        averagePerDay: 0,
        highPriority: 0,
    });

    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/obtener_incidentes.php';

    useEffect(() => {
        const fetchIncidentes = async () => {
            try {
                const response = await axios.get(API_URL);
                if (response.data.registros) {
                    const sortedIncidentes = response.data.registros.sort((a, b) => new Date(b.fecha_reporte) - new Date(a.fecha_reporte));
                    setIncidentes(sortedIncidentes);
                    calculateStats(sortedIncidentes);
                }
            } catch (error) {
                console.error("Error al obtener los incidentes:", error);
            }
        };

        fetchIncidentes();
    }, []);

    const calculateStats = (data) => {
        const total = data.length;
        const highPriority = data.filter(inc => inc.prioridad === 'Alta').length;

        if (total === 0) {
            setStats({ total: 0, averagePerDay: 0, highPriority: 0 });
            return;
        }

        const dates = data.map(inc => new Date(inc.fecha_reporte).getTime());
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        
        const diffTime = Math.abs(maxDate - minDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const averagePerDay = (total / diffDays).toFixed(2);

        setStats({ total, averagePerDay, highPriority });
    };

    const processDataForChart = (incidents) => {
        const monthlyData = {};

        incidents.forEach(incident => {
            const date = new Date(incident.fecha_reporte);
            const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });

            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month]++;
        });

        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
            const [m1, y1] = a.split(' ');
            const [m2, y2] = b.split(' ');
            const d1 = new Date(`01-${m1}-${y1}`);
            const d2 = new Date(`01-${m2}-${y2}`);
            return d1 - d2;
        });

        return {
            labels: sortedMonths,
            datasets: [
                {
                    label: 'Incidentes por Mes',
                    data: sortedMonths.map(month => monthlyData[month]),
                    fill: false,
                    borderColor: '#7f5af0',
                    tension: 0.1,
                },
            ],
        };
    };

    const chartData = processDataForChart(incidentes);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Incidentes por Mes',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const recentIncidents = incidentes.slice(0, 5);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Panel de Seguridad Cibernética</h1>
                <p>Análisis de Ciberseguridad en Tiempo Real</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Incidentes Totales</h3>
                    <p className="stat-value">{stats.total}</p>
                </div>
                <div className="stat-card">
                    <h3>Prioridad Alta</h3>
                    <p className="stat-value">{stats.highPriority}</p>
                </div>
                <div className="stat-card">
                    <h3>Promedio por Día</h3>
                    <p className="stat-value">{stats.averagePerDay}</p>
                </div>
            </div>

            <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
            </div>

            <div className="recent-incidents-container">
                <h2>Últimas 5 Detecciones</h2>
                <table className="incidents-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Prioridad</th>
                            <th>Estado</th>
                            <th>Fecha de Reporte</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentIncidents.length > 0 ? (
                            recentIncidents.map(incidente => (
                                <tr key={incidente.id}>
                                    <td>{incidente.titulo}</td>
                                    <td>{incidente.prioridad}</td>
                                    <td>{incidente.estado}</td>
                                    <td>{new Date(incidente.fecha_reporte).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No hay incidentes recientes.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
