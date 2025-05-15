import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaShoppingCart, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import OrderService from '../../../services/OrderService';
import ProductService from '../../../services/ProductService';

const DashboardIndex = () => {
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    revenue: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Fetch products and orders in parallel
      const [products, orders] = await Promise.all([
        ProductService.getAll(),
        OrderService.getAllOrders()
      ]);

      // Calculate revenue from orders
      const totalRevenue = calculateRevenue(orders);

      setStats({
        productCount: Array.isArray(products) ? products.length : 0,
        orderCount: Array.isArray(orders) ? orders.length : 0,
        revenue: totalRevenue,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
      }));
    }
  };

  const calculateRevenue = (orders) => {
    if (!Array.isArray(orders)) return 0;

    // Only count revenue from delivered orders with paid payment status
    return orders.reduce((total, order) => {
      if (order && order.orderStatus === 'DELIVERED' && order.paymentStatus === 'PAID') {
        return total + (order.totalAmount || 0);
      }
      return total;
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount);
  };

  if (stats.loading) {
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
          <span>Tổng quan hệ thống</span>
        </h1>
      </div>

      {stats.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p>{stats.error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Product Count Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaBoxOpen className="text-blue-600 text-2xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm uppercase tracking-wider">Sản phẩm</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.productCount}</p>
              <p className="text-sm text-gray-600">Tổng số sản phẩm trong hệ thống</p>
            </div>
          </div>
        </div>

        {/* Order Count Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FaShoppingCart className="text-green-600 text-2xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm uppercase tracking-wider">Đơn hàng</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.orderCount}</p>
              <p className="text-sm text-gray-600">Tổng số đơn hàng đã nhận</p>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaMoneyBillWave className="text-purple-600 text-2xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm uppercase tracking-wider">Doanh thu</h2>
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(stats.revenue)}</p>
              <p className="text-sm text-gray-600">Từ các đơn hàng đã giao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <FaChartLine className="text-gray-600 text-xl mr-2" />
          <h2 className="text-xl font-medium text-gray-700">Tình hình kinh doanh</h2>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between pb-2 mb-4 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Đơn hàng được giao thành công</span>
            <span className="text-sm text-green-600 font-medium">
              {stats.orderCount > 0 ?
                `${Math.round((stats.revenue / (stats.orderCount * 500000)) * 100)}%` :
                '0%'}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 mb-4 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Doanh thu trung bình/đơn hàng</span>
            <span className="text-sm text-blue-600 font-medium">
              {stats.orderCount > 0 ?
                formatCurrency(stats.revenue / stats.orderCount) :
                formatCurrency(0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Hiệu suất bán hàng</span>
            <span className="text-sm text-purple-600 font-medium">
              {stats.productCount > 0 ?
                `${Math.round((stats.orderCount / stats.productCount) * 100)}%` :
                '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => window.location.href = '/admin/product/create'}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition duration-150 flex items-center justify-center"
        >
          <FaBoxOpen className="mr-2" /> Thêm sản phẩm mới
        </button>

        <button
          onClick={() => window.location.href = '/admin/order'}
          className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition duration-150 flex items-center justify-center"
        >
          <FaShoppingCart className="mr-2" /> Quản lý đơn hàng
        </button>

        <button
          onClick={() => window.location.href = '/admin/product'}
          className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition duration-150 flex items-center justify-center"
        >
          <FaBoxOpen className="mr-2" /> Quản lý sản phẩm
        </button>

        <button
          onClick={() => fetchDashboardData()}
          className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition duration-150 flex items-center justify-center"
        >
          <FaChartLine className="mr-2" /> Cập nhật số liệu
        </button>
      </div>
    </div>
  );
};

export default DashboardIndex;