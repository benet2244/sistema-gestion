import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'ð' },
    {
        name: 'Detecciones',
        icon: 'ð¨',
        submenu: [
            { name: 'Listar Detecciones', path: '/incidents' },
            { name: 'Registrar Detección', path: '/incidents/add' },
            { name: 'Reporte de Detecciones', path: '/incidents/report' },
        ],
    },
    {
        name: 'Noticias',
        icon: 'ð°',
        submenu: [
            { name: 'Noticias Recientes', path: '/news' },
            { name: 'Mis Noticias Guardadas', path: '/saved-news' },
        ],
    },
    {
        name: 'Bitácora Incidentes',
        icon: 'ð',
        submenu: [
            { name: 'Bitácora de Incidentes', path: '/bitacora/add' },
        ],
    },
    {
        name: 'Bitácora Amenazas',
        icon: 'ð',
        submenu: [
            { name: 'Bitácora Mensual', path: '/bitacora-amenazas' },
            { name: 'Generar Reporte', path: '/bitacora-amenazas/reporte' },
            { name: 'Ver Gráficas', path: '/bitacora-amenazas/graficas' },
        ],
    },
    { name: 'Cerrar Sesión', path: '/', icon: 'ðª' },
];

const Navbar = ({ onLogout, isCollapsed, toggleNavbar, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const [openMenu, setOpenMenu] = useState(null);
    const navigate = useNavigate();

    const toggleSubmenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };
    
    const handleLogoutClick = () => {
        onLogout();
        navigate('/');
    };

    const handleLinkClick = () => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <nav 
                className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out z-20 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                
                <div className="flex items-center justify-between p-4 h-16">
                    {!isCollapsed && <span className="text-xl font-bold">SOC</span>}
                    <button className="p-2 rounded-md hover:bg-gray-700" onClick={toggleNavbar}>
                        {isCollapsed ? 'â' : 'â'}
                    </button>
                </div>
            
                <div className="p-4">
                    <h2 className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Bienvenido,</h2>
                    <p className={`font-bold transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>SOC. Ciberdefensa</p>
                    <span className={`text-sm text-gray-400 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>(Especialista)</span>
                </div>

                <ul className="flex-grow">
                    {navItems.map((item) => (
                        <li key={item.name} className="text-sm text-gray-300">
                            {item.submenu ? (
                                <>
                                    <div 
                                        className="flex justify-between items-center p-4 hover:bg-gray-700 cursor-pointer"
                                        onClick={() => toggleSubmenu(item.name)}
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-4">{item.icon}</span>
                                            {!isCollapsed && <span className="transition-opacity duration-300">{item.name}</span>}
                                        </div>
                                        {!isCollapsed && <span className={`transform transition-transform duration-300 ${openMenu === item.name ? 'rotate-180' : ''}`}>â¼</span>}
                                    </div>
                                    {openMenu === item.name && !isCollapsed && (
                                        <ul className="bg-gray-700">
                                            {item.submenu.map((subitem) => (
                                                <li key={subitem.name} onClick={handleLinkClick}>
                                                    <Link to={subitem.path} className="block p-3 pl-12 hover:bg-gray-600">
                                                        {subitem.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <div onClick={item.name === 'Cerrar Sesión' ? handleLogoutClick : handleLinkClick}>
                                    <Link to={item.path} className="flex items-center p-4 hover:bg-gray-700">
                                        <span className="mr-4">{item.icon}</span>
                                        {!isCollapsed && <span className="transition-opacity duration-300">{item.name}</span>}
                                    </Link>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Navbar;
