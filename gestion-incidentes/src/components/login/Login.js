import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Se cambia la URL a una ruta relativa para que funcione en cualquier servidor.
            const response = await fetch('https://192.168.39.115/gestion-incidentes/backend/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                onLoginSuccess();
            } else {
                setError(data.message || 'Error al iniciar sesión.');
            }
        } catch (error) {
            setError('No se pudo conectar al servidor. Inténtelo más tarde.');
            console.error('Fetch error:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-content">
                    <h1 className="login-title">Acceso al Sistema</h1>
                    <p className="login-description">Sistema de Gestión de Ciberdefensa</p>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Usuario</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <div className="login-button-container">
                            <button type="submit" className="login-button">Iniciar Sesión</button>
                        </div>
                    </form>
                </div>
                <div 
                    className="login-image" 
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')" }}
                >
                </div>
            </div>
        </div>
    );
};

export default Login;
