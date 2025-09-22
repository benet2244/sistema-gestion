import React from 'react';
import './inicio.css'; // Importar el nuevo archivo CSS

const Inicio = ({ onStart }) => (
    <div className="inicio-container">
        <div className="inicio-card">
            {/* Panel izquierdo */}
            <div className="inicio-content">
                <h1 className="inicio-title">Sistema de Gestión de Ciberdefensa</h1>
                <p className="inicio-description">Monitoreo, detección y respuesta a incidentes de seguridad.</p>
                <div className="inicio-button-container">
                    <button 
                        onClick={onStart} 
                        className="inicio-button"
                    >
                        Iniciar Sistema
                    </button>
                </div>
            </div>
            {/* Panel derecho con imagen */}
            <div 
                className="inicio-image" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')" }}
            >
                {/* La imagen de fondo se aplica aquí */}
            </div>
        </div>
    </div>
);

export default Inicio;
