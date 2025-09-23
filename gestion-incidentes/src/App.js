
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import Dashboard from './components/dashboard/dashboard';
import News from './components/news/news';
import IncidentList from './components/incidents/IncidentList';
import AddIncidentPage from './components/incidents/AddIncidentPage';
import EditIncidentPage from './components/incidents/EditIncidentPage';
import IncidentReport from './components/incidents/IncidentReport';
import BitacoraMensual from './components/BitacoraAmenazas/BitacoraMensual';
import BitacoraReporte from './components/BitacoraAmenazas/BitacoraReporte';
import BitacoraGraficas from './components/BitacoraGraficas/BitacoraGraficas';
import Inicio from './components/inicio/inicio';
import Bitacora from './components/BitacoraIncidentes/bitacora';
import SavedNews from './components/news/SavedNews'; 
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    // === LA CLAVE DEL ENRUTAMIENTO ===
    // El `basename` le dice a React Router que la aplicación vive en la subcarpeta /gestion-sistema.
    const basename = "/gestion-sistema";

    return (
        <Router basename={basename}>
            <div className="app-container">
                {isLoggedIn && <Navbar onLogout={handleLogout} />}
                <div className="content-wrapper">
                    <Routes>
                        <Route path="/" element={isLoggedIn ? <Navigate to="/inicio" /> : <Inicio onLogin={() => setIsLoggedIn(true)} />} />
                        <Route path="/inicio" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
                        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
                        <Route path="/noticias" element={isLoggedIn ? <News /> : <Navigate to="/" />} />
                        <Route path="/noticias-guardadas" element={isLoggedIn ? <SavedNews /> : <Navigate to="/" />} />
                        
                        {/* Rutas para Incidentes */}
                        <Route path="/incidentes" element={isLoggedIn ? <IncidentList /> : <Navigate to="/" />} />
                        <Route path="/incidentes/nuevo" element={isLoggedIn ? <AddIncidentPage /> : <Navigate to="/" />} />
                        <Route path="/incidentes/editar/:id" element={isLoggedIn ? <EditIncidentPage /> : <Navigate to="/" />} />
                        <Route path="/incidentes/reporte" element={isLoggedIn ? <IncidentReport /> : <Navigate to="/" />} />
                        
                        {/* Rutas para Bitácora de Amenazas */}
                        <Route path="/bitacora-amenazas/registro" element={isLoggedIn ? <BitacoraMensual /> : <Navigate to="/" />} />
                        <Route path="/bitacora-amenazas/reporte" element={isLoggedIn ? <BitacoraReporte /> : <Navigate to="/" />} />

                        {/* Rutas para Gráficas */}
                        <Route path="/graficas" element={isLoggedIn ? <BitacoraGraficas /> : <Navigate to="/" />} />
                        
                        {/* Ruta para Bitácora de Incidentes (antigua) */}\
                        <Route path="/bitacora" element={isLoggedIn ? <Bitacora /> : <Navigate to="/" />} />

                        {/* Redirección por si se intenta acceder a una ruta inexistente */}
                        <Route path="*" element={<Navigate to={isLoggedIn ? "/inicio" : "/"} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
