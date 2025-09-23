import React, { useState } from 'react';
import './BitacoraReporte.css'; // Importar el nuevo archivo CSS

// Estandarización de la URL del backend
const API_BASE_URL = 'http://localhost/gestion-incidentes/backend';

const BitacoraReporte = () => {
    const [monthlyTotals, setMonthlyTotals] = useState({});
    const [mesInicio, setMesInicio] = useState('');
    const [mesFin, setMesFin] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const threatTypes = ['malware', 'phishing', 'comando_y_control', 'criptomineria', 'denegacion_de_servicios', 'intentos_de_conexion'];
    const threatLabels = ['Malware', 'Phishing', 'Comando y Control', 'Criptominería', 'Denegación de Servicios', 'Intentos de Conexión'];

    const calculateMonthlyTotals = (data) => {
        const totals = {};
        data.forEach(mesData => {
            const mesName = mesData.mes;
            totals[mesName] = {};
            threatTypes.forEach(type => {
                totals[mesName][type] = 0;
            });
            mesData.registros.forEach(reg => {
                threatTypes.forEach(type => {
                    totals[mesName][type] += parseInt(reg[type], 10) || 0;
                });
            });
        });
        setMonthlyTotals(totals);
    };

    const fetchReportData = async () => {
        if (!mesInicio || !mesFin || !year) {
            setMessage("Por favor, selecciona un mes de inicio, un mes de fin y un año.");
            return;
        }

        setIsLoading(true);
        setMessage('');
        try {
            // Usando la URL estandarizada
            const url = new URL(`${API_BASE_URL}/reporte_bitacora.php`);
            url.searchParams.append('mesInicio', mesInicio);
            url.searchParams.append('mesFin', mesFin);
            url.searchParams.append('year', year);

            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success && data.data && data.data.length > 0) {
                calculateMonthlyTotals(data.data);
                setMessage('');
            } else {
                setMonthlyTotals({});
                setMessage(data.message || "No se encontraron datos para el período seleccionado.");
            }
        } catch (error) {
            console.error("Error al cargar los datos del reporte:", error);
            setMessage("Error al cargar los datos del reporte. Por favor, verifica tu conexión y el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    // ... (El resto del componente de renderizado no cambia)
    const labels = Object.keys(monthlyTotals);
    const maxTotal = labels.length > 0 ? Math.max(...labels.map(mes => threatTypes.reduce((sum, type) => sum + monthlyTotals[mes][type], 0))) : 0;
    
    return (
        <div className="report-container">
            <div className="report-wrapper">
                <h2 className="report-header">Generar Reporte de Amenazas</h2>
                
                <div className="filters-card">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Mes de Inicio:</label>
                            <select value={mesInicio} onChange={(e) => setMesInicio(e.target.value)} className="filter-select">
                                <option value="">Selecciona un mes</option>
                                {meses.map(mes => <option key={mes} value={mes}>{mes}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Mes de Fin:</label>
                            <select value={mesFin} onChange={(e) => setMesFin(e.target.value)} className="filter-select">
                                <option value="">Selecciona un mes</option>
                                {meses.map(mes => <option key={mes} value={mes}>{mes}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Año:</label>
                            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min="2000" max="2100" className="filter-input"/>
                        </div>
                    </div>
                    <div className="filters-action">
                        <button className="generate-report-button" onClick={fetchReportData} disabled={isLoading}>
                            {isLoading ? 'Generando...' : 'Mostrar Reporte'}
                        </button>
                    </div>
                </div>

                {message && <p className="feedback-message">{message}</p>}
                
                {labels.length > 0 && (
                    <div className="results-card">
                        <h3 className="results-title">Totales Mensuales de Amenazas</h3>
                        
                        <div className="chart-wrapper">
                            <h4 className="section-title">Gráfica de Amenazas</h4>
                            <div className="chart-scroll-container">
                                <div className="chart-container" style={{ minWidth: `${labels.length * 6}rem` }}>
                                    {labels.map(mes => {
                                        const totalMes = threatTypes.reduce((sum, type) => sum + (monthlyTotals[mes][type] || 0), 0);
                                        const heightPercentage = maxTotal > 0 ? (totalMes / maxTotal) * 100 : 0;
                                        return (
                                            <div key={mes} className="bar-group">
                                                <div className="bar-wrapper">
                                                    <div className="bar" style={{ height: `${heightPercentage}%` }}>
                                                        <span className="bar-label">{totalMes > 0 ? totalMes : ''}</span>
                                                    </div>
                                                </div>
                                                <span className="month-label">{mes}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="section-title">Resumen Detallado</h4>
                            <div className="summary-table-wrapper">
                                <table className="summary-table">
                                    <thead>
                                        <tr>
                                            <th>Mes</th>
                                            {threatLabels.map(label => <th key={label}>{label}</th>)}
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {labels.map(mes => (
                                            <tr key={mes}>
                                                <td>{mes}</td>
                                                {threatTypes.map(type => (
                                                    <td key={type}>{monthlyTotals[mes][type] || 0}</td>
                                                ))}
                                                <td className="total-cell">{threatTypes.reduce((sum, type) => sum + (monthlyTotals[mes][type] || 0), 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BitacoraReporte;
