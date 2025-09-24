import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AmenazasView.css';

const AmenazasView = () => {
    const [amenazas, setAmenazas] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    
    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/';

    const fetchAmenazas = async () => {
        try {
            const response = await axios.get(`${API_URL}obtener_amenazas.php`, {
                params: { month, year }
            });
            const numericData = response.data.registros.map(row => ({
                ...row,
                malware: parseInt(row.malware, 10) || 0,
                phishing: parseInt(row.phishing, 10) || 0,
                comando_y_control: parseInt(row.comando_y_control, 10) || 0,
                criptomineria: parseInt(row.criptomineria, 10) || 0,
                denegacion_de_servicios: parseInt(row.denegacion_de_servicios, 10) || 0,
                intentos_conexion_bloqueados: parseInt(row.intentos_conexion_bloqueados, 10) || 0,
            }));
            setAmenazas(numericData);
        } catch (error) {
            console.error("Error al obtener las amenazas:", error);
            setAmenazas([]);
        }
    };

    useEffect(() => {
        fetchAmenazas();
    }, [month, year]);

    const handleInputChange = (date, field, value) => {
        const updatedAmenazas = amenazas.map(a => {
            if (a.fecha === date) {
                const numericValue = parseInt(value, 10);
                return { ...a, [field]: isNaN(numericValue) ? 0 : numericValue };
            }
            return a;
        });
        setAmenazas(updatedAmenazas);
    };

    const handleInputBlur = async (date) => {
        const amenaza = amenazas.find(a => a.fecha === date);
        if (!amenaza) return;

        try {
            await axios.post(`${API_URL}guardar_amenazas.php`, amenaza);
            // Opcional: mostrar una notificación de éxito
        } catch (error) {
            console.error("Error al guardar los datos:", error);
            // Opcional: mostrar una notificación de error
        }
    };

    const columnTotals = useMemo(() => {
        const totals = { malware: 0, phishing: 0, comando_y_control: 0, criptomineria: 0, denegacion_de_servicios: 0, intentos_conexion_bloqueados: 0, totalGeneral: 0 };
        amenazas.forEach(a => {
            totals.malware += a.malware;
            totals.phishing += a.phishing;
            totals.comando_y_control += a.comando_y_control;
            totals.criptomineria += a.criptomineria;
            totals.denegacion_de_servicios += a.denegacion_de_servicios;
            totals.intentos_conexion_bloqueados += a.intentos_conexion_bloqueados;
        });
        totals.totalGeneral = Object.values(totals).reduce((sum, val) => sum + val, 0) - totals.totalGeneral; // self-correction
        return totals;
    }, [amenazas]);

    const getRowTotal = (amenaza) => {
        return Object.values(amenaza).reduce((sum, val) => typeof val === 'number' ? sum + val : sum, 0);
    };
    
    const columns = [
        { key: 'malware', label: 'MALWARE' },
        { key: 'phishing', label: 'PHISHING' },
        { key: 'comando_y_control', label: 'COMANDO Y CONTROL' },
        { key: 'criptomineria', label: 'CRIPTOMINERIA' },
        { key: 'denegacion_de_servicios', label: 'DENEGACION DE SERVICIOS' },
        { key: 'intentos_conexion_bloqueados', label: 'INTENTOS DE CONEXIÓN BLOQUEADOS' }
    ];

    return (
        <div className="amenazas-container">
            <h1>Registro Diario de Amenazas</h1>
            <div className="table-wrapper">
                <table className="amenazas-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            {columns.map(col => <th key={col.key}>{col.label}</th>)}
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {amenazas.map((a) => (
                            <tr key={a.fecha}>
                                <td>{new Date(a.fecha + 'T00:00:00').toLocaleDateString()}</td>
                                {columns.map(col => (
                                     <td key={col.key}>
                                         <input
                                             type="number"
                                             value={a[col.key]}
                                             onChange={(e) => handleInputChange(a.fecha, col.key, e.target.value)}
                                             onBlur={() => handleInputBlur(a.fecha)}
                                             className="data-input"
                                         />
                                     </td>
                                ))}
                                <td className="total-cell">{getRowTotal(a).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>TOTAL</th>
                            {columns.map(col => <th key={col.key}>{columnTotals[col.key].toLocaleString()}</th>)}
                            <th>{columnTotals.totalGeneral.toLocaleString()}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default AmenazasView;
