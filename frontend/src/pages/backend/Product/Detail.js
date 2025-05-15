import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductService from '../../../services/ProductService';
import { FaArrowLeft, FaEdit, FaTrashAlt } from 'react-icons/fa';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await ProductService.getById(id);
                setProduct(data);
            } catch (err) {
                console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
                setError('Không thể tải chi tiết sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleMoveToTrash = async () => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn chuyển sản phẩm này vào thùng rác?");
        if (confirmDelete) {
            try {
                await ProductService.moveToTrash(id);
                alert('Chuyển sản phẩm vào thùng rác thành công!');
                navigate('/admin/product');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác. Vui lòng thử lại.');
                console.error('Error moving product to trash:', err);
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
                } catch (error) {
                    console.error('Error loading image:', error);
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

    if (loading) return (
        <div className="container mx-auto mt-8 px-4 text-center font-mono">
            <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-300"></div>
            </div>
            <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
        </div>
    );

    if (error) return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <p>{error}</p>
                </div>
            </div>
        </div>
    );

    if (!product) return (
        <div className="container mx-auto mt-8 px-4 text-center font-mono">
            <div className="p-8 text-gray-500">Sản phẩm không tồn tại.</div>
        </div>
    );

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">
                    <span>Chi tiết Sản phẩm</span>
                </h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => navigate('/admin/product')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    >
                        <FaArrowLeft className="mr-2" /> Danh sách
                    </button>
                    <button
                        onClick={() => navigate(`/admin/product/update/${id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    >
                        <FaEdit className="mr-2" /> Chỉnh sửa
                    </button>
                    <button
                        onClick={handleMoveToTrash}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    >
                        <FaTrashAlt className="mr-2" /> Xóa
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/3">
                            {product.image ? (
                                <AuthenticatedImage 
                                    src={`http://localhost:8080/uploads/products/${product.image}`} 
                                    alt={product.name}
                                    className="w-full h-auto object-contain rounded-md border border-gray-200"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                                    <span className="text-gray-400 font-mono">No Image</span>
                                </div>
                            )}
                        </div>

                        <div className="md:w-2/3">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">ID: <span className="text-gray-700">{product.id}</span></p>
                                    <h2 className="text-2xl font-semibold text-gray-800 mt-1">{product.name}</h2>
                                </div>
                                
                                <div className="lg:col-span-2">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <span className="text-xl font-bold text-gray-800">
                                            {product.priceSale > 0 ? formatCurrency(product.priceSale) : formatCurrency(product.price)}
                                        </span>
                                        
                                        {product.priceSale > 0 && (
                                            <span className="text-lg text-gray-500 line-through">
                                                {formatCurrency(product.price)}
                                            </span>
                                        )}
                                        
                                        {product.sale > 0 && (
                                            <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                                -{product.sale}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin sản phẩm</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Số lượng:</span> 
                                            <span className="text-sm font-medium">{product.quantity || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Danh mục:</span>
                                            <span className="text-sm font-medium">{product.category?.name || 'Không có'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Trạng thái:</span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${product.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {product.status ? 'Hiển thị' : 'Ẩn'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Lượt xem:</span>
                                            <span className="text-sm font-medium">{product.view || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Ngày tạo:</span>
                                            <span className="text-sm font-medium">
                                                {product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Cập nhật:</span>
                                            <span className="text-sm font-medium">
                                                {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Thông số kỹ thuật</h3>
                                    <div className="space-y-2">
                                        {product.details && Object.entries(product.details).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <span className="text-sm text-gray-600">{key}:</span>
                                                <span className="text-sm font-medium">{value}</span>
                                            </div>
                                        ))}
                                        {(!product.details || Object.keys(product.details).length === 0) && (
                                            <span className="text-sm text-gray-500">Không có thông số</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {product.description && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Mô tả:</h3>
                                    <div className="text-sm text-gray-600 whitespace-pre-line p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        {product.description}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;