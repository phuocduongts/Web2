import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaToggleOn, FaToggleOff, FaEye, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import BannerService from '../../../services/BannerService';

const BannerList = () => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await BannerService.index();
            setBanners(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching banners:', err);
            setError('Không thể tải danh sách banner. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleMoveToTrash = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn chuyển banner này vào thùng rác?");
        if (confirmDelete) {
            try {
                await BannerService.moveToTrash(id);
                fetchBanners();
                alert('Chuyển banner vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác. Vui lòng thử lại.');
                console.error('Error moving banner to trash:', err);
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await BannerService.status(id);
            fetchBanners();
            alert('Cập nhật trạng thái thành công!');
        } catch (err) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.');
            console.error('Error updating banner status:', err);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(banners.map(banner => banner.id));
        }
        setSelectAll(!selectAll);
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một banner');
            return;
        }

        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn chuyển ${selectedItems.length} banner vào thùng rác?`);
        if (confirmDelete) {
            try {
                await Promise.all(selectedItems.map(id => BannerService.moveToTrash(id)));
                fetchBanners();
                setSelectedItems([]);
                setSelectAll(false);
                alert('Chuyển banner vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác. Vui lòng thử lại.');
                console.error('Error moving banners to trash:', err);
            }
        }
    };

    const AuthenticatedImage = ({ src, alt, className }) => {
        const [imageSrc, setImageSrc] = useState(null);

        useEffect(() => {
            const fetchImage = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(src, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const blob = await response.blob();
                        setImageSrc(URL.createObjectURL(blob));
                    } else {
                        setImageSrc('/placeholder-image.jpg');
                    }
                } catch {
                    setImageSrc('/placeholder-image.jpg');
                }
            };
            fetchImage();

            return () => {
                if (imageSrc && imageSrc.startsWith('blob:')) {
                    URL.revokeObjectURL(imageSrc);
                }
            };
        }, [src]);

        return <img src={imageSrc || '/loading-placeholder.jpg'} alt={alt} className={className} />;
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
                    <span>Danh sách Banner</span>
                </h1>
                <div className="flex space-x-3">
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                        onClick={() => handleNavigate('/admin/banner/create')}
                    >
                        <FaPlus className="mr-2" />
                        Thêm
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                        onClick={() => handleNavigate('/admin/banner/trash')}
                    >
                        <FaTrashAlt className="mr-2" />
                        Thùng rác
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
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {banners.length > 0 ? (
                                banners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                checked={selectedItems.includes(banner.id)}
                                                onChange={() => handleSelectItem(banner.id)}
                                            />
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-500">{banner.id}</td>
                                        <td className="p-3 whitespace-nowrap text-center">
                                            <AuthenticatedImage
                                                src={`http://localhost:8080/uploads/banners/${banner.image}`}
                                                alt={banner.title}
                                                className="h-16 w-32 object-cover rounded mx-auto"
                                            />
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-800">{banner.title}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                banner.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {banner.status ? 'Hiển thị' : 'Ẩn'}
                                            </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <div className="flex space-x-1">
                                                <button
                                                    className={`p-1.5 rounded ${
                                                        banner.status ? 'bg-green-500' : 'bg-gray-400'
                                                    } text-white hover:opacity-80 transition-opacity`}
                                                    onClick={() => handleToggleStatus(banner.id)}
                                                    title={banner.status ? "Đang hiển thị" : "Đang ẩn"}
                                                >
                                                    {banner.status ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate(`/admin/banner/detail/${banner.id}`)}
                                                    className="bg-yellow-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="bg-blue-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                    onClick={() => handleNavigate(`/admin/banner/update/${banner.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="bg-red-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                    onClick={() => handleMoveToTrash(banner.id)}
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
                                    <td colSpan="6" className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14v.01M12 20h.01M18 10a6 6 0 00-12 0" />
                                            </svg>
                                            <span className="block mt-2">Không có banner nào</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    {banners.length > 0 && (
                        <span>Hiển thị {banners.length} banner</span>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm transition duration-150"
                        onClick={handleSelectAll}
                    >
                        {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                    <button
                        className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition duration-150 ${
                            selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleDeleteSelected}
                        disabled={selectedItems.length === 0}
                    >
                        Xóa {selectedItems.length > 0 && `(${selectedItems.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannerList;