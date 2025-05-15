import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Package, FileText, Phone, Palette, UserPlus, User, ShoppingBag, ShoppingCart, TreePalm } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const LayoutBackend = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024); // Set based on screen size
    const [expandedMenus, setExpandedMenus] = useState({});
    const [userData, setUserData] = useState({
        fullname: '',
        username: '',
        email: ''
    });
    const location = useLocation();
    const navigate = useNavigate();

    // Check if user is logged in, if not redirect to login page
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/login');
        } else {
            // Get user data from localStorage
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUserData({
                        fullname: parsedUser.fullname || parsedUser.fullName || parsedUser.name || 'Admin User',
                        username: parsedUser.username || '',
                        email: parsedUser.email || 'admin@example.com'
                    });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, [navigate]);

    // Set sidebar state based on screen size
    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Set expanded menus based on current location
    useEffect(() => {
        menuItems.forEach(item => {
            if (item.subItems) {
                const isSubItemActive = item.subItems.some(subItem =>
                    location.pathname.startsWith(subItem.path)
                );
                if (isSubItemActive) {
                    setExpandedMenus(prev => ({ ...prev, [item.name]: true }));
                }
            }
        });
    }, [location.pathname]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const toggleSubmenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const menuItems = [
        { name: 'Sản phẩm', icon: ShoppingBag, path: '/admin/product' },
        { name: 'Danh mục', icon: Package, path: '/admin/category' },
        { name: 'Bài viết', icon: FileText, path: '/admin/post' },
        { name: 'Chủ đề bài viết', icon: TreePalm, path: '/admin/topic' },
        { name: 'Đơn hàng', icon: ShoppingCart, path: '/admin/order' },
        { name: 'Liên hệ', icon: Phone, path: '/admin/contact' },
        { name: 'Banner', icon: Palette, path: '/admin/banner' },
        { name: 'Thành viên', icon: UserPlus, path: '/admin/user' },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`bg-gradient-to-b from-gray-900 to-gray-700 text-white shadow-xl fixed lg:static h-full z-20
                ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}
            >
                <div className="p-5 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div 
                            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            onClick={() => navigate('/admin')}
                        >
                            <User size={24} className="text-gray-300" />
                            <h1 className="text-2xl font-mono ml-2 text-white">Admin</h1>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                <nav className="mt-2">
                    {menuItems.map((item, index) => {
                        const isMenuActive = item.path && isActive(item.path) ||
                            (item.subItems && item.subItems.some(subItem => isActive(subItem.path)));

                        return (
                            <div key={index} className="mb-1">
                                {item.subItems ? (
                                    <div>
                                        <button
                                            onClick={() => toggleSubmenu(item.name)}
                                            className={`flex items-center w-full px-4 py-3 text-left rounded-md
                                                ${isMenuActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-100'}
                                                ${!isSidebarOpen && 'justify-center'} transition-colors duration-200`}
                                        >
                                            <item.icon size={20} className={`${isSidebarOpen ? 'mr-3' : ''}`} />
                                            {isSidebarOpen && (
                                                <>
                                                    <span className="font-mono">{item.name}</span>
                                                    <ChevronDown
                                                        className={`ml-auto transform transition-transform duration-200
                                                            ${expandedMenus[item.name] ? 'rotate-180' : ''}`}
                                                        size={16}
                                                    />
                                                </>
                                            )}
                                        </button>
                                        {isSidebarOpen && expandedMenus[item.name] && (
                                            <div className="mt-1 ml-4 pl-4 border-l border-gray-700 space-y-1">
                                                {item.subItems.map((subItem, subIndex) => (
                                                    <Link
                                                        key={subIndex}
                                                        to={subItem.path}
                                                        className={`block py-2 px-3 rounded-md text-sm
                                                            ${isActive(subItem.path)
                                                                ? 'bg-gray-700 text-white font-mono'
                                                                : 'text-gray-100 hover:bg-gray-700 hover:text-white'}
                                                            transition-colors duration-200`}
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`flex items-center w-full px-4 py-3 rounded-md
                                            ${isActive(item.path) ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 text-gray-100'}
                                            ${!isSidebarOpen && 'justify-center'} transition-colors duration-200`}
                                    >
                                        <item.icon size={20} className={`${isSidebarOpen ? 'mr-3' : ''}`} />
                                        {isSidebarOpen && <span className="font-mono">{item.name}</span>}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main content */}
            <div className={`flex-1 flex flex-col overflow-hidden ${isSidebarOpen ? 'lg:ml-0' : 'ml-20 lg:ml-0'}`}>
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 px-6">
                    <div className="max-w-7xl mx-auto py-6">
                        <Outlet />
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default LayoutBackend;