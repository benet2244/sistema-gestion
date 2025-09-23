import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './BitacoraGraficas.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const threatKeys = { malware: 'Malware', phishing: 'Phishing', comando_y_control: 'Comando y Control', criptomineria: 'Criptominería', denegacion_de_servicios: 'Denegación de Servicios', intentos_de_conexion: 'Intentos de Conexión' };
const threatColors = { malware: '#FF6384', phishing: '#36A2EB', comando_y_control: '#FFCE56', criptomineria: '#4BC0C0', denegacion_de_servicios: '#9966FF', intentos_de_conexion: '#FF9F40' };

const KpiCard = ({ title, value, color }) => (
    <div className="kpi-card" style={{ borderLeft: `5px solid ${color}` }}>
        <p className="kpi-title">{title}</p>
        <h3 className="kpi-value">{value.toLocaleString()}</h3>
    </div>
);

const BitacoraGraficas = () => {
    const currentYear = new Date().getFullYear();
    const [filterType, setFilterType] = useState('year');
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    
    const [data, setData] = useState({ trend: [], totals: {}, actorSummary: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const fetchDashboardData = useCallback(async () => {
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
            const response = await axios.get('https://192.168.39.115/gestion-incidentes/backend/graficas_bitacora.php', { params });
            if (response.data.success && response.data.data) {
                const safeData = {
                    trend: response.data.data.trend || [],
                    totals: response.data.data.totals || {},
                    actorSummary: response.data.data.actorSummary || [],
                };
                setData(safeData);
                if (safeData.trend.length === 0 && safeData.actorSummary.length === 0) {
                    setMessage("No se encontraron datos para el período seleccionado.");
                }
            } else {
                setData({ trend: [], totals: {}, actorSummary: [] });
                setMessage(response.data.message || "No se encontraron datos.");
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setData({ trend: [], totals: {}, actorSummary: [] });
            setMessage("Error de conexión al cargar los datos.");
        } finally {
            setIsLoading(false);
        }
    }, [filterType, year, month, dateRange]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const actorChartData = {
        labels: data.actorSummary.map(a => a.actor),
        datasets: [{ label: 'Nº de Amenazas', data: data.actorSummary.map(a => a.count), backgroundColor: '#0694a2', borderColor: '#047481', borderWidth: 1 }],
    };
    const actorChartOptions = { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

    const doughnutChartData = { labels: Object.values(threatKeys), datasets: [{ data: Object.keys(threatKeys).map(key => data.totals[`total_${key}`] || 0), backgroundColor: Object.values(threatColors) }] };
    const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };

    const getBarChartLabels = () => {
        if (filterType === 'year') return MESES;
        if (filterType === 'month') return Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
        if (filterType === 'range') return [...new Set(data.trend.map(d => d.trend_unit))];
        return [];
    };
    const barChartLabels = getBarChartLabels();
    const barChartData = {
        labels: barChartLabels,
        datasets: Object.keys(threatKeys).map(key => ({
            label: threatKeys[key],
            data: barChartLabels.map(label => {
                let dataPoint;
                if (filterType === 'year') dataPoint = data.trend.find(d => d.trend_unit === MESES.indexOf(label) + 1);
                else if (filterType === 'month') dataPoint = data.trend.find(d => d.trend_unit == label);
                else dataPoint = data.trend.find(d => d.trend_unit === label);
                return dataPoint ? dataPoint[`total_${key}`] || 0 : 0;
            }),
            backgroundColor: threatColors[key],
        })),
    };
    const barOptions = { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } };

    return (
        <div className="graficas-dashboard-container"> {/* <-- CAMBIO CLAVE AQUI */}
            <div className="dashboard-header">
                <h2 className="dashboard-title">Dashboard de Amenazas</h2>
            </div>

            <div className="filter-controls">
                <div className="filter-tabs">
                    <button onClick={() => setFilterType('year')} className={filterType === 'year' ? 'active' : ''}>Anual</button>
                    <button onClick={() => setFilterType('month')} className={filterType === 'month' ? 'active' : ''}>Mensual</button>
                    <button onClick={() => setFilterType('range')} className={filterType === 'range' ? 'active' : ''}>Por Rango</button>
                </div>
                
                <div className="filter-inputs">
                    {(filterType === 'year' || filterType === 'month') && <select value={year} onChange={e => setYear(parseInt(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>}
                    {filterType === 'month' && <select value={month} onChange={e => setMonth(parseInt(e.target.value))}>{MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}</select>}
                    {filterType === 'range' && <><input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} /><input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} /></>}
                    <button className="apply-filter-btn" onClick={fetchDashboardData}>Aplicar Filtro</button>
                </div>
            </div>

            {isLoading ? <div className="loading-container">Cargando...</div> :
             message ? <div className="message-container">{message}</div> :
             <>
                <div className="kpi-grid">{Object.keys(threatKeys).map(key => <KpiCard key={key} title={threatKeys[key]} value={data.totals[`total_${key}`] || 0} color={threatColors[key]} />)}</div>
                
                <div className="summary-charts-grid">
                    <div className="chart-card">
                        <h3 className="chart-title">Amenazas por Actor</h3>
                        <div className="chart-wrapper-actor">
                           {data.actorSummary.length > 0 ? <Bar data={actorChartData} options={actorChartOptions} /> : <p className="no-data-msg">No hay datos de actores para este período.</p>}
                        </div>
                    </div>
                    <div className="chart-card">
                        <h3 className="chart-title">Distribución de Amenazas</h3>
                        <div className="chart-wrapper-doughnut"><Doughnut data={doughnutChartData} options={doughnutOptions} /></div>
                    </div>
                </div>

                <div className="chart-card full-width-chart">
                    <h3 className="chart-title">Tendencia de Amenazas</h3>
                    <div className="chart-wrapper-bar"><Bar data={barChartData} options={barOptions} /></div>
                </div>
            </>}
        </div>
    );
};

export default BitacoraGraficas;
