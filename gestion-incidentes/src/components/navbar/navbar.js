import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    {
        name: 'Detecciones',
        icon: '🚨',
        submenu: [
            { name: 'Listar Detecciones', path: '/incidents' },
            { name: 'Registrar Detección', path: '/incidents/add' },
            { name: 'Reporte de Detecciones', path: '/incidents/report' },
        ],
    },
    {
        name: 'Noticias',
        icon: '📰',
        submenu: [
            { name: 'Noticias Recientes', path: '/news' },
            { name: 'Mis Noticias Guardadas', path: '/saved-news' },
        ],
    },
    {
        name: 'Bitácora Incidentes',
        icon: '📄',
        submenu: [
            { name: 'Bitácora de Incidentes', path: '/bitacora/add' },
        ],
    },
    {
        name: 'Bitácora Amenazas',
        icon: '📊',
        submenu: [
            { name: 'Bitácora Mensual', path: '/bitacora-amenazas' },
            { name: 'Generar Reporte', path: '/bitacora-amenazas/reporte' },
            { name: 'Ver Gráficas', path: '/bitacora-amenazas/graficas' },
        ],
    },
    { name: 'Cerrar Sesión', path: '/', icon: '🚪' },
];

// El componente ahora acepta props para controlar su estado colapsado
const Navbar = ({ onLogout, isCollapsed, toggleNavbar }) => {
    const [openMenu, setOpenMenu] = useState(null);
    const navigate = useNavigate();

    const toggleSubmenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };
    
    // Función para manejar el cierre de sesión
    const handleLogoutClick = () => {
        onLogout();
        navigate('/');
    };

    return (
        <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="toggle-button-container">
                <button className="toggle-button" onClick={toggleNavbar}>
                    {isCollapsed ? '▶' : '◀'}
                </button>
            </div>
            
            <div className="profile-section">
                <h2 className="welcome-text">Bienvenido,</h2>
                <p className="username">SOC. Ciberdefensa</p>
                <span className="user-role">(Especialista)</span>
            </div>

            <ul className="main-menu">
                {navItems.map((item) => (
                    <li key={item.name} className="menu-item">
                        {item.submenu ? (
                            <>
                                <div className="submenu-toggle" onClick={() => toggleSubmenu(item.name)}>
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-text">{item.name}</span>
                                    <span className={`arrow ${openMenu === item.name ? 'open' : ''}`}>&#9660;</span>
                                </div>
                                {openMenu === item.name && (
                                    <ul className="submenu">
                                        {item.submenu.map((subitem) => (
                                            <li key={subitem.name} className="submenu-item">
                                                <Link to={subitem.path} className="submenu-link">
                                                    {subitem.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            item.name === 'Cerrar Sesión' ? (
                                <div className="menu-link" onClick={handleLogoutClick}>
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-text">{item.name}</span>
                                </div>
                            ) : (
                                <Link to={item.path} className="menu-link">
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-text">{item.name}</span>
                                </Link>
                            )
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;