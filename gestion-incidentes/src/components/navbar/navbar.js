
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css'; // Importamos el CSS

// --- Componentes de Iconos SVG --- //

const IconDashboard = () => (
    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
    </svg>
);

const IconShield = () => (
    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 018.618-3.04A12.02 12.02 0 0021 20.944a11.955 11.955 0 01-2.382-9.016z"></path>
    </svg>
);

const IconNewspaper = () => (
    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h2m-4 3h2m-4 3h2m-4 3h2"></path>
    </svg>
);

const IconClipboard = () => (
    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
    </svg>
);

const IconLogout = () => (
    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
    </svg>
);

const IconChevron = () => (
    <svg className="submenu-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
);

const IconMenu = () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
)


// --- Datos de Navegación con los nuevos iconos --- //

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <IconDashboard /> },
    {
        name: 'Detecciones',
        icon: <IconShield />,
        submenu: [
            { name: 'Listar Detecciones', path: '/incidents' },
            { name: 'Registrar Detección', path: '/incidents/add' },
            { name: 'Reporte de Detecciones', path: '/incidents/report' },
        ],
    },
    {
        name: 'Noticias',
        icon: <IconNewspaper />,
        submenu: [
            { name: 'Noticias Recientes', path: '/news' },
            { name: 'Mis Noticias Guardadas', path: '/saved-news' },
        ],
    },
    {
        name: 'Bitácora Incidentes',
        icon: <IconClipboard />,
        submenu: [
            { name: 'Bitácora de Incidentes', path: '/bitacora/add' },
        ],
    },
    {
        name: 'Bitácora Amenazas',
        icon: <IconClipboard />,
        submenu: [
            { name: 'Bitácora Mensual', path: '/bitacora-amenazas' },
            { name: 'Generar Reporte', path: '/bitacora-amenazas/reporte' },
            { name: 'Ver Gráficas', path: '/bitacora-amenazas/graficas' },
        ],
    },
    { name: 'Cerrar Sesión', path: '/', icon: <IconLogout /> },
];


// --- Componente Navbar --- //

const Navbar = ({ onLogout, isCollapsed, toggleNavbar, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const [openMenu, setOpenMenu] = useState(null);
    const navigate = useNavigate();

    const toggleSubmenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };
    
    const handleLogoutClick = (e) => {
        e.preventDefault();
        onLogout();
    };

    const handleLinkClick = () => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };
    
    const navbarClasses = `navbar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`;
    const overlayClasses = `navbar-overlay ${isMobileMenuOpen ? 'visible' : ''}`;

    return (
        <>
            <div className={overlayClasses} onClick={() => setIsMobileMenuOpen(false)}></div>
            <nav className={navbarClasses}>
                <div className="navbar-header">
                    <span className="navbar-brand">SOC</span>
                    <button className="navbar-toggle" onClick={toggleNavbar}>
                         <IconMenu />
                    </button>
                </div>
            
                <div className="user-profile">
                    <h2>Bienvenido,</h2>
                    <p>SOC. Ciberdefensa</p>
                    <span className="user-role">(Especialista)</span>
                </div>

                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.name} className="nav-item">
                            {item.submenu ? (
                                <>
                                    <div className="submenu-toggle" onClick={() => toggleSubmenu(item.name)}>
                                        {item.icon}
                                        <span className="nav-text">{item.name}</span>
                                        <div className={`submenu-arrow ${openMenu === item.name ? 'open' : ''}`}>
                                            <IconChevron />
                                        </div>
                                    </div>
                                    <ul className={`submenu ${openMenu === item.name ? 'open' : ''}`}>
                                        {item.submenu.map((subitem) => (
                                            <li key={subitem.name} onClick={handleLinkClick}>
                                                <Link to={subitem.path} className="submenu-link">
                                                    {subitem.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </> 
                            ) : (
                                <Link 
                                  to={item.path} 
                                  className="nav-link" 
                                  onClick={item.name === 'Cerrar Sesión' ? handleLogoutClick : handleLinkClick}
                                >
                                    {item.icon}
                                    <span className="nav-text">{item.name}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Navbar;
