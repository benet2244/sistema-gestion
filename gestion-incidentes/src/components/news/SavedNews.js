import React, { useState, useEffect } from 'react';
import './new.css'; // Usamos el mismo CSS para mantener la consistencia del diseño

const SavedNews = () => {
    const [savedNews, setSavedNews] = useState({
        vulnerabilities: [],
        cyberattacks: [],
        dataBreaches: [],
    });

    useEffect(() => {
        // Cargar las noticias guardadas desde localStorage al montar el componente
        const storedNews = localStorage.getItem('savedNews');
        if (storedNews) {
            setSavedNews(JSON.parse(storedNews));
        }
    }, []);

    const renderNewsColumn = (title, newsItems) => (
        <div className="news-column">
            <h2>{title}</h2>
            {newsItems.length > 0 ? (
                newsItems.map((item, index) => (
                    <div key={index} className="news-item">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <h3>{item.title}</h3>
                        </a>
                        <p className="news-date">{new Date(item.published).toLocaleDateString()}</p>
                        <p>{item.description}</p>
                    </div>
                ))
            ) : (
                <p>No hay noticias guardadas de este tipo.</p>
            )}
        </div>
    );

    return (
        <div className="news-container">
            <h1>Mis Noticias Guardadas</h1>
            <div className="news-columns-container">
                {renderNewsColumn('Vulnerabilidades', savedNews.vulnerabilities)}
                {renderNewsColumn('Ciberataques', savedNews.cyberattacks)}
                {renderNewsColumn('Brechas de Datos', savedNews.dataBreaches)}
            </div>
        </div>
    );
};

export default SavedNews;