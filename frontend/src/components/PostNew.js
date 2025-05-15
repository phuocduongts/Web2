import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostService from '../services/PostService';
import TopicService from '../services/TopicService';

export default function PostNew() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
        fetchTopics();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await PostService.index();
            
            // Ensure we handle the response format correctly
            const postsData = Array.isArray(response) ? response : [];
            
            console.log('Posts data received:', postsData);
            
            // MODIFIED: Get all posts - we have data but not being displayed
            // Let's use all posts regardless of status
            console.log('Post statuses:', postsData.map(post => post.status));
            
            // We won't filter by status since we need to show all posts
            const allPosts = postsData;
            
            // Sorting by creation date
            const sortedPosts = allPosts.sort((a, b) => {
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.id - a.id;
            });
            
            // Taking only the 4 most recent posts
            const recentPosts = sortedPosts.slice(0, 4);
            console.log('Recent posts:', recentPosts.length);
            
            // Formatting the data for display
            const formattedArticles = recentPosts.map(post => ({
                id: post.id,
                title: post.title,
                image: post.image ? `http://localhost:8080/uploads/posts/${post.image}` : "/placeholder-image.jpg",
                content: post.content ? stripHtml(post.content).substring(0, 150) + '...' : 'Không có mô tả',
                slug: post.slug || `post-${post.id}`, // Fallback if slug is missing
                link: `/post/${post.slug || `post-${post.id}`}`,
                topic_id: post.topic_id
            }));
            
            console.log('Formatted articles:', formattedArticles);
            setArticles(formattedArticles);
            setError(null);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Không thể tải bài viết mới nhất.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopics = async () => {
        try {
            const response = await TopicService.index();
            
            // Handle the response format correctly
            const topicsData = Array.isArray(response) ? response : [];
            
            console.log('Topics data received:', topicsData);
            
            // Use all topics without filtering by status
            setTopics(topicsData);
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };
    
    const stripHtml = (html) => {
        if (!html) return '';
        try {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || "";
        } catch (error) {
            console.error('Error stripping HTML:', error);
            return html.replace(/<[^>]*>?/gm, ''); // Fallback regex method
        }
    };

    const handleImageError = (e) => {
        e.target.src = "/placeholder-image.jpg";
    };

    const handleViewAllPosts = () => {
        navigate('/tat-ca-bai-viet');
    };

    const handleViewByTopic = (topicId, topicSlug) => {
        navigate(`/posts/topic/${topicSlug}`, { state: { topicId } });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Bài viết mới nhất</h2>
                <div className="flex justify-center items-center py-12">
                    <p className="text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Bài viết mới nhất</h2>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Bài viết mới nhất</h2>
                <div className="flex justify-center items-center py-12">
                    <p className="text-gray-600">Không có bài viết mới.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <div className="flex justify-between items-center mt-20 mb-4">
                <h2 className="text-2xl md:text-3xl font-mono text-gray-800">BÀI VIẾT MỚI NHẤT</h2>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleViewAllPosts}
                        className="text-blue-600 hover:text-blue-800 font-mono text-sm flex items-center transition-colors"
                    >
                        Xem tất cả
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                {articles.length > 0 && (
                    <div className="col-span-1 md:col-span-2 flex flex-col">
                        <Link to={articles[0].link} className="block overflow-hidden border border-gray-300 shadow-md hover:shadow-xl transition-shadow h-full">
                            <div className="relative h-48 md:h-52">
                                <img
                                    src={articles[0].image}
                                    alt={articles[0].title}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                />
                            </div>
                            <div className="p-4 md:p-5 flex flex-col flex-grow bg-white">
                                <h3 className="text-lg font-mono mb-2 text-gray-800">{articles[0].title}</h3>
                                <p className="text-sm text-gray-600 flex-grow">{articles[0].content}</p>
                                <div className="mt-3 text-xs text-blue-600 font-mono">Xem thêm</div>
                            </div>
                        </Link>
                    </div>
                )}

                {articles.length > 1 && (
                    <div className="col-span-1 md:col-span-2 grid grid-rows-3 gap-4">
                        {articles.slice(1).map((article, index) => (
                            <Link
                                key={index}
                                to={article.link}
                                className="block overflow-hidden border border-gray-300 shadow-md hover:shadow-xl transition-shadow flex h-24 md:h-28"
                            >
                                <div className="w-32 md:w-36 h-full overflow-hidden">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                        onError={handleImageError}
                                    />
                                </div>
                                <div className="p-2 md:p-3 flex flex-col justify-center flex-grow bg-white">
                                    <h3 className="text-sm font-mono mb-1 text-gray-800 line-clamp-2">{article.title}</h3>
                                    <p className="text-xs text-gray-600 line-clamp-2">{article.content}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}