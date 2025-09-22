import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './BitacoraGraficas.css'; // Importar la nueva hoja de estilos

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const BitacoraGraficas = () => {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGraficaData();
    }, []);

    const fetchGraficaData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://192.168.39.115/gestion-incidentes/backend/graficas_bitacora.php');
            const data = response.data;

            if (data && data.labels) {
                setChartData({
                    labels: data.labels,
                    datasets: [
                        { label: 'Malware', data: data.malware, borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.5)', tension: 0.3 },
                        { label: 'Phishing', data: data.phishing, borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.5)', tension: 0.3 },
                        { label: 'Comando y Control', data: data.comando_y_control, borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.5)', tension: 0.3 },
                        { label: 'Criptominería', data: data.criptomineria, borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.5)', tension: 0.3 },
                        { label: 'Denegación de Servicios', data: data.denegacion_de_servicios, borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.5)', tension: 0.3 },
                        { label: 'Intentos de Conexión', data: data.intentos_de_conexion, borderColor: '#374151', backgroundColor: 'rgba(55, 65, 81, 0.5)', tension: 0.3 },
                    ],
                });
            } else {
                setError("No se recibieron datos válidos del servidor.");
            }
        } catch (error) {
            console.error("Error al cargar los datos de la gráfica:", error);
            setError("No se pudieron cargar los datos de las gráficas. Intenta de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#4A5568', font: { size: 14 } } },
            title: { display: true, text: 'Distribución de Amenazas Cibernéticas', color: '#2D3748', font: { size: 20, weight: 'bold' } },
        },
        scales: {
            x: { title: { display: true, text: 'Meses', color: '#4A5568', font: { size: 16, weight: 'semibold' } }, ticks: { color: '#718096' }, grid: { display: false } },
            y: { title: { display: true, text: 'Cantidad de Amenazas', color: '#4A5568', font: { size: 16, weight: 'semibold' } }, ticks: { color: '#718096' }, grid: { color: '#E2E8F0' } },
        },
    };

    if (loading) {
        return <div className="loading-container"><p className="loading-message">Cargando gráficas...</p></div>;
    }

    if (error) {
        return <div className="graphics-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="graphics-container">
            <h2 className="graphics-header">Visualización de Amenazas</h2>
            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="chart-title">Evolución de Amenazas en el Tiempo</h3>
                    <div className="chart-canvas-container">
                        {chartData.labels && chartData.labels.length > 0 ? (
                            <Line data={chartData} options={options} />
                        ) : (
                            <p className="status-message">No hay datos disponibles para mostrar.</p>
                        )}
                    </div>
                </div>
                <div className="chart-card">
                    <h3 className="chart-title">Total de Amenazas por Categoría</h3>
                    <div className="chart-canvas-container">
                        {chartData.labels && chartData.labels.length > 0 ? (
                            <Bar data={chartData} options={options} />
                        ) : (
                            <p className="status-message">No hay datos disponibles para mostrar.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BitacoraGraficas;
