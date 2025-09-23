import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import Dashboard from './components/dashboard/dashboard'; 
import IncidentList from './components/incidents/IncidentList';
import AddIncidentPage from './components/incidents/AddIncidentPage'; // Importar nuevo componente
import EditIncidentPage from './components/incidents/EditIncidentPage'; // Importar nuevo componente
import IncidentReport from './components/incidents/IncidentReport';
import News from './components/news/news'; 
import SavedNews from './components/news/SavedNews';
import Bitacora from './components/BitacoraIncidentes/bitacora';
import Inicio from './components/inicio/inicio';
import BitacoraMensual from './components/BitacoraAmenazas/BitacoraMensual';
import BitacoraReporte from './components/BitacoraAmenazas/BitacoraReporte';
import BitacoraGraficas from './components/BitacoraGraficas/BitacoraGraficas'; // <-- RUTA CORREGIDA
import './App.css'; // Importar el nuevo archivo CSS

const PrivateRoute = ({ children, isLoggedIn }) => {
    return isLoggedIn ? children : <Navigate to="/" replace />;
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!isLoggedIn && window.location.pathname !== '/') {
            navigate('/', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const handleLogin = () => {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/dashboard');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        navigate('/', { replace: true });
    };

    const toggleNavbar = () => {
        setIsNavbarCollapsed(!isNavbarCollapsed);
        setIsMobileMenuOpen(false); // Cierra el menú móvil si se colapsa la barra lateral
    };
  
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const showNavbar = isLoggedIn && window.location.pathname !== '/';

    return (
        <div className="app-container">
            {showNavbar && (
                <Navbar 
                    onLogout={handleLogout} 
                    isCollapsed={isNavbarCollapsed} 
                    toggleNavbar={toggleNavbar} 
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
            )}
            <div className="content-wrapper">
                {showNavbar && (
                    <div className="mobile-header">
                        <button onClick={toggleMobileMenu} className="mobile-menu-button">
                            <svg className="mobile-menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                )}
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Inicio onStart={handleLogin} />} />
                        <Route path="/dashboard" element={<PrivateRoute isLoggedIn={isLoggedIn}><Dashboard /></PrivateRoute>} />
                        <Route path="/bitacora-amenazas" element={<PrivateRoute isLoggedIn={isLoggedIn}><BitacoraMensual /></PrivateRoute>} />
                        <Route path="/bitacora-amenazas/reporte" element={<PrivateRoute isLoggedIn={isLoggedIn}><BitacoraReporte /></PrivateRoute>} />
                        <Route path="/bitacora-amenazas/graficas" element={<PrivateRoute isLoggedIn={isLoggedIn}><BitacoraGraficas /></PrivateRoute>} />
                        <Route 
                            path="/incidents" 
                            element={
                                <PrivateRoute isLoggedIn={isLoggedIn}>
                                    <IncidentList />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/incidents/add" 
                            element={<PrivateRoute isLoggedIn={isLoggedIn}><AddIncidentPage /></PrivateRoute>} 
                        />
                        <Route 
                            path="/incidents/edit/:id" 
                            element={<PrivateRoute isLoggedIn={isLoggedIn}><EditIncidentPage /></PrivateRoute>} 
                        />
                        <Route 
                            path="/incidents/report" 
                            element={<PrivateRoute isLoggedIn={isLoggedIn}><IncidentReport /></PrivateRoute>} 
                        />
                        <Route path="/news" element={<PrivateRoute isLoggedIn={isLoggedIn}><News /></PrivateRoute>} /> 
                        <Route path="/saved-news" element={<PrivateRoute isLoggedIn={isLoggedIn}><SavedNews /></PrivateRoute>} />
                        <Route path="/bitacora/add" element={<PrivateRoute isLoggedIn={isLoggedIn}><Bitacora /></PrivateRoute>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const AppWrapper = () => (
    <Router>
        <App />
    </Router>
);

export default AppWrapper;
