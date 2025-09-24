import React, { useState } from 'react';
import axios from 'axios';
import './Registro.css';

const Registro = ({ onRegistroSuccess, onNavigateToLogin }) => {
    const [formData, setFormData] = useState({
        nombre_usuario: '',
        contrasena: '',
        rol: 'usuario',
    });

    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const API_URL = 'http://localhost/proyecto/sistema-gestion/gestion-incidentes/backend/crear_usuario.php';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Enviando datos...');
        setIsSuccess(false);

        try {
            const response = await axios.post(API_URL, formData);
            setMessage(response.data.mensaje || 'Usuario registrado con éxito.');
            setIsSuccess(true);
            setFormData({
                nombre_usuario: '',
                contrasena: '',
                rol: 'usuario',
            });
            if (onRegistroSuccess) {
                onRegistroSuccess();
            }
        } catch (error) {
            setIsSuccess(false);
            if (error.response) {
                setMessage(`Error: ${error.response.data?.mensaje || 'Error al registrar el usuario.'}`);
            } else if (error.request) {
                setMessage('Error de conexión con el servidor.');
            } else {
                setMessage('Ocurrió un error inesperado.');
            }
        }
    };

    return (
        <div className="registro-container">
            <h2>Registro de Nuevo Usuario</h2>
            {message && (
                <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit} className="registro-form">
                <div className="form-group">
                    <label htmlFor="nombre_usuario">Nombre de Usuario:</label>
                    <input
                        type="text"
                        name="nombre_usuario"
                        value={formData.nombre_usuario}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="contrasena">Contraseña:</label>
                    <input
                        type="password"
                        name="contrasena"
                        value={formData.contrasena}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="rol">Rol:</label>
                    <select
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        required
                    >
                        <option value="usuario">Usuario</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>
                <button type="submit" className="submit-btn">Registrar</button>
            </form>
            <p className="login-link">
                ¿Ya tienes una cuenta? <button onClick={onNavigateToLogin}>Inicia Sesión</button>
            </p>
        </div>
    );
};

export default Registro;
