import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUndo, FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import TopicService from '../../../services/TopicService';

const TopicTrashList = () => {
  const navigate = useNavigate();
  const [trashedTopics, setTrashedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrashedTopics();
  }, []);

  const fetchTrashedTopics = async () => {
    try {
      setLoading(true);
      const data = await TopicService.getTrash();
      setTrashedTopics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trashed topics:', err);
      setError('Không thể tải danh sách topic đã xóa. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục topic này?")) {
      try {
        await TopicService.restoreFromTrash(id);
        fetchTrashedTopics();
        alert('Khôi phục topic thành công!');
      } catch (err) {
        alert('Có lỗi xảy ra khi khôi phục topic.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn topic này?")) {
      try {
        await TopicService.delete(id);
        fetchTrashedTopics();
        alert('Xóa topic vĩnh viễn thành công!');
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa topic.');
      }
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4 font-mono">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-700">
          <span>Thùng rác - Topic</span>
        </h1>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
          onClick={() => navigate('/admin/topic')}
        >
          <FaArrowLeft className="mr-2" />
          Quay lại danh sách
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
                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Mô tả</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trashedTopics.length > 0 ? (
                trashedTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="py-4 px-4 text-center text-gray-600">{topic.id}</td>
                    <td className="py-4 px-4 text-center text-gray-800 font-medium">{topic.name}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{topic.description}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleRestore(topic.id)}
                          className="bg-blue-500 p-2 text-white rounded hover:opacity-80 transition duration-150"
                          title="Khôi phục"
                        >
                          <FaUndo />
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
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
                  <td colSpan="4" className="text-center py-12 text-gray-500">Không có topic nào trong thùng rác</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TopicTrashList;