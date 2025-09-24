import React from 'react';
import './App.css';
import Login from './components/Login'; // Importar nuestro componente de Login

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Gestión de Incidentes</h1>
        <Login /> {/* Renderizar el componente de Login */}
      </header>
    </div>
  );
}

export default App;
