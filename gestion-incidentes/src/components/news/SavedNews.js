import React, { useState, useEffect } from 'react';

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
        <div className="w-full lg:w-1/3 px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">{title}</h2>
            <div className="space-y-6">
                {newsItems && newsItems.length > 0 ? (
                    newsItems.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-300 block mb-2">
                                {item.title}
                            </a>
                            <p className="text-sm text-gray-500 mb-3">{new Date(item.published).toLocaleDateString()}</p>
                            <p className="text-gray-700 leading-relaxed">{item.description}</p>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-gray-500">No hay noticias guardadas en esta categoría.</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return <div className="text-center py-10">Cargando noticias guardadas...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Mis Noticias Guardadas</h1>
                
                <div className="flex flex-wrap -mx-4">
                    {renderNewsColumn('Vulnerabilidades', savedNews.vulnerabilities)}
                    {renderNewsColumn('Ciberataques', savedNews.cyberattacks)}
                    {renderNewsColumn('Brechas de Datos', savedNews.dataBreaches)}
                </div>
            </div>
        </div>
    );
};

export default SavedNews;
