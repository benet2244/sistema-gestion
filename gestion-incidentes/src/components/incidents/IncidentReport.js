import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const IncidentReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [reportHistory, setReportHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const REPORTS_API_URL = 'https://192.168.39.115/gestion-incidentes/backend/reportes.php';
    const HISTORY_API_URL = 'https://192.168.39.115/gestion-incidentes/backend/bitacora_reportes.php';

    useEffect(() => {
        fetchReportHistory();
    }, []);

    const fetchReportHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await axios.get(HISTORY_API_URL);
            setReportHistory(response.data ? response.data.sort((a, b) => b.id - a.id) : []);
        } catch (error) {
            console.error("Error al cargar la bitácora de reportes:", error);
            setMessage('No se pudo cargar el historial de reportes.');
            setIsError(true);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleGeneratePDF = async (data, start, end) => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const margin = 50;
        let y = height - 50;

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        page.drawText("Reporte de Incidentes de Seguridad", { x: margin, y, font: boldFont, size: 18, color: rgb(0.05, 0.2, 0.45) });
        y -= 25;
        page.drawText(`Periodo: ${start} a ${end}`, { x: margin, y, font, size: 12, color: rgb(0.3, 0.3, 0.3) });
        y -= 30;

        const headers = ["ID", "Tipo", "Prioridad", "Fecha", "Responsable", "Equipo Afectado", "Estado"];
        const colWidths = [30, 80, 50, 70, 80, 100, 60];
        let x = margin;

        headers.forEach((header, i) => {
            page.drawText(header, { x, y, font: boldFont, size: 10, color: rgb(0, 0, 0) });
            x += colWidths[i];
        });
        y -= 20;

        data.forEach(incidente => {
            if (y < 40) {
                page = pdfDoc.addPage(); y = height - 50;
            }
            x = margin;
            const row = [
                incidente.id, incidente.tipo_incidente, incidente.prioridad, 
                incidente.fecha_incidente, incidente.responsable, 
                incidente.equipo_afectado, incidente.estado_equipo
            ];
            row.forEach((cell, i) => {
                page.drawText(String(cell || ''), { x, y, font, size: 9, color: rgb(0.1, 0.1, 0.1) });
                x += colWidths[i];
            });
            y -= 15;
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_incidentes_${start}_a_${end}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const handleGenerateReport = async (format) => {
        if (!startDate || !endDate) {
            setMessage('Por favor, selecciona las fechas de inicio y fin.');
            setIsError(true);
            return;
        }
        setMessage('Generando reporte...');
        setIsError(false);

        try {
            const response = await axios.get(REPORTS_API_URL, { params: { start_date: startDate, end_date: endDate } });
            if (response.data.length === 0) {
                setMessage('No se encontraron incidentes en el rango de fechas seleccionado.');
                setIsError(true);
                return;
            }

            if (format === 'pdf') await handleGeneratePDF(response.data, startDate, endDate);
            else {
                let fileContent, mimeType, extension;
                if (format === 'csv') {
                    const header = Object.keys(response.data[0]).join(',');
                    const rows = response.data.map(inc => Object.values(inc).join(','));
                    fileContent = `${header}\n${rows.join('\n')}`;
                    mimeType = 'text/csv';
                    extension = 'csv';
                } else { // JSON
                    fileContent = JSON.stringify(response.data, null, 2);
                    mimeType = 'application/json';
                    extension = 'json';
                }
                const blob = new Blob([fileContent], { type: mimeType });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `reporte_incidentes_${startDate}_a_${endDate}.${extension}`;
                link.click();
                URL.revokeObjectURL(link.href);
            }
            
            setMessage(`Reporte en formato ${format.toUpperCase()} generado exitosamente.`);
            setIsError(false);
            await axios.post(HISTORY_API_URL, { nombre_reporte: `Reporte de ${startDate} a ${endDate}`, fecha_inicio: startDate, fecha_fin: endDate, formato: format });
            fetchReportHistory();

        } catch (error) {
            setMessage('Error al generar el reporte. Inténtalo de nuevo.');
            setIsError(true);
            console.error('Error:', error.response || error.message);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-10">

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-2 pb-4">Generar Reporte de Incidentes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-600 mb-1">Fecha de Inicio</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-600 mb-1">Fecha de Fin</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                        <button onClick={() => handleGenerateReport('pdf')} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"><span>Descargar PDF</span></button>
                        <button onClick={() => handleGenerateReport('csv')} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"><span>Descargar CSV</span></button>
                        <button onClick={() => handleGenerateReport('json')} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"><span>Descargar JSON</span></button>
                    </div>
                    {message && <p className={`mt-6 text-center text-sm font-semibold ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-2 pb-4">Bitácora de Reportes Generados</h2>
                    {loadingHistory ? <p className="text-center text-gray-500">Cargando historial...</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600">Nombre del Reporte</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600">Fecha de Creación</th>
                                        <th className="p-4 text-sm font-semibold text-gray-600 text-center">Formato</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportHistory.length > 0 ? reportHistory.map(report => (
                                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 text-sm text-gray-800 font-medium">{report.id}</td>
                                            <td className="p-4 text-sm text-gray-700">{report.nombre_reporte}</td>
                                            <td className="p-4 text-sm text-gray-600">{new Date(report.fecha_creacion).toLocaleString()}</td>
                                            <td className="p-4 text-sm text-center">
                                                <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${report.formato === 'pdf' ? 'bg-red-500' : report.formato === 'csv' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                                    {report.formato.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center p-6 text-gray-500">No hay reportes en el historial.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default IncidentReport;
