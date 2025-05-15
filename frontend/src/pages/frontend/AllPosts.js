import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PostService from '../../services/PostService';
import TopicService from '../../services/TopicService';

export default function AllPosts() {
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 12;
    
    // Fetch posts and topics on initial load
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Check URL parameters for topic filter
                const searchParams = new URLSearchParams(location.search);
                const topicParam = searchParams.get('topic');
                
                // Get topic ID from location state or URL param
                let initialTopicId = null;
                if (location.state && location.state.topicId) {
                    initialTopicId = parseInt(location.state.topicId, 10);
                }
                
                // Fetch both posts and topics
                let postsResponse;
                const topicsResponse = await TopicService.index();
                
                // Process topics first
                const topicsData = Array.isArray(topicsResponse) ? topicsResponse : [];
                setTopics(topicsData);
                
                // If we have a topic param but no state, try to find the topic ID by name
                if (!initialTopicId && topicParam) {
                    const matchedTopic = topicsData.find(t => 
                        t.name.toLowerCase() === topicParam.toLowerCase() ||
                        t.slug === topicParam.toLowerCase()
                    );
                    if (matchedTopic) {
                        initialTopicId = matchedTopic.id;
                    }
                }
                
                // Set selected topic if found
                if (initialTopicId) {
                    setSelectedTopic(initialTopicId);
                    // Fetch posts by topic directly from the backend
                    postsResponse = await PostService.getByTopic(initialTopicId);
                } else {
                    // Fetch all posts if no topic selected
                    postsResponse = await PostService.index();
                }
                
                // Process posts
                const postsData = Array.isArray(postsResponse) ? postsResponse : [];
                
                // Sorting by creation date
                const sortedPosts = postsData.sort((a, b) => {
                    if (a.created_at && b.created_at) {
                        return new Date(b.created_at) - new Date(a.created_at);
                    }
                    return b.id - a.id;
                });
                
                // Formatting the data for display
                const formattedPosts = sortedPosts.map(post => ({
                    id: post.id,
                    title: post.title,
                    image: post.image ? `http://localhost:8080/uploads/posts/${post.image}` : "/placeholder-image.jpg",
                    content: post.content ? stripHtml(post.content).substring(0, 150) + '...' : 'Không có mô tả',
                    slug: post.slug || `post-${post.id}`, // Fallback if slug is missing
                    link: `/post/${post.slug || `post-${post.id}`}`,
                    topic_id: post.topic_id || (post.topic ? post.topic.id : null),
                    created_at: post.created_at,
                    status: post.status
                }));
                
                setPosts(formattedPosts);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [location.search, location.state]); // Re-run when location state or search params change

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

    const handleTopicFilter = async (topicId) => {
        // If clicking the currently selected topic, clear the filter
        if (topicId === selectedTopic) {
            setSelectedTopic(null);
            setCurrentPage(1);
            navigate('', { replace: true });
            
            // Fetch all posts
            try {
                setLoading(true);
                const postsResponse = await PostService.index();
                const postsData = Array.isArray(postsResponse) ? postsResponse : [];
                
                const formattedPosts = postsData.map(post => ({
                    id: post.id,
                    title: post.title,
                    image: post.image ? `http://localhost:8080/uploads/posts/${post.image}` : "/placeholder-image.jpg",
                    content: post.content ? stripHtml(post.content).substring(0, 150) + '...' : 'Không có mô tả',
                    slug: post.slug || `post-${post.id}`,
                    link: `/post/${post.slug || `post-${post.id}`}`,
                    topic_id: post.topic_id || (post.topic ? post.topic.id : null),
                    created_at: post.created_at,
                    status: post.status
                }));
                
                setPosts(formattedPosts);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Không thể tải dữ liệu.');
            } finally {
                setLoading(false);
            }
            return;
        }
        
        // Otherwise, set the new topic filter
        setSelectedTopic(topicId);
        setCurrentPage(1); // Reset to first page when changing filters
        
        if (topicId) {
            // Get topic name for URL
            const selectedTopicObj = topics.find(t => t.id === topicId);
            const topicSlug = selectedTopicObj?.slug || selectedTopicObj?.name?.toLowerCase() || 'topic';
            
            // Update URL without reloading the page
            navigate(`?topic=${topicSlug}`, { 
                state: { topicId },
                replace: true 
            });
            
            // Fetch posts by topic directly from the backend
            try {
                setLoading(true);
                const postsResponse = await PostService.getByTopic(topicId);
                const postsData = Array.isArray(postsResponse) ? postsResponse : [];
                
                const formattedPosts = postsData.map(post => ({
                    id: post.id,
                    title: post.title,
                    image: post.image ? `http://localhost:8080/uploads/posts/${post.image}` : "/placeholder-image.jpg",
                    content: post.content ? stripHtml(post.content).substring(0, 150) + '...' : 'Không có mô tả',
                    slug: post.slug || `post-${post.id}`,
                    link: `/post/${post.slug || `post-${post.id}`}`,
                    topic_id: post.topic_id || (post.topic ? post.topic.id : null),
                    created_at: post.created_at,
                    status: post.status
                }));
                
                setPosts(formattedPosts);
            } catch (err) {
                console.error('Error fetching posts by topic:', err);
                setError('Không thể tải dữ liệu theo chủ đề.');
            } finally {
                setLoading(false);
            }
        }
    };

    // Filter posts based on selected topic (as a backup - now we fetch filtered posts from backend)
    const filteredPosts = posts;

    // Calculate pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Change page
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            // Scroll to top when changing page
            window.scrollTo(0, 0);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <h1 className="text-3xl font-bold mb-6">Tất cả bài viết</h1>
                <div className="flex justify-center items-center py-12">
                    <p className="text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <h1 className="text-3xl font-bold mb-6">Tất cả bài viết</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
            <h1 className="text-3xl font-mono text-gray-800 mb-6">TẤT CẢ BÀI VIẾT</h1>

            {/* Selected topic info - show this when a topic is selected */}
            {selectedTopic && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="font-mono">
                        Đang xem bài viết trong chủ đề: 
                        <span className="font-bold ml-2">
                            {topics.find(t => t.id === selectedTopic)?.name || 'Chủ đề không xác định'}
                        </span>
                    </p>
                </div>
            )}

            {/* Topic Filter */}
            <div className="mb-8">
                <h2 className="text-xl font-mono mb-4">Lọc theo chủ đề:</h2>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => handleTopicFilter(null)}
                        className={`px-4 py-2 rounded-full text-sm font-mono transition-colors ${
                            selectedTopic === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Tất cả
                    </button>

                    {topics.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => handleTopicFilter(topic.id)}
                            className={`px-4 py-2 rounded-full text-sm font-mono transition-colors ${
                                selectedTopic === topic.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {topic.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            {currentPosts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Không có bài viết nào trong chủ đề này.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentPosts.map(post => (
                        <Link
                            key={post.id}
                            to={post.link}
                            className="block overflow-hidden border border-gray-300 rounded shadow-md hover:shadow-xl transition-shadow h-full"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                    onError={handleImageError}
                                />
                            </div>
                            <div className="p-4 bg-white flex flex-col flex-grow">
                                <h3 className="text-lg font-mono mb-2 text-gray-800 line-clamp-2">{post.title}</h3>

                                {/* Find topic name */}
                                {post.topic_id && (
                                    <span className="mb-2 text-xs text-gray-500">
                                        {topics.find(t => t.id === parseInt(post.topic_id, 10))?.name || 'Chủ đề không xác định'}
                                    </span>
                                )}

                                <p className="text-sm text-gray-600 mb-3 flex-grow line-clamp-3">{post.content}</p>

                                <div className="text-xs text-blue-600 font-mono mt-auto">Xem chi tiết</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded ${
                                currentPage === 1
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            &laquo;
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Only show 5 page buttons at most
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => paginate(pageNumber)}
                                        className={`px-3 py-1 rounded ${
                                            currentPage === pageNumber
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            } else if (
                                (pageNumber === currentPage - 2 && currentPage > 3) ||
                                (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                            ) {
                                return <span key={pageNumber} className="px-1">...</span>;
                            }
                            return null;
                        })}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded ${
                                currentPage === totalPages
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            &raquo;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}