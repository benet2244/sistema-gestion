import React from 'react';
import './Navbar.css';

const Navbar = ({ onNavigate }) => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a onClick={() => onNavigate('dashboard')}>CiberSeg</a>
            </div>
            <ul className="navbar-links">
                <li><a onClick={() => onNavigate('dashboard')}>Dashboard</a></li>
                <li><a onClick={() => onNavigate('detecciones')}>Detecciones</a></li>
            </ul>
        </nav>
    );
};

export default Navbar;
