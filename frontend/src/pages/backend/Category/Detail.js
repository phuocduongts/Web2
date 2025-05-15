import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import CategoryService from '../../../services/CategoryService';

const CategoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                const data = await CategoryService.detail(id);
                setCategory(data);
                setError(null);
            } catch (err) {
                setError('Không thể tải thông tin danh mục. Vui lòng thử lại sau.');
                console.error("Lỗi khi lấy thông tin:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto mt-8 px-4 text-center font-mono">
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
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">
                    <span>Chi tiết Danh mục</span>
                </h1>
                <div className="flex space-x-3">
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                        onClick={() => navigate(`/admin/category/update/${id}`)}
                    >
                        <FaEdit className="mr-2" />
                        Chỉnh sửa
                    </button>
                    <button
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                        onClick={() => navigate('/admin/category')}
                    >
                        <FaArrowLeft className="mr-2" />
                        Quay lại
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

            {category && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex border-b pb-2">
                                    <span className="font-medium text-gray-600 w-32">ID:</span>
                                    <span className="text-gray-800">{category.id}</span>
                                </div>
                                <div className="flex border-b pb-2">
                                    <span className="font-medium text-gray-600 w-32">Tên danh mục:</span>
                                    <span className="text-gray-800">{category.name}</span>
                                </div>
                                <div className="flex border-b pb-2">
                                    <span className="font-medium text-gray-600 w-32">Danh mục cha:</span>
                                    <span className="text-gray-800">{category.parent ? category.parent.name : "Không có"}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex border-b pb-2">
                                    <span className="font-medium text-gray-600 w-32">Trạng thái:</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        category.status === true 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {category.status === true ? 'Hiển thị' : 'Ẩn'}
                                    </span>
                                </div>
                                <div className="flex border-b pb-2">
                                    <span className="font-medium text-gray-600 w-32">Đã xóa:</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        category.deleted 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {category.deleted ? 'Đã xóa' : 'Chưa xóa'}
                                    </span>
                                </div>
                                <div className="flex border-b pb-2">
                                    <span className="font-medium text-gray-600 w-32">Slug:</span>
                                    <span className="text-gray-800">{category.slug || "Không có"}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <h3 className="font-medium text-gray-600 mb-2">Mô tả:</h3>
                            <div className="bg-gray-50 p-3 rounded border">
                                {category.description || "Không có mô tả"}
                            </div>
                        </div>
                        
                        {category.createdAt && (
                            <div className="pt-4 text-sm text-gray-500">
                                Tạo lúc: {new Date(category.createdAt).toLocaleString('vi-VN')}
                                {category.updatedAt && category.updatedAt !== category.createdAt && 
                                    ` | Cập nhật lúc: ${new Date(category.updatedAt).toLocaleString('vi-VN')}`}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryDetail;