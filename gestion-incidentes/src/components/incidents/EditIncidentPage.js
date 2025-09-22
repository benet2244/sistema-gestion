import React, { useState, useEffect } from 'react';
import IncidentForm from './IncidentForm';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditIncidentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                const response = await axios.get(`https://192.168.39.115/gestion-incidentes/backend/incidentes.php?id=${id}`);
                if (response.data) {
                    setIncident(response.data);
                } else {
                    setError('No se encontró el incidente.');
                }
            } catch (err) {
                setError('Error al cargar los datos del incidente.');
                console.error('Error fetching incident:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchIncident();
    }, [id]);

    const handleIncidentEdited = () => {
        // Redirige al usuario a la lista de incidentes después de editar.
        navigate('/incidents');
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando datos del incidente...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;
    }

    return (
        <IncidentForm 
            currentIncident={incident} 
            onIncidentEdited={handleIncidentEdited} 
        />
    );
};

export default EditIncidentPage;
