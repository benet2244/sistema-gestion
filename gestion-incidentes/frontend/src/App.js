import React, { useState } from 'react';
import './App.css';
import Login from './components/login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import DeteccionForm from './components/DeteccionForm/DeteccionForm';
import Registro from './components/Registro/Registro';

const VIEW = {
    LOGIN: 'login',
    REGISTRO: 'registro',
    DASHBOARD: 'dashboard',
    DETECCION: 'deteccion',
};

function App() {
    const [currentView, setCurrentView] = useState(VIEW.LOGIN);

    const handleLoginSuccess = () => {
        setCurrentView(VIEW.DASHBOARD);
    };

    const handleRegistroSuccess = () => {
        setCurrentView(VIEW.LOGIN);
    };

    const navigateToDeteccionForm = () => {
        setCurrentView(VIEW.DETECCION);
    };

    const navigateToRegistro = () => {
        setCurrentView(VIEW.REGISTRO);
    };

    const renderView = () => {
        switch (currentView) {
            case VIEW.LOGIN:
                return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegistro={navigateToRegistro} />;
            case VIEW.REGISTRO:
                return <Registro onRegistroSuccess={handleRegistroSuccess} />;
            case VIEW.DASHBOARD:
                return <Dashboard onNavigateToDeteccion={navigateToDeteccionForm} />;
            case VIEW.DETECCION:
                return <DeteccionForm onNavigateToDashboard={() => setCurrentView(VIEW.DASHBOARD)} />;
            default:
                return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegistro={navigateToRegistro} />;
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