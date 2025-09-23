
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css'; // Asegúrate que la ruta al CSS es correcta

// --- Iconos ---
const IconLogout = () => <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H4a1 1 0 00-1-1zm10.293 4.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 12H7a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const IconUserCircle = () => <svg className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const IconMenu = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const IconChevronDown = () => <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;


// --- Datos de Navegación (CORREGIDOS) ---
const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    {
        name: 'Detecciones',
        submenu: [
            { name: 'Listar Detecciones', path: '/incidents' },
            { name: 'Registrar Detección', path: '/incidents/add' },
            { name: 'Reporte de Detecciones', path: '/incidents/report' },
        ],
    },
    {
        name: 'Noticias',
        submenu: [
            { name: 'Noticias Recientes', path: '/news' },
            { name: 'Mis Noticias Guardadas', path: '/saved-news' },
        ],
    },
    {
        name: 'Reporte de Incidentes',
        path: '/bitacora/add'
    },
    {
        name: 'Amenazas Bloqueadas',
        submenu: [
            { name: 'Bitácora Mensual', path: '/bitacora-amenazas' },
            { name: 'Generar Reporte', path: '/bitacora-amenazas/reporte' }, // CORREGIDO
            { name: 'Ver Gráficas', path: '/bitacora-amenazas/graficas' },   // CORREGIDO
        ],
    },
];

const Navbar = ({ onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(null); // Para controlar submenús en móvil

    const navigate = useNavigate();

    const handleLogoutClick = (e) => {
        e.preventDefault();
        onLogout();
        navigate('/');
    };

    // Para cerrar el menú móvil al hacer clic en un enlace
    const handleLinkClick = () => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };
    
    // Para abrir/cerrar submenús en móvil
    const handleSubmenuToggle = (itemName) => {
        setOpenSubmenu(openSubmenu === itemName ? null : itemName);
    };

    return (
        <nav className="navbar">
            {/* Sección Izquierda: Logo y Toggle Móvil */}
            <div className="navbar-left">
                <Link to="/dashboard" className="navbar-brand">SOC</Link>
            </div>
            
            <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <IconMenu />
            </div>

            {/* Sección Central: Enlaces de Navegación */}
            <div className={`navbar-center ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <ul className={`nav-list ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    {navItems.map((item) => (
                        <li key={item.name} className="nav-item">
                            {item.submenu ? (
                                <>
                                    <div className="submenu-toggle" onClick={() => handleSubmenuToggle(item.name)}>
                                        <span>{item.name}</span>
                                        <IconChevronDown />
                                    </div>
                                    <ul className={`submenu ${openSubmenu === item.name ? 'open' : ''}`}>
                                        {item.submenu.map((subitem) => (
                                            <li key={subitem.name}>
                                                <Link to={subitem.path} className="submenu-link" onClick={handleLinkClick}>
                                                    {subitem.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <Link to={item.path} className="nav-link" onClick={handleLinkClick}>
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sección Derecha: Perfil de Usuario y Logout */}
            <div className="navbar-right">
                <div className="user-profile-section">
                    <div className="user-info">
                        <IconUserCircle />
                        <p>Menu</p>
                    </div>
                    <div className="logout-menu">
                         <button onClick={handleLogoutClick} className="logout-button">
                            <IconLogout />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
