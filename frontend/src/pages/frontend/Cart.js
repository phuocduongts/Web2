import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartService from '../../services/CartService';
import AuthService from '../../services/AuthService';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    // Function to handle image URLs
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-image.jpg';
        return `http://localhost:8080/uploads/products/${imagePath}`;
    };

    const fetchCartItems = async () => {
        try {
            setLoading(true);

            // Check if user is logged in
            if (!AuthService.isAuthenticated()) {
                navigate('/');
                return;
            }
            const user = AuthService.getCurrentUser();
            const response = await CartService.getCartByUser(user.id);
            const cartData = response.data || response;

            // Make sure we have an array of items
            const items = Array.isArray(cartData) ? cartData :
                (cartData.items ? cartData.items : []);

            setCartItems(items);
            
            // Initialize selected items with all items
            const itemIds = items.map(item => item.id);
            setSelectedItems(itemIds);

            // Calculate totals based on selected items
            calculateTotals(items, itemIds);
            
            // Trigger cart count update in header
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const calculateTotals = (items, selectedIds = selectedItems) => {
        // Calculate subtotal only for selected items
        const subtotalAmount = items.reduce((sum, item) => {
            if (selectedIds.includes(item.id)) {
                const price = item.product.discountPrice ||
                    item.product.price_sale ||
                    item.product.priceSale ||
                    item.product.price || 0;
                return sum + (price * item.quantity);
            }
            return sum;
        }, 0);

        setSubtotal(subtotalAmount);

        // Set shipping cost based on business rules
        // For example: Free shipping for orders over 500,000₫
        const shippingCost = subtotalAmount > 500000 ? 0 : 0;
        setShipping(shippingCost);

        // Calculate total
        setTotal(subtotalAmount + shippingCost);
    };

    const handleItemSelection = (itemId) => {
        let newSelectedItems;
        
        if (selectedItems.includes(itemId)) {
            // Remove from selection
            newSelectedItems = selectedItems.filter(id => id !== itemId);
        } else {
            // Add to selection
            newSelectedItems = [...selectedItems, itemId];
        }
        
        setSelectedItems(newSelectedItems);
        calculateTotals(cartItems, newSelectedItems);
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            const allItemIds = cartItems.map(item => item.id);
            setSelectedItems(allItemIds);
            calculateTotals(cartItems, allItemIds);
        } else {
            setSelectedItems([]);
            calculateTotals(cartItems, []);
        }
    };

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            // Update the quantity in the backend
            await CartService.changeQuantity(itemId, newQuantity);

            // Update state locally
            const updatedItems = cartItems.map(item => {
                if (item.id === itemId) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            setCartItems(updatedItems);
            calculateTotals(updatedItems);
            
            // Trigger cart count update in header
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (err) {
            console.error('Error updating cart item quantity:', err);
            alert('Có lỗi xảy ra khi cập nhật số lượng. Vui lòng thử lại.');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            // Remove the item from the backend
            await CartService.delete(itemId);

            // Update state locally
            const updatedItems = cartItems.filter(item => item.id !== itemId);
            
            // Also update selected items
            const updatedSelectedItems = selectedItems.filter(id => id !== itemId);
            
            setCartItems(updatedItems);
            setSelectedItems(updatedSelectedItems);
            calculateTotals(updatedItems, updatedSelectedItems);
            
            // Trigger cart count update in header
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (err) {
            console.error('Error removing cart item:', err);
            alert('Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
            try {
                // Clear the cart in the backend
                await CartService.clear();

                // Update state locally
                setCartItems([]);
                setSelectedItems([]);
                calculateTotals([]);
                
                // Trigger cart count update in header
                window.dispatchEvent(new CustomEvent('cart-updated'));
            } catch (err) {
                console.error('Error clearing cart:', err);
                alert('Có lỗi xảy ra khi xóa giỏ hàng. Vui lòng thử lại.');
            }
        }
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
            return;
        }

        // Store selected items in session storage to use in checkout page
        const selectedProducts = cartItems.filter(item => selectedItems.includes(item.id));
        sessionStorage.setItem('checkoutItems', JSON.stringify(selectedProducts));
        
        navigate('/thanh-toan');
    };

    const formatPrice = (amount) => {
        if (!amount) return '0';
        let formatted = amount.toString().replace(/\D/g, '');
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return formatted;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin mx-auto" />
                        <p className="mt-2 text-xl font-mono">Đang tải giỏ hàng...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded text-center w-full max-w-md">
                        <p className="text-xl font-mono">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-16 py-8 font-mono">
            <h1 className="text-3xl font-mono text-center mb-8">Giỏ hàng của bạn</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-8">
                    <h2 className="text-xl mb-4">Giỏ hàng của bạn hiện đang trống</h2>
                    <p className="mb-6">Hãy thêm một số sản phẩm vào giỏ hàng để tiếp tục</p>
                    <Link to="/tat-ca-san-pham" className="bg-black text-white px-6 py-3 rounded-sm">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart items */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white border border-gray-200 rounded-sm">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                <h2 className="text-xl">Chi tiết giỏ hàng</h2>
                                <button
                                    onClick={handleClearCart}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Xóa tất cả
                                </button>
                            </div>

                            {/* Headers for desktop */}
                            <div className="hidden md:flex border-b border-gray-200 p-4 bg-gray-50 text-gray-600">
                                <div className="w-12 flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                </div>
                                <div className="w-2/5">Sản phẩm</div>
                                <div className="w-1/5 text-center">Đơn giá</div>
                                <div className="w-1/5 text-center">Số lượng</div>
                                <div className="w-1/5 text-right">Thành tiền</div>
                            </div>

                            {/* Cart items */}
                            {cartItems.map(item => {
                                const product = item.product;
                                const price = product.discountPrice ||
                                    product.price_sale ||
                                    product.priceSale ||
                                    product.price || 0;
                                const total = price * item.quantity;
                                const isSelected = selectedItems.includes(item.id);

                                return (
                                    <div key={item.id}
                                        className={`flex flex-col md:flex-row border-b border-gray-200 p-4 items-center ${isSelected ? 'bg-blue-50' : ''}`}
                                    >
                                        {/* Checkbox - Mobile & Desktop */}
                                        <div className="w-full md:w-12 flex md:justify-center mb-2 md:mb-0">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleItemSelection(item.id)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="ml-2 md:hidden">Chọn</span>
                                            </div>
                                        </div>

                                        {/* Product Info - Mobile & Desktop */}
                                        <div className="flex items-center w-full md:w-2/5 mb-4 md:mb-0">
                                            <div className="w-20 h-20 mr-4 flex-shrink-0">
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Link to={`/san-pham/${product.id}`} className="hover:text-red-600">
                                                    {product.name}
                                                </Link>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm mt-2 md:hidden"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="hidden md:block text-red-500 hover:text-red-700 text-sm ml-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Price - Mobile & Desktop */}
                                        <div className="flex w-full md:w-1/5 justify-between md:justify-center mb-2 md:mb-0">
                                            <span className="md:hidden">Đơn giá:</span>
                                            <span>{formatPrice(price)}₫</span>
                                        </div>

                                        {/* Quantity - Mobile & Desktop */}
                                        <div className="flex w-full md:w-1/5 justify-between md:justify-center mb-2 md:mb-0">
                                            <span className="md:hidden">Số lượng:</span>
                                            <div className="flex items-center">
                                                <button
                                                    className="border border-gray-300 px-2"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                    className="border-t border-b border-gray-300 text-center w-12 py-1"
                                                />
                                                <button
                                                    className="border border-gray-300 px-2"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Total - Mobile & Desktop */}
                                        <div className="flex w-full md:w-1/5 justify-between md:justify-end">
                                            <span className="md:hidden">Thành tiền:</span>
                                            <span className="font-semibold">{formatPrice(total)}₫</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4">
                            <Link to="/tat-ca-san-pham" className="text-blue-600 hover:underline">
                                ← Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>

                    {/* Order summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white border border-gray-200 rounded-sm p-6">
                            <h2 className="text-xl mb-4">Tổng thanh toán</h2>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between py-2">
                                    <span>Sản phẩm đã chọn</span>
                                    <span>{selectedItems.length}/{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(subtotal)}₫</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span>Phí vận chuyển</span>
                                    <span>{shipping === 0 ? 'Miễn phí' : `${formatPrice(shipping)}₫`}</span>
                                </div>
                                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                                    <span className="font-bold">Tổng cộng</span>
                                    <span className="font-bold text-xl">{formatPrice(total)}₫</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Đã bao gồm VAT (nếu có)
                                </p>
                            </div>

                            <button
                                className={`w-full text-white py-3 mt-4 ${selectedItems.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                onClick={handleCheckout}
                                disabled={selectedItems.length === 0}
                            >
                                TIẾN HÀNH THANH TOÁN {selectedItems.length > 0 ? `(${selectedItems.length} sản phẩm)` : ''}
                            </button>

                            <div className="mt-4 text-sm">
                                <p className="mb-2">Chúng tôi chấp nhận:</p>
                                <div className="flex gap-2">
                                    <div className="border border-gray-200 p-1 rounded">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-8" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4Z" fill="#F3F4F6" />
                                            <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4Z" stroke="#9CA3AF" strokeWidth="1" />
                                            <text x="12" y="14" textAnchor="middle" fill="#4B5563" fontSize="6" fontWeight="bold">VISA</text>
                                        </svg>
                                    </div>
                                    <div className="border border-gray-200 p-1 rounded">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-8" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4Z" fill="#F3F4F6" />
                                            <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4Z" stroke="#9CA3AF" strokeWidth="1" />
                                            <text x="12" y="14" textAnchor="middle" fill="#4B5563" fontSize="5" fontWeight="bold">MASTER</text>
                                        </svg>
                                    </div>
                                    <div className="border border-gray-200 p-1 rounded">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-12" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4Z" fill="#F3F4F6" />
                                            <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4Z" stroke="#9CA3AF" strokeWidth="1" />
                                            <text x="12" y="14" textAnchor="middle" fill="#4B5563" fontSize="5" fontWeight="bold">COD</text>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;