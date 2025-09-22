import React from 'react';
import './inicio.css';

const Inicio = ({ onStart }) => (
    <div className="inicio-container">
        <div className="login-card"> {/* Nuevo contenedor */}
            <div className="left-panel">
                <h1 className="title">Sistema de Gestión de Ciberdefensa</h1>
                <div className="start-button-container">
                    <button onClick={onStart} className="start-button">
                        Iniciar Sistema
                    </button>
                </div>
            </div>
            <div className="right-panel">
                {/* La imagen se maneja con CSS */}
            </div>
        </div>
    </div>
);

export default Inicio;