import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import ProductService from '../../../services/ProductService';

const ProductCreate = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        priceSale: '',
        image: null,
        categoryId: '',
        quantity: 0,
        isOnSale: false, // Fixed field name here (was isOneSale)
        view: 0,
        status: true,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch categories
                const categoriesResponse = await axios.get('http://localhost:8080/api/categories');
                setCategories(categoriesResponse.data);

                // Set default category if available
                if (categoriesResponse.data.length > 0) {
                    setForm(prev => ({ ...prev, categoryId: categoriesResponse.data[0].id }));
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Có lỗi xảy ra khi tải danh mục. Vui lòng thử lại sau.');
            }
        };

        fetchCategories();
    }, []);

    // Update isOnSale when price or priceSale changes
    useEffect(() => {
        if (form.price && form.priceSale && Number(form.price) > 0 && Number(form.priceSale) > 0) {
            const regularPrice = Number(form.price);
            const salePrice = Number(form.priceSale);

            // If sale price is less than regular price, mark as on sale
            if (salePrice < regularPrice) {
                setForm(prev => ({ ...prev, isOnSale: true }));
            }
        }
    }, [form.price, form.priceSale]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            if (files[0]) {
                setForm({ ...form, image: files[0] });
                // Create preview URL
                setPreviewImage(URL.createObjectURL(files[0]));
            }
        } else if (type === 'checkbox') {
            setForm({ ...form, [name]: checked });
        } else if (type === 'number') {
            setForm({ ...form, [name]: value === '' ? '' : Number(value) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    // Toggle isOnSale directly
    const handleIsOnSaleChange = (e) => {
        const isChecked = e.target.checked;
        setForm({ ...form, isOnSale: isChecked });

        // If turning off sale, clear sale price
        if (!isChecked) {
            setForm(prev => ({ ...prev, priceSale: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Create FormData object
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('categoryId', form.categoryId);

        // Optional fields
        if (form.priceSale) formData.append('priceSale', form.priceSale);
        
        // Fix: Convert boolean to string "true" or "false" explicitly
        formData.append('isOnSale', form.isOnSale.toString());
        
        if (form.quantity) formData.append('quantity', form.quantity);
        formData.append('status', form.status.toString());
        formData.append('view', form.view);

        // Append image if it exists
        if (form.image) {
            formData.append('image', form.image);
        }

        try {
            // Create new product
            await ProductService.create(formData);
            setSuccess(true);
            // Reset form after successful submission
            setForm({
                name: '',
                description: '',
                price: '',
                priceSale: '',
                image: null,
                categoryId: categories.length > 0 ? categories[0].id : '',
                quantity: 0,
                isOnSale: false, // Fixed field name here
                view: 0,
                status: true,
            });
            setPreviewImage(null);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error creating product:', err);
            setError('Không thể thêm sản phẩm. Vui lòng kiểm tra lại thông tin và thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/product');
    };

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-mono font-medium text-gray-800">
                    <span >Thêm Sản phẩm mới</span>
                </h1>
                <button
                    onClick={() => navigate('/admin/product')}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md inline-flex items-center text-sm font-mono shadow-md transition duration-150"
                >
                    <FaArrowLeft className="mr-2" /> Trở về
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-md font-mono text-sm">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded-md font-mono text-sm">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p>Thêm sản phẩm thành công!</p>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <form onSubmit={handleSubmit} className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Tên sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập tên sản phẩm"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Danh mục <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="categoryId"
                                value={form.categoryId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                                required
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Giá (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                placeholder="100000"
                                value={form.price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Giá khuyến mãi (VNĐ)
                            </label>
                            <input
                                type="number"
                                name="priceSale"
                                value={form.priceSale}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                                disabled={!form.isOnSale}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-mono font-medium text-gray-700">
                                Số lượng
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-1 flex items-center">
                            <div className="flex items-center h-full pt-6">
                                <input
                                    type="checkbox"
                                    id="isOnSale"
                                    name="isOnSale"
                                    checked={form.isOnSale}
                                    onChange={handleIsOnSaleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isOnSale" className="ml-2 text-sm text-gray-700 font-mono">
                                    Sản phẩm đang giảm giá
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="block text-sm font-mono font-medium text-gray-700 mb-1">
                            Mô tả sản phẩm
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                            placeholder="Nhập mô tả sản phẩm..."
                        ></textarea>
                    </div>

                    <div className="mt-5">
                        <label className="block text-sm font-mono font-medium text-gray-700 mb-1">
                            Hình ảnh sản phẩm
                        </label>
                        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                            <input
                                type="file"
                                name="image"
                                onChange={handleChange}
                                accept="image/*"
                                className="w-full text-sm font-mono"
                            />
                            {previewImage && (
                                <div className="flex items-center">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="h-20 object-contain border rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewImage(null);
                                            setForm(prev => ({ ...prev, image: null }));
                                        }}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 flex items-center">
                        <input
                            type="checkbox"
                            id="status"
                            name="status"
                            checked={form.status}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="status" className="ml-2 text-sm text-gray-700 font-mono">
                            Hiển thị sản phẩm (đang hoạt động)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 inline-flex items-center transition duration-150 text-sm font-mono"
                        >
                            <FaTimes className="mr-2" /> Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center transition duration-150 text-sm font-mono"
                        >
                            <FaSave className="mr-2" />
                            {loading ? 'Đang xử lý...' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductCreate;