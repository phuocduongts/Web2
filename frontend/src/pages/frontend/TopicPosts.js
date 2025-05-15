import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import PostService from '../../services/PostService';
import TopicService from '../../services/TopicService';

export default function TopicPosts() {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [topic, setTopic] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 12;

    useEffect(() => {
        // Get topic ID from location state if available
        const topicId = location.state?.topicId;

        fetchData(topicId);
    }, [slug, location.state]);

    const fetchData = async (topicIdFromState) => {
        try {
            setLoading(true);

            // Fetch all topics
            const topicsResponse = await TopicService.index();
            const topicsData = Array.isArray(topicsResponse) ? topicsResponse : [];
            setTopics(topicsData);

            // Find the topic by slug or ID
            let currentTopic;
            if (topicIdFromState) {
                currentTopic = topicsData.find(t => t.id === topicIdFromState);
            } else {
                currentTopic = topicsData.find(t => t.slug === slug || t.id.toString() === slug);
            }

            if (!currentTopic) {
                setError('Không tìm thấy chủ đề.');
                setLoading(false);
                return;
            }

            setTopic(currentTopic);

            // Fetch all posts
            const postsResponse = await PostService.index();
            const postsData = Array.isArray(postsResponse) ? postsResponse : [];

            // Filter posts by topic
            const topicPosts = postsData
                .filter(post => post.topic_id === currentTopic.id)
                .sort((a, b) => {
                    if (a.created_at && b.created_at) {
                        return new Date(b.created_at) - new Date(a.created_at);
                    }
                    return b.id - a.id;
                });

            // Format posts for display
            const formattedPosts = topicPosts.map(post => ({
                id: post.id,
                title: post.title,
                image: post.image ? `http://localhost:8080/uploads/posts/${post.image}` : "/placeholder-image.jpg",
                content: post.content ? stripHtml(post.content).substring(0, 150) + '...' : 'Không có mô tả',
                slug: post.slug || `post-${post.id}`,
                link: `/post/${post.slug || `post-${post.id}`}`,
                topic_id: post.topic_id,
                created_at: post.created_at
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

    const handleBackToAllPosts = () => {
        navigate('/tat-ca-bai-viet');
    };

    // Calculate pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage);

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
                <div className="flex justify-center items-center py-12">
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error || 'Không tìm thấy chủ đề.'}</p>
                </div>
                <button
                    onClick={handleBackToAllPosts}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Quay lại tất cả bài viết
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
                <span className="mx-2">/</span>
                <Link to="/tat-ca-bai-viet" className="hover:text-blue-600 transition-colors">Bài viết</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-700 font-medium">{topic.name}</span>
            </div>

            {/* Topic Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-mono text-gray-800 mb-4">CHỦ ĐỀ: {topic.name.toUpperCase()}</h1>
                {topic.description && (
                    <p className="text-gray-600">{topic.description}</p>
                )}
            </div>

            {/* Topic Posts */}
            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Không có bài viết nào trong chủ đề này.</p>
                    <button
                        onClick={handleBackToAllPosts}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Xem tất cả bài viết
                    </button>
                </div>
            ) : (
                <>
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
                                    <p className="text-sm text-gray-600 mb-3 flex-grow line-clamp-3">{post.content}</p>
                                    <div className="text-xs text-blue-600 font-mono mt-auto">Xem chi tiết</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded ${currentPage === 1
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
                                                className={`px-3 py-1 rounded ${currentPage === pageNumber
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
                                    className={`px-3 py-1 rounded ${currentPage === totalPages
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    &raquo;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleBackToAllPosts}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại tất cả bài viết
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}