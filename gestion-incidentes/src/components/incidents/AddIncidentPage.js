import React from 'react';
import IncidentForm from './IncidentForm';
import { useNavigate } from 'react-router-dom';

const AddIncidentPage = () => {
    const navigate = useNavigate();

    const handleIncidentAdded = () => {
        // Redirige al usuario a la lista de incidentes después de agregar uno nuevo.
        navigate('/incidents');
    };

    return (
        <IncidentForm 
            onIncidentAdded={handleIncidentAdded} 
        />
    );
};

export default AddIncidentPage;
