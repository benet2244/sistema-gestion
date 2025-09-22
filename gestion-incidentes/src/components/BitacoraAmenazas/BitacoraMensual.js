import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './bitacoraAmenazas.css';

const BitacoraMensual = () => {
    const [mes, setMes] = useState('');
    const [year, setYear] = useState('');
    const [registros, setRegistros] = useState(
        Array(31).fill({
            malware: 0,
            phishing: 0,
            comando_y_control: 0,
            criptomineria: 0,
            denegacion_de_servicios: 0,
            intentos_de_conexion: 0
        })
    );
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const getDaysInMonth = (month, year) => {
        const monthIndex = meses.indexOf(month);
        if (monthIndex === -1) return 31;
        const date = new Date(year, monthIndex + 1, 0);
        return date.getDate();
    };

    const fetchBitacoraData = async (selectedMes, selectedYear) => {
        if (!selectedMes || !selectedYear) {
            setRegistros(Array(31).fill({
                malware: 0,
                phishing: 0,
                comando_y_control: 0,
                criptomineria: 0,
                denegacion_de_servicios: 0,
                intentos_de_conexion: 0
            }));
            setMessage('');
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await axios.get('https://192.168.39.115/gestion-incidentes/backend/bitacora_mensual.php', {
                params: {
                    mes: selectedMes,
                    year: selectedYear
                }
            });

            const daysInMonth = getDaysInMonth(selectedMes, selectedYear);
            const initialRegistros = Array(daysInMonth).fill(null).map((_, index) => ({
                malware: 0,
                phishing: 0,
                comando_y_control: 0,
                criptomineria: 0,
                denegacion_de_servicios: 0,
                intentos_de_conexion: 0
            }));

            if (response.data.success && response.data.registros.length > 0) {
                const fetchedData = response.data.registros;
                const newRegistros = initialRegistros.map((_, index) => {
                    const found = fetchedData.find(d => parseInt(d.fecha.split('-')[2]) === index + 1);
                    return found ? {
                        malware: parseInt(found.malware),
                        phishing: parseInt(found.phishing),
                        comando_y_control: parseInt(found.comando_y_control),
                        criptomineria: parseInt(found.criptomineria),
                        denegacion_de_servicios: parseInt(found.denegacion_de_servicios),
                        intentos_de_conexion: parseInt(found.intentos_de_conexion),
                    } : initialRegistros[index];
                });
                setRegistros(newRegistros);
                setMessage("Datos cargados correctamente. Presiona 'Editar' para modificar.");
                setIsEditing(false);
            } else {
                setRegistros(initialRegistros);
                setMessage("No hay datos para este mes y año. Puedes ingresar nuevos datos y guardarlos.");
                setIsEditing(true);
            }

        } catch (error) {
            console.error("Error al cargar la bitácora:", error);
            setRegistros(Array(getDaysInMonth(selectedMes, selectedYear)).fill({
                malware: 0,
                phishing: 0,
                comando_y_control: 0,
                criptomineria: 0,
                denegacion_de_servicios: 0,
                intentos_de_conexion: 0
            }));
            setMessage("Error al cargar la bitácora. Inténtalo de nuevo.");
            setIsEditing(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBitacoraData(mes, year);
    }, [mes, year]);

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newRegistros = [...registros];
        newRegistros[index] = { ...newRegistros[index], [name]: parseInt(value) || 0 };
        setRegistros(newRegistros);
    };

    const handleGuardarBitacora = async () => {
        if (!mes || !year) {
            setMessage("Por favor, selecciona un mes y un año.");
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const dataToSave = registros.map((reg, index) => ({
                ...reg,
                fecha: `${year}-${String(meses.indexOf(mes) + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`,
            }));

            const response = await axios.post('http://192.168.39.115/gestion-incidentes/backend/bitacora_mensual.php', {
                mes,
                year,
                registros: dataToSave
            });
            setMessage(response.data.message);
            setIsEditing(false);
        } catch (error) {
            console.error("Error al guardar la bitácora:", error);
            setMessage("Error al guardar la bitácora. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // SVG icons for buttons
    const FaEdit = () => (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path d="M402.3 344.9l32-32c5.6-5.6 14.8-5.6 20.5 0l112 112c5.6 5.6 5.6 14.8 0 20.5l-32 32c-5.6 5.6-14.8 5.6-20.5 0l-112-112c-5.6-5.7-5.6-14.8-.1-20.4zm-147.1 113.8L61.7 458.1c-12.7 1.1-23.2-9.4-22.1-22.1l3.3-143.6c.3-12.7 5.3-24.8 14.1-33.6L311.9 44.1c18.7-18.7 49.1-18.7 67.9 0l7.1 7.1c9.4 9.4 14.7 22 14.7 35.5c0 13.5-5.3 26.1-14.7 35.5L296.8 335.5c-8.8 8.8-20.9 13.8-33.6 14.1zM504 384c-13.3 0-24 10.7-24 24v40H72V104h152c13.3 0 24-10.7 24-24s-10.7-24-24-24H48C21.5 56 0 77.5 0 104v360c0 26.5 21.5 48 48 48h456c26.5 0 48-21.5 48-48v-64c0-13.3-10.7-24-24-24z"></path>
      </svg>
    );

    const FaSave = () => (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path d="M542.1 329.8c-1.3-4-2.8-7.9-4.5-11.8c-6.1-13.8-14.8-26.6-26.3-36.9c-11.5-10.3-25-18.2-39.7-23.2c-1.5-.5-3-1-4.5-1.5L460 256h-81.8c-14.2 0-27.6 5.6-37.6 15.6l-96 96c-10 10-15.6 23.4-15.6 37.6V448h112v-68.2l96.7-96.7c1.3-.8 2.5-1.7 3.7-2.7c11.5-10.3 22-22.7 30.6-36.4c8.5-13.7 14.4-28.5 17.5-43.8c.4-1.9.8-3.7 1.2-5.6l1.3-6.6l.8-4.4c.5-2.6.9-5.3 1.2-8.1c.3-2.6.5-5.3.7-8c.3-4.5.4-9 .3-13.5c-.3-10.5-2.2-20.9-5.7-30.8c-3.5-9.9-8.4-19.3-14.7-27.9c-6.3-8.6-14-16.5-22.8-23.4c-8.9-6.9-18.7-12.8-29.2-17.6c-10.5-4.8-21.7-8.1-33.3-9.8c-11.6-1.7-23.4-1.9-35.1-.6c-11.7 1.3-23 4.4-33.9 9.3c-10.9 4.9-21.2 11.5-30.6 19.8c-9.5 8.3-18 18-25.5 28.8c-7.4 10.7-13.8 22.3-18.8 34.6c-5.1 12.3-8.6 25.1-10.5 38.3c-1.9 13.2-2.3 26.6-1.2 39.8c1.1 13.2 3.8 26.2 8.1 38.8c4.2 12.6 9.9 24.8 17.1 36.3c7.2 11.5 15.8 22.3 25.4 32.1l176 176c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L282.7 334.3c-10-10-15.6-23.4-15.6-37.6V256h81.8c14.2 0 27.6 5.6 37.6 15.6l113.8 113.8c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L384 384h-81.8c-14.2 0-27.6 5.6-37.6 15.6l-80.1 80.1c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L224 334.3V256zM544 480c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32h176V0H64C28.7 0 0 28.7 0 64v416c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64V128h-96c-17.7 0-32-14.3-32-32V0h-32v96h64v-64h-32V32h-32v32H288V0h-32v32H192V0h-32v32h-32V0h-32v32H64C28.7 32 0 60.7 0 96v352c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64V96c0-17.7-14.3-32-32-32h-64V0h32v32h32v32zM480 480v-64h-32v64h32z"></path>
      </svg>
    );

    const TailSpin = ({ color, height, width }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        style={{ background: 'none', height: height, width: width }}
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray="188.49555921538757 64.83185521538759"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            repeatCount="indefinite"
            dur="1s"
            values="0 50 50;360 50 50"
            keyTimes="0;1"
          />
        </circle>
      </svg>
    );

    return (
        <div className="bitacora-container p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Registro de Amenazas Mensuales</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                <div className="form-group flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700">Mes:</label>
                    <select
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="">Selecciona un mes</option>
                        {meses.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="form-group flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700">Año:</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="">Selecciona un año</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {message && <p className={`message text-center font-semibold mb-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <TailSpin color="#4f46e5" height={80} width={80} />
                </div>
            ) : (
                <div className="table-container bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Malware</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phishing</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comando y Control</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criptominería</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Denegación de Servicios</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intentos de Conexión</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registros.slice(0, getDaysInMonth(mes, year)).map((registro, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                name="malware"
                                                value={registro.malware}
                                                onChange={(e) => handleInputChange(index, e)}
                                                disabled={!isEditing}
                                                className="w-full border rounded-md p-1 text-center"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                name="phishing"
                                                value={registro.phishing}
                                                onChange={(e) => handleInputChange(index, e)}
                                                disabled={!isEditing}
                                                className="w-full border rounded-md p-1 text-center"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                name="comando_y_control"
                                                value={registro.comando_y_control}
                                                onChange={(e) => handleInputChange(index, e)}
                                                disabled={!isEditing}
                                                className="w-full border rounded-md p-1 text-center"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                name="criptomineria"
                                                value={registro.criptomineria}
                                                onChange={(e) => handleInputChange(index, e)}
                                                disabled={!isEditing}
                                                className="w-full border rounded-md p-1 text-center"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                name="denegacion_de_servicios"
                                                value={registro.denegacion_de_servicios}
                                                onChange={(e) => handleInputChange(index, e)}
                                                disabled={!isEditing}
                                                className="w-full border rounded-md p-1 text-center"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                name="intentos_de_conexion"
                                                value={registro.intentos_de_conexion}
                                                onChange={(e) => handleInputChange(index, e)}
                                                disabled={!isEditing}
                                                className="w-full border rounded-md p-1 text-center"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-4 mt-6">
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        disabled={!mes || !year}
                    >
                        <FaEdit /> Editar Bitácora
                    </button>
                ) : (
                    <button
                        onClick={handleGuardarBitacora}
                        className="flex-1 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        disabled={isLoading || !mes || !year}
                    >
                        <FaSave /> Guardar Bitácora
                    </button>
                )}
            </div>
        </div>
    );
};

export default BitacoraMensual;
