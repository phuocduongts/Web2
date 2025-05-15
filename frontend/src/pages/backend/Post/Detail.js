import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaTrashAlt } from 'react-icons/fa';
import PostService from '../../../services/PostService';
import TopicService from '../../../services/TopicService';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                setLoading(true);
                const postData = await PostService.detail(id);
                setPost(postData);

                // Nếu có topic_id hoặc topicId, thì fetch thông tin topic
                if (postData.topic_id || postData.topicId) {
                    const topicId = postData.topic_id || postData.topicId;
                    try {
                        const topicData = await TopicService.show(topicId);
                        setTopic(topicData);
                    } catch (topicError) {
                        console.error('Error fetching topic:', topicError);
                    }
                } else if (postData.topic) {
                    setTopic(postData.topic);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [id]);

    const handleMoveToTrash = async () => {
        if (window.confirm('Bạn có chắc chắn muốn chuyển bài viết này vào thùng rác?')) {
            try {
                await PostService.moveToTrash(id);
                alert('Chuyển bài viết vào thùng rác thành công!');
                navigate('/admin/post');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác.');
            }
        }
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

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                </div>
                <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
                <div className="text-center mt-4">
                    <button
                        onClick={() => navigate('/admin/post')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center"
                    >
                        <FaArrowLeft className="mr-2" /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-gray-600">Không tìm thấy bài viết.</p>
                <div className="mt-4">
                    <button
                        onClick={() => navigate('/admin/post')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center"
                    >
                        <FaArrowLeft className="mr-2" /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">Chi tiết bài viết</h1>
                <div className="space-x-3">
                    <button
                        onClick={() => navigate('/admin/post')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center"
                    >
                        <FaArrowLeft className="mr-2" /> Quay lại
                    </button>
                    <button
                        onClick={() => navigate(`/admin/post/update/${id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center"
                    >
                        <FaEdit className="mr-2" /> Chỉnh sửa
                    </button>
                    <button
                        onClick={handleMoveToTrash}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded inline-flex items-center"
                    >
                        <FaTrashAlt className="mr-2" /> Xóa
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                                <div className="flex space-x-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center">
                                        <span className="font-medium mr-2">Chủ đề:</span>
                                        <span>{topic ? topic.name : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium mr-2">Trạng thái:</span>
                                        <span className={`${post.status ? 'text-green-600' : 'text-gray-600'}`}>
                                            {post.status ? 'Hiển thị' : 'Ẩn'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="prose max-w-none">
                                        <div className="whitespace-pre-wrap">{post.content}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Hình ảnh</h3>
                                {post.image ? (
                                    <AuthenticatedImage
                                        src={`http://localhost:8080/uploads/posts/${post.image}`}
                                        alt={post.title}
                                        className="w-full h-auto object-cover rounded-lg border"
                                    />
                                ) : (
                                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-lg border">
                                        <span className="text-gray-500">Không có hình ảnh</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Thông tin thêm</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID:</span>
                                        <span className="font-medium">{post.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span className="font-medium">
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cập nhật:</span>
                                        <span className="font-medium">
                                            {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;