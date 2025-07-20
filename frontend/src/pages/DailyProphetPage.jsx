// frontend/src/DailyProphet.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'react-lottie';
import io from 'socket.io-client';
import axios from 'axios';

// IMPORTANT: Ensure your Lottie JSON file is named 'newspaper_unfold.json'
// and is located in 'frontend/src/assets/'
import newspaperAnimationData from '../assets/newspaper_unfold.json'; // Corrected import path

// Define a type for your News Article (for better clarity, even in JS)
/**
 * @typedef {object} NewsArticle
 * @property {string} _id - MongoDB ID
 * @property {string} headline
 * @property {string} content
 * @property {string} category
 * @property {string} imageURL
 * @property {string} author
 * @property {string} publishDate - Date string
 */

// Connect to your Node.js backend's Socket.IO server
// Ensure this URL matches your Node.js backend's port (default 5000)
const socket = io('http://localhost:5000');

const DailyProphet = () => {
    /** @type {[NewsArticle[], React.Dispatch<React.SetStateAction<NewsArticle[]>>]} */
    const [news, setNews] = useState([]);
    const [currentCategory, setCurrentCategory] = useState('Ministry Affairs');
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    const [isUnfolding, setIsUnfolding] = useState(true); // For initial newspaper animation
    const [articleForAnimation, setArticleForAnimation] = useState(null); // State to hold article for Lottie
    const newsContainerRef = useRef(null); // Ref for scroll to top
    // NEW: State to control viewing mode: 'latest' (generated) or 'archive' (from DB)
    const [viewMode, setViewMode] = useState('latest'); 

    // Define the categories for the news feed
    const categories = ['Ministry Affairs', 'Dark Arts', 'Quidditch', 'Creatures', 'General'];

    // Lottie animation options
    const lottieDefaultOptions = {
        loop: false,
        autoplay: true,
        animationData: newspaperAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    // --- Socket.IO setup ---
    useEffect(() => {
        // Event listener for successful connection to WebSocket server
        socket.on('connect', () => {
            console.log('Connected to WebSocket server:', socket.id);
            // Join the default category room on initial connect
            socket.emit('joinNewsFeed', currentCategory);
        });

        // Event listener for incoming news updates
        socket.on('newsUpdate', (newArticle) => {
            console.log('Received live news:', newArticle);
            // Only add to news if we are in 'latest' view mode or if it's the current category
            // and we want to show live updates on top of archive
            if (viewMode === 'latest' || newArticle.category === currentCategory) {
                setNews((prevNews) => [newArticle, ...prevNews]);
                setArticleForAnimation(newArticle); // Update article for animation if it's the first one
                if (newsContainerRef.current) {
                    newsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });

        // Event listener for disconnection from WebSocket server
        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        // Cleanup function: runs when the component unmounts or dependencies change
        return () => {
            // Leave the current category room before disconnecting or changing category
            socket.emit('leaveNewsFeed', currentCategory);
            socket.off('connect');
            socket.off('newsUpdate');
            socket.off('disconnect');
            socket.disconnect(); // Disconnect the socket
        };
    }, [currentCategory, viewMode]); // Re-run this effect if currentCategory or viewMode changes

    // --- Function to fetch NEW news from the backend (generate) ---
    const fetchNews = async (category, isInitialLoad = false) => {
        setIsLoadingNews(true); // Set loading state to true
        if (!isInitialLoad) {
            setIsUnfolding(true); // Start unfolding animation for new generation
        }
        setNews([]); // Clear news when changing category to show fresh content
        setArticleForAnimation(null); // Clear article for animation while loading
        setViewMode('latest'); // Ensure we are in 'latest' view mode

        try {
            const response = await axios.post('http://localhost:5000/api/news/generate', { category });
            const generatedArticle = response.data;
            setNews([generatedArticle]); // Display the newly generated article
            setArticleForAnimation(generatedArticle); // Set the article for the animation
        } catch (error) {
            console.error('Error fetching news:', error);
            setNews([]);
            setArticleForAnimation(null);
        } finally {
            setIsLoadingNews(false); // Set loading state to false
            setTimeout(() => {
                setIsUnfolding(false);
            }, isInitialLoad ? 2000 : 1000); // Longer delay for initial page load
        }
    };

    // NEW: Function to fetch OLD news from the backend (archive)
    const fetchArchiveNews = async () => {
        setIsLoadingNews(true);
        setIsUnfolding(false); // No unfolding animation for archive view
        setNews([]); // Clear current news
        setArticleForAnimation(null); // Clear article for animation
        setViewMode('archive'); // Set view mode to archive

        try {
            // This calls the Node.js GET /api/news endpoint
            const response = await axios.get('http://localhost:5000/api/news');
            const archivedArticles = response.data;
            setNews(archivedArticles); // Display all archived articles
        } catch (error) {
            console.error('Error fetching archived news:', error);
            setNews([]);
        } finally {
            setIsLoadingNews(false);
        }
    };

    // --- Initial fetch of news when the component mounts ---
    useEffect(() => {
        // Decide whether to fetch latest or archive on initial mount
        if (viewMode === 'latest') {
            fetchNews(currentCategory, true); // Fetch news for the default category on mount
        } else {
            fetchArchiveNews(); // Or fetch archive if that's the default view
        }
    }, []); // Empty dependency array means this runs only once after the initial render

    // --- Handler for category button clicks (generates new news) ---
    const handleCategoryChange = (category) => {
        if (currentCategory) {
            socket.emit('leaveNewsFeed', currentCategory); // Leave the old category room
        }
        setCurrentCategory(category); // Update the current category state
        socket.emit('joinNewsFeed', category); // Join the new category room
        fetchNews(category); // Fetch news for the newly selected category
    };

    // NEW: Handler for "View Archive" button click
    const handleViewArchive = () => {
        fetchArchiveNews();
    };

    // NEW: Handler for "Generate New" button click (resets to latest view)
    const handleGenerateNew = () => {
        fetchNews(currentCategory); // Generate new news for the current category
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 sm:p-8 font-inter">
            {/* Initial Newspaper Unfolding Animation */}
            <AnimatePresence>
                {isUnfolding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden" 
                    >
                        <Lottie options={lottieDefaultOptions} height={400} width={400} />
                        
                        {/* Headline and Content for the Lottie animation */}
                        {articleForAnimation && ( 
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1 }} 
                                className="absolute text-center px-8 max-w-2xl"
                                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} 
                            >
                                <h2 className="text-3xl sm:text-5xl font-bold text-yellow-400 mb-2 font-serif leading-tight">
                                    {articleForAnimation.headline}
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-300 italic">
                                    {articleForAnimation.content.substring(0, 150)}... {/* Show a snippet */}
                                </p>
                            </motion.div>
                        )}

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="text-4xl sm:text-6xl font-bold text-yellow-400 absolute mt-48"
                        >
                            The Daily Prophet
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: isUnfolding ? 1.5 : 0, duration: 0.8 }}
                className="text-center mb-6 sm:mb-8"
            >
                <h1 className="text-5xl sm:text-7xl font-bold text-yellow-400 mb-2 font-serif">The Daily Prophet</h1>
                <p className="text-lg sm:text-xl text-gray-300">Your Live Source for Magical News</p>
            </motion.header>

            {/* Category Navigation & View Mode Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
                <div className="flex justify-center space-x-2 sm:space-x-4 flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105
                                        ${currentCategory === category && viewMode === 'latest' ? 'bg-yellow-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                {/* NEW: View Mode Buttons */}
                <div className="flex space-x-2 sm:space-x-4 mt-4 sm:mt-0">
                    <button
                        onClick={handleGenerateNew}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105
                                    ${viewMode === 'latest' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Generate New
                    </button>
                    <button
                        onClick={handleViewArchive}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105
                                    ${viewMode === 'archive' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        View Archive
                    </button>
                </div>
            </div>

            {/* News Articles Container */}
            <div ref={newsContainerRef} className="max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-gray-700 p-2 sm:p-4 rounded-lg">
                {isLoadingNews ? (
                    <div className="text-center text-xl sm:text-3xl text-yellow-500 animate-pulse">Loading today's mystical headlines...</div>
                ) : news.length > 0 ? (
                    viewMode === 'latest' ? (
                        // Display only the first article, styled for full-screen appearance (for generated news)
                        <motion.div 
                            key={news[0]._id} // Always use the first article for display
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700 p-6 sm:p-10 mx-auto max-w-4xl lg:max-w-5xl flex flex-col" // Adjusted styling
                        >
                            <h2 className="text-3xl sm:text-5xl font-bold text-yellow-300 mb-4 text-center font-serif leading-tight">{news[0].headline}</h2>
                            <p 
                                className="text-gray-200 text-base sm:text-lg text-justify mb-6 flex-grow leading-relaxed" 
                                dangerouslySetInnerHTML={{ __html: news[0].content.replace(/\n/g, '<br/><br/>') }} 
                            ></p>
                            <div className="mt-auto flex justify-between items-center w-full text-sm sm:text-base border-t border-gray-700 pt-4">
                                <span className="text-gray-400 bg-gray-700 px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold">{news[0].category}</span>
                                <span className="text-gray-500 italic">By {news[0].author} on {new Date(news[0].publishDate).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ) : (
                        // Display multiple articles in a grid for archive view
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-8">
                            <AnimatePresence>
                                {news.map((article) => (
                                    <motion.div
                                        key={article._id} 
                                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700 p-4 sm:p-6 flex flex-col relative" // Removed items-center
                                    >
                                        <h2 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-2 sm:mb-3 text-center font-serif">{article.headline}</h2>
                                        <p 
                                            className="text-gray-200 text-sm sm:text-base text-justify mb-4 flex-grow"
                                            dangerouslySetInnerHTML={{ __html: article.content.substring(0, 200) + '...' }} // Show snippet for archive cards
                                        ></p>
                                        <div className="mt-auto flex justify-between items-center w-full text-xs sm:text-sm border-t border-gray-700 pt-3">
                                            <span className="text-gray-400 bg-gray-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full">{article.category}</span>
                                            <span className="text-gray-500 italic">{new Date(article.publishDate).toLocaleDateString()}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )
                ) : (
                    <div className="text-center text-xl sm:text-2xl text-gray-400">No news found for this category. Try another or generate new articles!</div>
                )}
            </div>
        </div>
    );
};

export default DailyProphet;
