import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import ProductCard from '../../components/ProductCard';

const ProductSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const keyword = searchParams.get('keyword') || '';
    
    // State management
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 12;

    useEffect(() => {
        // Get page parameter from URL if present
        const pageFromUrl = searchParams.get('page');
        if (pageFromUrl) {
            setCurrentPage(parseInt(pageFromUrl));
        }

        fetchCategories();
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const response = await CategoryService.index();
            const activeCategories = Array.isArray(response)
                ? response.filter(cat => cat.status !== 0)
                : [];
            setCategories(activeCategories);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build parameters object
            const params = {
                page: currentPage,
                limit: productsPerPage,
                q: keyword
            };

            const response = await ProductService.search(params);

            if (response && response.products && Array.isArray(response.products)) {
                setProducts(response.products);
                setTotalPages(Math.ceil(response.total / productsPerPage));
                setTotalProducts(response.total);
            } else if (Array.isArray(response)) {
                setProducts(response);
                setTotalPages(Math.ceil(response.length / productsPerPage));
                setTotalProducts(response.length);
            } else {
                setProducts([]);
                setTotalPages(1);
                setTotalProducts(0);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Không thể tải danh sách sản phẩm.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, keyword]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        updateUrlParams('page', pageNumber.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const updateUrlParams = (key, value, resetPage = false) => {
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        if (resetPage) {
            params.set('page', '1');
            setCurrentPage(1);
        }

        setSearchParams(params);
    };

    const renderPagination = () => {
        const pages = [];

        pages.push(
            <button
                key="prev"
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 mx-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                aria-label="Previous page"
            >
                &laquo;
            </button>
        );

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 1 && i <= currentPage + 1)
            ) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-1 mx-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        aria-label={`Page ${i}`}
                    >
                        {i}
                    </button>
                );
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pages.push(
                    <span key={i} className="px-2">
                        ...
                    </span>
                );
            }
        }

        pages.push(
            <button
                key="next"
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 mx-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                aria-label="Next page"
            >
                &raquo;
            </button>
        );

        return pages;
    };

    return (
        <div className="container mx-auto px-16 py-8">
            <h1 className="text-2xl font-mono text-gray-800 mb-6">
                Kết quả tìm kiếm cho: <span className="font-bold">"{keyword}"</span>
            </h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Main content */}
                <div className="w-full">
                    {/* Product count */}
                    <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                        <div className="text-sm text-gray-600 font-mono">
                            {loading ? 'Đang tải...' : `Hiển thị ${products.length} / ${totalProducts} sản phẩm`}
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Loading state */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-gray-600 font-mono">Đang tải sản phẩm...</div>
                        </div>
                    )}

                    {/* No products found */}
                    {!loading && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <p className="text-xl text-gray-600 mb-4">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{keyword}"</p>
                            <p className="text-gray-500 mb-6">Vui lòng thử lại với từ khóa khác hoặc xem các sản phẩm của chúng tôi</p>
                            <button
                                onClick={() => navigate('/tat-ca-san-pham')}
                                className="px-6 py-2 bg-black text-white hover:bg-gray-800 font-mono"
                            >
                                Xem tất cả sản phẩm
                            </button>
                        </div>
                    )}

                    {/* Products grid */}
                    {!loading && products.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {products.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        image={product.image ? `http://localhost:8080/uploads/products/${product.image}` : '/placeholder-product.jpg'}
                                        name={product.name}
                                        price={product.price}
                                        discountPrice={product.priceSale}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="flex justify-center mt-8">
                                    {renderPagination()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductSearch;