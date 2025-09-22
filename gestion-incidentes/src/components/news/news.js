import React, { useState, useEffect } from 'react';
import './news.css'; // Importar la nueva hoja de estilos

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
            setError(null);
            try {
                // Usamos un proxy para evitar problemas de CORS
                const proxyUrl = 'https://api.allorigins.win/get?url=';
                const rssFeedUrl = 'https://thehackernews.com/feeds/posts/default';
                const response = await fetch(`${proxyUrl}${encodeURIComponent(rssFeedUrl)}`);
                const data = await response.json();
                
                if (!data.contents) throw new Error("Failed to fetch news content.");

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                const allNews = Array.from(xmlDoc.querySelectorAll("item")).map(item => ({
                    title: item.querySelector("title")?.textContent || 'N/A',
                    link: item.querySelector("link")?.textContent || '#',
                    description: item.querySelector("description")?.textContent || 'No description available.',
                    published: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                }));

                // Filtrar noticias por categorías
                setVulnerabilitiesNews(allNews.filter(item => /vulnerability/i.test(item.title) || /vulnerability/i.test(item.description)));
                setCyberattacksNews(allNews.filter(item => /cyberattack|malware/i.test(item.title) || /cyberattack|malware/i.test(item.description)));
                setDataBreachNews(allNews.filter(item => /breach|data leak/i.test(item.title) || /breach|data leak/i.test(item.description)));

            } catch (err) {
                setError("Could not load news. Please try again later.");
                console.error("Error fetching news:", err);
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
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-card-title">{item.title}</a>
                            <p className="news-card-date">{new Date(item.published).toLocaleDateString()}</p>
                            <p className="news-card-description">{item.description}</p>
                            <button onClick={() => handleSaveNews(item, title)} className="save-news-button">Guardar Noticia</button>
                        </div>
                    ))
                ) : (
                    <p className="status-message">No news found in this category.</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="news-feed-container">
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

            {showSaveMessage && (
                <div className="save-notification">
                    ¡Noticia guardada con éxito!
                </div>
            )}
        </div>
    );
};

export default News;
