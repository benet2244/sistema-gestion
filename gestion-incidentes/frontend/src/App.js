import React, { useState } from 'react';
import Login from './components/login/Login';
import Navbar from './components/Navbar/Navbar';
import DeteccionesView from './components/DeteccionesView/DeteccionesView';
import Dashboard from './components/Dashboard/Dashboard';
import AmenazasView from './components/AmenazasView/AmenazasView'; // 1. Importar el nuevo componente
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('login');

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentPage('login');
    };

    const navigateTo = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        if (!user) {
            return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegistro={() => navigateTo('registro')} />;
        }

        return (
            <div className="app-container">
                <Navbar onNavigate={navigateTo} user={user} onLogout={handleLogout} />
                <main className="main-content">
                    {currentPage === 'dashboard' && <Dashboard />}
                    {currentPage === 'detecciones' && <DeteccionesView />}
                    {currentPage === 'amenazas' && <AmenazasView />} {/* 2. Añadir la ruta de renderizado */}
                </main>
            </div>
        );
    };

    return renderPage();
}

export default App;
