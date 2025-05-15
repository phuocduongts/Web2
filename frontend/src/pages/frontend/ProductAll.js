import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import CategoryService from '../../services/CategoryService';
import ProductService from '../../services/ProductService';

const ProductAll = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Get parameters from URL if present
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('q');
    const pageFromUrl = searchParams.get('page');
    const sortFromUrl = searchParams.get('sort');
    const minPriceFromUrl = searchParams.get('minPrice');
    const maxPriceFromUrl = searchParams.get('maxPrice');

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }

    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }

    if (pageFromUrl) {
      setCurrentPage(parseInt(pageFromUrl));
    }

    if (sortFromUrl) {
      setSortOption(sortFromUrl);
    }

    if (minPriceFromUrl || maxPriceFromUrl) {
      setPriceRange({
        min: minPriceFromUrl || '',
        max: maxPriceFromUrl || ''
      });
    }

    fetchCategories();
  }, [searchParams]);

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, sortOption, searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.index();
      // Filter only active categories
      const activeCategories = Array.isArray(response)
        ? response.filter(category => category.status !== 0)
        : [];
      setCategories(activeCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Không thể tải các danh mục sản phẩm.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build parameters object
      const params = {
        page: currentPage,
        limit: productsPerPage
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (priceRange.min) {
        params.minPrice = priceRange.min;
      }

      if (priceRange.max) {
        params.maxPrice = priceRange.max;
      }

      if (searchQuery) {
        params.q = searchQuery;
      }

      // Add sort parameter
      if (sortOption === 'price_asc') {
        params.sort = 'price';
        params.order = 'asc';
      } else if (sortOption === 'price_desc') {
        params.sort = 'price';
        params.order = 'desc';
      } else if (sortOption === 'newest') {
        params.sort = 'created_at';
        params.order = 'desc';
      }

      // Use the search method instead of getAll to properly handle the search parameters
      const response = await ProductService.search(params);

      // Handle the response format correctly
      if (response && response.products && Array.isArray(response.products)) {
        setProducts(response.products);
        setTotalPages(Math.ceil(response.total / productsPerPage));
        setTotalProducts(response.total);
      } else if (Array.isArray(response)) {
        // If the API returns just an array of products
        setProducts(response);
        setTotalPages(Math.ceil(response.length / productsPerPage));
        setTotalProducts(response.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    updateUrlParams('category', categoryId, true);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    updateUrlParams('sort', value, true);
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams('q', searchQuery, true);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams);

    // Update both price params at once
    if (priceRange.min) {
      params.set('minPrice', priceRange.min);
    } else {
      params.delete('minPrice');
    }

    if (priceRange.max) {
      params.set('maxPrice', priceRange.max);
    } else {
      params.delete('maxPrice');
    }

    // Reset to page 1
    params.set('page', '1');

    setSearchParams(params);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    updateUrlParams('page', pageNumber.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to update URL parameters
  const updateUrlParams = (key, value, resetPage = false) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    if (resetPage) {
      params.set('page', '1');
      setCurrentPage(1);
    }

    setSearchParams(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('');
    setSortOption('default');
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
    setCurrentPage(1);

    // Clear all params except page
    const params = new URLSearchParams();
    params.set('page', '1');
    setSearchParams(params);
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const pages = [];

    // Add previous button
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

    // Add page numbers
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

    // Add next button
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

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return selectedCategory ||
      sortOption !== 'default' ||
      priceRange.min ||
      priceRange.max ||
      searchQuery;
  };

  return (
    <div className="container mx-auto px-16 py-8">
      <h1 className="text-2xl font-mono text-gray-800 mb-6">TẤT CẢ SẢN PHẨM</h1>

      {/* Search bar - top of page */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm sản phẩm..."
            className="border border-gray-300 rounded-l-sm px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with filters */}
        <div className="w-full md:w-1/4">
          {/* Active filters summary */}
          {hasActiveFilters() && (
            <div className="border border-gray-200 rounded-sm p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-mono">BỘ LỌC ĐÃ CHỌN</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="space-y-2 mt-2">
                {selectedCategory && (
                  <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                    <span className="text-sm">Danh mục: {categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}</span>
                    <button
                      onClick={() => handleCategoryChange('')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                )}
                {sortOption !== 'default' && (
                  <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                    <span className="text-sm">
                      Sắp xếp: {
                        sortOption === 'price_asc' ? 'Giá thấp đến cao' :
                          sortOption === 'price_desc' ? 'Giá cao đến thấp' :
                            sortOption === 'newest' ? 'Mới nhất' : ''
                      }
                    </span>
                    <button
                      onClick={() => handleSortChange({ target: { value: 'default' } })}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                )}
                {(priceRange.min || priceRange.max) && (
                  <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                    <span className="text-sm">
                      Giá: {priceRange.min ? `${priceRange.min}đ` : '0đ'} - {priceRange.max ? `${priceRange.max}đ` : 'Không giới hạn'}
                    </span>
                    <button
                      onClick={() => {
                        setPriceRange({ min: '', max: '' });
                        const params = new URLSearchParams(searchParams);
                        params.delete('minPrice');
                        params.delete('maxPrice');
                        setSearchParams(params);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                )}
                {searchQuery && searchParams.get('q') && (
                  <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                    <span className="text-sm">Tìm kiếm: {searchQuery}</span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        updateUrlParams('q', '', true);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-sm p-4 mb-6">
            <h2 className="text-lg font-mono mb-4 pb-2 border-b border-gray-200">DANH MỤC</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left font-mono hover:text-blue-700 ${!selectedCategory ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                >
                  Tất cả sản phẩm
                </button>
              </li>
              {categories.map(category => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left font-mono hover:text-blue-700 ${selectedCategory === category.id ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-gray-200 rounded-sm p-4 mb-6">
            <h2 className="text-lg font-mono mb-4 pb-2 border-b border-gray-200">GIÁ</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="mr-2 font-mono text-sm text-gray-700">Từ:</span>
                <input
                  type="number"
                  name="min"
                  value={priceRange.min}
                  onChange={handlePriceRangeChange}
                  placeholder="0"
                  className="border border-gray-300 rounded-sm px-2 py-1 w-full text-sm"
                />
              </div>
              <div className="flex items-center">
                <span className="mr-2 font-mono text-sm text-gray-700">Đến:</span>
                <input
                  type="number"
                  name="max"
                  value={priceRange.max}
                  onChange={handlePriceRangeChange}
                  placeholder="999999"
                  className="border border-gray-300 rounded-sm px-2 py-1 w-full text-sm"
                />
              </div>
              <button
                onClick={applyPriceFilter}
                className="bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-mono w-full hover:bg-blue-700"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4">
          {/* Sort controls */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <div className="text-sm text-gray-600 font-mono">
              {loading ? 'Đang tải...' : `Hiển thị ${products.length} / ${totalProducts} sản phẩm`}
            </div>
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm font-mono text-gray-700">Sắp xếp:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="border border-gray-300 rounded-sm px-2 py-1 text-sm"
              >
                <option value="default">Mặc định</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
                <option value="newest">Mới nhất</option>
              </select>
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
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600 font-mono">Không tìm thấy sản phẩm nào.</div>
            </div>
          )}

          {/* Products grid */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
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
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductAll;