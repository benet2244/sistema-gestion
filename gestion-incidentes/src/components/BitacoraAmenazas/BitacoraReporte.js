import React, { useState } from 'react';

const API_URL = 'https://192.168.39.115/gestion-incidentes/backend/reporte_bitacora.php';

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

    const labels = Object.keys(monthlyTotals);
    const maxTotal = labels.length > 0 ? Math.max(...labels.map(mes => threatTypes.reduce((sum, type) => sum + monthlyTotals[mes][type], 0))) : 0;
    
    return (
        <div className="bg-gray-100 p-4 sm:p-6 lg:p-8 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Generar Reporte de Amenazas</h2>
                
                <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mes de Inicio:</label>
                            <select value={mesInicio} onChange={(e) => setMesInicio(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Selecciona un mes</option>
                                {meses.map(mes => <option key={mes} value={mes}>{mes}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mes de Fin:</label>
                            <select value={mesFin} onChange={(e) => setMesFin(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Selecciona un mes</option>
                                {meses.map(mes => <option key={mes} value={mes}>{mes}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Año:</label>
                            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min="2000" max="2100" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <button className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300" onClick={fetchReportData} disabled={isLoading}>
                            {isLoading ? 'Generando...' : 'Mostrar Reporte'}
                        </button>
                    </div>
                </div>

                {message && <p className="text-center text-red-600 font-semibold my-4">{message}</p>}
                
                {labels.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Totales Mensuales de Amenazas</h3>
                        
                        {/* Gráfico de Barras */}
                        <div className="mb-8 p-4 border rounded-lg">
                            <h4 className="text-xl font-semibold text-gray-700 text-center mb-4">Gráfica de Amenazas</h4>
                            <div className="w-full overflow-x-auto">
                                <div className="chart-container flex items-end h-64 space-x-4 pl-4 border-l-2 border-b-2 border-gray-300" style={{ minWidth: `${labels.length * 6}rem` }}>
                                    {labels.map(mes => {
                                        const totalMes = threatTypes.reduce((sum, type) => sum + (monthlyTotals[mes][type] || 0), 0);
                                        const heightPercentage = maxTotal > 0 ? (totalMes / maxTotal) * 100 : 0;
                                        return (
                                            <div key={mes} className="bar-group flex-1 flex flex-col items-center">
                                                <div className="relative w-full h-full flex items-end">
                                                    <div className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-700 transition-colors" style={{ height: `${heightPercentage}%` }}>
                                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-700">{totalMes > 0 ? totalMes : ''}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 mt-2 text-center">{mes}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Tabla de Resumen */}
                        <div>
                            <h4 className="text-xl font-semibold text-gray-700 mb-4">Resumen Detallado</h4>
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                                            {threatLabels.map(label => <th key={label} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</th>)}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {labels.map(mes => (
                                            <tr key={mes} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mes}</td>
                                                {threatTypes.map(type => (
                                                    <td key={type} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{monthlyTotals[mes][type] || 0}</td>
                                                ))}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{threatTypes.reduce((sum, type) => sum + (monthlyTotals[mes][type] || 0), 0)}</td>
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
