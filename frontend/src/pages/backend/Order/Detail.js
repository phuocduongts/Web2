import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft,
    FaPrint,
    FaEdit,
    FaTrashAlt,
    FaUser,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaTruck,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaExclamationTriangle,
} from 'react-icons/fa';
import OrderService from '../../../services/OrderService';
import OrderDetailService from '../../../services/OrderDetailService';
import UserService from '../../../services/UserService'; // Import UserService

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [user, setUser] = useState(null); // Add state for user
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [paymentStatusUpdating, setPaymentStatusUpdating] = useState(false);

    // Định nghĩa base URL cho hình ảnh sản phẩm
    const IMAGE_BASE_URL = 'http://localhost:8080/uploads/products/';

    useEffect(() => {
        fetchOrderData();
    }, [id]);

    const fetchOrderData = async () => {
        try {
            setLoading(true);

            // Fetch order info
            const orderData = await OrderService.getOrderById(id);
            console.log("Order data:", orderData);
            setOrder(orderData);

            // Fetch order details (line items)
            const orderDetailsData = await OrderDetailService.getOrderDetailsByOrderId(id);
            console.log("Order details data:", orderDetailsData);

            // Luôn đảm bảo setOrderDetails nhận một mảng
            setOrderDetails(Array.isArray(orderDetailsData) ? orderDetailsData : []);

            // Fetch user data if userId exists
            if (orderData && orderData.userId) {
                try {
                    const userData = await UserService.getById(orderData.userId);
                    console.log("User data:", userData);
                    setUser(userData);
                } catch (userErr) {
                    console.error('Error fetching user data:', userErr);
                    // Continue execution even if user fetch fails
                }
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching order data:', err);
            setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setStatusUpdating(true);
            await OrderService.updateOrderStatus(id, newStatus);
            fetchOrderData(); // Refresh data
            alert(`Đã cập nhật trạng thái đơn hàng thành ${getStatusLabel(newStatus)}`);
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleUpdatePaymentStatus = async (newStatus) => {
        try {
            setPaymentStatusUpdating(true);
            await OrderService.updatePaymentStatus(id, newStatus);
            fetchOrderData(); // Refresh data
            alert(`Đã cập nhật trạng thái thanh toán thành ${getPaymentStatusLabel(newStatus)}`);
        } catch (err) {
            console.error('Error updating payment status:', err);
            alert('Có lỗi xảy ra khi cập nhật trạng thái thanh toán');
        } finally {
            setPaymentStatusUpdating(false);
        }
    };

    const handleUpdateTrackingInfo = async () => {
        const trackingNumber = prompt('Nhập mã vận đơn mới:');
        if (trackingNumber === null) return; // User canceled

        try {
            await OrderService.updateTrackingInfo(id, trackingNumber);
            fetchOrderData(); // Refresh data
            alert('Đã cập nhật mã vận đơn thành công!');
        } catch (err) {
            console.error('Error updating tracking info:', err);
            alert('Có lỗi xảy ra khi cập nhật mã vận đơn');
        }
    };

    const handleMoveToTrash = async () => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn chuyển đơn hàng này vào thùng rác?');
        if (confirmDelete) {
            try {
                await OrderService.moveToTrash(id);
                alert('Đã chuyển đơn hàng vào thùng rác!');
                navigate('/admin/order/');
            } catch (err) {
                console.error('Error moving order to trash:', err);
                alert('Có lỗi xảy ra khi chuyển đơn hàng vào thùng rác');
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'N/A';

        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'PROCESSING': return 'Đang xử lý';
            case 'SHIPPED': return 'Đang giao hàng';
            case 'DELIVERED': return 'Đã giao hàng';
            case 'CANCELLED': return 'Đã hủy';
            default: return 'Không xác định';
        }
    };

    const getPaymentStatusLabel = (status) => {
        switch (status) {
            case 'PAID': return 'Đã thanh toán';
            case 'PENDING': return 'Chờ thanh toán';
            case 'FAILED': return 'Thanh toán lỗi';
            default: return 'Không xác định';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-blue-100 text-blue-800';
            case 'PROCESSING':
                return 'bg-yellow-100 text-yellow-800';
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Hàm lấy đường dẫn đầy đủ cho hình ảnh
    const getProductImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/100x100?text=No+Image';

        // Kiểm tra xem imagePath đã có đường dẫn đầy đủ chưa
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        // Loại bỏ "/" ở đầu nếu có
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

        // Trả về đường dẫn đầy đủ
        return `${IMAGE_BASE_URL}${cleanPath}`;
    };

    if (loading) {
        return (
            <div className="container mx-auto mt-8 px-4 text-center font-mono">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                </div>
                <p className="text-gray-600 mt-2">Đang tải dữ liệu đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto mt-8 px-4 font-mono">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded flex items-center">
                    <FaExclamationTriangle className="mr-3" />
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => navigate('/admin/order/')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center text-sm"
                >
                    <FaArrowLeft className="mr-2" />
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto mt-8 px-4 text-center font-mono">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded flex items-center">
                    <FaExclamationTriangle className="mr-3" />
                    <p>Không tìm thấy thông tin đơn hàng!</p>
                </div>
                <button
                    onClick={() => navigate('/admin/order')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center text-sm"
                >
                    <FaArrowLeft className="mr-2" />
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    // Calculate the total amount from order details as a fallback
    const calculatedTotal = orderDetails.reduce((sum, item) => {
        return sum + (item.finalPrice || item.subtotal || 0);
    }, 0);

    return (
        <div className="container mx-auto mt-6 px-4 font-mono print:px-0 print:shadow-none">
            {/* Header - Hide buttons when printing */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-2xl font-medium text-gray-700 flex items-center">
                    <span>Chi tiết đơn hàng #{order.id}</span>
                </h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate('/admin/order')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    >
                        <FaArrowLeft className="mr-2" />
                        Quay lại
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    >
                        <FaPrint className="mr-2" />
                        In đơn hàng
                    </button>
                    <button
                        onClick={() => navigate(`/admin/order/update/${order.id}`)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    >
                        <FaEdit className="mr-2" />
                        Sửa
                    </button>
                    <button
                        onClick={handleMoveToTrash}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                    >
                        <FaTrashAlt className="mr-2" />
                        Xóa
                    </button>
                </div>
            </div>

            {/* Order Header - Include when printing */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mb-6 print:shadow-none print:border-none">
                <div className="p-5 border-b border-gray-200 print:text-center">
                    <h2 className="font-bold text-xl text-gray-800 print:text-2xl">ĐƠN HÀNG #{order.id}</h2>
                    <p className="text-sm text-gray-500 mt-1 print:text-base">
                        Ngày đặt: {formatDate(order.orderDate)}
                    </p>
                    <div className="hidden print:block print:mt-4 print:text-lg">
                        <p className="font-semibold">Fashion Store</p>
                        <p>Email: info@fashionstore.com</p>
                        <p>Số điện thoại: (84) 28 1234 5678</p>
                        <p>Địa chỉ: 702 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Order Information */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 print:shadow-none print:border-none">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Thông tin đơn hàng</h3>
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">Ngày đặt:</span>
                            <span className="ml-2 text-sm font-medium">{formatDate(order.orderDate)}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                    {getStatusLabel(order.orderStatus)}
                                </span>
                            </div>
                            <span className="text-sm text-gray-600">Trạng thái:</span>
                            <div className="ml-auto print:hidden">
                                <select
                                    className="text-sm border border-gray-300 rounded p-1"
                                    value={order.orderStatus || 'PENDING'}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    disabled={statusUpdating}
                                >
                                    <option value="PENDING">Chờ xử lý</option>
                                    <option value="PROCESSING">Đang xử lý</option>
                                    <option value="SHIPPED">Đang giao hàng</option>
                                    <option value="DELIVERED">Đã giao hàng</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                    {getPaymentStatusLabel(order.paymentStatus)}
                                </span>
                            </div>
                            <span className="text-sm text-gray-600">Thanh toán:</span>
                            <div className="ml-auto print:hidden">
                                <select
                                    className="text-sm border border-gray-300 rounded p-1"
                                    value={order.paymentStatus || 'PENDING'}
                                    onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                                    disabled={paymentStatusUpdating}
                                >
                                    <option value="PENDING">Chờ thanh toán</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="FAILED">Thanh toán lỗi</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <FaMoneyBillWave className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                            <span className="ml-2 text-sm font-medium">
                                {order.paymentMethod || 'COD (Thanh toán khi nhận hàng)'}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <FaTruck className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">Mã vận đơn:</span>
                            <span className="ml-2 text-sm font-medium">
                                {order.trackingNumber || 'Chưa có'}
                            </span>
                            <button
                                onClick={handleUpdateTrackingInfo}
                                className="ml-2 text-xs text-blue-500 hover:text-blue-700 print:hidden"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customer Information - Updated to match OrderList */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 print:shadow-none print:border-none">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Thông tin khách hàng</h3>
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="flex items-start">
                            <FaUser className="text-gray-500 mr-2 mt-1" />
                            <div>
                                <div className="text-sm font-medium text-gray-800">
                                    {user ? user.fullName || user.username : (order.shippingName || 'N/A')}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {user ? user.email : (order.email || 'N/A')}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <FaPhone className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">Số điện thoại:</span>
                            <span className="ml-2 text-sm font-medium">
                                {user ? user.phone : (order.shippingPhone || 'N/A')}
                            </span>
                        </div>
                        <div className="flex items-start">
                            <FaMapMarkerAlt className="text-gray-500 mr-2 mt-1" />
                            <span className="text-sm text-gray-600 mt-0.5">Địa chỉ:</span>
                            <span className="ml-2 text-sm font-medium">
                                {order.shippingAddress || 'N/A'}{order.shippingCity ? `, ${order.shippingCity}` : ''}
                            </span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-sm text-gray-600 ml-5">Ghi chú:</span>
                            <span className="ml-2 text-sm font-medium italic">
                                {order.notes || 'Không có ghi chú'}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Order Summary */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 print:shadow-none print:border-none">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Tổng quan đơn hàng</h3>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Tổng số sản phẩm:</span>
                            <span className="text-sm font-medium">{orderDetails.length}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Tổng tiền hàng:</span>
                            <span className="text-sm font-medium">
                                {formatCurrency(orderDetails.reduce((sum, item) => sum + (item.subtotal || 0), 0))}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Giảm giá:</span>
                            <span className="text-sm font-medium">
                                {formatCurrency(orderDetails.reduce((sum, item) => sum + (item.discountAmount || 0), 0))}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Phí vận chuyển:</span>
                            <span className="text-sm font-medium">
                                {formatCurrency(order.shipping || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between py-3 font-medium">
                            <span className="text-gray-800">Tổng thanh toán:</span>
                            <span className="text-lg text-blue-600">
                                {formatCurrency(order.totalAmount || calculatedTotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mb-6 print:shadow-none print:border-none">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Chi tiết sản phẩm</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đơn giá
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số lượng
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thành tiền
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orderDetails.length > 0 ? (
                                orderDetails.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {item.productImage && (
                                                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                        <img
                                                            className="h-10 w-10 rounded-sm object-cover"
                                                            src={getProductImageUrl(item.productImage)}
                                                            alt={item.productName}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="ml-0">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.productName || `Sản phẩm #${item.productId || 'N/A'}`}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        SKU: {item.productId || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatCurrency(item.unitPrice)}</div>
                                            {item.discountAmount > 0 && (
                                                <div className="text-xs text-green-600">
                                                    Giảm: {formatCurrency(item.discountAmount)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.quantity}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {formatCurrency(item.finalPrice || item.subtotal)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14v.01M12 20h.01M18 10a6 6 0 00-12 0" />
                                            </svg>
                                            <span>Không có thông tin chi tiết cho đơn hàng này</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Tổng cộng:</td>
                                <td className="px-6 py-3 text-sm font-bold text-gray-900">
                                    {formatCurrency(order.totalAmount || calculatedTotal)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;