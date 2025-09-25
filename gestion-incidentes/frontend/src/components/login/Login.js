import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLoginSuccess, onNavigateToRegistro }) => {
    const [nombre_usuario, setNombreUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/login.php';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre_usuario || !contrasena) {
            setMessage({ type: 'error', text: 'Por favor, complete todos los campos.' });
            return;
        }

        try {
            const response = await axios.post(API_URL, {
                nombre_usuario,
                contrasena,
                
            });

            if (response.status === 200 && response.data.usuario) {
                setMessage({ type: 'success', text: 'Login exitoso. Redirigiendo...' });
                onLoginSuccess(response.data.usuario);
            } else {
                throw new Error(response.data.mensaje || 'Error desconocido');
            }
        } catch (error) {
            const errorMsg = error.response ? error.response.data.mensaje : error.message;
            setMessage({ type: 'error', text: `Error: ${errorMsg}` });
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Iniciar Sesión</h2>
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                <div className="form-group">
                    <label>Usuario</label>
                    <input 
                        type="text" 
                        value={nombre_usuario}
                        onChange={(e) => setNombreUsuario(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Contraseña</label>
                    <input 
                        type="password" 
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="submit-button">Acceder</button>
                <div className="registro-link">
                    <p>¿No tienes una cuenta? <button type="button" onClick={onNavigateToRegistro}>Regístrate</button></p>
                </div>
            </form>
        </div>
    );
};

export default Login;
