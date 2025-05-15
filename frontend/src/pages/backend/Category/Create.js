import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import CategoryService from '../../../services/CategoryService';

const CategoryCreate = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(true);
    const [parentId, setParentId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await CategoryService.index();
            console.log('API Response in CategoryCreate:', response); // Debug log
            
            // Try different data structures that might be returned by the API
            let categoriesData = [];
            
            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    categoriesData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    categoriesData = response.data.data;
                } else if (response.data.categories && Array.isArray(response.data.categories)) {
                    categoriesData = response.data.categories;
                } else if (typeof response.data === 'object') {
                    // If it's an object with category items
                    categoriesData = Object.values(response.data);
                }
            } else if (Array.isArray(response)) {
                categoriesData = response;
            }
            
            console.log('Processed Categories Data in Create:', categoriesData); // Debug log
            
            setCategories(categoriesData);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Không thể lấy danh sách danh mục. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = { 
                name, 
                description, 
                status: status === true || status === 'true' ? 1 : 0, 
                parentId: parentId === '' ? null : parentId 
            };
            
            console.log('Submitting data:', data); // Debug log
            
            await CategoryService.create(data);
            alert('Thêm danh mục thành công!');
            navigate('/admin/category');
        } catch (err) {
            setError('Có lỗi xảy ra khi thêm danh mục. Vui lòng thử lại.');
            console.error('Error creating category:', err);
        }
    };

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
                    <span>Thêm Danh mục mới</span>
                </h1>
                <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    onClick={() => navigate('/admin/category')}
                >
                    <FaArrowLeft className="mr-2" />
                    Quay lại
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
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập tên danh mục"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Danh mục cha</label>
                            <select
                                value={parentId || ''}
                                onChange={(e) => setParentId(e.target.value || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Không có</option>
                                {categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Không có danh mục nào</option>
                                )}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                            <select
                                value={status.toString()}
                                onChange={(e) => setStatus(e.target.value === 'true')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="true">Hiển thị</option>
                                <option value="false">Ẩn</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập mô tả danh mục"
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/category')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition duration-150 inline-flex items-center"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-150 inline-flex items-center"
                        >
                            <FaSave className="mr-2" />
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryCreate;