import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import DeteccionForm from './components/DeteccionForm/DeteccionForm';
import DeteccionesView from './components/DeteccionesView/DeteccionesView';
import Login from './components/Login/Login';

function App() {
    const [currentView, setCurrentView] = useState('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setCurrentView('dashboard');
    };

    const handleNavigate = (view) => {
        if (isAuthenticated) {
            setCurrentView(view);
        }
    };

    const renderView = () => {
        if (!isAuthenticated) {
            return <Login onLoginSuccess={handleLoginSuccess} />;
        }

        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'detecciones':
                return <DeteccionesView />;
            case 'formulario':
                return <DeteccionForm />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="App">
            {isAuthenticated && <Navbar onNavigate={handleNavigate} />}
            <main className="main-content">
                {renderView()}
            </main>
        </div>
    );
}

export default App;
