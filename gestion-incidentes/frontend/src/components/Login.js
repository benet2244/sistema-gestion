import React, { useState } from 'react';
import axios from 'axios'; // Importar axios

const Login = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');

    // Manejador para cuando se envía el formulario
    const handleSubmit = async (event) => {
        event.preventDefault();

        // URL del endpoint de la API. 
        // ¡ASEGÚRATE DE QUE ESTA URL SEA CORRECTA PARA TU SERVIDOR LOCAL!
        const url = 'http://localhost/gestion-incidentes/backend/api/login.php';

        try {
            // Realizar la petición POST con axios
            const response = await axios.post(url, {
                nombre_usuario: nombreUsuario,
                contrasena: contrasena
            });

            // El backend responde con un JSON. Mostramos el mensaje.
            alert(response.data.mensaje);

            // Si el login es exitoso, podrías redirigir al usuario o guardar el rol
            if (response.data.rol) {
                console.log('Rol del usuario:', response.data.rol);
                // Aquí podrías guardar el rol en el estado de la app o en el localStorage
            }

        } catch (error) {
            // Si axios lanza un error (ej. 401 No Autorizado, 404 No Encontrado)
            if (error.response) {
                // El servidor respondió con un código de estado fuera del rango 2xx
                alert(`Error: ${error.response.data.mensaje}`);
            } else if (error.request) {
                // La petición se hizo pero no se recibió respuesta (ej. servidor caído)
                alert('No se pudo conectar con el servidor. ¿Está el servidor Apache y MySQL corriendo?');
                console.error('Error de petición:', error.request);
            } else {
                // Algo más causó el error
                alert('Ocurrió un error inesperado.');
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <div>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre de Usuario:</label>
                    <input
                        type="text"
                        value={nombreUsuario}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
};

export default Login;
