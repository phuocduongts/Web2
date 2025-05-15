import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PostService from '../../services/PostService';
import TopicService from '../../services/TopicService';

export default function PostDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
        fetchTopics();
    }, [slug]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            // Get all posts to find the one with matching slug
            const response = await PostService.index();
            const postsData = Array.isArray(response) ? response : [];
            
            // Find the post with matching slug
            const foundPost = postsData.find(post => post.slug === slug || `post-${post.id}` === slug);
            
            if (!foundPost) {
                setError('Không tìm thấy bài viết.');
                setLoading(false);
                return;
            }
            
            // Format post for display
            const formattedPost = {
                id: foundPost.id,
                title: foundPost.title,
                content: foundPost.content,
                image: foundPost.image ? `http://localhost:8080/uploads/posts/${foundPost.image}` : "/placeholder-image.jpg",
                created_at: foundPost.created_at,
                updated_at: foundPost.updated_at,
                topic_id: foundPost.topic_id,
                status: foundPost.status,
                slug: foundPost.slug || `post-${foundPost.id}`
            };
            
            setPost(formattedPost);
            
            // Find related posts (same topic)
            const sameTopicPosts = postsData
                .filter(p => p.topic_id === foundPost.topic_id && p.id !== foundPost.id)
                .map(post => ({
                    id: post.id,
                    title: post.title,
                    image: post.image ? `http://localhost:8080/uploads/posts/${post.image}` : "/placeholder-image.jpg",
                    content: post.content ? stripHtml(post.content).substring(0, 100) + '...' : 'Không có mô tả',
                    slug: post.slug || `post-${post.id}`,
                    link: `/post/${post.slug || `post-${post.id}`}`,
                    topic_id: post.topic_id
                }))
                .slice(0, 3); // Limit to 3 related posts
                
            setRelatedPosts(sameTopicPosts);
            setError(null);
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Không thể tải thông tin bài viết.');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchTopics = async () => {
        try {
            const response = await TopicService.index();
            const topicsData = Array.isArray(response) ? response : [];
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
    
    const getTopicName = (topicId) => {
        const topic = topics.find(t => t.id === topicId);
        return topic ? topic.name : 'Chủ đề không xác định';
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const handleBackToAllPosts = () => {
        navigate('/tat-ca-bai-viet');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <div className="flex justify-center items-center py-12">
                    <p className="text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error || 'Không tìm thấy bài viết.'}</p>
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
                {post.topic_id && (
                    <>
                        <Link 
                            to={`/posts/topic/${topics.find(t => t.id === post.topic_id)?.slug || post.topic_id}`}
                            state={{ topicId: post.topic_id }}
                            className="hover:text-blue-600 transition-colors"
                        >
                            {getTopicName(post.topic_id)}
                        </Link>
                        <span className="mx-2">/</span>
                    </>
                )}
                <span className="text-gray-700 font-medium truncate max-w-xs">{post.title}</span>
            </div>
            
            {/* Post Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                    {post.topic_id && (
                        <Link 
                            to={`/posts/topic/${topics.find(t => t.id === post.topic_id)?.slug || post.topic_id}`}
                            state={{ topicId: post.topic_id }}
                            className="bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {getTopicName(post.topic_id)}
                        </Link>
                    )}
                    
                    {post.created_at && (
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(post.created_at)}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Featured Image */}
            {post.image && (
                <div className="mb-8 flex justify-center">
                    <img 
                        src={post.image} 
                        alt={post.title} 
                        className="max-w-full max-h-96 object-contain"
                        onError={handleImageError}
                    />
                </div>
            )}
            
            {/* Post Content */}
            <div className="prose prose-lg max-w-none mb-12">
                {/* Use dangerouslySetInnerHTML to render HTML content */}
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="mt-12 border-t pt-8">
                    <h2 className="text-2xl font-mono text-gray-800 mb-6">BÀI VIẾT LIÊN QUAN</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedPosts.map(relatedPost => (
                            <Link 
                                key={relatedPost.id} 
                                to={relatedPost.link}
                                className="block overflow-hidden border border-gray-300 rounded shadow-md hover:shadow-xl transition-shadow h-full"
                            >
                                <div className="h-40 overflow-hidden">
                                    <img 
                                        src={relatedPost.image} 
                                        alt={relatedPost.title}
                                        className="w-full h-full object-cover transition-transform hover:scale-105"
                                        onError={handleImageError} 
                                    />
                                </div>
                                <div className="p-4 bg-white">
                                    <h3 className="text-lg font-mono mb-2 text-gray-800 line-clamp-2">{relatedPost.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-3">{relatedPost.content}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Back Button */}
            <div className="mt-8">
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
        </div>
    );
}