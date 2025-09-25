import React, { useState } from 'react';
import Login from './components/login/Login';
import Registro from './components/Registro/Registro'; // 1. Importar Registro
import Navbar from './components/Navbar/Navbar';
import DeteccionesView from './components/DeteccionesView/DeteccionesView';
import Dashboard from './components/Dashboard/Dashboard';
import AmenazasView from './components/AmenazasView/AmenazasView';
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
        // Si el usuario no está autenticado
        if (!user) {
            // 2. Decidir qué componente mostrar: Login o Registro
            switch (currentPage) {
                case 'login':
                    return <Login 
                                onLoginSuccess={handleLoginSuccess} 
                                onNavigateToRegistro={() => navigateTo('registro')} 
                            />;
                case 'registro':
                    return <Registro 
                                onNavigateToLogin={() => navigateTo('login')}
                                // Opcional: navegar a login tras registro exitoso
                                onRegistroSuccess={() => {
                                    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                                    navigateTo('login');
                                }}
                            />;
                default:
                    // Por si acaso, volver a login si el estado es inválido
                    setCurrentPage('login');
                    return <Login 
                                onLoginSuccess={handleLoginSuccess} 
                                onNavigateToRegistro={() => navigateTo('registro')} 
                            />;
            }
        }

        // Si el usuario está autenticado, mostrar el contenido principal
        return (
            <div className="app-container">
                <Navbar onNavigate={navigateTo} user={user} onLogout={handleLogout} />
                <main className="main-content">
                    {currentPage === 'dashboard' && <Dashboard />}
                    {currentPage === 'detecciones' && <DeteccionesView />}
                    {currentPage === 'amenazas' && <AmenazasView />}
                </main>
            </div>
        );
    };

    return renderPage();
}

export default App;
