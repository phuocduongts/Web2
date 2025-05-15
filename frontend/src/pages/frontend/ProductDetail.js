import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductService from '../../services/ProductService';
import CartService from '../../services/CartService';
import AuthService from '../../services/AuthService';
import ProductCard from '../../components/ProductCard';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImage, setCurrentImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        setIsLoggedIn(AuthService.isAuthenticated());
    }, []);

    // Function to handle image URLs with authentication
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-image.jpg';
        return `http://localhost:8080/uploads/products/${imagePath}`;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await ProductService.getById(id);
                const productData = response.data || response;

                if (!productData) {
                    throw new Error('Product not found');
                }

                setProduct(productData);

                // Fetch related products
                if (productData.category_id || productData.category?.id) {
                    try {
                        // Use category_id directly from product or from the category object
                        const categoryId = productData.category_id || productData.category?.id;
                        const relatedResponse = await ProductService.getByCategory(categoryId);
                        console.log("Related products API response:", relatedResponse);

                        // Extract data from response properly
                        let relatedData;
                        if (relatedResponse && relatedResponse.data) {
                            // If response has data property (axios response format)
                            if (relatedResponse.data.products) {
                                // If the API returns a paginated structure with 'products' field
                                relatedData = relatedResponse.data.products;
                            } else {
                                // If the API returns an array directly in data
                                relatedData = relatedResponse.data;
                            }
                        } else {
                            // If response is the data itself
                            if (relatedResponse.products) {
                                relatedData = relatedResponse.products;
                            } else {
                                relatedData = relatedResponse;
                            }
                        }

                        // Ensure relatedData is an array
                        if (!Array.isArray(relatedData)) {
                            console.error("Related products data is not an array:", relatedData);
                            relatedData = [];
                        }

                        // Filter out the current product from related products list
                        const filteredRelatedProducts = relatedData.filter(item =>
                            item && item.id !== parseInt(id)
                        ).slice(0, 4); // Limit to 4 related products

                        console.log("Filtered related products:", filteredRelatedProducts);
                        setRelatedProducts(filteredRelatedProducts);
                    } catch (relatedErr) {
                        console.error("Error fetching related products:", relatedErr);
                        setRelatedProducts([]);
                    }
                }
            } catch (err) {
                setError('Không tìm thấy sản phẩm. Vui lòng thử lại sau.');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }

        // Cleanup
        return () => {
            setRelatedProducts([]);
        };
    }, [id]);

    const formatPrice = (amount) => {
        if (!amount) return '';
        let formatted = amount.toString().replace(/\D/g, '');
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return formatted;
    };

    const calculateDiscountPercentage = () => {
        if (!product?.discountPrice || !product?.price) return null;
        const discount = Math.round(((product.price - product.discountPrice) / product.price) * 100);
        return `-${discount}%`;
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    // Show notification
    const showNotification = (message, isError = false) => {
        setNotificationMessage({
            text: message,
            isError: isError
        });

        // Hide notification after 3 seconds
        setTimeout(() => {
            setNotificationMessage(null);
        }, 3000);
    };

    // Handle add to cart
    // Trong ProductDetail.js
    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        try {
            setIsAddingToCart(true);

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const checkResponse = await CartService.checkProductInCart(
                AuthService.getCurrentUser().id,
                product.id
            );

            if (checkResponse?.data?.exists) {
                // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
                const existingItem = checkResponse.data.cartItem;
                const newQuantity = existingItem.quantity + quantity;
                await CartService.updateQuantity(existingItem.id, newQuantity);
                showNotification(`Đã cập nhật số lượng sản phẩm "${product.name}" trong giỏ hàng`);
            } else {
                // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
                await CartService.addToCart(
                    AuthService.getCurrentUser().id,
                    product.id,
                    quantity
                );
                showNotification(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng`);
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            showNotification(`Không thể thêm sản phẩm vào giỏ hàng: ${error.message}`, true);
        } finally {
            setIsAddingToCart(false);
        }
    };
    const redirectToLogin = () => {
        setShowLoginModal(false);
        // Store the current URL for redirect after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin mx-auto" />
                        <p className="mt-2 text-xl font-mono">Đang tải chi tiết sản phẩm...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded text-center w-full max-w-md">
                        <p className="text-xl font-mono">{error || 'Không tìm thấy sản phẩm'}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare product images
    const productImages = [];

    // Add main product image
    if (product.image) {
        productImages.push(getImageUrl(product.image));
    } else {
        productImages.push('/placeholder-image.jpg');
    }

    // Add additional images if available
    if (product.gallery && Array.isArray(product.gallery)) {
        product.gallery.forEach(img => {
            productImages.push(getImageUrl(img));
        });
    }

    // Add placeholder images if we have less than 3 images
    while (productImages.length < 3) {
        productImages.push('/placeholder-image.jpg');
    }

    // Calculate discount percentage
    const discountPercentage = calculateDiscountPercentage();

    // Check for discount price from different possible field names
    const hasDiscount =
        product.is_on_sale === 1 ||
        product.priceSale > 0 ||
        product.price_sale > 0 ||
        product.discountPrice > 0;

    const actualPrice = parseFloat(product.price);
    const actualDiscountPrice = hasDiscount
        ? parseFloat(product.price_sale || product.priceSale || product.discountPrice)
        : null;

    return (
        <div className="container mx-auto px-16 py-8 font-mono">
            {/* Notification */}
            {notificationMessage && (
                <div className={`fixed top-4 right-4 p-4 shadow-md rounded-sm z-50 ${notificationMessage.isError ? 'bg-red-100 border-l-4 border-red-500 text-red-700' : 'bg-green-100 border-l-4 border-green-500 text-green-700'}`}>
                    <div className="flex items-center">
                        {notificationMessage.isError ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        <p>{notificationMessage.text}</p>
                    </div>
                </div>
            )}

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white w-full max-w-md p-6 shadow-lg rounded-sm">
                        <h2 className="text-2xl font-mono text-center mb-4">Đăng nhập</h2>
                        <p className="text-gray-700 mb-6 text-center">
                            Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={redirectToLogin}
                                className="bg-[#EB1C24] text-white px-6 py-2 rounded-sm hover:bg-red-600 transition"
                            >
                                Đăng nhập
                            </button>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-sm hover:bg-gray-300 transition"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-5xl text-center mb-6">Chi tiết sản phẩm</h2>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left column: Image gallery */}
                <div className="w-full md:w-1/2">
                    <div className="relative mb-4">
                        {discountPercentage && (
                            <div className="absolute top-2 left-2 bg-white border border-gray-200 text-[#EB1C24] text-base px-2 py-1 z-10 rounded-sm">
                                {discountPercentage}
                            </div>
                        )}
                        <img
                            src={productImages[currentImage]}
                            alt={product.name}
                            className="w-full h-auto object-cover rounded-sm"
                        />
                    </div>
                </div>

                {/* Right column: Product info */}
                <div className="w-full md:w-1/2">
                    <h1 className="text-2xl font-mono mb-2">{product.name}</h1>

                    <div className="mb-4">
                        {hasDiscount ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-[#EB1C24] text-2xl font-medium">{formatPrice(actualDiscountPrice)}₫</span>
                                <span className="text-gray-500 text-lg line-through">{formatPrice(actualPrice)}₫</span>
                            </div>
                        ) : (
                            <span className="text-2xl font-medium">{formatPrice(actualPrice)}₫</span>
                        )}
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg mb-2">Mô tả sản phẩm</h2>
                        <p className="text-gray-700">
                            {product.description || product.short_description || 'Không có mô tả cho sản phẩm này.'}
                        </p>
                    </div>

                    {product.detail && (
                        <div className="mb-6">
                            <h2 className="text-lg mb-2">Chi tiết</h2>
                            <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: product.detail }} />
                        </div>
                    )}

                    {product.specifications && (
                        <div className="mb-6">
                            <h2 className="text-lg mb-2">Specifications</h2>
                            <div className="border-t border-gray-200">
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <div key={key} className="py-2 border-b border-gray-200 flex">
                                        <span className="w-1/3 text-gray-600">{key}</span>
                                        <span className="w-2/3">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <h2 className="text-lg mb-2">Số lượng</h2>
                        <div className="flex items-center">
                            <button
                                className="border border-gray-300 px-3 py-1 text-xl"
                                onClick={decreaseQuantity}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="border-t border-b border-gray-300 text-center w-16 py-1"
                            />
                            <button
                                className="border border-gray-300 px-3 py-1 text-xl"
                                onClick={increaseQuantity}
                            >
                                +
                            </button>
                        </div>

                        {product.stock !== undefined && (
                            <p className="mt-2 text-sm text-gray-600">
                                {product.stock > 0
                                    ? `Còn ${product.stock} sản phẩm trong kho`
                                    : 'Hết hàng'}
                            </p>
                        )}
                    </div>

                    <button
                        className={`bg-[#EB1C24] text-white px-6 py-3 rounded-sm w-full md:w-auto ${isAddingToCart ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || product.stock === 0}
                    >
                        {isAddingToCart ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                    </button>
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-8">
                <h2 className="text-3xl mb-3">Sản phẩm liên quan</h2>
                {relatedProducts && relatedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" style={{ transform: 'scale(0.95)' }}>
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct.id}
                                id={relatedProduct.id}
                                name={relatedProduct.name}
                                price={relatedProduct.price}
                                discountPrice={relatedProduct.price_sale || relatedProduct.priceSale || relatedProduct.discountPrice}
                                image={getImageUrl(relatedProduct.image)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Không có sản phẩm liên quan.</p>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;