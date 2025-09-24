import React, { useState } from 'react';
import axios from 'axios';
import './login.css'; // ¡Importación del archivo CSS!

const Login = ({ onLoginSuccess }) => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const url = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/login.php';

        try {
            const response = await axios.post(url, {
                nombre_usuario: nombreUsuario,
                contrasena: contrasena
            });

            const mensaje = response.data?.mensaje || "Inicio de sesión exitoso. Redirigiendo..."; 
            alert(mensaje);

            if (response.data?.rol) {
                console.log('Rol del usuario:', response.data.rol);
                // Llamar a la función para actualizar el estado en App.js
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            }

        } catch (error) {
            if (error.response) {
                const serverMessage = error.response.data?.mensaje || 'Error en la respuesta del servidor.';
                alert(`Error: ${serverMessage}`);
            } else if (error.request) {
                alert('No se pudo conectar con el servidor. ¿Está el servidor Apache y MySQL corriendo?');
            } else {
                alert('Ocurrió un error inesperado.');
            }
        }
    };

    return (
        <div className="login-container"> {/* Clase para aplicar estilos */}
            <h2 className="login-title">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label>Nombre de Usuario:</label>
                    <input
                        type="text"
                        value={nombreUsuario}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Iniciar Sesión</button>
            </form>
        </div>
    );
};

export default Login;