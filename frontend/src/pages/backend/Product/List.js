import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaToggleOn, FaToggleOff, FaEye, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import ProductService from '../../../services/ProductService';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                ProductService.getAll(),
                fetch('http://localhost:8080/api/categories').then(res => res.json())
            ]);

            setProducts(productsData);
            setCategories(categoriesData);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMoveToTrash = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn chuyển sản phẩm này vào thùng rác?");
        if (confirmDelete) {
            try {
                await ProductService.moveToTrash(id);
                fetchProducts();
                alert('Chuyển sản phẩm vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác. Vui lòng thử lại.');
                console.error('Error moving product to trash:', err);
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await ProductService.toggleStatus(id);
            fetchProducts();
            alert('Cập nhật trạng thái thành công!');
        } catch (err) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.');
            console.error('Error updating product status:', err);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount);
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
            setSelectedItems(products.map(product => product.id));
        }
        setSelectAll(!selectAll);
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn chuyển ${selectedItems.length} sản phẩm vào thùng rác?`);
        if (confirmDelete) {
            try {
                await Promise.all(selectedItems.map(id => ProductService.moveToTrash(id)));
                fetchProducts();
                setSelectedItems([]);
                setSelectAll(false);
                alert('Chuyển sản phẩm vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác. Vui lòng thử lại.');
                console.error('Error moving products to trash:', err);
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
                    <span>Danh sách Sản phẩm</span>
                </h1>
                <div className="flex space-x-3">
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                        onClick={() => handleNavigate('/admin/product/create')}
                    >
                        <FaPlus className="mr-2" />
                        Thêm
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                        onClick={() => handleNavigate('/admin/product/trash')}
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
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {products && products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                checked={selectedItems.includes(product.id)}
                                                onChange={() => handleSelectItem(product.id)}
                                            />
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            {product.image ? (
                                                <AuthenticatedImage
                                                    src={`http://localhost:8080/uploads/products/${product.image}`}
                                                    alt={product.name}
                                                    className="h-12 w-12 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <span className="text-gray-500 text-xs">No img</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-800">{product.name}</td>
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                                            {product.category ? product.category.name : 'N/A'}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                                            <div>{formatCurrency(product.price)}</div>
                                            {product.priceSale > 0 && (
                                                <div className="text-xs text-red-600">
                                                    Sale: {formatCurrency(product.priceSale)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-500">{product.quantity || 0}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.status === true
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {product.status === true ? 'Hiển thị' : 'Ẩn'}
                                            </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <div className="flex space-x-1">
                                                <button
                                                    className={`p-1.5 rounded ${product.status === true ? 'bg-green-500' : 'bg-gray-400'
                                                        } text-white hover:opacity-80 transition-opacity`}
                                                    onClick={() => handleToggleStatus(product.id)}
                                                    title={product.status === true ? "Đang hiển thị" : "Đang ẩn"}
                                                >
                                                    {product.status === true ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                                <button
                                                    onClick={() => handleNavigate(`/admin/product/detail/${product.id}`)}
                                                    className="bg-yellow-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="bg-blue-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                    onClick={() => handleNavigate(`/admin/product/update/${product.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="bg-red-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                    onClick={() => handleMoveToTrash(product.id)}
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
                                    <td colSpan="9" className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14v.01M12 20h.01M18 10a6 6 0 00-12 0" />
                                            </svg>
                                            <span className="block mt-2">Không có sản phẩm nào</span>
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
                    {products.length > 0 && (
                        <span>Hiển thị {products.length} sản phẩm</span>
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
                        className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition duration-150 ${selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
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

export default ProductList;