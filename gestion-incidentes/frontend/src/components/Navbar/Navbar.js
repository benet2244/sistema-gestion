import React from 'react';
import './Navbar.css';

const Navbar = ({ onNavigate, user, onLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <a onClick={() => onNavigate('dashboard')}>CiberSeg</a>
                </div>
                <ul className="navbar-links">
                    <li><a onClick={() => onNavigate('dashboard')}>Dashboard</a></li>
                    <li><a onClick={() => onNavigate('detecciones')}>Detecciones</a></li>
                    <li><a onClick={() => onNavigate('amenazas')}>Amenazas</a></li> {/* Nuevo enlace */}
                </ul>
            </div>

            {user && (
                <div className="navbar-right">
                    <div className="user-details">
                        <span className="user-name">{user.nombre_usuario}</span>
                        <span className="user-role">{user.rol}</span>
                    </div>
                    <button onClick={onLogout} className="logout-btn">Cerrar Sesión</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
