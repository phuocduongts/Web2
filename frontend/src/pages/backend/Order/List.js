import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaTrashAlt, FaSearch, FaFilter, FaUser } from 'react-icons/fa';
import OrderService from '../../../services/OrderService';
import UserService from '../../../services/UserService';

const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Direct API call to debug the response format
            const ordersResponse = await OrderService.getAllOrders();
            const usersResponse = await UserService.getAll();

            console.log("Orders response:", ordersResponse);
            console.log("Users response:", usersResponse);

            // Transform users array into a lookup object for quick access
            const usersMap = {};
            if (Array.isArray(usersResponse)) {
                usersResponse.forEach(user => {
                    usersMap[user.id] = user;
                });
            }

            // Ensure ordersResponse is an array
            const ordersArray = Array.isArray(ordersResponse) ? ordersResponse :
                (ordersResponse && typeof ordersResponse === 'object' ? [ordersResponse] : []);

            setOrders(ordersArray);
            setUsers(usersMap);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleMoveToTrash = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn chuyển đơn hàng này vào thùng rác?");
        if (confirmDelete) {
            try {
                await OrderService.moveToTrash(id);
                fetchData();
                alert('Chuyển đơn hàng vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác. Vui lòng thử lại.');
                console.error('Error moving order to trash:', err);
            }
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
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
            setSelectedItems(orders.map(order => order.id));
        }
        setSelectAll(!selectAll);
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một đơn hàng');
            return;
        }

        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn chuyển ${selectedItems.length} đơn hàng vào thùng rác?`);
        if (confirmDelete) {
            try {
                await Promise.all(selectedItems.map(id => OrderService.moveToTrash(id)));
                fetchData();
                setSelectedItems([]);
                setSelectAll(false);
                alert('Chuyển đơn hàng vào thùng rác thành công!');
            } catch (err) {
                alert('Có lỗi xảy ra khi chuyển vào thùng rác. Vui lòng thử lại.');
                console.error('Error moving orders to trash:', err);
            }
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

    const filteredOrders = (orders || []).filter(order => {
        if (!order) return false;

        const user = users[order.userId] || {};

        const matchesSearch =
            (order.id && order.id.toString().includes(searchTerm)) ||
            (order.shippingName && order.shippingName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingPhone && order.shippingPhone.includes(searchTerm)) ||
            (order.trackingNumber && order.trackingNumber.includes(searchTerm)) ||
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.username && order.username.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

        return matchesSearch && (statusFilter === 'all' || matchesStatus);
    });

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
                    <span>Danh sách Đơn hàng</span>
                </h1>
                <div className="flex space-x-3">
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded inline-flex items-center text-sm shadow-sm transition duration-150"
                        onClick={() => handleNavigate('/admin/order/trash')}
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

            {/* Debug info - can be removed in production */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                <p className="text-sm text-yellow-700">Đơn hàng đã tải: {orders ? orders.length : 0}</p>
                <p className="text-sm text-yellow-700">Nguồn dữ liệu: API</p>
            </div>

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
                    <div className="flex items-center space-x-2">
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
            </div>

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
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã ĐH</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đặt</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => {
                                    if (!order) return null;
                                    const user = users[order.userId] || {};
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    checked={selectedItems.includes(order.id)}
                                                    onChange={() => handleSelectItem(order.id)}
                                                />
                                            </td>
                                            <td className="p-3 whitespace-nowrap text-sm text-gray-500">#{order.id || 'N/A'}</td>
                                            <td className="p-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-800">
                                                            {user.fullName || user.username || order.username || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {user.email || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.orderDate)}
                                            </td>
                                            <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                    {order.orderStatus === 'PENDING' && 'Chờ xử lý'}
                                                    {order.orderStatus === 'PROCESSING' && 'Đang xử lý'}
                                                    {order.orderStatus === 'SHIPPED' && 'Đang giao'}
                                                    {order.orderStatus === 'DELIVERED' && 'Đã giao'}
                                                    {order.orderStatus === 'CANCELLED' && 'Đã hủy'}
                                                    {(!order.orderStatus || !['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) && 'Chờ xử lý'}
                                                </span>
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus === 'PAID' && 'Đã thanh toán'}
                                                    {order.paymentStatus === 'PENDING' && 'Chờ thanh toán'}
                                                    {order.paymentStatus === 'FAILED' && 'Thanh toán lỗi'}
                                                    {(!order.paymentStatus || !['PAID', 'PENDING', 'FAILED'].includes(order.paymentStatus)) && 'Chờ thanh toán'}
                                                </span>
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleNavigate(`/admin/order/detail/${order.id}`)}
                                                        className="bg-blue-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                        title="Xem chi tiết"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                  
                                                    <button
                                                        className="bg-red-500 p-1.5 text-white rounded hover:opacity-80 transition-opacity"
                                                        onClick={() => handleMoveToTrash(order.id)}
                                                        title="Chuyển vào thùng rác"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14v.01M12 20h.01M18 10a6 6 0 00-12 0" />
                                            </svg>
                                            <span className="block mt-2">Không tìm thấy đơn hàng nào</span>
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
                    {filteredOrders && filteredOrders.length > 0 && (
                        <span>Hiển thị {filteredOrders.length}/{orders ? orders.length : 0} đơn hàng</span>
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
                        className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition duration-150 ${selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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

export default OrderList;