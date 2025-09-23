import React, { useState, useEffect } from 'react';
import './news.css';

const News = () => {
    const [vulnerabilitiesNews, setVulnerabilitiesNews] = useState([]);
    const [cyberattacksNews, setCyberattacksNews] = useState([]);
    const [dataBreachNews, setDataBreachNews] = useState([]);
    const [showSaveMessage, setShowSaveMessage] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null); // Reset error state on new fetch
            try {
                const proxyUrl = 'https://api.allorigins.win/get?url=';
                const rssFeedUrl = 'https://thehackernews.com/feeds/posts/default';
                const response = await fetch(`${proxyUrl}${encodeURIComponent(rssFeedUrl)}`);
                
                if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

                const data = await response.json();
                
                if (!data.contents) throw new Error("Failed to fetch news content from proxy.");

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                const allNews = Array.from(xmlDoc.querySelectorAll("item")).map(item => {
                    const mediaContent = item.querySelector("media\\:content, content");
                    const imageUrl = mediaContent ? mediaContent.getAttribute('url') : null;

                    return {
                        title: item.querySelector("title")?.textContent || 'N/A',
                        link: item.querySelector("link")?.textContent || '#',
                        description: item.querySelector("description")?.textContent || 'No description available.',
                        published: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                        imageUrl: imageUrl,
                    };
                });

                setVulnerabilitiesNews(allNews.filter(item => /vulnerability/i.test(item.title)));
                setCyberattacksNews(allNews.filter(item => /cyberattack|malware/i.test(item.title)));
                setDataBreachNews(allNews.filter(item => /breach|data leak/i.test(item.title)));

            } catch (err) {
                setError(`Error al cargar las noticias: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const handleSaveNews = (newsItem, type) => {
        const storedNews = JSON.parse(localStorage.getItem('savedNews')) || { vulnerabilities: [], cyberattacks: [], dataBreaches: [] };
        const category = type === 'Vulnerabilidades' ? 'vulnerabilities' : type === 'Ciberataques' ? 'cyberattacks' : 'dataBreaches';

        if (!storedNews[category].some(item => item.link === newsItem.link)) {
            storedNews[category].push(newsItem);
            localStorage.setItem('savedNews', JSON.stringify(storedNews));
            setShowSaveMessage(true);
            setTimeout(() => setShowSaveMessage(false), 2500);
        }
    };

    const renderNewsColumn = (title, newsItems) => (
        <div className="news-column">
            <h2 className="column-title">{title}</h2>
            <div className="news-items-list">
                {newsItems.length > 0 ? (
                    newsItems.map((item, index) => (
                        <div key={index} className="news-card">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="news-card-image" />}
                            <div className="news-card-content">
                                <h3 className="news-card-title">{item.title}</h3>
                                <p className="news-card-date">{new Date(item.published).toLocaleDateString()}</p>
                                <p className="news-card-description">{item.description}</p>
                                <div className="news-card-actions">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="view-news-button">Ver</a>
                                    <button onClick={() => handleSaveNews(item, title)} className="save-news-button">Guardar</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="status-message">No news found in this category.</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="cyber-news-container"> {/* <-- CAMBIO CLAVE AQUÍ */}
             <div className="news-feed-wrapper">
                <h1 className="feed-header">Noticias de Ciberseguridad</h1>
                {loading && <div className="status-message">Cargando noticias...</div>}
                {error && <div className="error-message">{error}</div>}
                {!loading && !error && (
                    <div className="news-columns-container">
                        {renderNewsColumn('Vulnerabilidades', vulnerabilitiesNews)}
                        {renderNewsColumn('Ciberataques', cyberattacksNews)}
                        {renderNewsColumn('Brechas de Datos', dataBreachNews)}
                    </div>
                )}
            </div>
            {showSaveMessage && <div className="save-notification">¡Noticia guardada con éxito!</div>}
        </div>
    );
};

export default News;
