import React, { useState } from 'react';
import './App.css';
import Login from './components/login/Login'; 
import Dashboard from './components/Dashboard/Dashboard'; // ¡Nuevo componente!
import DeteccionForm from './components/DeteccionForm/DeteccionForm'; 

// Usamos estados para simular la navegación entre vistas
const VIEW = {
    LOGIN: 'login',
    DASHBOARD: 'dashboard',
    DETECCION: 'deteccion',
};

function App() {
    // Usamos 'currentView' para gestionar qué componente se muestra
    const [currentView, setCurrentView] = useState(VIEW.LOGIN);
    
    // Simula la función que inicia el dashboard después del login
    const handleLoginSuccess = () => {
        setCurrentView(VIEW.DASHBOARD); 
    };
    
    // Función para cambiar la vista al formulario de detección
    const navigateToDeteccionForm = () => {
        setCurrentView(VIEW.DETECCION);
    };

    // Lógica de Renderizado
    const renderView = () => {
        switch (currentView) {
            case VIEW.LOGIN:
                return <Login onLoginSuccess={handleLoginSuccess} />;
            
            case VIEW.DASHBOARD:
                // El dashboard puede tener un botón para navegar al formulario
                return <Dashboard onNavigateToDeteccion={navigateToDeteccionForm} />;
            
            case VIEW.DETECCION:
                // El formulario puede tener un botón para volver al dashboard
                return (
                    <DeteccionForm 
                        onNavigateToDashboard={() => setCurrentView(VIEW.DASHBOARD)} 
                    />
                );

            default:
                return <Login onLoginSuccess={handleLoginSuccess} />;
        }
    };

    return (
        <div className="App">
            <h1>Sistema de Gestión de Incidentes</h1>
            <main>
                {renderView()}
            </main>
        </div>
    );
}

export default App;