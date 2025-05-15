import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';

const BannerUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        status: true,
        image: null,
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/banners/${id}`);
                const banner = res.data;

                setForm({
                    title: banner.title || '',
                    status: banner.status !== undefined ? banner.status : true,
                    image: null,
                });

                if (banner.image) {
                    setCurrentImage(`http://localhost:8080/uploads/banners/${banner.image}`);
                }
            } catch (err) {
                console.error('Error fetching banner:', err);
                setError('Không thể tải dữ liệu banner.');
            }
        };

        fetchBanner();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            if (files[0]) {
                setForm({ ...form, image: files[0] });
                setPreviewImage(URL.createObjectURL(files[0]));
            }
        } else if (type === 'checkbox') {
            setForm({ ...form, [name]: checked });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('status', form.status ? 1 : 0);

        if (form.image) {
            formData.append('image', form.image);
        }

        try {
            await axios.put(`http://localhost:8080/api/banners/${id}`, formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/banner');
            }, 2000);
        } catch (err) {
            console.error('Error updating banner:', err);
            setError('Cập nhật banner thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/banner');
    };

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">
                    <span>Cập nhật banner</span>
                </h1>
                <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:opacity-80 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                >
                    <FaArrowLeft className="mr-2" /> Trở về
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Cập nhật banner thành công!
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề banner <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="Nhập tiêu đề banner"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh banner</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleChange}
                            accept="image/*"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2">
                            {previewImage && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Hình ảnh mới:</p>
                                    <img src={previewImage} alt="Preview" className="h-40 object-contain border rounded-md" />
                                </div>
                            )}
                            {currentImage && !previewImage && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Hình ảnh hiện tại:</p>
                                    <img src={currentImage} alt="Current" className="h-40 object-contain border rounded-md" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="status"
                            checked={form.status}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Hiển thị banner</label>
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
                            disabled={loading}
                        >
                            <FaSave className="mr-2" />
                            {loading ? 'Đang xử lý...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BannerUpdate;