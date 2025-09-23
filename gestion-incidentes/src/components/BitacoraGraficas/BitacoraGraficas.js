import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './BitacoraGraficas.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Estandarización de la URL del backend
const API_BASE_URL = 'http://localhost/gestion-incidentes/backend';

const BitacoraGraficas = () => {
    const [filterType, setFilterType] = useState('year');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [data, setData] = useState({ trend: [], totals: {}, actorSummary: [] });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const handleApplyFilter = async () => {
        setIsLoading(true);
        setMessage('');
        let params = {};
        if (filterType === 'year') params = { year };
        if (filterType === 'month') params = { year, month };
        if (filterType === 'range') params = { start_date: dateRange.start, end_date: dateRange.end };

        if (filterType === 'range' && (!dateRange.start || !dateRange.end)) {
            setMessage("Por favor, seleccione una fecha de inicio y de fin.");
            setIsLoading(false);
            setData({ trend: [], totals: {}, actorSummary: [] });
            return;
        }

        try {
            // Usando fetch y la URL estandarizada
            const url = new URL(`${API_BASE_URL}/graficas_bitacora.php`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            const response = await fetch(url, {credentials: 'include'});
            const result = await response.json();

            if (result.success && result.data) {
                const safeData = {
                    trend: result.data.trend || [],
                    totals: result.data.totals || {},
                    actorSummary: result.data.actorSummary || [],
                };
                setData(safeData);
                if (safeData.trend.length === 0 && (!safeData.totals || Object.keys(safeData.totals).length === 0) && safeData.actorSummary.length === 0) {
                    setMessage("No se encontraron datos para el período seleccionado.");
                }
            } else {
                setData({ trend: [], totals: {}, actorSummary: [] });
                setMessage(result.message || "No se encontraron datos.");
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setData({ trend: [], totals: {}, actorSummary: [] });
            setMessage("Error crítico: No se pudo conectar con el servidor o el script falló. Revise la consola del navegador para más detalles.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        handleApplyFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ... (El resto del componente de renderizado no cambia)
    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Tendencia de Amenazas' } },
        scales: { y: { beginAtZero: true, stacked: true }, x: { stacked: true } },
    };

    const doughnutOptions = {
        responsive: true,
        plugins: { legend: { position: 'right' }, title: { display: true, text: 'Resumen de Actores de Amenaza' } },
    };

    const threatTypes = ['total_malware', 'total_phishing', 'total_comando_y_control', 'total_criptomineria', 'total_denegacion_de_servicios', 'total_intentos_de_conexion'];
    const threatLabels = ['Malware', 'Phishing', 'Comando y Control', 'Criptominería', 'Denegación de Servicios', 'Intentos de Conexión'];
    const trendLabels = data.trend.map(d => d.trend_unit);

    const barChartData = {
        labels: trendLabels,
        datasets: threatTypes.map((type, i) => ({
            label: threatLabels[i],
            data: data.trend.map(d => d[type] || 0),
            backgroundColor: `hsl(${i * 60}, 70%, 50%)`,
        })),
    };

    const doughnutData = {
        labels: data.actorSummary.map(a => a.actor),
        datasets: [{
            data: data.actorSummary.map(a => a.count),
            backgroundColor: data.actorSummary.map((_, i) => `hsl(${i * 360 / data.actorSummary.length}, 70%, 60%)`),
        }],
    };

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Dashboard de Análisis de Amenazas</h2>
            
            <div className="filters-card">
                <div className="filter-group">
                    <label>Filtrar por:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="year">Año</option>
                        <option value="month">Mes</option>
                        <option value="range">Rango de Fechas</option>
                    </select>
                </div>

                {filterType === 'year' && (
                     <div className="filter-group"><label>Año:</label><select value={year} onChange={(e) => setYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                )}
                {filterType === 'month' && (
                    <><div className="filter-group"><label>Mes:</label><select value={month} onChange={(e) => setMonth(e.target.value)}>{months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></div>
                    <div className="filter-group"><label>Año:</label><select value={year} onChange={(e) => setYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div></>
                )}
                {filterType === 'range' && (
                    <><div className="filter-group"><label>Inicio:</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}/></div>
                    <div className="filter-group"><label>Fin:</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}/></div></>
                )}

                <button onClick={handleApplyFilter} disabled={isLoading}>{isLoading ? 'Cargando...' : 'Aplicar Filtro'}</button>
            </div>

            {message && <p className="feedback-message">{message}</p>}

            {data.trend.length > 0 && <div className="chart-card"><Bar options={chartOptions} data={barChartData} /></div>}
            {data.actorSummary.length > 0 && <div className="chart-card"><Doughnut data={doughnutData} options={doughnutOptions} /></div>}
        </div>
    );
};

export default BitacoraGraficas;
