import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopicService from '../../../services/TopicService';
import { FaEye, FaEdit, FaTrashAlt, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';

const TopicList = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const data = await TopicService.index();
            setTopics(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching topics:', err);
            setError('Không thể tải danh sách topic. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await TopicService.status(id);
            fetchTopics();
            alert('Cập nhật trạng thái thành công!');
        } catch (err) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái.');
        }
    };

    const handleMoveToTrash = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn chuyển topic này vào thùng rác?')) {
            try {
                await TopicService.moveToTrash(id);
                fetchTopics();
                alert('Chuyển topic vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác.');
            }
        }
    };

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">Danh sách chủ đề</h1>
                <div className="space-x-3">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate('/admin/topic/create')}
                    >
                        <FaPlus className="inline mr-2" /> Thêm
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate('/admin/topic/trash')}
                    >
                        <FaTrashAlt className="inline mr-2" /> Thùng rác
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
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Tên</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Chi tiết</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {topics.length > 0 ? (
                                topics.map((topic) => (
                                    <tr key={topic.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="py-4 px-4 text-center text-gray-600">{topic.id}</td>
                                        <td className="py-4 px-4 text-center text-gray-800 font-medium">{topic.name}</td>
                                        <td className="py-4 px-4 text-center text-gray-600">{topic.description}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${topic.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {topic.status ? 'Hiển thị' : 'Ẩn'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    className={`p-2 rounded ${topic.status ? 'bg-green-500' : 'bg-gray-400'
                                                        } text-white hover:opacity-80 transition duration-150`}
                                                    onClick={() => handleToggleStatus(topic.id)}
                                                    title="Bật/tắt trạng thái"
                                                >
                                                    {topic.status ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/topic/detail/${topic.id}`)}
                                                    className="bg-yellow-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/topic/update/${topic.id}`)}
                                                    className="bg-blue-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveToTrash(topic.id)}
                                                    className="bg-red-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                                                    title="Chuyển vào thùng rác"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">Không có topic nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TopicList;