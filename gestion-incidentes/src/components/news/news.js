import React, { useState, useEffect } from 'react';

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
                const rssFeeds = ['https://thehackernews.com/feeds/posts/default'];
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
                            allNews.push({
                                title: item.querySelector("title")?.textContent || 'N/A',
                                link: item.querySelector("link")?.textContent || '#',
                                description: item.querySelector("description")?.textContent || 'No description available.',
                                published: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                            });
                        });
                    } else {
                        throw new Error("Failed to fetch news content.");
                    }
                }

                const vulns = allNews.filter(item => item.title.toLowerCase().includes('vulnerability') || item.description.toLowerCase().includes('vulnerability'));
                const attacks = allNews.filter(item => item.title.toLowerCase().includes('cyberattack') || item.description.toLowerCase().includes('malware'));
                const breaches = allNews.filter(item => item.title.toLowerCase().includes('breach') || item.description.toLowerCase().includes('data leak'));

                setVulnerabilitiesNews(vulns);
                setCyberattacksNews(attacks);
                setDataBreachNews(breaches);

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
        <div className="w-full lg:w-1/3 px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">{title}</h2>
            <div className="space-y-6">
                {newsItems.length > 0 ? (
                    newsItems.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-300 block mb-2">{item.title}</a>
                            <p className="text-sm text-gray-500 mb-3">{new Date(item.published).toLocaleDateString()}</p>
                            <p className="text-gray-700 leading-relaxed">{item.description}</p>
                            <button onClick={() => handleSaveNews(item, title)} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
                                Guardar Noticia
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No news found in this category.</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Noticias de Ciberseguridad</h1>
                
                {loading && <div className="text-center text-xl font-semibold text-gray-600">Cargando noticias...</div>}
                {error && <div className="text-center bg-red-100 text-red-700 p-4 rounded-lg shadow-md">{error}</div>}
                
                {!loading && !error && (
                    <div className="flex flex-wrap -mx-4">
                        {renderNewsColumn('Vulnerabilidades', vulnerabilitiesNews)}
                        {renderNewsColumn('Ciberataques', cyberattacksNews)}
                        {renderNewsColumn('Brechas de Datos', dataBreachNews)}
                    </div>
                )}
            </div>

            {showSaveMessage && (
                <div className="fixed bottom-5 right-5 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg text-lg animate-bounce">
                    ¡Noticia guardada con éxito!
                </div>
            )}
        </div>
    );
};

export default News;
