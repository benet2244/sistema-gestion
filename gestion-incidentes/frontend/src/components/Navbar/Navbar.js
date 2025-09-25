import React from 'react';
import './Navbar.css';

const Navbar = ({ onNavigate, user, onLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <button
                        type="button"
                        className="navbar-logo-btn"
                        onClick={() => onNavigate('dashboard')}
                    >
                        CiberSeg
                    </button>
                </div>
                <ul className="navbar-links">
                    <li>
                        <button
                            type="button"
                            className="navbar-link-btn"
                            onClick={() => onNavigate('dashboard')}
                        >
                            Dashboard
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            className="navbar-link-btn"
                            onClick={() => onNavigate('detecciones')}
                        >
                            Detecciones
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            className="navbar-link-btn"
                            onClick={() => onNavigate('amenazas')}
                        >
                            Amenazas
                        </button>
                    </li> {/* Nuevo enlace */}
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
