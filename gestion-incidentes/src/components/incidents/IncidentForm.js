import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IncidentForm = ({ onIncidentAdded, onIncidentEdited, currentIncident, setCurrentIncident }) => {
  const [formData, setFormData] = useState({
    tipo_incidente: '',
    prioridad: 'media',
    fecha_incidente: '',
    responsable: '',
    equipo_afectado: '',
    direccion_mac: '',
    dependencia: '',
    cantidad_detecciones: '',
    estado_equipo: '',
    acciones_tomadas: '',
    hash_url: '',
    nivel_amenaza: '',
    detalles: '',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (currentIncident) {
      setFormData({
        tipo_incidente: currentIncident.tipo_incidente || '',
        prioridad: currentIncident.prioridad || 'media',
        fecha_incidente: currentIncident.fecha_incidente ? new Date(currentIncident.fecha_incidente).toISOString().split('T')[0] : '',
        responsable: currentIncident.responsable || '',
        equipo_afectado: currentIncident.equipo_afectado || '',
        direccion_mac: currentIncident.direccion_mac || '',
        dependencia: currentIncident.dependencia || '',
        cantidad_detecciones: currentIncident.cantidad_detecciones || '',
        estado_equipo: currentIncident.estado_equipo || '',
        acciones_tomadas: currentIncident.acciones_tomadas || '',
        hash_url: currentIncident.hash_url || '',
        nivel_amenaza: currentIncident.nivel_amenaza || '',
        detalles: currentIncident.detalles || '',
      });
      setMessage('');
      setIsError(false);
    } else {
      // Reset form to its initial state
      setFormData({
        tipo_incidente: '', prioridad: 'media', fecha_incidente: '', responsable: '',
        equipo_afectado: '', direccion_mac: '', dependencia: '', cantidad_detecciones: '',
        estado_equipo: '', acciones_tomadas: '', hash_url: '', nivel_amenaza: '', detalles: '',
      });
    }
  }, [currentIncident]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyzeHash = async () => {
    if (!formData.hash_url) {
        setMessage('Por favor, ingresa un hash o URL para analizar.');
        setIsError(true);
        return;
    }
    setIsAnalyzing(true);
    setMessage('');
    setIsError(false);
    setAnalysisResult(null);
    try {
        const response = await axios.post('https://192.168.39.115/gestion-incidentes/backend/analizar_hash.php', { hash: formData.hash_url });
        if (response.data.success) {
            setAnalysisResult(response.data.data);
            setFormData(prev => ({ ...prev, nivel_amenaza: response.data.data.nivel_compromiso, cantidad_detecciones: response.data.data.estadisticas.malicious }));
            setMessage('Análisis completado exitosamente.');
            setIsError(false);
        } else {
            setMessage(response.data.message || 'Error al analizar el hash.');
            setIsError(true);
        }
    } catch (error) {
        setMessage('Error de conexión con el servidor de análisis.');
        setIsError(true);
        console.error('Error al analizar hash:', error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
        if (currentIncident) {
            await axios.put(`https://192.168.39.115/gestion-incidentes/backend/incidentes.php?id=${currentIncident.id}`, formData);
            setMessage('Incidente actualizado exitosamente.');
            if (onIncidentEdited) onIncidentEdited();
        } else {
            await axios.post('https://192.168.39.115/gestion-incidentes/backend/incidentes.php', formData);
            setMessage('Incidente registrado exitosamente.');
            if (onIncidentAdded) onIncidentAdded();
        }
        setFormData({ tipo_incidente: '', prioridad: 'media', fecha_incidente: '', responsable: '', equipo_afectado: '', direccion_mac: '', dependencia: '', cantidad_detecciones: '', estado_equipo: '', acciones_tomadas: '', hash_url: '', nivel_amenaza: '', detalles: '' });
        setCurrentIncident(null);
        setAnalysisResult(null);
    } catch (error) {
        setMessage(`Error al ${currentIncident ? 'actualizar' : 'registrar'} el incidente. Inténtalo de nuevo.`);
        setIsError(true);
        console.error(`Error:`, error);
    }
  };
  
  const threatLevelClasses = { baja: 'bg-green-100 text-green-800', media: 'bg-yellow-100 text-yellow-800', alta: 'bg-red-100 text-red-800', default: 'bg-gray-100 text-gray-800' };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-5xl mx-auto my-10">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b-2 pb-4">{currentIncident ? 'Editar Incidente' : 'Registrar Nuevo Incidente'}</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <label htmlFor="hash_url" className="block text-lg font-bold text-gray-800 mb-3">Análisis de Hash / URL (VirusTotal)</label>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" id="hash_url" name="hash_url" value={formData.hash_url} onChange={handleChange} className="flex-grow w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ingresa SHA256, MD5 o URL" />
                <button type="button" onClick={handleAnalyzeHash} disabled={isAnalyzing} className="w-full sm:w-auto px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg">
                    {isAnalyzing ? 'Analizando...' : 'Analizar'}
                </button>
            </div>
        </div>

        {analysisResult && (
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-5 rounded-r-lg space-y-3 text-sm shadow-md">
                <h4 className="font-bold text-lg text-blue-900">Resultados del Análisis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div><span className="font-semibold">Nivel de Amenaza:</span> <span className={`px-3 py-1 rounded-full text-xs font-bold ml-2 ${threatLevelClasses[analysisResult.nivel_compromiso?.toLowerCase()] || threatLevelClasses.default}`}>{analysisResult.nivel_compromiso}</span></div>
                    <div><span className="font-semibold">Tipo de Virus:</span> <span className="font-medium">{analysisResult.tipo_virus || 'No disponible'}</span></div>
                    <div><span className="font-semibold">Detecciones:</span> <span className="font-bold text-red-600">{analysisResult.estadisticas.malicious || 0}</span> / {analysisResult.estadisticas.total || 0}</div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fields... */}
            <div>
                <label htmlFor="tipo_incidente" className="block text-sm font-semibold text-gray-600">Tipo de Incidente</label>
                <select id="tipo_incidente" name="tipo_incidente" value={formData.tipo_incidente} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Selecciona un tipo</option>
                    <option value="Malware">Malware</option>
                    <option value="Phishing">Phishing</option>
                    <option value="Denegacion de servicio">Denegación de Servicio</option>
                    <option value="Intrusion">Intrusión</option>
                    <option value="Fuga de datos">Fuga de Datos</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>
            <div>
                <label htmlFor="prioridad" className="block text-sm font-semibold text-gray-600">Prioridad</label>
                <select id="prioridad" name="prioridad" value={formData.prioridad} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </div>
            <div>
                <label htmlFor="fecha_incidente" className="block text-sm font-semibold text-gray-600">Fecha del Incidente</label>
                <input type="date" id="fecha_incidente" name="fecha_incidente" value={formData.fecha_incidente} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label htmlFor="responsable" className="block text-sm font-semibold text-gray-600">Responsable</label>
                <input type="text" id="responsable" name="responsable" value={formData.responsable} onChange={handleChange} required placeholder="Ej: Analista SOC" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label htmlFor="equipo_afectado" className="block text-sm font-semibold text-gray-600">Equipo Afectado</label>
                <input type="text" id="equipo_afectado" name="equipo_afectado" value={formData.equipo_afectado} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label htmlFor="direccion_mac" className="block text-sm font-semibold text-gray-600">Dirección MAC</label>
                <input type="text" id="direccion_mac" name="direccion_mac" value={formData.direccion_mac} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label htmlFor="dependencia" className="block text-sm font-semibold text-gray-600">Dependencia</label>
                <input type="text" id="dependencia" name="dependencia" value={formData.dependencia} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
                <label htmlFor="estado_equipo" className="block text-sm font-semibold text-gray-600">Estado del Equipo</label>
                <input type="text" id="estado_equipo" name="estado_equipo" value={formData.estado_equipo} onChange={handleChange} placeholder="Ej: Limpio, Contenido" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div className="lg:col-span-1">
                <label htmlFor="nivel_amenaza" className="block text-sm font-semibold text-gray-600">Nivel de Amenaza</label>
                <input type="text" id="nivel_amenaza" name="nivel_amenaza" value={formData.nivel_amenaza} onChange={handleChange} readOnly className="mt-1 w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm cursor-not-allowed"/>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
                <label htmlFor="acciones_tomadas" className="block text-sm font-semibold text-gray-600">Acciones Tomadas</label>
                <textarea id="acciones_tomadas" name="acciones_tomadas" rows="4" value={formData.acciones_tomadas} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
                <label htmlFor="detalles" className="block text-sm font-semibold text-gray-600">Detalles Adicionales</label>
                <textarea id="detalles" name="detalles" rows="4" value={formData.detalles} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            {currentIncident && (
                <button type="button" onClick={() => { setCurrentIncident(null); setAnalysisResult(null); setMessage(''); }} className="px-6 py-2 font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 shadow-sm hover:shadow-md">
                    Cancelar Edición
                </button>
            )}
            <button type="submit" className="px-8 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg">
                {currentIncident ? 'Guardar Cambios' : 'Registrar Incidente'}
            </button>
        </div>
      </form>
      {message && <p className={`mt-6 text-center text-sm font-semibold ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
    </div>
  );
};

export default IncidentForm;
