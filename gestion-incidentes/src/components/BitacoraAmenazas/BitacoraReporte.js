import React, { useState } from 'react';

const API_URL = 'https://192.168.39.115/gestion-incidentes/backend/reporte_bitacora.php';

const BitacoraReporte = () => {
    const [monthlyTotals, setMonthlyTotals] = useState({});
    const [mesInicio, setMesInicio] = useState('');
    const [mesFin, setMesFin] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
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
            const url = new URL(API_URL);
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

    const getChartData = () => {
        const labels = Object.keys(monthlyTotals);
        const dataSets = threatTypes.map((type, index) => {
            const dataValues = labels.map(mes => monthlyTotals[mes][type] || 0);
            return {
                label: threatLabels[index],
                data: dataValues,
                color: `hsl(${(index * 60) % 360}, 70%, 50%)`
            };
        });
        return { labels, dataSets };
    };

    const { labels } = getChartData();
    const maxTotal = labels.length > 0 ? Math.max(...labels.map(mes => threatTypes.reduce((sum, type) => sum + monthlyTotals[mes][type], 0))) : 0;
    
    return (
        <div className="reporte-container">
            <style>{`
                .reporte-container {
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    background-color: #f4f7f9;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    color: #2c3e50;
                }
                
                .reporte-container h2 {
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 2rem;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .form-group label {
                    font-weight: bold;
                    color: #34495e;
                }
                
                .form-group select,
                .form-group input[type="number"] {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 4px;
                    border: 1px solid #bdc3c7;
                    transition: border-color 0.3s;
                    box-sizing: border-box;
                }
                
                .form-group select:focus,
                .form-group input[type="number"]:focus {
                    outline: none;
                    border-color: #3498db;
                }
                
                .buttons-container {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .action-button {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 50px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
                    color: white;
                    background-color: #3498db;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .action-button:hover:not(:disabled) {
                    background-color: #2980b9;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                }
                
                .action-button:disabled {
                    background-color: #b0c4de;
                    cursor: not-allowed;
                }

                .message {
                    text-align: center;
                    color: #e74c3c;
                    margin-bottom: 1rem;
                    font-weight: bold;
                }
                
                .reporte-preview table, .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1.5rem;
                    background-color: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                
                .reporte-preview th,
                .reporte-preview td,
                .summary-table th,
                .summary-table td {
                    padding: 0.75rem;
                    border: 1px solid #ecf0f1;
                    text-align: left;
                }
                
                .reporte-preview th,
                .summary-table th {
                    background-color: #34495e;
                    color: white;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                
                .reporte-preview tr:nth-child(even),
                .summary-table tr:nth-child(even) {
                    background-color: #f8f9fa;
                }

                .chart-container {
                    margin-top: 3rem;
                    padding: 1.5rem;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                
                .chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    height: 250px;
                    padding-top: 10px;
                    border-left: 2px solid #34495e;
                    border-bottom: 2px solid #34495e;
                    position: relative;
                }
                .chart:after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.05) 1px, transparent 1px);
                    background-size: 100% 25px; /* Adjust grid lines spacing */
                }

                .bar-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    margin: 0 5px;
                    position: relative;
                }

                .bar {
                    width: 80%;
                    background-color: #3498db;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                    transition: height 0.5s ease-in-out;
                    position: relative;
                }
                .bar-label {
                    position: absolute;
                    top: -20px;
                    font-size: 0.75rem;
                    font-weight: bold;
                    color: #555;
                }

                .bar-label-hidden {
                    display: none;
                }

                .bar-group-label {
                    font-size: 0.75rem;
                    text-align: center;
                    margin-top: 5px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }
                
                @media (max-width: 768px) {
                    .form-group {
                        flex-direction: column;
                    }
                    .bar-group-label {
                        font-size: 0.65rem;
                        transform: rotate(-45deg);
                        transform-origin: 0% 0%;
                        margin-top: 15px;
                    }
                    .reporte-container {
                        padding: 1rem;
                    }
                }
            `}</style>
            <h2>Generar Reporte de Amenazas</h2>
            <div className="form-group">
                <label>Mes de Inicio:</label>
                <select value={mesInicio} onChange={(e) => setMesInicio(e.target.value)}>
                    <option value="">Selecciona un mes</option>
                    {meses.map(mes => <option key={mes} value={mes}>{mes}</option>)}
                </select>
                <label>Mes de Fin:</label>
                <select value={mesFin} onChange={(e) => setMesFin(e.target.value)}>
                    <option value="">Selecciona un mes</option>
                    {meses.map(mes => <option key={mes} value={mes}>{mes}</option>)}
                </select>
                <label>Año:</label>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min="2000" max="2100" />
            </div>
            <div className="buttons-container">
                <button className="action-button" onClick={fetchReportData} disabled={isLoading}>
                    {isLoading ? (
                        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4.75V6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17.1266 6.87343L16.0659 7.93414" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19.25 12L17.75 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17.1266 17.1266L16.0659 16.0659" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 17.75V19.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7.93414 16.0659L6.87343 17.1266" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.25 12L4.75 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7.93414 7.93414L6.87343 6.87343" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : 'Mostrar Reporte'}
                </button>
            </div>

            {message && <p className="message">{message}</p>}
            
            {Object.keys(monthlyTotals).length > 0 && (
                <div className="reporte-preview">
                    <h3>Totales Mensuales de Amenazas</h3>           
                    <div className="chart-container">
                        <h4>Gráfica de Amenazas</h4>
                        <div className="chart-wrapper" style={{ overflowX: 'auto' }}>
                             <div className="chart" style={{ width: Math.max(800, labels.length * 100) }}>
                                 {labels.map(mes => {
                                     const totalMes = threatTypes.reduce((sum, type) => sum + (monthlyTotals[mes][type] || 0), 0);
                                     const heightPercentage = maxTotal > 0 ? (totalMes / maxTotal) * 100 : 0;
                                     return (
                                         <div key={mes} className="bar-group">
                                             <div
                                                 className="bar"
                                                 style={{ height: `${heightPercentage}%`, backgroundColor: '#3498db' }}
                                             >
                                             </div>
                                             <span className="bar-label" style={{ display: heightPercentage < 10 ? 'none' : 'block' }}>{totalMes}</span>
                                             <span className="bar-group-label">{mes}</span>
                                         </div>
                                     );
                                 })}
                             </div>
                        </div>
                    </div>
                    

                    <h4 style={{ marginTop: '2rem' }}>Resumen de Amenazas por Mes</h4>
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
                                    <td>{threatTypes.reduce((sum, type) => sum + (monthlyTotals[mes][type] || 0), 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BitacoraReporte;
