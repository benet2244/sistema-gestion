import React from 'react';
import './DeteccionDetails.css';

const DeteccionDetails = ({ detection }) => {
    const renderDetail = (label, value) => (
        <div className="detail-item">
            <span className="detail-label">{label}:</span>
            <span className="detail-value">{value || 'No disponible'}</span>
        </div>
    );

    const renderAnalysisDetails = () => {
        if (!detection.detalles || detection.detalles.trim() === '') {
            return <p>No hay detalles adicionales o análisis para este incidente.</p>;
        }

        try {
            const details = JSON.parse(detection.detalles);
            const stats = details.data?.attributes?.last_analysis_stats;
            const results = details.data?.attributes?.last_analysis_results;
            const hash = details.data?.id; // ¡CORRECTO! Extraer el hash (ID) del JSON

            if (stats && results) {
                const maliciousScans = Object.values(results).filter(r => r.category === 'malicious');

                return (
                    <div className="virustotal-details">
                        <h4>Análisis de VirusTotal</h4>
                        <div className="virustotal-stats">
                            <span className="vt-stat malicious">Maliciosos: {stats.malicious}</span>
                            <span className="vt-stat suspicious">Sospechosos: {stats.suspicious}</span>
                            <span className="vt-stat harmless">Inofensivos: {stats.harmless}</span>
                            <span className="vt-stat undetected">No detectados: {stats.undetected}</span>
                        </div>
                        {maliciousScans.length > 0 && (
                            <div className="vt-malicious-list">
                                <h5>Principales Detecciones Maliciosas:</h5>
                                <ul>
                                    {maliciousScans.slice(0, 5).map((scan, index) => (
                                        <li key={index}>
                                            <strong>{scan.engine_name}:</strong> {scan.result}
                                        </li>
                                    ))}
                                    {maliciousScans.length > 5 && <li>... y {maliciousScans.length - 5} más.</li>}
                                </ul>
                            </div>
                        )}
                        {/* LÓGICA DEL ENLACE CORREGIDA Y EN EL LUGAR CORRECTO */}
                        {hash && (
                            <div className="link-section">
                                <a href={`https://www.virustotal.com/gui/file/${hash}`} target="_blank" rel="noopener noreferrer" className="vt-link">
                                    Ver reporte completo en VirusTotal
                                </a>
                            </div>
                        )}
                    </div>
                );
            }
        } catch (error) {
            return (
                <div className="details-section">
                    <h4>Notas Adicionales</h4>
                    <p className="raw-details-text">{detection.detalles}</p>
                </div>
            );
        }

        return (
            <div className="details-section">
                <h4>Notas Adicionales</h4>
                <p className="raw-details-text">{detection.detalles}</p>
            </div>
        );
    };

    return (
        <div className="detection-details-container">
            <h3>Detalles del Incidente #{detection.id_deteccion}</h3>
            <div className="details-grid">
                {renderDetail('Tipo de Incidente', detection.tipo_incidente)}
                {renderDetail('Responsable', detection.responsable)}
                {renderDetail('Fecha del Incidente', new Date(detection.fecha_incidente).toLocaleString())}
                {renderDetail('Severidad', detection.severity)}
                {renderDetail('Estado', detection.estado)}
                {renderDetail('Nivel de Amenaza', detection.nivel_amenaza)}
                {renderDetail('Hostname', detection.hostname)}
                {renderDetail('Equipo Afectado', detection.equipo_afectado)}
                {renderDetail('Dirección MAC', detection.direccion_mac)}
                {renderDetail('IP Origen', detection.source_ip)}
                {renderDetail('IP Destino', detection.target_ip)}
                {renderDetail('Dependencia', detection.dependencia)}
                {renderDetail('Cantidad', detection.cantidad_detecciones)}
                {renderDetail('Estado del Equipo', detection.estado_equipo)}
            </div>

            <div className="details-section">
                <h4>Descripción y Acciones</h4>
                <p><strong>Descripción:</strong> {detection.detection_description || 'N/A'}</p>
                <p><strong>Acciones Tomadas:</strong> {detection.acciones_tomadas || 'N/A'}</p>
            </div>

            {renderAnalysisDetails()}

            {/* YA NO HAY LÓGICA DE ENLACE AQUÍ, FUE MOVIDA ARRIBA */}
        </div>
    );
};

export default DeteccionDetails;
