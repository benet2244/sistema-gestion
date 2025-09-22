import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Iconos SVG para las Tarjetas ---
const TotalIncidentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m-9 8h12a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const HighPriorityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ResolvedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Componente de Tarjeta del Dashboard ---
const DashboardCard = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 flex items-center justify-between border-l-4 ${color}`}>
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
        </div>
        <div className="text-gray-300">{icon}</div>
    </div>
);

// --- Gráfico de Tipos de Incidentes ---
const IncidentTypeChart = ({ incidents }) => {
    const types = incidents.reduce((acc, inc) => {
        const type = inc.tipo_incidente || 'Desconocido';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(types),
        datasets: [{
            data: Object.values(types),
            backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'],
            hoverBackgroundColor: ['#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED', '#4B5563'],
            borderColor: '#fff',
            borderWidth: 2,
        }],
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Incidentes por Tipo</h3>
            {incidents.length > 0 ? <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} /> : <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>}
        </div>
    );
};

// --- Gráfico de Estado de Equipos ---
const IncidentStatusChart = ({ incidents }) => {
    const statuses = incidents.reduce((acc, inc) => {
        const status = inc.estado_equipo || 'Desconocido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(statuses),
        datasets: [{
            data: Object.values(statuses),
            backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'],
            hoverBackgroundColor: ['#059669', '#DC2626', '#D97706', '#2563EB', '#7C3AED'],
            borderColor: '#fff',
            borderWidth: 2,
        }],
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Estado de los Equipos</h3>
            {incidents.length > 0 ? <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} /> : <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>}
        </div>
    );
};

// --- Tabla de Incidentes Recientes ---
const RecentIncidentsTable = ({ incidents }) => (
    <div className="bg-white rounded-xl shadow-lg mt-8 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Incidentes Recientes</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b-2 border-gray-200">
                    <tr>
                        <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Tipo</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Prioridad</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Fecha</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Responsable</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Estado Equipo</th>
                    </tr>
                </thead>
                <tbody>
                    {incidents.slice(0, 5).map(inc => (
                        <tr key={inc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3 text-sm text-gray-700">{inc.id}</td>
                            <td className="p-3 text-sm text-gray-700">{inc.tipo_incidente}</td>
                            <td className="p-3 text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${inc.prioridad === 'alta' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{inc.prioridad}</span></td>
                            <td className="p-3 text-sm text-gray-700">{inc.fecha_incidente}</td>
                            <td className="p-3 text-sm text-gray-700">{inc.responsable}</td>
                            <td className="p-3 text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${inc.estado_equipo === 'limpio' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>{inc.estado_equipo}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

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
            setError("Error al cargar los incidentes. Por favor, verifica la conexión.");
            setIncidents([]);
        } finally {
            setLoading(false);
        }
    }, [calculateStats]);

    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><div className="text-xl font-semibold text-gray-600">Cargando Dashboard...</div></div>;
    }

    if (error) {
        return <div className="text-center p-8 bg-red-50 text-red-600 rounded-lg shadow-md">{error}</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
                    <button onClick={fetchIncidents} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                        Actualizar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Total de Incidentes" value={stats.totalIncidents} icon={<TotalIncidentsIcon />} color="border-blue-500" />
                    <DashboardCard title="Prioridad Alta" value={stats.highPriority} icon={<HighPriorityIcon />} color="border-red-500" />
                    <DashboardCard title="Equipos Limpios" value={stats.resolved} icon={<ResolvedIcon />} color="border-green-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
                    <div className="lg:col-span-2 h-96"><IncidentTypeChart incidents={incidents} /></div>
                    <div className="lg:col-span-3 h-96"><IncidentStatusChart incidents={incidents} /></div>
                </div>

                <RecentIncidentsTable incidents={incidents} />
            </div>
        </div>
    );
};

export default Dashboard;
