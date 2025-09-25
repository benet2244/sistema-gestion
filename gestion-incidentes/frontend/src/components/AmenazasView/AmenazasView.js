import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './AmenazasView.css';

const AmenazasView = () => {
    // --- ESTADO ---
    const [amenazas, setAmenazas] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/';

    // --- OBTENCIÓN DE DATOS ---
    const fetchAmenazas = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}obtener_amenazas.php`, {
                params: { month: selectedMonth, year: selectedYear }
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
    }, [selectedMonth, selectedYear]); // Dependencias para re-ejecutar la petición

    useEffect(() => {
        fetchAmenazas();
    }, [fetchAmenazas]);

    // --- MANEJO DE ENTRADAS ---
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
        } catch (error) {
            console.error("Error al guardar los datos:", error);
        }
    };

    // --- CÁLCULOS ---
    const columnTotals = useMemo(() => {
        const totals = { malware: 0, phishing: 0, comando_y_control: 0, criptomineria: 0, denegacion_de_servicios: 0, intentos_conexion_bloqueados: 0 };
        amenazas.forEach(a => {
            totals.malware += a.malware;
            totals.phishing += a.phishing;
            totals.comando_y_control += a.comando_y_control;
            totals.criptomineria += a.criptomineria;
            totals.denegacion_de_servicios += a.denegacion_de_servicios;
            totals.intentos_conexion_bloqueados += a.intentos_conexion_bloqueados;
        });
        return totals;
    }, [amenazas]);
    
    const totalGeneral = useMemo(() => Object.values(columnTotals).reduce((sum, val) => sum + val, 0), [columnTotals]);

    const getRowTotal = (amenaza) => {
        return Object.keys(columnTotals).reduce((sum, key) => sum + (amenaza[key] || 0), 0);
    };
    
    // --- RENDERIZADO ---
    const columns = [
        { key: 'malware', label: 'MALWARE' },
        { key: 'phishing', label: 'PHISHING' },
        { key: 'comando_y_control', label: 'COMANDO Y CONTROL' },
        { key: 'criptomineria', label: 'CRIPTOMINERIA' },
        { key: 'denegacion_de_servicios', label: 'DENEGACIÓN DE SERVICIOS' },
        { key: 'intentos_conexion_bloqueados', label: 'CONEXIONES BLOQUEADAS' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('es-ES', { month: 'long' }) }));
    const monthName = months.find(m => m.value === selectedMonth)?.name || '';

    return (
        <div className="amenazas-container">
            <div className="amenazas-header">
                <h1>Registro Diario de Amenazas</h1>
                <div className="filter-controls">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="amenazas-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            {columns.map(col => <th key={col.key}>{col.label}</th>)}
                            <th>TOTAL DÍA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {amenazas.map((a) => (
                            <tr key={a.fecha}>
                                <td>{new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
                            <th>TOTAL MES</th>
                            {columns.map(col => <th key={col.key}>{columnTotals[col.key].toLocaleString()}</th>)}
                            <th>{totalGeneral.toLocaleString()}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default AmenazasView;
