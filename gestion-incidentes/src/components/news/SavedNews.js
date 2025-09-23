import React, { useState, useEffect } from 'react';
import './SavedNews.css'; 

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

    const handleDeleteNews = (newsLink, category) => {
        const updatedNews = { ...savedNews };
        updatedNews[category] = updatedNews[category].filter(item => item.link !== newsLink);
        setSavedNews(updatedNews);
        localStorage.setItem('savedNews', JSON.stringify(updatedNews));
    };

    const renderNewsColumn = (title, newsItems, categoryKey) => (
        <div className="news-column">
            <h2 className="column-title">{title}</h2>
            <div className="news-items-list">
                {newsItems && newsItems.length > 0 ? (
                    newsItems.map((item, index) => (
                        <div key={index} className="news-card">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="news-card-image" />}
                            <div className="news-card-content">
                                <h3 className="news-card-title">{item.title}</h3>
                                <p className="news-card-date">{new Date(item.published).toLocaleDateString()}</p>
                                <p className="news-card-description">{item.description}</p>

                                <div className="news-card-actions">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="view-news-button">Ver</a>
                                    <button onClick={() => handleDeleteNews(item.link, categoryKey)} className="delete-news-button">Eliminar</button>
                                </div>
                            </div>
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
        <div className="saved-news-page-container"> {/* <-- CAMBIO CLAVE AQUÍ */}
            <div className="saved-news-wrapper">
                <h1 className="saved-news-header">Mis Noticias Guardadas</h1>
                <div className="news-columns-container">
                    {renderNewsColumn('Vulnerabilidades', savedNews.vulnerabilities, 'vulnerabilities')}
                    {renderNewsColumn('Ciberataques', savedNews.cyberattacks, 'cyberattacks')}
                    {renderNewsColumn('Brechas de Datos', savedNews.dataBreaches, 'dataBreaches')}
                </div>
            </div>
        </div>
    );
};

export default SavedNews;
