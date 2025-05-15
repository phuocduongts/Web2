import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import OrderService from '../../services/OrderService';

const UserOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Get the current user from localStorage or your auth context
        const user = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(user);
        
        if (user && user.id) {
            fetchUserOrders(user.id);
        } else {
            setError('Vui lòng đăng nhập để xem đơn hàng của bạn');
            setLoading(false);
        }
    }, []);

    const fetchUserOrders = async (userId) => {
        try {
            setLoading(true);
            const response = await OrderService.getUserOrders(userId);
            
            // If response is already an array, use it directly
            // Otherwise, handle potential response structures
            const ordersArray = Array.isArray(response) ? response :
                (response && response.data ? response.data : []);
                
            setOrders(ordersArray);
            setError(null);
        } catch (err) {
            console.error('Error fetching user orders:', err);
            setError('Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrderDetails = (orderId) => {
        navigate(`/don-hang/chi-tiet/${orderId}`);
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

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xử lý';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'SHIPPED':
                return 'Đang giao';
            case 'DELIVERED':
                return 'Đã giao';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return 'Chờ xử lý';
        }
    };

    const getPaymentStatusText = (status) => {
        switch (status) {
            case 'PAID':
                return 'Đã thanh toán';
            case 'PENDING':
                return 'Chờ thanh toán';
            case 'FAILED':
                return 'Thanh toán lỗi';
            default:
                return 'Chờ thanh toán';
        }
    };

    const filteredOrders = orders.filter(order => {
        if (!order) return false;

        const matchesSearch =
            (order.id && order.id.toString().includes(searchTerm)) ||
            (order.shippingName && order.shippingName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingPhone && order.shippingPhone.includes(searchTerm)) ||
            (order.trackingNumber && order.trackingNumber.includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

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

    if (error && !currentUser) {
        return (
            <div className="container mx-auto mt-8 px-4 text-center font-mono">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/dang-nhap')} 
                    className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
                >
                    Đăng nhập ngay
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto mt-8 px-4 font-mono">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium text-gray-700">
                    <span>Đơn hàng của tôi</span>
                </h1>
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

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mb-4">
                <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center">
                        <FaFilter className="text-gray-400 mr-2" />
                        <select
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="SHIPPED">Đang giao</option>
                            <option value="DELIVERED">Đã giao</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã ĐH</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ giao hàng</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-500">#{order.id || 'N/A'}</td>
                                        <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.orderDate)}
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-800">
                                                {order.shippingName || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.shippingAddress || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.shippingPhone || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                {getStatusText(order.orderStatus)}
                                            </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {getPaymentStatusText(order.paymentStatus)}
                                            </span>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewOrderDetails(order.id)}
                                                className="bg-blue-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14v.01M12 20h.01M18 10a6 6 0 00-12 0" />
                                            </svg>
                                            <span className="block mt-2">Bạn chưa có đơn hàng nào</span>
                                            <button 
                                                onClick={() => navigate('/')} 
                                                className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
                                            >
                                                Mua sắm ngay
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                {filteredOrders.length > 0 && (
                    <span>Hiển thị {filteredOrders.length}/{orders.length} đơn hàng</span>
                )}
            </div>
        </div>
    );
};

export default UserOrders;