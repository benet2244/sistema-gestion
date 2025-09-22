import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import './IncidentReport.css'; // Importar el nuevo archivo CSS

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
        let page = pdfDoc.addPage();
        const { height } = page.getSize();
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
        <div className="report-container">
            <div className="report-wrapper">

                <div className="report-card">
                    <h2 className="report-title">Generar Reporte de Incidentes</h2>
                    <div className="date-selector-grid">
                        <div className="date-input-group">
                            <label htmlFor="startDate">Fecha de Inicio</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="endDate">Fecha de Fin</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
                        </div>
                    </div>
                    <div className="report-actions">
                        <button onClick={() => handleGenerateReport('pdf')} className="report-button pdf-button"><span>Descargar PDF</span></button>
                        <button onClick={() => handleGenerateReport('csv')} className="report-button csv-button"><span>Descargar CSV</span></button>
                        <button onClick={() => handleGenerateReport('json')} className="report-button json-button"><span>Descargar JSON</span></button>
                    </div>
                    {message && <p className={`feedback-message ${isError ? 'error' : 'success'}`}>{message}</p>}
                </div>

                <div className="report-card">
                    <h2 className="report-title">Bitácora de Reportes Generados</h2>
                    {loadingHistory ? <p className="loading-message">Cargando historial...</p> : (
                        <div className="history-table-wrapper">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre del Reporte</th>
                                        <th>Fecha de Creación</th>
                                        <th style={{textAlign: 'center'}}>Formato</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportHistory.length > 0 ? reportHistory.map(report => (
                                        <tr key={report.id}>
                                            <td>{report.id}</td>
                                            <td>{report.nombre_reporte}</td>
                                            <td>{new Date(report.fecha_creacion).toLocaleString()}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className={`format-pill format-${report.formato}`}>
                                                    {report.formato.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '2rem'}}>No hay reportes en el historial.</td></tr>
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
