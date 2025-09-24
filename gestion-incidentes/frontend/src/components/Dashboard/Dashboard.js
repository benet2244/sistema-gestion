import React from 'react';
import './Dashboard.css'; // Importa los estilos

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <h2>Panel de Seguridad Cibernética para Operaciones de Seguridad</h2>
            
            {/* Contenedor principal de métricas y gráficos */}
            <div className="dashboard-grid">

                {/* Columna Izquierda: Métricas Clave */}
                <div className="metric-column">
                    <div className="metric-card threats-total">
                        <div className="icon">🛡️</div>
                        <div className="value">1100</div>
                        <div className="label">Threats</div>
                    </div>
                    <div className="metric-card threats-avg">
                        <div className="icon">📊</div>
                        <div className="value">1.74</div>
                        <div className="label">Average Threats per Day</div>
                    </div>
                </div>

                {/* Columna Central y Derecha: Gráficos */}
                <div className="chart-area">
                    {/* Top 10 Threats */}
                    <div className="chart-card top-threats">
                        <h3>Top 10 Threats by Sub Class</h3>
                        {/* Placeholder para la gráfica de barras */}
                        <div className="chart-placeholder">
                            [Gráfico de Barras aquí, ej: Toolbar, Adware, Spyware...]
                        </div>
                    </div>

                    {/* Threats by Class Name */}
                    <div className="chart-card class-name">
                        <h3>Threats by Class Name</h3>
                        {/* Placeholder para la gráfica de pastel/dona */}
                        <div className="chart-placeholder">
                            [Gráfico de Pastel aquí, ej: Malware (26%), Trusted (22%)]
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Tendencia Mensual (Abajo) */}
            <div className="trend-area">
                <div className="chart-card trend-chart">
                    <h3>Threats per Month</h3>
                    {/* Placeholder para la gráfica de línea */}
                    <div className="chart-placeholder-line">
                        [Gráfico de Línea con Tendencia Mensual]
                    </div>
                </div>
            </div>

            {/* Placeholder para el botón que llevará al formulario de Detección (opcional) */}
            {/* <button className="go-to-form-btn">Ir a Registro de Detección</button> */}
        </div>
    );
};

export default Dashboard;