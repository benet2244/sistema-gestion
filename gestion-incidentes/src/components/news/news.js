import React, { useState, useEffect } from 'react';
import './new.css';

const News = () => {
    const [vulnerabilitiesNews, setVulnerabilitiesNews] = useState([]);
    const [cyberattacksNews, setCyberattacksNews] = useState([]);
    const [dataBreachNews, setDataBreachNews] = useState([]);

    const [showSaveMessage, setShowSaveMessage] = useState(false); // Nuevo estado para el mensaje
    const [error, setError] = useState(null); // Estado para el error

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const rssFeeds = [
                    'https://thehackernews.com/feeds/posts/default'
                ];
                const allNews = [];
                for (const url of rssFeeds) {
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                    const response = await fetch(proxyUrl);
                    const data = await response.json();
                    
                    if (data.contents) {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                        const items = xmlDoc.querySelectorAll("item");
                        
                        items.forEach(item => {
                            const title = item.querySelector("title")?.textContent || '';
                            const link = item.querySelector("link")?.textContent || '';
                            const description = item.querySelector("description")?.textContent || '';
                            const published = item.querySelector("pubDate")?.textContent || '';
                            allNews.push({ title, link, description, published });
                        });
                    } else {
                        throw new Error("Proxy response is missing 'contents'.");
                    }
                }
                const vulns = [];
                const attacks = [];
                const breaches = [];
                allNews.forEach(item => {
                    const title = item.title.toLowerCase();
                    const description = item.description.toLowerCase();
                    if (title.includes('vulnerability') || title.includes('vulnerabilities') || description.includes('vulnerability') || description.includes('vulnerabilities')) {
                        vulns.push(item);
                    } else if (title.includes('cyberattack') || title.includes('cyberattacks') || description.includes('cyberattack') || description.includes('cyberattacks') || title.includes('malware') || description.includes('malware')) {
                        attacks.push(item);
                    } else if (title.includes('breach') || title.includes('breaches') || description.includes('breach') || description.includes('breaches') || title.includes('data leak') || description.includes('data leak')) {
                        breaches.push(item);
                    }
                });
                setVulnerabilitiesNews(vulns);
                setCyberattacksNews(attacks);
                setDataBreachNews(breaches);

            } catch (err) {
                setError("Error al cargar las noticias. Por favor, intente de nuevo más tarde.");
                console.error("Error fetching news:", err);
            }
        };
        fetchNews();
    }, []);

    const handleSaveNews = (newsItem, type) => {
        // 1. Obtener las noticias existentes del localStorage
        const storedNews = JSON.parse(localStorage.getItem('savedNews')) || { vulnerabilities: [], cyberattacks: [], dataBreaches: [] };
        
        // 2. Verificar si la noticia ya está guardada
        const isAlreadySaved = storedNews[type].some(item => item.link === newsItem.link);
        
        if (!isAlreadySaved) {
            // 3. Si no existe, agregar la nueva noticia
            storedNews[type].push(newsItem);
            
            // 4. Guardar el objeto completo actualizado en localStorage
            localStorage.setItem('savedNews', JSON.stringify(storedNews));
            
            // 5. Mostrar el mensaje flotante
            setShowSaveMessage(true);
            setTimeout(() => {
                setShowSaveMessage(false);
            }, 2000); // El mensaje desaparece después de 2 segundos
        }
    };

    const renderNewsColumn = (title, newsItems, type) => (
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
                        <button className="save-button" onClick={() => handleSaveNews(item, type)}>Guardar</button>
                    </div>
                ))
            ) : (
                <p>No se encontraron noticias de este tipo.</p>
            )}
        </div>
    );
    return (
        <div className="news-container">
            <h1>Noticias de Ciberseguridad</h1>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            <div className="news-columns-container">
                {renderNewsColumn('Vulnerabilidades', vulnerabilitiesNews, 'vulnerabilities')}
                {renderNewsColumn('Ciberataques', cyberattacksNews, 'cyberattacks')}
                {renderNewsColumn('Brechas de Datos', dataBreachNews, 'dataBreaches')}
            </div>
            {showSaveMessage && (
                <div className="floating-message">
                    Noticia guardada con éxito!
                </div>
            )}
        </div>
    );
};


export default News;