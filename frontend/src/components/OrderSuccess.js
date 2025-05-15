import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import OrderService from '../services/OrderService';
import OrderDetailService from '../services/OrderDetailService';
import ProductService from '../services/ProductService';
import AuthService from '../services/AuthService';

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get order data from location state (passed from Checkout)
    const orderFromCheckout = location.state?.orderData;
    
    const [order, setOrder] = useState(orderFromCheckout || null);
    const [orderDetails, setOrderDetails] = useState(location.state?.orderItems || []);
    const [loading, setLoading] = useState(!orderFromCheckout);
    const [error, setError] = useState(null);
    const [productsDetails, setProductsDetails] = useState({});

    useEffect(() => {
        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
            navigate('/dang-nhap');
            return;
        }

        // If order data wasn't passed via location state, fetch it from API
        if (!orderFromCheckout && id) {
            fetchOrderData();
        } else if (orderDetails.length > 0) {
            // If we have order details from checkout, fetch complete product info
            fetchProductsDetails();
        }
    }, [id, navigate, orderFromCheckout, orderDetails]);

    const fetchOrderData = async () => {
        try {
            setLoading(true);

            // Fetch order information
            const orderResponse = await OrderService.getOrderById(id);
            const orderData = orderResponse.data || orderResponse;
            setOrder(orderData);

            // Fetch order details
            const detailsResponse = await OrderDetailService.getOrderDetailsByOrderId(id);
            const detailsData = detailsResponse.data || detailsResponse;
            setOrderDetails(detailsData);

            // Once we have order details, fetch complete product info
            if (detailsData && detailsData.length > 0) {
                const productIds = detailsData.map(item => 
                    item.productId || (item.product && item.product.id)
                ).filter(Boolean);
                
                if (productIds.length > 0) {
                    await fetchProductsDetailsById(productIds);
                }
            }
        } catch (err) {
            console.error('Error fetching order data:', err);
            setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsDetails = async () => {
        try {
            const productIds = orderDetails.map(item => 
                item.productId || (item.product && item.product.id)
            ).filter(Boolean);
            
            if (productIds.length > 0) {
                await fetchProductsDetailsById(productIds);
            }
        } catch (err) {
            console.error('Error fetching product details:', err);
        }
    };

    const fetchProductsDetailsById = async (productIds) => {
        try {
            // Create a map to store product details
            const productsMap = {};
            
            // Fetch details for each product
            await Promise.all(productIds.map(async (productId) => {
                try {
                    const response = await ProductService.getById(productId);
                    const productData = response.data || response;
                    productsMap[productId] = productData;
                } catch (err) {
                    console.error(`Error fetching product ${productId}:`, err);
                }
            }));
            
            setProductsDetails(productsMap);
        } catch (err) {
            console.error('Error in fetchProductsDetailsById:', err);
        }
    };

    const formatPrice = (amount) => {
        if (!amount) return '0';
        let formatted = amount.toString().replace(/\D/g, '');
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return formatted;
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-image.jpg';
        return `http://localhost:8080/uploads/products/${imagePath}`;
    };

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'COD':
                return 'Thanh toán khi nhận hàng';
            case 'BANK_TRANSFER':
                return 'Chuyển khoản ngân hàng';
            case 'CREDIT_CARD':
                return 'Thẻ tín dụng/ghi nợ';
            default:
                return method;
        }
    };

    const getOrderStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'SHIPPED':
                return 'Đang giao hàng';
            case 'DELIVERED':
                return 'Đã giao hàng';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const getPaymentStatusText = (status) => {
        switch (status) {
            case 'UNPAID':
                return 'Chưa thanh toán';
            case 'PAID':
                return 'Đã thanh toán';
            case 'REFUNDED':
                return 'Đã hoàn tiền';
            default:
                return status;
        }
    };

    // Get complete product details by combining orderDetail and productsDetails
    const getEnhancedProductInfo = (item) => {
        const productId = item.productId || (item.product && item.product.id);
        const basicProductInfo = item.product || {};
        const fullProductInfo = productsDetails[productId] || {};
        
        return {
            id: productId,
            name: fullProductInfo.name || basicProductInfo.name || 'Sản phẩm không xác định',
            image: fullProductInfo.image || basicProductInfo.image,
            sku: fullProductInfo.sku || basicProductInfo.sku || '',
            brand: fullProductInfo.brand || basicProductInfo.brand || '',
            category: fullProductInfo.category || basicProductInfo.category || {},
            price: item.price, // Use price from order detail as it might differ from current product price
            quantity: item.quantity
        };
    };

    if (loading) {
        return (
            <div className="container mx-auto px-16 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin mx-auto" />
                        <p className="mt-2 text-xl font-mono">Đang tải thông tin đơn hàng...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-16 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded text-center w-full max-w-md">
                        <p className="text-xl font-mono">{error}</p>
                        <button
                            onClick={() => navigate('/account/orders')}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Xem đơn hàng của tôi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-16 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded text-center w-full max-w-md">
                        <p className="text-xl font-mono">Không tìm thấy thông tin đơn hàng.</p>
                        <button
                            onClick={() => navigate('/account/orders')}
                            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                        >
                            Xem đơn hàng của tôi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-16 py-8 font-mono">
            <div className="bg-green-50 border border-green-200 p-6 rounded-md mb-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-3xl font-bold text-green-800 mb-2">Đặt hàng thành công!</h1>
                <p className="text-lg text-green-700">
                    Cảm ơn bạn đã đặt hàng. Đơn hàng #{id} của bạn đã được xác nhận.
                </p>
                <p className="text-gray-600 mt-2">
                    Một email xác nhận đã được gửi tới địa chỉ email của bạn.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
                    <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
                        {getOrderStatusText(order.orderStatus)}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2">Thông tin đơn hàng</h3>
                        <p><span className="text-gray-500">Mã đơn hàng:</span> #{id}</p>
                        <p><span className="text-gray-500">Ngày đặt hàng:</span> {formatDate(order.orderDate)}</p>
                        <p><span className="text-gray-500">Trạng thái đơn hàng:</span> {getOrderStatusText(order.orderStatus)}</p>
                        <p><span className="text-gray-500">Trạng thái thanh toán:</span> {getPaymentStatusText(order.paymentStatus)}</p>
                        <p><span className="text-gray-500">Phương thức thanh toán:</span> {getPaymentMethodText(order.paymentMethod)}</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-700 mb-2">Thông tin giao hàng</h3>
                        <p><span className="text-gray-500">Người nhận:</span> {order.recipientName}</p>
                        <p><span className="text-gray-500">Điện thoại:</span> {order.recipientPhone}</p>
                        <p><span className="text-gray-500">Email:</span> {order.recipientEmail}</p>
                        <p><span className="text-gray-500">Địa chỉ:</span> {order.shippingAddress}</p>
                        {order.notes && <p><span className="text-gray-500">Ghi chú:</span> {order.notes}</p>}
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-bold text-gray-700 mb-4">Sản phẩm đã đặt</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SKU</th>
                                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                    <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orderDetails.map((item) => {
                                    const productInfo = getEnhancedProductInfo(item);
                                    return (
                                        <tr key={item.id}>
                                            <td className="px-2 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-16 w-16 flex-shrink-0">
                                                        <img className="h-16 w-16 object-cover rounded"
                                                            src={getImageUrl(productInfo.image)}
                                                            alt={productInfo.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{productInfo.name}</div>
                                                        {productInfo.brand && (
                                                            <div className="text-xs text-gray-500">
                                                                Thương hiệu: {productInfo.brand}
                                                            </div>
                                                        )}
                                                        {productInfo.category && productInfo.category.name && (
                                                            <div className="text-xs text-gray-500">
                                                                Danh mục: {productInfo.category.name}
                                                            </div>
                                                        )}
                                                        <Link 
                                                            to={`/product/${productInfo.id}`}
                                                            className="text-xs text-blue-600 hover:text-blue-800"
                                                        >
                                                            Xem chi tiết
                                                        </Link>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                {productInfo.sku || 'N/A'}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                {formatPrice(item.price)}₫
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                {item.quantity}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {formatPrice(item.price * item.quantity)}₫
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Tạm tính</span>
                            <span>{formatPrice(order.subtotal)}₫</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Phí vận chuyển</span>
                            <span>{order.shipping === 0 ? 'Miễn phí' : `${formatPrice(order.shipping)}₫`}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between py-2 text-green-600">
                                <span>Giảm giá</span>
                                <span>-{formatPrice(order.discount)}₫</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 text-lg font-bold">
                            <span>Tổng cộng</span>
                            <span>{formatPrice(order.total)}₫</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link to="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">
                    Tiếp tục mua hàng
                </Link>
                <Link to="/account/orders"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded">
                    Xem đơn hàng của tôi
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;