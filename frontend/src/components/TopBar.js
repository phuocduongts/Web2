import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({
    isLoggedIn,
    currentUser,
    showUserDropdown,
    setShowUserDropdown,
    setShowLoginModal,
    handleLogout,
    isAdmin
}) {
    const navigate = useNavigate();

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-16 py-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="flex items-center mr-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <div>
                                <div className="text-lg font-mono">Hotline mua hàng</div>
                                <div className="text-sm font-mono">Gọi ngay: 086 2642568</div>
                            </div>
                        </div>
                        <div className="flex items-center mr-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <div>
                                <div className="text-lg font-mono">Giao hàng tận nơi</div>
                                <div className="text-sm font-mono">Miễn phí từ 5 sản phẩm</div>
                            </div>
                        </div>
                        <div className="flex items-center mr-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                            </svg>
                            <div>
                                <div className="text-lg font-mono">1 Đổi 1 nếu lỗi hàng</div>
                                <div className="text-sm font-mono">Trong vòng 7 ngày</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="relative" id="user-dropdown">
                            {isLoggedIn ? (
                                <>
                                    <button
                                        id="user-button"
                                        className="flex items-center"
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    >
                                        <div className="text-lg font-mono">
                                            <span>Xin chào,</span>
                                            <div className="text-lg text-left font-mono">{currentUser?.fullName || currentUser?.username}</div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {showUserDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg z-30 border border-gray-200">
                                            <ul className="py-1">
                                                {isAdmin() && (
                                                    <li>
                                                        <a href="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-mono">
                                                            Quản trị hệ thống
                                                        </a>
                                                    </li>
                                                )}
                                                <li>
                                                    <a href="/thong-tin-tai-khoan/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-mono">
                                                        Thông tin tài khoản
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/don-hang/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 font-mono">
                                                        Đơn hàng của tôi
                                                    </a>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-mono"
                                                    >
                                                        Đăng xuất
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    id="login-button"
                                    className="flex items-center"
                                    onClick={() => setShowLoginModal(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div className="text-lg font-mono">
                                        <span>Đăng nhập / Đăng ký</span>
                                        <div className="text-lg text-left font-mono">Tài khoản của tôi</div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}