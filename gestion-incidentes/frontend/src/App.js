import React, { useState } from 'react';
import Login from './components/login/Login';
import Registro from './components/Registro/Registro';
import Navbar from './components/Navbar/Navbar';
import DeteccionesView from './components/DeteccionesView/DeteccionesView';
import Dashboard from './components/Dashboard/Dashboard';
import AmenazasView from './components/AmenazasView/AmenazasView';
import Bitacora from './components/Bitacora/Bitacora'; // Importar Bitacora
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
            switch (currentPage) {
                case 'login':
                    return <Login 
                                onLoginSuccess={handleLoginSuccess} 
                                onNavigateToRegistro={() => navigateTo('registro')} 
                            />;
                case 'registro':
                    return <Registro 
                                onNavigateToLogin={() => navigateTo('login')}
                                onRegistroSuccess={() => {
                                    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                                    navigateTo('login');
                                }}
                            />;
                default:
                    setCurrentPage('login');
                    return <Login 
                                onLoginSuccess={handleLoginSuccess} 
                                onNavigateToRegistro={() => navigateTo('registro')} 
                            />;
            }
        }

        return (
            <div className="app-container">
                <Navbar onNavigate={navigateTo} user={user} onLogout={handleLogout} />
                <main className="main-content">
                    {currentPage === 'dashboard' && <Dashboard />}
                    {currentPage === 'detecciones' && <DeteccionesView />}
                    {currentPage === 'amenazas' && <AmenazasView />}
                    {currentPage === 'bitacora' && <Bitacora />} {/* Añadir Bitacora */}
                </main>
            </div>
        );
    };

    return renderPage();
}

export default App;
