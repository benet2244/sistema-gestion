import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDocument, rgb } from 'pdf-lib';
import '../IncidentCss/IncidentReport.css';

const IncidentReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState('');
    const [reportHistory, setReportHistory] = useState([]);

    const REPORTS_API_URL = 'https://192.168.39.115/gestion-incidentes/backend/reportes.php';
    const HISTORY_API_URL = 'https://192.168.39.115/gestion-incidentes/backend/bitacora_reportes.php';

    useEffect(() => {
        const fetchReportHistory = async () => {
            try {
                const response = await axios.get(HISTORY_API_URL);
                if (response.data) {
                    const sortedHistory = response.data.sort((a, b) => b.id - a.id);
                    setReportHistory(sortedHistory);
                }
            } catch (error) {
                console.error("Error al cargar la bitácora de reportes:", error);
            }
        };
        fetchReportHistory();
    }, []);

    const handleGeneratePDFWithLib = async (data, start, end) => {
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        let yPosition = height - 50;
        const margin = 50;

        // Título del reporte
        page.drawText("Reporte de Incidentes de Seguridad", {
            x: margin,
            y: yPosition,
            size: 18,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        // Fechas del reporte
        page.drawText(`Desde: ${start}  Hasta: ${end}`, {
            x: margin,
            y: yPosition,
            size: 12,
            color: rgb(0, 0, 0),
        });
        yPosition -= 30;

        // Cabeceras de la tabla
        const headers = ["ID", "Tipo", "Prioridad", "Fecha", "Responsable", "Equipo", "MAC", "Detecciones", "Nivel"];
        const columnWidth = (width - 2 * margin) / headers.length;
        let xPosition = margin;

        headers.forEach(header => {
            page.drawText(header, {
                x: xPosition,
                y: yPosition,
                size: 10,
                color: rgb(0.2, 0.4, 0.6),
            });
            xPosition += columnWidth;
        });
        yPosition -= 15;

        // Contenido de la tabla
        data.forEach(incidente => {
            if (yPosition < 50) {
                page = pdfDoc.addPage();
                yPosition = height - 50;
            }

            xPosition = margin;
            const rowData = [
                incidente.id,
                incidente.tipo_incidente,
                incidente.prioridad,
                incidente.fecha_incidente,
                incidente.responsable,
                incidente.equipo_afectado,
                incidente.direccion_mac,
                incidente.cantidad_detecciones,
                incidente.nivel_amenaza,
            ];

            rowData.forEach((cell, index) => {
                const text = String(cell || '');
                page.drawText(text, {
                    x: margin + index * columnWidth,
                    y: yPosition,
                    size: 8,
                    color: rgb(0, 0, 0),
                });
            });
            yPosition -= 12;
        });

        // Guardar el PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_incidentes_${start}_a_${end}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleGenerateReport = async (e, format) => {
        e.preventDefault();
        setMessage('');

        if (!startDate || !endDate) {
            setMessage('Por favor, selecciona una fecha de inicio y una de fin.');
            return;
        }

        try {
            const response = await axios.get(REPORTS_API_URL, {
                params: {
                    start_date: startDate,
                    end_date: endDate
                }
            });

            const reportData = response.data;

            if (reportData.length === 0) {
                setMessage('No se encontraron incidentes en el rango de fechas seleccionado.');
                return;
            }

            if (format === 'csv') {
                const header = Object.keys(reportData[0]).join(',');
                const rows = reportData.map(inc => Object.values(inc).join(','));
                const fileContent = `${header}\n${rows.join('\n')}`;
                const blob = new Blob([fileContent], { type: 'text/csv' });
                const fileURL = window.URL.createObjectURL(blob);
                const fileLink = document.createElement('a');
                fileLink.href = fileURL;
                fileLink.setAttribute('download', `reporte_incidentes_${startDate}_a_${endDate}.csv`);
                document.body.appendChild(fileLink);
                fileLink.click();
                fileLink.remove();
            } else if (format === 'json') {
                const fileContent = JSON.stringify(reportData, null, 2);
                const blob = new Blob([fileContent], { type: 'application/json' });
                const fileURL = window.URL.createObjectURL(blob);
                const fileLink = document.createElement('a');
                fileLink.href = fileURL;
                fileLink.setAttribute('download', `reporte_incidentes_${startDate}_a_${endDate}.json`);
                document.body.appendChild(fileLink);
                fileLink.click();
                fileLink.remove();
            } else if (format === 'pdf') {
                await handleGeneratePDFWithLib(reportData, startDate, endDate);
            }

            setMessage(`Reporte en formato ${format.toUpperCase()} generado y descargado exitosamente.`);

            const newReportEntry = {
                nombre_reporte: `Reporte de ${startDate} a ${endDate}`,
                fecha_inicio: startDate,
                fecha_fin: endDate,
                formato: format
            };
            await axios.post(HISTORY_API_URL, newReportEntry);
            
            const historyResponse = await axios.get(HISTORY_API_URL);
            const sortedHistory = historyResponse.data.sort((a, b) => b.id - a.id);
            setReportHistory(sortedHistory);

        } catch (error) {
            setMessage('Error al generar el reporte o guardar la bitácora.');
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="report-page-container">
            <div className="report-form-section">
                <h2>Generar Datos</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="startDate">Fecha de Inicio:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="endDate">Fecha de Fin:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    
                    <div className="button-container">
                        <button 
                            className="csv-button" 
                            onClick={(e) => handleGenerateReport(e, 'csv')}
                        >
                            Descargar CSV
                        </button>
                        <button 
                            className="json-button" 
                            onClick={(e) => handleGenerateReport(e, 'json')}
                        >
                            Descargar JSON
                        </button>
                        <button 
                            className="pdf-button" 
                            onClick={(e) => handleGenerateReport(e, 'pdf')}
                        >
                            Descargar PDF
                        </button>
                    </div>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
            <div className="report-list-section">
                <h2>Bitácora de Reportes Generados</h2>
                {reportHistory.length > 0 ? (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre del Reporte</th>
                                <th>Fecha de Creación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportHistory.map(report => (
                                <tr key={report.id}>
                                    <td>{report.id}</td>
                                    <td>{report.nombre_reporte}</td>
                                    <td>{report.fecha_creacion}</td>
                                    <td>
                                        <button 
                                            className="download-button"
                                            onClick={() => alert(`Funcionalidad de descarga de reportes guardados no implementada en este ejemplo. Genera el reporte de nuevo.`)}
                                        >
                                            Descargar {report.formato.toUpperCase()}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-reports-message">No hay reportes generados.</p>
                )}
            </div>
        </div>
    );
};

export default IncidentReport;