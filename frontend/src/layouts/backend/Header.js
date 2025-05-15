import React, { useState, useEffect } from 'react';
import { Home, LogOut, Settings, User, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState({
        fullname: 'Admin',
        username: '',
        email: ''
    });

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('admin_token');
        const loggedIn = !!token;
        setIsLoggedIn(loggedIn);

        // Get user data from localStorage
        if (loggedIn) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUserData({
                        fullname: parsedUser.fullname || parsedUser.fullName || parsedUser.name || 'Admin',
                        username: parsedUser.username || '',
                        email: parsedUser.email || ''
                    });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, [location]); // Re-check when location changes

    const handleLogout = () => {
        // Show confirmation dialog
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            navigate('/login');
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const toggleNotifications = () => {
        setNotificationsOpen(!notificationsOpen);
        if (profileOpen) setProfileOpen(false);
    };

    const toggleProfile = () => {
        setProfileOpen(!profileOpen);
        if (notificationsOpen) setNotificationsOpen(false);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="flex justify-between items-center px-6 py-3">
                {/* Center - Navigation */}
                <div className="hidden md:flex space-x-1">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-600 transition-colors duration-200"
                    >
                        <Home size={18} />
                        <span className="font-mono">Trang chủ</span>
                    </button>
                </div>

                {/* Right side - User controls */}
                <div className="flex items-center space-x-2">
                    {isLoggedIn ? (
                        <>
                        
                            {/* User profile - Only show when logged in */}
                            <div className="relative">
                                <button
                                    onClick={toggleProfile}
                                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                                >
                                    <span className="hidden md:inline font-mono text-gray-700">{userData.username}</span>
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-20">
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center font-mono"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Login button - Only show when not logged in */
                        <button
                            onClick={handleLogin}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-mono"
                        >
                            <User size={18} />
                            <span>Đăng nhập</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;