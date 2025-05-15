import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartService from '../../services/CartService';
import OrderService from '../../services/OrderService';
import AuthService from '../../services/AuthService';

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [total, setTotal] = useState(0);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        paymentMethod: 'COD',
        notes: ''
    });

    // Validation state
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Function to handle image URLs
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-image.jpg';
        return `http://localhost:8080/uploads/products/${imagePath}`;
    };

    useEffect(() => {
        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
            navigate('/dang-nhap', { state: { from: '/thanh-toan' } });
            return;
        }

        // Pre-fill user data if available
        const user = AuthService.getCurrentUser();
        if (user) {
            setFormData(prevState => ({
                ...prevState,
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                province: user.province || '',
                district: user.district || '',
                ward: user.ward || ''
            }));
        }

        fetchCartItems();
    }, [navigate]);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const user = AuthService.getCurrentUser();
            const response = await CartService.getCartByUser(user.id);

            const cartData = response.data || response;
            // Make sure we have an array of items
            const items = Array.isArray(cartData) ? cartData :
                (cartData.items ? cartData.items : []);

            // Redirect to cart if empty
            if (items.length === 0) {
                navigate('/gio-hang');
                return;
            }

            setCartItems(items);
            calculateTotals(items);
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (items) => {
        // Calculate subtotal
        const subtotalAmount = items.reduce((sum, item) => {
            const price = item.product.discountPrice ||
                item.product.price_sale ||
                item.product.priceSale ||
                item.product.price || 0;
            return sum + (price * item.quantity);
        }, 0);

        setSubtotal(subtotalAmount);

        // Set shipping cost based on business rules
        const shippingCost = subtotalAmount > 500000 ? 0 : 0;
        setShipping(shippingCost);

        // Calculate total
        setTotal(subtotalAmount + shippingCost);
    };

    const formatPrice = (amount) => {
        if (!amount) return '0';
        let formatted = amount.toString().replace(/\D/g, '');
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return formatted;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
        if (!formData.email.trim()) errors.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';

        if (!formData.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, '')))
            errors.phone = 'Số điện thoại không hợp lệ';

        if (!formData.address.trim()) errors.address = 'Vui lòng nhập địa chỉ';
        if (!formData.province.trim()) errors.province = 'Vui lòng nhập tỉnh/thành phố';
        if (!formData.district.trim()) errors.district = 'Vui lòng nhập quận/huyện';
        if (!formData.ward.trim()) errors.ward = 'Vui lòng nhập phường/xã';

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            window.scrollTo(0, 0);
            return;
        }

        try {
            setIsSubmitting(true);

            const user = AuthService.getCurrentUser();

            // Check if user is null
            if (!user || !user.id) {
                setError("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
                setIsSubmitting(false);
                return;
            }

            const orderRequest = {
                userId: user.id,
                shippingAddress: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
                recipientName: formData.fullName,
                recipientPhone: formData.phone,
                recipientEmail: formData.email,
                orderStatus: "PENDING",
                paymentStatus: "UNPAID",
                paymentMethod: formData.paymentMethod,
                subtotal: subtotal,
                shipping: shipping,
                total: total,
                notes: formData.notes,
                items: cartItems.map(item => ({
                    productId: item?.product?.id,
                    quantity: item.quantity,
                    price: item.product.discountPrice ||
                        item.product.price_sale ||
                        item.product.priceSale ||
                        item.product.price
                }))
            };

            const response = await OrderService.createOrder(orderRequest);

            const newOrderId = response?.data?.id || response?.id;

            if (newOrderId) {
                // Prepare order data to pass to OrderSuccess
                const orderData = {
                    id: newOrderId,
                    orderDate: new Date().toISOString(),
                    ...orderRequest,
                    // Include additional fields that OrderSuccess might need
                    shippingAddress: orderRequest.shippingAddress,
                    recipientName: orderRequest.recipientName,
                    recipientPhone: orderRequest.recipientPhone,
                    recipientEmail: orderRequest.recipientEmail,
                    orderStatus: orderRequest.orderStatus,
                    paymentStatus: orderRequest.paymentStatus,
                    paymentMethod: orderRequest.paymentMethod,
                    subtotal: orderRequest.subtotal,
                    shipping: orderRequest.shipping,
                    total: orderRequest.total,
                    notes: orderRequest.notes
                };

                // Prepare order items data
                const orderItems = cartItems.map(item => ({
                    id: item.id,
                    product: {
                        id: item.product.id,
                        name: item.product.name,
                        image: item.product.image,
                        price: item.product.discountPrice || 
                               item.product.price_sale || 
                               item.product.priceSale || 
                               item.product.price
                    },
                    quantity: item.quantity,
                    price: item.product.discountPrice || 
                           item.product.price_sale || 
                           item.product.priceSale || 
                           item.product.price
                }));

                // Clear the cart
                await CartService.clear(user.id);

                // Navigate to success page with all necessary data
                navigate(`/dat-hang-thanh-cong/${newOrderId}`, {
                    state: {
                        orderData: orderData,
                        orderItems: orderItems
                    }
                });
            } else {
                throw new Error("Không thể lấy ID đơn hàng từ phản hồi");
            }

        } catch (err) {
            console.error('Error placing order:', err);
            setError('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin mx-auto" />
                        <p className="mt-2 text-xl font-mono">Đang tải thông tin...</p>
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
                        <button
                            onClick={() => navigate('/gio-hang')}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Quay lại giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-16 py-8 font-mono">
            <h1 className="text-3xl font-mono text-center mb-8">Thanh toán</h1>

            {Object.keys(formErrors).length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p className="font-bold">Vui lòng kiểm tra lại thông tin:</p>
                    <ul className="list-disc ml-5">
                        {Object.values(formErrors).map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Checkout form */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white border border-gray-200 rounded-sm p-6">
                        <h2 className="text-xl mb-4">Thông tin giao hàng</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                                    Họ tên *
                                </label>
                                <input
                                    className={`w-full p-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded`}
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                                {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                        Email *
                                    </label>
                                    <input
                                        className={`w-full p-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                                        Số điện thoại *
                                    </label>
                                    <input
                                        className={`w-full p-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                                    Địa chỉ *
                                </label>
                                <input
                                    className={`w-full p-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded`}
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Số nhà, tên đường, tòa nhà..."
                                />
                                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">
                                        Tỉnh/Thành phố *
                                    </label>
                                    <input
                                        className={`w-full p-2 border ${formErrors.province ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        id="province"
                                        name="province"
                                        type="text"
                                        value={formData.province}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tỉnh/thành phố"
                                    />
                                    {formErrors.province && <p className="text-red-500 text-xs mt-1">{formErrors.province}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">
                                        Quận/Huyện *
                                    </label>
                                    <input
                                        className={`w-full p-2 border ${formErrors.district ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        id="district"
                                        name="district"
                                        type="text"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        placeholder="Nhập quận/huyện"
                                    />
                                    {formErrors.district && <p className="text-red-500 text-xs mt-1">{formErrors.district}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ward">
                                        Phường/Xã *
                                    </label>
                                    <input
                                        className={`w-full p-2 border ${formErrors.ward ? 'border-red-500' : 'border-gray-300'} rounded`}
                                        id="ward"
                                        name="ward"
                                        type="text"
                                        value={formData.ward}
                                        onChange={handleInputChange}
                                        placeholder="Nhập phường/xã"
                                    />
                                    {formErrors.ward && <p className="text-red-500 text-xs mt-1">{formErrors.ward}</p>}
                                </div>
                            </div>

                            <h2 className="text-xl mb-4 mt-8">Phương thức thanh toán</h2>

                            <div className="mb-6">
                                <div className="flex items-center mb-2">
                                    <input
                                        id="paymentCOD"
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={formData.paymentMethod === 'COD'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor="paymentCOD" className="flex items-center">
                                        <span className="mr-2">Thanh toán khi nhận hàng (COD)</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-12" viewBox="0 0 24 24">
                                            <rect width="24" height="20" x="0" y="2" rx="2" ry="2" fill="#F3F4F6" stroke="#9CA3AF" />
                                            <text x="12" y="14" textAnchor="middle" fill="#4B5563" fontSize="5" fontWeight="bold">COD</text>
                                        </svg>
                                    </label>
                                </div>

                                <div className="flex items-center mb-2">
                                    <input
                                        id="paymentBank"
                                        type="radio"
                                        name="paymentMethod"
                                        value="BANK_TRANSFER"
                                        checked={formData.paymentMethod === 'BANK_TRANSFER'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor="paymentBank">Chuyển khoản ngân hàng</label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="paymentCard"
                                        type="radio"
                                        name="paymentMethod"
                                        value="CREDIT_CARD"
                                        checked={formData.paymentMethod === 'CREDIT_CARD'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor="paymentCard" className="flex items-center">
                                        <span className="mr-2">Thẻ tín dụng/ghi nợ</span>
                                        <div className="flex gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-8" viewBox="0 0 24 24">
                                                <rect width="24" height="20" x="0" y="2" rx="2" ry="2" fill="#F3F4F6" stroke="#9CA3AF" />
                                                <text x="12" y="14" textAnchor="middle" fill="#4B5563" fontSize="6" fontWeight="bold">VISA</text>
                                            </svg>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-8" viewBox="0 0 24 24">
                                                <rect width="24" height="20" x="0" y="2" rx="2" ry="2" fill="#F3F4F6" stroke="#9CA3AF" />
                                                <text x="12" y="14" textAnchor="middle" fill="#4B5563" fontSize="5" fontWeight="bold">MASTER</text>
                                            </svg>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                                    Ghi chú đơn hàng
                                </label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded"
                                    id="notes"
                                    name="notes"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                ></textarea>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Order summary */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white border border-gray-200 rounded-sm p-6 sticky top-4">
                        <h2 className="text-xl mb-4">Đơn hàng của bạn</h2>

                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h3 className="font-bold mb-2">Sản phẩm</h3>

                            {cartItems.map(item => {
                                const product = item.product;
                                const price = product.discountPrice ||
                                    product.price_sale ||
                                    product.priceSale ||
                                    product.price || 0;
                                const total = price * item.quantity;

                                return (
                                    <div key={item.id} className="flex justify-between py-2 text-sm">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 mr-2">
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span>
                                                {product.name} <span className="text-gray-500">x {item.quantity}</span>
                                            </span>
                                        </div>
                                        <span>{formatPrice(total)}₫</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <div className="flex justify-between py-2">
                                <span>Tạm tính</span>
                                <span>{formatPrice(subtotal)}₫</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span>Phí vận chuyển</span>
                                <span>{shipping === 0 ? 'Miễn phí' : `${formatPrice(shipping)}₫`}</span>
                            </div>
                        </div>

                        <div className="flex justify-between py-2 font-bold">
                            <span>Tổng cộng</span>
                            <span className="text-xl">{formatPrice(total)}₫</span>
                        </div>

                        <p className="text-sm text-gray-500 my-2">
                            Đã bao gồm VAT (nếu có)
                        </p>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-3 mt-4 text-white ${isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG'}
                        </button>

                        <p className="text-xs text-gray-500 mt-2">
                            Bằng cách đặt hàng, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;