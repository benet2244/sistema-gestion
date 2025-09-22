import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../IncidentCss/EditIncidentForm.css';

const EditIncidentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                const response = await axios.get(`https://192.168.39.115/gestion-incidentes/backend/incidentes.php?id=${id}`);
                setFormData(response.data);
            } catch (error) {
                setMessage('Error al cargar los datos del incidente.');
                console.error('Error fetching incident:', error);
            }
        };

        if (id) {
            fetchIncident();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://192.168.39.115/gestion-incidentes/backend/incidentes.php?id=${formData.id}`, formData);
            setMessage('Incidente actualizado con éxito!');
            setTimeout(() => {
                navigate('/incidents');
            }, 1500);
        } catch (error) {
            setMessage('Error al actualizar el incidente.');
            console.error('Error updating incident:', error);
        }
    };

    if (!formData) {
        return <div className="loading-container">Cargando incidente...</div>;
    }
    

    return (
        <div className="incident-form-container">
            <h2>Editar Incidente</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="tipo_incidente">Tipo de Incidente:</label>
                    <input
                        type="text"
                        id="tipo_incidente"
                        name="tipo_incidente"
                        value={formData.tipo_incidente || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="prioridad">Prioridad:</label>
                    <select
                        id="prioridad"
                        name="prioridad"
                        value={formData.prioridad || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona una prioridad</option>
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="fecha_incidente">Fecha del Incidente:</label>
                    <input
                        type="date"
                        id="fecha_incidente"
                        name="fecha_incidente"
                        value={formData.fecha_incidente ? formData.fecha_incidente.split('T')[0] : ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="responsable">Responsable:</label>
                    <input
                        type="text"
                        id="responsable"
                        name="responsable"
                        value={formData.responsable || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="equipo_afectado">Equipo Afectado:</label>
                    <input
                        type="text"
                        id="equipo_afectado"
                        name="equipo_afectado"
                        value={formData.equipo_afectado || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="direccion_mac">Dirección MAC:</label>
                    <input
                        type="text"
                        id="direccion_mac"
                        name="direccion_mac"
                        value={formData.direccion_mac || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="dependencia">Dependencia:</label>
                    <input
                        type="text"
                        id="dependencia"
                        name="dependencia"
                        value={formData.dependencia || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cantidad_detecciones">Detecciones:</label>
                    <input
                        type="number"
                        id="cantidad_detecciones"
                        name="cantidad_detecciones"
                        value={formData.cantidad_detecciones || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="estado_equipo">Estado del Equipo:</label>
                    <select
                        id="estado_equipo"
                        name="estado_equipo"
                        value={formData.estado_equipo || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona un estado</option>
                        <option value="comprometido">Comprometido</option>
                        <option value="aislado">Aislado</option>
                        <option value="limpio">Limpio</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="acciones_tomadas">Acciones Tomadas:</label>
                    <textarea
                        id="acciones_tomadas"
                        name="acciones_tomadas"
                        value={formData.acciones_tomadas || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="hash_url">Hash/URL/Archivo:</label>
                    <input
                        type="text"
                        id="hash_url"
                        name="hash_url"
                        value={formData.hash_url || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="nivel_amenaza">Nivel de Amenaza:</label>
                    <select
                        id="nivel_amenaza"
                        name="nivel_amenaza"
                        value={formData.nivel_amenaza || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona un nivel</option>
                        <option value="bajo">Bajo</option>
                        <option value="medio">Medio</option>
                        <option value="alto">Alto</option>
                        <option value="critico">Crítico</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="detalles">Detalles:</label>
                    <textarea
                        id="detalles"
                        name="detalles"
                        value={formData.detalles || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="button-group">
                    <button type="submit" className="submit-btn">Guardar Cambios</button>
                    <button type="button" onClick={() => navigate('/incidents')} className="cancel-btn">Cancelar</button>
                </div>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default EditIncidentForm;