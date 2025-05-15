import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryService from '../../services/CategoryService';
import AuthService from '../../services/AuthService';
import CartService from '../../services/CartService'; // Thêm import CartService
import LoginModal from '../../components/LoginModal';
import TopBar from '../../components/TopBar';

export default function Header() {
    const [currentPath, setCurrentPath] = useState('');
    const [categories, setCategories] = useState([]);
    const [showCategories, setShowCategories] = useState(false);
    const [activeParentCategory, setActiveParentCategory] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: '',
    });

    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentPath(window.location.pathname);
        fetchCategories();
        checkLoginStatus();
    }, []);

    // Thêm useEffect để lắng nghe sự kiện cập nhật giỏ hàng
    useEffect(() => {
        // Lắng nghe sự kiện cập nhật giỏ hàng từ trang Cart.jsx
        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('cart-updated', handleCartUpdate);

        // Cleanup listener khi component unmount
        return () => {
            window.removeEventListener('cart-updated', handleCartUpdate);
        };
    }, []);

    const checkLoginStatus = () => {
        const authStatus = AuthService.isAuthenticated();
        setIsLoggedIn(authStatus);

        if (authStatus) {
            const user = AuthService.getCurrentUser();
            setCurrentUser(user);
            // Fetch cart count when user is logged in
            fetchCartCount();
        }
    };

    // Thêm hàm fetchCartCount để lấy số lượng sản phẩm trong giỏ hàng
    const fetchCartCount = async () => {
        if (!AuthService.isAuthenticated()) {
            setCartItemCount(0);
            return;
        }

        try {
            const user = AuthService.getCurrentUser();
            const response = await CartService.getCartByUser(user.id);
            const cartData = response.data || response;

            // Đếm tổng số lượng sản phẩm trong giỏ hàng
            const items = Array.isArray(cartData) ? cartData : (cartData.items ? cartData.items : []);
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            
            setCartItemCount(totalItems);
        } catch (err) {
            console.error('Error fetching cart count:', err);
            setCartItemCount(0);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await CategoryService.index();
            const categoriesData = Array.isArray(response) ? response :
                (response.data ? response.data : []);

            // Get all active categories
            const activeCategories = categoriesData.filter(cat => cat.status === true);

            // Optional: Sort categories for better display 
            // This puts parent categories first, followed by their children
            activeCategories.sort((a, b) => {
                // First sort by parent_id (null values first)
                const aParentId = a.parent_id || a.parent?.id;
                const bParentId = b.parent_id || b.parent?.id;

                if (!aParentId && bParentId) return -1;
                if (aParentId && !bParentId) return 1;

                // Then sort by name
                return a.name.localeCompare(b.name);
            });

            setCategories(activeCategories);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách danh mục.');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (categoryId) => {
        setActiveParentCategory(activeParentCategory === categoryId ? null : categoryId);
    };

    const handleParentCategoryClick = (categoryId) => {
        navigate(`/danh-muc-san-pham/${categoryId}`);
        setShowCategories(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/tim-kiem-san-pham?keyword=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (loginError) {
            setLoginError('');
        }
    };

    const handleLoginSubmit = async (username, password) => {
        try {
            const response = await AuthService.login(username, password);
            setIsLoggedIn(true);
            const user = AuthService.getCurrentUser();
            setCurrentUser(user);

            // Fetch cart count after successful login
            fetchCartCount();
            
            setShowSuccessNotification(true);
            setTimeout(() => {
                setShowSuccessNotification(false);
            }, 5000);
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
        }
    };

    const handleLogout = () => {
        AuthService.logout();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setShowUserDropdown(false);
        setCartItemCount(0);
    };

    const handleCreateAccount = () => {
        setShowLoginModal(false);
        navigate('/dang-ky-tai-khoan');
    };

    const handleForgotPassword = () => {
        setShowLoginModal(false);
        navigate('/quen-mat-khau');
    };

    const isAdmin = () => {
        return currentUser && (currentUser.role === 'ADMIN');
    };

    // Handle cart navigation with authentication check
    const handleCartNavigation = (e) => {
        if (!isLoggedIn) {
            e.preventDefault();
            setShowLoginModal(true);
            return false;
        }
        // Allow default navigation to cart page
        return true;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById('categories-dropdown');
            const userDropdown = document.getElementById('user-dropdown');
            const loginModal = document.getElementById('login-modal');

            if (dropdown && !dropdown.contains(event.target)) {
                setShowCategories(false);
                setActiveParentCategory(null);
            }

            if (userDropdown && !userDropdown.contains(event.target) && !event.target.closest('#user-button')) {
                setShowUserDropdown(false);
            }

            if (loginModal && !loginModal.contains(event.target) && event.target.id !== 'login-button') {
                setShowLoginModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        AuthService.setupAxiosInterceptors();
    }, []);

    return (
        <div>
            {showSuccessNotification && (
                <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 z-50 shadow-md max-w-md font-mono">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <p className="font-bold">Đăng nhập thành công!</p>
                                <p className="text-sm">Xin chào, {currentUser?.fullName || currentUser?.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSuccessNotification(false)}
                            className="text-green-700 hover:text-green-900"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <TopBar
                isLoggedIn={isLoggedIn}
                currentUser={currentUser}
                showUserDropdown={showUserDropdown}
                setShowUserDropdown={setShowUserDropdown}
                setShowLoginModal={setShowLoginModal}
                handleLogout={handleLogout}
                isAdmin={isAdmin}
            />
            <header className="bg-white sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-16 py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="hover:opacity-80 transition mr-8">
                            <img
                                src="https://file.hstatic.net/200000312481/file/newlogoort_5ffe29c58c414ccebc2120bed119c8c0.png"
                                alt="Outerity Logo"
                                className="h-10"
                            />
                        </a>
                        <nav className="flex-1 flex items-center space-x-6 text-lg font-mono text-gray-800">
                            <a href="/" className={`relative hover:text-black transition ${currentPath === '/' ? 'after:absolute after:w-full after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0' : 'after:absolute after:w-0 after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all after:duration-300'}`}>TRANG CHỦ</a>
                            <a href="/tat-ca-san-pham" className={`relative hover:text-black transition ${currentPath.includes('/tat-ca-san-pham') ? 'after:absolute after:w-full after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0' : 'after:absolute after:w-0 after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all after:duration-300'}`}>TẤT CẢ SẢN PHẨM</a>
                            <div className="relative" id="categories-dropdown">
                                <button
                                    className={`relative hover:text-black transition flex items-center ${currentPath.includes('/shop')
                                        ? 'after:absolute after:w-full after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0'
                                        : 'after:absolute after:w-0 after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all after:duration-300'
                                        }`}
                                    onClick={() => setShowCategories(!showCategories)}
                                >
                                    SHOP
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-4 w-4 ml-1 transition-transform ${showCategories ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {loading ? (
                                    showCategories && (
                                        <div className="absolute left-0 mt-3 w-64 bg-white border border-gray-200 shadow-lg z-30 py-4 text-center">
                                            <p className="text-gray-500">Đang tải danh mục...</p>
                                        </div>
                                    )
                                ) : error ? (
                                    showCategories && (
                                        <div className="absolute left-0 mt-3 w-64 bg-white border border-gray-200 shadow-lg z-30 py-4 text-center">
                                            <p className="text-red-500">{error}</p>
                                        </div>
                                    )
                                ) : (
                                    showCategories && (
                                        <div className="absolute left-0 mt-3 w-64 bg-white border border-gray-200 shadow-lg z-30">
                                            <ul className="py-2">
                                                {categories.map((category) => (
                                                    <li key={category.id} className="w-full">
                                                        <a
                                                            href={`/danh-muc-san-pham/${category.id}`}
                                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                        >
                                                            {category.name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                )}
                            </div>
                            <a href="/lien-he" className={`relative hover:text-black transition ${currentPath === '/lien-he' ? 'after:absolute after:w-full after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0' : 'after:absolute after:w-0 after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all after:duration-300'}`}>LIÊN HỆ</a>
                            <a href="/gioi-thieu" className={`relative hover:text-black transition ${currentPath === '/gioi-thieu' ? 'after:absolute after:w-full after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0' : 'after:absolute after:w-0 after:h-0.5 after:bg-black after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all after:duration-300'}`}>GIỚI THIỆU</a>
                        </nav>
                        <div className="flex items-center space-x-4">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="border border-gray-300 px-4 py-2 text-sm w-64 focus:outline-none focus:border-gray-400 font-mono"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </button>
                            </form>
                            <a
                                href="/gio-hang"
                                className="flex items-center hover:opacity-80 transition"
                                onClick={(e) => !handleCartNavigation(e) && e.preventDefault()}
                            >
                                <div className="relative">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-mono">
                                        {cartItemCount}
                                    </span>
                                </div>
                                <span className="ml-2 text-sm font-mono">Giỏ hàng</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>
            <LoginModal
                showModal={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLoginSubmit}
                onCreateAccount={handleCreateAccount}
                onForgotPassword={handleForgotPassword}
            />
        </div>
    );
}