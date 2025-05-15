import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTrashAlt, FaUndo, FaArrowLeft } from 'react-icons/fa';
import PostService from '../../../services/PostService';
import TopicService from '../../../services/TopicService';

const PostTrashList = () => {
    const navigate = useNavigate();
    const [trashedPosts, setTrashedPosts] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTrashedPosts();
    }, []);

    const fetchTrashedPosts = async () => {
        try {
            setLoading(true);
            const [postsData, topicsData] = await Promise.all([
                PostService.getTrash(),
                TopicService.index()
            ]);
            setTrashedPosts(postsData);
            setTopics(topicsData);
            setError(null);
        } catch (err) {
            console.error('Error loading trashed posts:', err);
            setError('Không thể tải danh sách bài viết trong thùng rác. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn khôi phục bài viết này?')) {
            try {
                await PostService.restoreFromTrash(id);
                fetchTrashedPosts();
                alert('Khôi phục bài viết thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi khôi phục bài viết.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này không thể hoàn tác!')) {
            try {
                await PostService.delete(id);
                fetchTrashedPosts();
                alert('Xóa bài viết vĩnh viễn thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi xóa bài viết.');
            }
        }
    };

    const getTopicName = (post) => {
        if (post.topic && post.topic.id) {
            const topic = topics.find(t => t.id === post.topic.id);
            return topic ? topic.name : 'N/A';
        } else if (post.topicId) {
            const topic = topics.find(t => t.id === post.topicId);
            return topic ? topic.name : 'N/A';
        } else if (post.topic_id) {
            const topic = topics.find(t => t.id === post.topic_id);
            return topic ? topic.name : 'N/A';
        }
        return 'N/A';
    };

    const AuthenticatedImage = ({ src, alt, className }) => {
        const [imageSrc, setImageSrc] = useState(null);

        useEffect(() => {
            const fetchImage = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(src, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const blob = await response.blob();
                        setImageSrc(URL.createObjectURL(blob));
                    } else {
                        setImageSrc('/placeholder-image.jpg');
                    }
                } catch (error) {
                    setImageSrc('/placeholder-image.jpg');
                }
            };
            fetchImage();
            return () => {
                if (imageSrc && imageSrc.startsWith('blob:')) {
                    URL.revokeObjectURL(imageSrc);
                }
            };
        }, [src]);

        return <img src={imageSrc || '/loading-placeholder.jpg'} alt={alt} className={className} />;
    };

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">Thùng rác bài viết</h1>
                <div className="space-x-3">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate('/admin/post')}
                    >
                        <FaArrowLeft className="inline mr-2" /> Quay lại
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse"></div>
                            <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                            <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                        </div>
                        <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">ID</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Hình ảnh</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Tiêu đề</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Chủ đề</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Ngày xóa</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {trashedPosts.length > 0 ? (
                                trashedPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="py-4 px-4 text-center text-gray-600">{post.id}</td>
                                        <td className="py-4 px-4 text-center">
                                            {post.image ? (
                                                <AuthenticatedImage
                                                    src={`http://localhost:8080/uploads/posts/${post.image}`}
                                                    alt={post.title}
                                                    className="w-16 h-16 object-cover rounded mx-auto"
                                                />
                                            ) : (
                                                <span className="text-gray-400">No image</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center text-gray-800 font-medium">{post.title}</td>
                                        <td className="py-4 px-4 text-center text-gray-600">{getTopicName(post)}</td>
                                        <td className="py-4 px-4 text-center text-gray-600">
                                            {post.deleted_at ? new Date(post.deleted_at).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => navigate(`/admin/post/detail/${post.id}`)}
                                                    className="bg-yellow-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleRestore(post.id)}
                                                    className="bg-green-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Khôi phục"
                                                >
                                                    <FaUndo />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="bg-red-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Xóa vĩnh viễn"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-500">Không có bài viết nào trong thùng rác</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PostTrashList;