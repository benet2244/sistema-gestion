import React from 'react';

const Inicio = ({ onStart }) => (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-4xl w-full mx-auto rounded-lg shadow-2xl overflow-hidden md:flex">
            {/* Panel izquierdo */}
            <div className="w-full md:w-1/2 bg-gray-800 p-8 flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4 leading-tight">Sistema de Gestión de Ciberdefensa</h1>
                <p className="text-gray-400 mb-8">Monitoreo, detección y respuesta a incidentes de seguridad.</p>
                <div className="flex justify-start">
                    <button 
                        onClick={onStart} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 ease-in-out"
                    >
                        Iniciar Sistema
                    </button>
                </div>
            </div>
            {/* Panel derecho con imagen */}
            <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')" }}>
                {/* La imagen de fondo se aplica aquí */}
            </div>
        </div>
    </div>
);

export default Inicio;
