import React, { useState, useEffect } from 'react';
import './SavedNews.css'; // Importar la nueva hoja de estilos

const SavedNews = () => {
    const [savedNews, setSavedNews] = useState({
        vulnerabilities: [],
        cyberattacks: [],
        dataBreaches: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedNews = localStorage.getItem('savedNews');
            if (storedNews) {
                setSavedNews(JSON.parse(storedNews));
            }
        } catch (error) {
            console.error("Error loading saved news from localStorage:", error);
        }
        setLoading(false);
    }, []);

    const renderNewsColumn = (title, newsItems) => (
        <div className="news-column">
            <h2 className="column-title">{title}</h2>
            <div className="news-items-list">
                {newsItems && newsItems.length > 0 ? (
                    newsItems.map((item, index) => (
                        <div key={index} className="news-card">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-card-title">
                                {item.title}
                            </a>
                            <p className="news-card-date">{new Date(item.published).toLocaleDateString()}</p>
                            <p className="news-card-description">{item.description}</p>
                        </div>
                    ))
                ) : (
                    <div className="no-news-message-card">
                        <p className="no-news-message-text">No hay noticias guardadas en esta categoría.</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return <div className="loading-message">Cargando noticias guardadas...</div>;
    }

    return (
        <div className="saved-news-container">
            <div className="saved-news-wrapper">
                <h1 className="saved-news-header">Mis Noticias Guardadas</h1>
                
                <div className="news-columns-container">
                    {renderNewsColumn('Vulnerabilidades', savedNews.vulnerabilities)}
                    {renderNewsColumn('Ciberataques', savedNews.cyberattacks)}
                    {renderNewsColumn('Brechas de Datos', savedNews.dataBreaches)}
                </div>
            </div>
        </div>
    );
};

export default SavedNews;
