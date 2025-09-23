import React, { useState, useEffect, useCallback } from 'react';
import './BitacoraMensual.css'; // Estilos para la bitácora

// Estandarización de la URL del backend
const API_BASE_URL = 'http://localhost/gestion-incidentes/backend';

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const threatKeys = ['malware', 'phishing', 'comando_y_control', 'criptomineria', 'denegacion_de_servicios', 'intentos_de_conexion'];

const getDaysInMonth = (month, year) => {
    const monthIndex = meses.indexOf(month);
    if (monthIndex === -1 || !year) return 31; 
    return new Date(year, monthIndex + 1, 0).getDate();
};

const BitacoraMensual = () => {
    const [mes, setMes] = useState('');
    const [year, setYear] = useState('');
    const [registros, setRegistros] = useState([]);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const initializeRegistros = useCallback((numDays) => {
        const initialRecord = threatKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        return Array(numDays).fill(initialRecord);
    }, []);

    const fetchBitacoraData = useCallback(async (selectedMes, selectedYear) => {
        const daysInMonth = getDaysInMonth(selectedMes, selectedYear);
        if (!selectedMes || !selectedYear) {
            setRegistros(initializeRegistros(daysInMonth));
            return;
        }
        setIsLoading(true);
        try {
            // Usando fetch y la URL estandarizada
            const response = await fetch(`${API_BASE_URL}/bitacora_mensual.php?mes=${selectedMes}&year=${selectedYear}`);
            const data = await response.json();

            const initialRegistros = initializeRegistros(daysInMonth);
            if (data.success && data.registros.length > 0) {
                const fetchedData = data.registros;
                const newRegistros = initialRegistros.map((_, index) => {
                    const day = index + 1;
                    const found = fetchedData.find(d => parseInt(d.fecha.split('-')[2], 10) === day);
                    if (found) {
                        const newRecord = {};
                        threatKeys.forEach(key => { newRecord[key] = parseInt(found[key], 10) || 0; });
                        return newRecord;
                    }
                    return initialRegistros[index];
                });
                setRegistros(newRegistros);
                setMessage("Datos cargados. Presiona 'Editar' para modificar.");
                setIsEditing(false);
            } else {
                setRegistros(initialRegistros);
                setMessage("No hay datos para este mes. Puedes ingresarlos y guardarlos.");
                setIsEditing(true);
            }
        } catch (error) {
            console.error("Error al cargar la bitácora:", error);
            setRegistros(initializeRegistros(daysInMonth));
            setMessage("Error al cargar la bitácora. Inténtalo de nuevo.");
            setIsError(true);
            setIsEditing(true);
        } finally { setIsLoading(false); }
    }, [initializeRegistros]);

    useEffect(() => { fetchBitacoraData(mes, year); }, [mes, year, fetchBitacoraData]);

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newRegistros = [...registros];
        newRegistros[index] = { ...newRegistros[index], [name]: parseInt(value, 10) || 0 };
        setRegistros(newRegistros);
    };

    const handleGuardarBitacora = async () => {
        if (!mes || !year) {
            setMessage("Por favor, selecciona un mes y un año.");
            setIsError(true);
            return;
        }
        setIsLoading(true);
        setMessage('');
        setIsError(false);
        try {
            const dataToSave = registros.map((reg, index) => ({
                ...reg,
                fecha: `${year}-${String(meses.indexOf(mes) + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`
            }));
            
            // Usando fetch para el método POST
            const response = await fetch(`${API_BASE_URL}/bitacora_mensual.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mes, year, registros: dataToSave })
            });
            const result = await response.json();

            setMessage(result.message);
            setIsError(!result.success);
            if(result.success) setIsEditing(false);

        } catch (error) {
            console.error("Error al guardar la bitácora:", error);
            setMessage("Error de conexión al guardar la bitácora.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Resto del componente (sin cambios en la lógica de renderizado) ---

    const columnTotals = threatKeys.reduce((acc, key) => {
        acc[key] = registros.reduce((sum, reg) => sum + (reg[key] || 0), 0);
        return acc;
    }, {});
    const grandTotal = Object.values(columnTotals).reduce((sum, val) => sum + val, 0);

    const FaEdit = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M402.3 344.9l32-32c5.6-5.6 14.8-5.6 20.5 0l112 112c5.6 5.6 5.6 14.8 0 20.5l-32 32c-5.6 5.6-14.8 5.6-20.5 0l-112-112c-5.6-5.7-5.6-14.8-.1-20.4zm-147.1 113.8L61.7 458.1c-12.7 1.1-23.2-9.4-22.1-22.1l3.3-143.6c.3-12.7 5.3-24.8 14.1-33.6L311.9 44.1c18.7-18.7 49.1-18.7 67.9 0l7.1 7.1c9.4 9.4 14.7 22 14.7 35.5c0 13.5-5.3 26.1-14.7 35.5L296.8 335.5c-8.8 8.8-20.9 13.8-33.6 14.1zM504 384c-13.3 0-24 10.7-24 24v40H72V104h152c13.3 0 24-10.7 24-24s-10.7-24-24-24H48C21.5 56 0 77.5 0 104v360c0 26.5 21.5 48 48 48h456c26.5 0 48-21.5 48-48v-64c0-13.3-10.7-24-24-24z"></path></svg>;
    const FaSave = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M433.9 129.9l-83.9-83.9A48 48 0 00316.1 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V163.9a48 48 0 00-14.1-33.9zM224 416c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm96-304.5H96V128h224v-16.5z"></path></svg>;

    return (
        <div className="bitacora-container">
             <div className="bitacora-main-header">
                <h2 className="bitacora-title">Registro de Amenazas Mensuales</h2>
                <div className="actions-container">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="action-button edit-button" disabled={!mes || !year || isLoading}>
                            <FaEdit /> Editar Bitácora
                        </button>
                    ) : (
                        <button onClick={handleGuardarBitacora} className="action-button save-button" disabled={isLoading || !mes || !year}>
                            <FaSave /> Guardar Bitácora
                        </button>
                    )}
                </div>
            </div>

            <div className="filters-container">
                 <div className="filter-group">
                    <label className="filter-label">Mes:</label>
                    <select value={mes} onChange={(e) => setMes(e.target.value)} className="filter-select">
                        <option value="">Selecciona un mes</option>
                        {meses.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Año:</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="filter-select">
                        <option value="">Selecciona un año</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {message && <p className={`feedback-message ${isError ? 'is-error' : 'is-success'}`}>{message}</p>}

            {isLoading ? (
                <div className="loading-container">Cargando...</div>
            ) : (
                <div className="table-container">
                    <table className="threat-table">
                        <thead>
                            <tr>
                                <th>Día</th>
                                <th>Malware</th>
                                <th>Phishing</th>
                                <th>Comando y Control</th>
                                <th>Criptominería</th>
                                <th>Denegación de Servicios</th>
                                <th>Intentos de Conexión</th>
                                <th className="total-header-cell">Total Día</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registros.slice(0, getDaysInMonth(mes, year)).map((registro, index) => {
                                const rowTotal = Object.values(registro).reduce((sum, val) => sum + (val || 0), 0);
                                return (
                                    <tr key={index}>
                                        <td className="day-cell">{index + 1}</td>
                                        {threatKeys.map(key => (
                                            <td key={key}>
                                                <input
                                                    type="number"
                                                    name={key}
                                                    value={registro[key]}
                                                    onChange={(e) => handleInputChange(index, e)}
                                                    onFocus={(e) => e.target.select()}
                                                    disabled={!isEditing}
                                                    className="table-input"
                                                    min="0"
                                                />
                                            </td>
                                        ))}
                                        <td className="total-cell">{rowTotal}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="totals-row">
                                <th>Total Mensual</th>
                                {threatKeys.map(key => (
                                    <td key={key}>{columnTotals[key]}</td>
                                ))}
                                <td className="grand-total-cell">{grandTotal}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BitacoraMensual;
