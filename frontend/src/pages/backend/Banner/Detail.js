import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const BannerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [banner, setBanner] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:8080/api/banners/${id}`);
                setBanner(res.data);
            } catch (err) {
                console.error('Error loading banner:', err);
                setError('Không thể tải thông tin banner.');
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, [id]);

    const handleBack = () => {
        navigate('/admin/banner');
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

    if (error) {
        return (
            <div className="container mx-auto mt-8 px-4 font-mono">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
                <button
                    onClick={handleBack}
                    className="bg-gray-500 hover:opacity-80 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                >
                    <FaArrowLeft className="mr-2" /> Trở về
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">
                    <span>Chi tiết banner</span>
                </h1>
                <button
                    onClick={handleBack}
                    className="bg-gray-500 hover:opacity-80 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                >
                    <FaArrowLeft className="mr-2" /> Trở về
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="border-b pb-2">
                            <h3 className="text-gray-500 text-sm font-medium">ID</h3>
                            <p className="font-medium text-gray-800">{banner.id}</p>
                        </div>

                        <div className="border-b pb-2">
                            <h3 className="text-gray-500 text-sm font-medium">Tiêu đề</h3>
                            <p className="font-medium text-gray-800">{banner.title}</p>
                        </div>

                        {banner.link && (
                            <div className="border-b pb-2">
                                <h3 className="text-gray-500 text-sm font-medium">Liên kết</h3>
                                <p className="font-medium text-gray-800">{banner.link}</p>
                            </div>
                        )}

                        <div className="border-b pb-2">
                            <h3 className="text-gray-500 text-sm font-medium">Trạng thái</h3>
                            <div className="flex items-center mt-1">
                                {banner.status ? (
                                    <>
                                        <FaCheckCircle className="text-green-500 mr-2" />
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Hiển thị
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <FaTimesCircle className="text-gray-500 mr-2" />
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Ẩn
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {banner.created_at && (
                            <div className="border-b pb-2">
                                <h3 className="text-gray-500 text-sm font-medium">Ngày tạo</h3>
                                <p className="font-medium text-gray-800">
                                    {new Date(banner.created_at).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        )}

                        {banner.updated_at && (
                            <div className="pb-2">
                                <h3 className="text-gray-500 text-sm font-medium">Cập nhật lần cuối</h3>
                                <p className="font-medium text-gray-800">
                                    {new Date(banner.updated_at).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-2">Hình ảnh banner</h3>
                        {banner.image ? (
                            <div className="rounded-md p-1 bg-gray-50">
                                <img
                                    src={`http://localhost:8080/uploads/banners/${banner.image}`}
                                    alt={banner.title}
                                    className="w-full object-contain rounded"
                                    style={{ maxHeight: '300px' }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md border border-dashed border-gray-300">
                                <p className="text-gray-500 text-sm">Không có hình ảnh</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerDetail;