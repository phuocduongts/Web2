import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaTimes } from 'react-icons/fa';
import BannerService from '../../../services/BannerService';

const BannerCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        status: true,
        image: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            if (files[0]) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: files[0]
                }));
                setPreviewImage(URL.createObjectURL(files[0]));
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề không được để trống';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Tạo FormData để gửi cho BannerService
        const formSubmit = new FormData();
        formSubmit.append('title', formData.title);
        formSubmit.append('status', formData.status ? 1 : 0); // Nếu backend nhận 1/0 thay vì true/false
        if (formData.image) {
            formSubmit.append('image', formData.image);
        }

        try {
            await BannerService.create(formSubmit);
            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/banner');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi tạo banner.';
            alert(errorMessage);
            console.error('Error creating banner:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/banner');
    };

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">
                    <span>Thêm Banner Mới</span>
                </h1>
                <button
                    className="bg-gray-500 hover:opacity-80 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    onClick={handleCancel}
                >
                    <FaArrowLeft className="mr-2" />
                    Trở về
                </button>
            </div>

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Thêm banner thành công!
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                            Tiêu đề banner <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Nhập tiêu đề banner"
                            required
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">
                            Hình ảnh banner
                        </label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleChange}
                            accept="image/*"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {previewImage && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-1">Hình ảnh preview:</p>
                                <img src={previewImage} alt="Preview" className="h-40 object-contain border rounded-md" />
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Hiển thị banner</span>
                        </label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:opacity-80 inline-flex items-center transition duration-150"
                        >
                            <FaTimes className="mr-2" /> Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:opacity-80 inline-flex items-center transition duration-150"
                            disabled={isSubmitting}
                        >
                            <FaSave className="mr-2" />
                            {isSubmitting ? 'Đang xử lý...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BannerCreate;