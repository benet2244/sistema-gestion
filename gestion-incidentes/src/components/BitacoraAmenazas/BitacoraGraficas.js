import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

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
                        {
                            label: 'Malware',
                            data: data.malware,
                            borderColor: '#EF4444', // Rojo
                            backgroundColor: 'rgba(239, 68, 68, 0.5)',
                            tension: 0.3,
                        },
                        {
                            label: 'Phishing',
                            data: data.phishing,
                            borderColor: '#10B981', // Verde
                            backgroundColor: 'rgba(16, 185, 129, 0.5)',
                            tension: 0.3,
                        },
                        {
                            label: 'Comando y Control',
                            data: data.comando_y_control,
                            borderColor: '#3B82F6', // Azul
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                            tension: 0.3,
                        },
                        {
                            label: 'Criptominería',
                            data: data.criptomineria,
                            borderColor: '#F59E0B', // Ámbar
                            backgroundColor: 'rgba(245, 158, 11, 0.5)',
                            tension: 0.3,
                        },
                        {
                            label: 'Denegación de Servicios',
                            data: data.denegacion_de_servicios,
                            borderColor: '#8B5CF6', // Violeta
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                            tension: 0.3,
                        },
                        {
                            label: 'Intentos de Conexión',
                            data: data.intentos_de_conexion,
                            borderColor: '#374151', // Gris oscuro
                            backgroundColor: 'rgba(55, 65, 81, 0.5)',
                            tension: 0.3,
                        },
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
            legend: {
                position: 'top',
                labels: {
                    color: '#4A5568', // text-gray-700
                    font: {
                        size: 14,
                    }
                }
            },
            title: {
                display: true,
                text: 'Distribución de Amenazas Cibernéticas',
                color: '#2D3748', // text-gray-800
                font: {
                    size: 20,
                    weight: 'bold',
                }
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Meses',
                    color: '#4A5568',
                    font: {
                        size: 16,
                        weight: 'semibold',
                    }
                },
                ticks: {
                    color: '#718096', // text-gray-500
                },
                grid: {
                    display: false,
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Cantidad de Amenazas',
                    color: '#4A5568',
                    font: {
                        size: 16,
                        weight: 'semibold',
                    }
                },
                ticks: {
                    color: '#718096',
                },
                grid: {
                    color: '#E2E8F0', // border-gray-200
                }
            },
        },
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p className="text-xl text-gray-500">Cargando gráficas...</p></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-6 bg-red-100 rounded-lg">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Visualización de Amenazas</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Evolución de Amenazas en el Tiempo</h3>
                    <div className="relative h-96">
                        {chartData.labels && chartData.labels.length > 0 ? (
                            <Line data={chartData} options={options} />
                        ) : (
                            <p className="text-center text-gray-500">No hay datos disponibles para mostrar.</p>
                        )}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Total de Amenazas por Categoría</h3>
                    <div className="relative h-96">
                        {chartData.labels && chartData.labels.length > 0 ? (
                            <Bar data={chartData} options={options} />
                        ) : (
                            <p className="text-center text-gray-500">No hay datos disponibles para mostrar.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BitacoraGraficas;
