import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Rutas corregidas según la estructura de archivos real
import Login from './components/inicio/inicio.js';
import Navbar from './components/navbar/navbar.js';
import Dashboard from './components/dashboard/dashboard.js';
import IncidentForm from './components/incidents/IncidentForm.js';
import ThreatLog from './components/BitacoraIncidentes/bitacora.js';
import MonthlyLog from './components/BitacoraAmenazas/BitacoraMensual.js';
import ThreatReport from './components/BitacoraAmenazas/BitacoraReporte.js';
import Graficas from './components/BitacoraGraficas/BitacoraGraficas.js'; // <-- NUEVA IMPORTACIÓN
import News from './components/news/news';
import SavedNews from './components/news/SavedNews';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

    const handleLogin = () => {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
    };

    const basename = "/";

    return (
        <Router basename={basename}>
            <div className="app-container">
                {isLoggedIn && <Navbar onLogout={handleLogout} />}
                <div className={isLoggedIn ? "content-wrapper" : ""}>
                    <Routes>
                        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
                        <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
                        <Route path="/registrar-incidente" element={isLoggedIn ? <IncidentForm /> : <Navigate to="/login" />} />
                        <Route path="/bitacora-amenazas" element={isLoggedIn ? <ThreatLog /> : <Navigate to="/login" />} />
                        <Route path="/bitacora-mensual" element={isLoggedIn ? <MonthlyLog /> : <Navigate to="/login" />} />
                        <Route path="/reporte-bitacora" element={isLoggedIn ? <ThreatReport /> : <Navigate to="/login" />} />
                        <Route path="/graficas" element={isLoggedIn ? <Graficas /> : <Navigate to="/login" />} /> {/* <-- NUEVA RUTA */}
                        <Route path="/noticias" element={isLoggedIn ? <News /> : <Navigate to="/login" />} />
                        <Route path="/noticias-guardadas" element={isLoggedIn ? <SavedNews /> : <Navigate to="/login" />} />
                        <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
