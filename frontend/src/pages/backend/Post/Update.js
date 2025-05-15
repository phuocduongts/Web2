import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import PostService from '../../../services/PostService';
import TopicService from '../../../services/TopicService';

const PostUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [topics, setTopics] = useState([]);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    const [post, setPost] = useState({
        title: '',
        content: '',
        topic_id: '',
        status: true,
        image: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);
                // Fetch post and topics in parallel
                const [postData, topicsData] = await Promise.all([
                    PostService.detail(id),
                    TopicService.index()
                ]);

                // Set post data
                setPost({
                    title: postData.title,
                    content: postData.content,
                    topic_id: postData.topic_id || postData.topicId || (postData.topic ? postData.topic.id : ''),
                    status: postData.status,
                    image: null // Không thay đổi ảnh trừ khi người dùng chọn ảnh mới
                });

                // Set current image for preview
                if (postData.image) {
                    setCurrentImage(postData.image);
                }

                // Set topics
                setTopics(topicsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải thông tin bài viết hoặc danh sách chủ đề.');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setPost({ ...post, [name]: checked });
        } else {
            setPost({ ...post, [name]: value });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPost({ ...post, image: file });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!post.title || !post.content || !post.topic_id) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        try {
            setLoading(true);
            await PostService.update(id, post);
            alert('Cập nhật bài viết thành công!');
            navigate('/admin/post');
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Có lỗi xảy ra khi cập nhật bài viết. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
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

    return (
        <div className="container mx-auto px-4 py-8 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">Cập nhật bài viết</h1>
                <button
                    onClick={() => navigate('/admin/post')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
                >
                    <FaArrowLeft className="mr-2" /> Quay lại
                </button>
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

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                Tiêu đề <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={post.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tiêu đề bài viết"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                                Nội dung <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={post.content}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="10"
                                placeholder="Nhập nội dung bài viết"
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="topic_id" className="block text-gray-700 font-medium mb-2">
                                Chủ đề <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="topic_id"
                                name="topic_id"
                                value={post.topic_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">-- Chọn chủ đề --</option>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-gray-700 font-medium mb-2">
                                Hình ảnh
                            </label>
                            {currentImage && !imagePreview && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">Hình ảnh hiện tại:</p>
                                    <img
                                        src={`http://localhost:8080/uploads/posts/${currentImage}`}
                                        alt="Current"
                                        className="w-full h-40 object-cover rounded-lg border"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-1 italic">
                                        Để trống nếu không muốn thay đổi hình ảnh
                                    </p>
                                </div>
                            )}

                            <input
                                type="file"
                                id="image"
                                name="image"
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                accept="image/*"
                            />

                            {imagePreview && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 mb-1">Hình ảnh mới:</p>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="status"
                                name="status"
                                checked={post.status}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="status" className="ml-2 block text-gray-700">
                                Hiển thị bài viết
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <div className="w-4 h-4 bg-white rounded-full animate-pulse mr-2"></div>
                                        <div className="w-4 h-4 bg-white rounded-full animate-pulse delay-150 mr-2"></div>
                                        <div className="w-4 h-4 bg-white rounded-full animate-pulse delay-300"></div>
                                    </span>
                                ) : (
                                    <>
                                        <FaSave className="mr-2" /> Cập nhật bài viết
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PostUpdate;