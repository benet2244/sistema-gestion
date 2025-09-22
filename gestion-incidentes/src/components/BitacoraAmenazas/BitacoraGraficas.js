import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './bitacoraAmenazas.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const BitacoraGraficas = () => {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        fetchGraficaData();
    }, []);

    const fetchGraficaData = async () => {
        try {
            const response = await axios.get('https://192.168.39.115/gestion-incidentes/backend/graficas_bitacora.php');
            const data = response.data;

            setChartData({
                labels: data.labels,
                datasets: [
                    {
                        label: 'Malware',
                        data: data.malware,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.5)',
                        tension: 0.3,
                    },
                    {
                        label: 'Phishing',
                        data: data.phishing,
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        tension: 0.3,
                    },
                    {
                        label: 'Comando y Control',
                        data: data.comando_y_control,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.5)',
                        tension: 0.3,
                    },
                    {
                        label: 'Criptominería',
                        data: data.criptomineria,
                        borderColor: '#f1c40f',
                        backgroundColor: 'rgba(241, 196, 15, 0.5)',
                        tension: 0.3,
                    },
                    {
                        label: 'Denegación de Servicios',
                        data: data.denegacion_de_servicios,
                        borderColor: '#9b59b6',
                        backgroundColor: 'rgba(155, 89, 182, 0.5)',
                        tension: 0.3,
                    },
                    {
                        label: 'Intentos de Conexión',
                        data: data.intentos_de_conexion,
                        borderColor: '#34495e',
                        backgroundColor: 'rgba(52, 73, 94, 0.5)',
                        tension: 0.3,
                    },
                ],
            });
        } catch (error) {
            console.error("Error al cargar los datos de la gráfica:", error);
        }
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Gráfica de Amenazas Mensuales',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Meses',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Cantidad de Amenazas',
                },
                min: 0,
            },
        },
    };

    return (
        <div className="graficas-container">
            <h2>Gráficas de Amenazas</h2>
            <div className="chart-wrapper">
                <h3>Amenazas a lo largo del tiempo</h3>
                {chartData.labels && chartData.labels.length > 0 ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <p>No hay datos disponibles para mostrar.</p>
                )}
            </div>
            <div className="chart-wrapper">
                <h3>Total de Amenazas por Categoría</h3>
                {chartData.labels && chartData.labels.length > 0 ? (
                    <Bar data={chartData} options={options} />
                ) : (
                    <p>No hay datos disponibles para mostrar.</p>
                )}
            </div>
        </div>
    );
};

export default BitacoraGraficas;
