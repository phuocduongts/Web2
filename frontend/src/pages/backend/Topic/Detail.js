import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopicService from '../../../services/TopicService';
import { FaArrowLeft } from 'react-icons/fa';

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const data = await TopicService.detail(id);
        setTopic(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching topic details:', err);
        setError('Không thể tải thông tin topic. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  return (
    <div className="container mx-auto mt-8 px-4 font-mono">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-700">
          <span>Chi tiết Topic</span>
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
          topic && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">ID</h3>
                    <p className="mt-1 text-lg text-gray-900">{topic.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tên Topic</h3>
                    <p className="mt-1 text-lg text-gray-900 font-medium">{topic.name}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái</h3>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          topic.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {topic.status ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Mô tả</h3>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">{topic.description || 'Không có mô tả'}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TopicDetail;